const TrnxIssue = require("../../../model/transaction/trnxIssue");
const TrnxDetails = require("../../../model/transaction/trnxDetails");
const TrnxMoveOrder = require("../../../model/transaction/trnxMoveOrder");
const ItemInfo = require("../../../model/master/itemInfo");
const { computeAvgPrice } = require("../../../utils/priceUtils");

async function moveOrderIssueCTR(req, res, next) {
  const data = req.body;
  try {
    if (!data.itemDetails) {
      return res.status(400).send({ error: "Item is required" });
    } else {
      // Aggregate issueQty per item code + location to handle duplicate entries from frontend
      const agg = {};
      for (const dtl of data.itemDetails) {
        const code = dtl.code;
        const name = dtl.name;
        const loc = dtl.location;
        const qty = Number(dtl.issueQty || 0);

        if (!code || !loc) {
          return res.status(401).send({
            error: `Invalid item code or location for item ${JSON.stringify(
              dtl
            )}`,
          });
        }

        if (!qty || qty <= 0) {
          return res.status(401).send({
            error: `Invalid issueQty for item ${name} at location ${loc}`,
          });
        }

        const key = `${code}:::${loc}:::${name}`;
        agg[key] = (agg[key] || 0) + qty;
      }

      // Validate each aggregated entry against ItemInfo stock for that location
      for (const key of Object.keys(agg)) {
        const [code, loc, name] = key.split(":::");
        const totalReqQty = agg[key];

        const itemInfo = await ItemInfo.findOne({ code });
        if (!itemInfo) {
          return res
            .status(401)
            .send({ error: `Item not found for code ${code}` });
        }

        const stockEntry = (itemInfo.stock || []).find(
          (s) => s.location === loc
        );
        const onHand = stockEntry ? Number(stockEntry.onHandQty || 0) : 0;

        if (!stockEntry) {
          return res.status(401).send({
            error: `No stock found at location ${loc} for item ${name}`,
          });
        }

        if (totalReqQty > onHand) {
          return res.status(401).send({
            error: `Insufficient stock for item ${name} at location ${loc}. Requested ${totalReqQty}, available ${onHand}`,
          });
        }
      }

      const lastItem = await TrnxIssue.findOne({}).sort({ code: -1 });
      const nextCode = lastItem?.code ? lastItem.code + 1 : 10001;
      const newData = new TrnxIssue({
        orgId: req.orgId,
        code: nextCode,
        tnxType: data.tnxType,
        tnxRef: data.tnxRef,
        reference: data.reference,
        costCenter: data.costCenter,
        headerText: data.headerText,
        documentAt: new Date(),
        issuedAt: new Date(),
        itemDetails: data.itemDetails?.map((dtl) => ({
          code: dtl.code || null,
          SKU: dtl.SKU || null,
          name: dtl.name,
          UOM: dtl.UOM,
          location: dtl.location,
          issuePrice: dtl.issuePrice,
          issueQty: dtl.issueQty * -1,
          remarks: dtl.remarks,
        })),
        createdBy: req.actionBy,
        updatedBy: req.actionBy,
      });

      // collect step messages as structured objects
      const responseSteps = [];
      // Create record
      try {
        await newData.save();
        responseSteps.push({
          orgId: req.orgId,
          actionBy: req.actionBy,
          controller: "moveOrderIssueCTR",
          step: "createRecord",
          status: "success",
          message: `New goods issue record created #${newData.code}`,
          code: "RECORD_CREATED",
        });
      } catch (err) {
        responseSteps.push({
          orgId: req.orgId,
          actionBy: req.actionBy,
          controller: "moveOrderIssueCTR",
          step: "createRecord",
          status: "failed",
          message: `Failed to create goods issue record #${newData.code}`,
          code: "RECORD_CREATE_FAILED",
          details: err.message,
        });
        // critical failure — stop processing and return
        return res.status(500).send({
          message: "Failed to create goods issue record",
          code: newData.code,
          status: "failed",
          steps: responseSteps,
        });
      }

      // Tnx Detials Added
      const tnxDetails = newData.itemDetails.map((item) => ({
        orgId: newData.orgId,
        tnxType: newData.tnxType,
        tnxRef: newData.code,
        reference: newData.reference,
        headerText: newData.headerText,
        itemCode: item.code,
        itemSKU: item.SKU,
        itemName: item.name,
        itemUOM: item.UOM,
        itemPrice: item.issuePrice,
        tnxQty: item.issueQty,
        location: item.location,
        remarks: item.remarks,
        costCenter: newData.costCenter,
        documentAt: newData.documentAt,
        issuedAt: newData.issuedAt,
        createdBy: newData.createdBy,
        updatedBy: newData.updatedBy,
      }));

      let newTnx = [];
      try {
        newTnx = await TrnxDetails.insertMany(tnxDetails);
        responseSteps.push({
          orgId: req.orgId,
          actionBy: req.actionBy,
          controller: "moveOrderIssueCTR",
          step: "insertTnx",
          status: "success",
          message: `Transaction details created (${newTnx.length} items)`,
          code: "TNX_INSERTED",
          count: newTnx.length,
        });
      } catch (err) {
        // attempt to collect inserted docs if available
        const insertedCount =
          (err && err.insertedDocs && err.insertedDocs.length) || 0;
        newTnx = (err && err.insertedDocs) || [];
        responseSteps.push({
          orgId: req.orgId,
          actionBy: req.actionBy,
          controller: "moveOrderIssueCTR",
          step: "insertTnx",
          status: "failed",
          message: `Transaction insert failed (${insertedCount} inserted)`,
          code: "TNX_INSERT_FAILED",
          details: err.message,
        });
        // continue processing item updates for best-effort
      }

      // Item Info Updated
      const updatedItems = [];
      for (const element of newData.itemDetails) {
        try {
          const item = await ItemInfo.findOne({ code: element.code });
          if (!item) {
            responseSteps.push({
              orgId: req.orgId,
              actionBy: req.actionBy,
              controller: "moveOrderIssueCTR",
              step: "updateItem",
              status: "skipped",
              message: `"${element.name}" Item with code not found, skipped update`,
              code: "ITEM_NOT_FOUND",
              item: { code: element.code, location: element.location },
            });
            continue;
          }

          const newQty = element.issueQty * -1;
          const newPrice = element.issuePrice;


          // Compute new avg price and update stock using helper
          const { avgPrice, updatedStock } = computeAvgPrice(
            item.stock,
            element.location,
            newQty,
            newPrice,
            item.avgPrice
          );

          item.stock = updatedStock;
          item.avgPrice = avgPrice;

          await item.save();

          updatedItems.push({
            code: element.code,
            location: element.location,
            issueQty: newQty,
          });
          responseSteps.push({
            orgId: req.orgId,
            actionBy: req.actionBy,
            controller: "moveOrderIssueCTR",
            step: "updateItem",
            status: "success",
            message: `Item ${element?.SKU} updated (location: ${element.location}, issue Qty: ${newQty})`,
            code: "ITEM_UPDATED",
            item: { code: element.code, location: element.location },
          });
        } catch (err) {
          responseSteps.push({
            orgId: req.orgId,
            actionBy: req.actionBy,
            controller: "moveOrderIssueCTR",
            step: "updateItem",
            status: "failed",
            message: `Item ${element.code} update failed`,
            code: "ITEM_UPDATE_FAILED",
            item: { code: element.code, location: element.location },
            details: err.message,
          });
          // continue with next item
          continue;
        }
      }

      // Move Order issue Qty update
      for (const item of data.itemDetails) {
        try {
          await TrnxMoveOrder.findOneAndUpdate(
            { _id: item.MOid, "itemDetails._id": item.MOLineid },
            { $inc: { "itemDetails.$.issueQty": item.issueQty } }
          );
        } catch (err) {
          responseSteps.push({
            orgId: req.orgId,
            actionBy: req.actionBy,
            controller: "moveOrderIssueCTR",
            step: "updateMO",
            status: "failed",
            message: `Item ${element.code} MO update failed`,
            code: "MO_UPDATE_FAILED",
            item: { code: element.code, location: element.location },
            details: err.message,
          });
          // continue with next item
          continue;
        }
      }
      // Add Log activites
      const logData = {
        orgId: req.orgId,
        id: req.actionBy,
        refModel: "Goods-Issue",
        action: `Goods issued ID #${newData.code}`,
      };
      req.log = logData;
      req.serverLog = responseSteps;

      // Compute summary counts and overall status
      const successCount = responseSteps.filter(
        (s) => s.status === "success"
      ).length;
      const failedCount = responseSteps.filter(
        (s) => s.status === "failed"
      ).length;
      const skippedCount = responseSteps.filter(
        (s) => s.status === "skipped"
      ).length;

      let overallStatus = "completed";
      let statusCode = 201;
      if (failedCount > 0 && successCount > 0) {
        overallStatus = "partial";
        statusCode = 207; // Multi-Status
      } else if (failedCount > 0 && successCount === 0) {
        overallStatus = "failed";
        statusCode = 500;
      }

      // Final response with aggregated steps
      res.status(statusCode).send({
        message: `GI ID #${newData.code} for MO ID#${newData.tnxRef} - process ${overallStatus}`,
        code: newData.code,
        status: overallStatus,
        steps: responseSteps,
        counts: {
          success: successCount,
          failed: failedCount,
          skipped: skippedCount,
        },
        tnxCount: newTnx.length || 0,
        updatedItems,
        newDataId: newData._id,
      });
      next();
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: error.message || "Error creating" });
  }
}
module.exports = moveOrderIssueCTR;
