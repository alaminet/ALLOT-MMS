const TrnxReceive = require("../../../model/transaction/trnxReceive");
const TrnxDetails = require("../../../model/transaction/trnxDetails");
const ItemInfo = require("../../../model/master/itemInfo");
const PurchaseOrder = require("../../../model/purchaseOrder");
const PurchaseReq = require("../../../model/purchaseReq");

async function creatPOGRNRecCTR(req, res, next) {
  const data = req.body;
  const orgId = req.orgId;
  const orgPackage = req.orgPackage;
  try {
    // Date Ranges
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfNow = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      23,
      59,
      59,
      999
    );
    const itemExistCount = await TrnxReceive.countDocuments({
      orgId: orgId,
      createdAt: { $gte: startOfMonth, $lte: endOfNow },
    });
    if (itemExistCount + 1 > orgPackage?.limit?.transactions) {
      return res.status(400).send({ error: "Package limit exceeded" });
    }
    if (!data.itemDetails) {
      return res.status(400).send({ error: "Item is required" });
    } else {
      const lastItem = await TrnxReceive.findOne({}).sort({ code: -1 });
      const newData = new TrnxReceive({
        orgId: req.orgId,
        code: lastItem?.code ? lastItem.code + 1 : 5000000001,
        tnxType: data.tnxType,
        sourceType: data.sourceType,
        sourceRef: data.sourceRef,
        documentAt: new Date(data.documentAt),
        receivedAt: new Date(data.receivedAt),
        headerText: data.headerText,
        invoiceNo: data.invoiceNo,
        TaxNo: data.TaxNo,
        itemDetails: data.itemDetails?.map((dtl) => ({
          code: dtl.code || null,
          SKU: dtl.SKU || null,
          name: dtl.name,
          UOM: dtl.UOM,
          location: dtl.location,
          receiveQty: dtl.receiveQty,
          unitPrice: Number(dtl.unitPrice) || 0,
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
          controller: "createTrnxRecCTR",
          step: "createRecord",
          status: "success",
          message: `New goods receive record created #${newData.code}`,
          code: "RECORD_CREATED",
        });
      } catch (err) {
        responseSteps.push({
          orgId: req.orgId,
          actionBy: req.actionBy,
          controller: "createTrnxRecCTR",
          step: "createRecord",
          status: "failed",
          message: `Failed to create goods receive record #${newData.code}`,
          code: "RECORD_CREATE_FAILED",
          details: err.message,
        });
        // critical failure — stop processing and return
        return res.status(500).send({
          message: "Failed to create goods receive record",
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
        itemCode: item.code || null,
        itemSKU: item.SKU || null,
        itemName: item.name,
        itemUOM: item.UOM,
        itemPrice: Number(item.unitPrice) || 0,
        tnxQty: item.receiveQty,
        location: item.location,
        remarks: item.remarks,
        createdBy: newData.createdBy,
        updatedBy: newData.updatedBy,
      }));
      let newTnx = [];
      try {
        newTnx = await TrnxDetails.insertMany(tnxDetails);
        responseSteps.push({
          orgId: req.orgId,
          actionBy: req.actionBy,
          controller: "createTrnxRecCTR",
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
          controller: "createTrnxRecCTR",
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
          const item = await ItemInfo.findOne({ code: element?.code });
          if (!item) {
            responseSteps.push({
              orgId: req.orgId,
              actionBy: req.actionBy,
              controller: "createTrnxRecCTR",
              step: "updateItem",
              status: "skipped",
              message: `"${element.name}" Item with code not found, skipped update`,
              code: "ITEM_NOT_FOUND",
              item: { code: element.code, location: element.location },
            });
            continue;
          }

          const newQty = element.receiveQty;
          const newPrice = element.unitPrice;

          // Find existing stock entry by location
          const index = item.stock.findIndex(
            (s) => s.location === element.location
          );

          let existingQty = 0;
          let existingPrice = item.avgPrice || 0;

          if (index !== -1) {
            // Overwrite existing stock entry
            const existingLoc = item.stock[index];
            existingQty = existingLoc.recQty || 0;

            item.stock[index] = {
              location: element.location,
              recQty: existingQty + newQty,
              issueQty: existingLoc.issueQty || 0,
              onHandQty: (existingLoc.onHandQty || 0) + newQty,
            };
          } else {
            // Insert new stock entry
            item.stock.push({
              location: element.location,
              recQty: newQty,
              issueQty: 0,
              onHandQty: newQty,
            });
          }

          // Calculate avgPrice using weighted average
          const totalQty = existingQty + newQty;
          const existingValue = existingQty * existingPrice;
          const newValue = newQty * newPrice;
          item.avgPrice =
            totalQty > 0 ? (existingValue + newValue) / totalQty : newPrice;

          item.lastPrice = newPrice;

          await item.save();
          updatedItems.push({
            code: element.code,
            location: element.location,
            recQty: newQty,
          });

          responseSteps.push({
            orgId: req.orgId,
            actionBy: req.actionBy,
            controller: "createTrnxRecCTR",
            step: "updateItem",
            status: "success",
            message: `Item ${element?.SKU} updated (location: ${element.location}, receive Qty: ${newQty})`,
            code: "ITEM_UPDATED",
            item: { code: element.code, location: element.location },
          });
        } catch (err) {
          responseSteps.push({
            orgId: req.orgId,
            actionBy: req.actionBy,
            controller: "createTrnxRecCTR",
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

      // Update PO GRN Qty and PO RecQty
      for (const item of data.itemDetails) {
        try {
          // Update PO GRN Qty
          const poId = data.sourceRef;
          const poLineId = item.POLineID;
          const qty = Number(item.receiveQty || 0);
          if (!poId || !poLineId || !qty) continue;
          await PurchaseOrder.updateOne(
            { code: poId, "itemDetails._id": poLineId },
            { $inc: { "itemDetails.$.GRNQty": qty } }
          );
        } catch (err) {
          responseSteps.push({
            orgId: req.orgId,
            actionBy: req.actionBy,
            controller: "createTrnxRecCTR",
            step: "updatePO",
            status: "failed",
            message: `Item ${element.code} PO update failed`,
            code: "PO_UPDATE_FAILED",
            item: { code: element.code, location: element.location },
            details: err.message,
          });
          // continue with next item
          continue;
        }
        try {
          //Update PR RecQty
          const prId = item.PRRef;
          const prLineId = item.PRLineId;
          const recQty = Number(item.receiveQty || 0);
          if (!prId || !prLineId || !recQty) continue;
          await PurchaseReq.updateOne(
            { _id: prId, "itemDetails._id": prLineId },
            { $inc: { "itemDetails.$.recQty": recQty } }
          );
        } catch (err) {
          responseSteps.push({
            orgId: req.orgId,
            actionBy: req.actionBy,
            controller: "createTrnxRecCTR",
            step: "updatePR",
            status: "failed",
            message: `Item ${element.code} PR update failed`,
            code: "PR_UPDATE_FAILED",
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
        refModel: "Goods-Receive",
        action: `Goods received ID #${newData.code}`,
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
        message: `Goods received ID #${newData.code} - process ${overallStatus}`,
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
module.exports = creatPOGRNRecCTR;
