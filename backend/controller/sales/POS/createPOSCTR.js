const SalesPOS = require("../../../model/Sales/SalesPOS");
const ItemInfo = require("../../../model/master/itemInfo");
const TrnxDetails = require("../../../model/transaction/trnxDetails");

async function createPOSCTR(req, res, next) {
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
      999,
    );
    const itemExistCount = await SalesPOS.countDocuments({
      orgId: orgId,
      createdAt: { $gte: startOfMonth, $lte: endOfNow },
    });
    if (itemExistCount + 1 > orgPackage?.limit?.POS) {
      return res.status(400).send({ error: "Package limit exceeded" });
    }
    if (!data.products) {
      return res.status(400).send({ error: "Products is required" });
    } else {
      const lastItem = await SalesPOS.findOne({}).sort({ code: -1 });
      const newData = new SalesPOS({
        orgId: orgId,
        code: lastItem?.code + 1 || 200001,
        billing: data.billing,
        payments: data.payments,
        products: data.products,
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
          controller: "createPOSCTR",
          step: "createRecord",
          status: "success",
          message: `New goods issue record created #${newData.code}`,
          code: "RECORD_CREATED",
        });
      } catch (err) {
        responseSteps.push({
          orgId: req.orgId,
          actionBy: req.actionBy,
          controller: "createPOSCTR",
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

      //Update Item Info Stock Levels
      const tnxDetails = [];
      const updatedItems = [];
      for (const element of newData.products) {
        try {
          const item = await ItemInfo.findOne({
            SKU: element.SKU,
            orgId: orgId,
          });
          if (!item) {
            responseSteps.push({
              orgId: req.orgId,
              actionBy: req.actionBy,
              controller: "createPOSCTR",
              step: "updateItem",
              status: "skipped",
              message: `"${element.name}" Item with SKU not found, skipped update`,
              code: "ITEM_NOT_FOUND",
              item: { code: element.SKU, name: element.name },
            });
            continue;
          }

          // Deduct stock
          let totalDeductQty = element.quantity;
          for (const stockEntry of item.stock) {
            if (totalDeductQty <= 0) break;

            let deductedQty = 0; // Track actual quantity deducted from this stock entry

            if (stockEntry.onHandQty >= totalDeductQty) {
              deductedQty = totalDeductQty;
              stockEntry.onHandQty -= totalDeductQty;
              stockEntry.issueQty += totalDeductQty;
              totalDeductQty = 0;
            } else {
              deductedQty = stockEntry.onHandQty;
              totalDeductQty -= stockEntry.onHandQty;
              stockEntry.issueQty += stockEntry.onHandQty;
              stockEntry.onHandQty = 0;
            }
            await item.save();

            // Only collect tnxDetails if quantity was actually deducted
            if (deductedQty > 0) {
              tnxDetails.push({
                orgId: newData.orgId,
                tnxType: "Sales",
                tnxRef: newData.code,
                reference: "POS Sales",
                headerText: "POS Sales",
                itemCode: item.code,
                itemSKU: item.SKU,
                itemName: item.name,
                itemUOM: element.UOM,
                itemPrice: item.salePrice,
                tnxQty: deductedQty,
                location: stockEntry.location,
                remarks: `VAT: ${element.VAT}, Discount:${element.discount} ${element.discountType}`,
                costCenter: null,
                documentAt: Date.now(),
                issuedAt: Date.now(),
                createdBy: newData.createdBy,
                updatedBy: newData.updatedBy,
              });
              updatedItems.push({
                code: item.code,
                location: stockEntry.location,
                issueQty: deductedQty,
              });
              responseSteps.push({
                orgId: req.orgId,
                actionBy: req.actionBy,
                controller: "createPOSCTR",
                step: "updateItem",
                status: "success",
                message: `Item ${element?.SKU} updated (location: ${stockEntry.location}, issue Qty: ${deductedQty})`,
                code: "ITEM_UPDATED",
                item: {
                  code: item.code,
                  location: stockEntry.location,
                  qty: deductedQty,
                },
              });
            }
          }
        } catch (err) {
          responseSteps.push({
            orgId: req.orgId,
            actionBy: req.actionBy,
            controller: "createPOSCTR",
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
      let newTnx = [];
      try {
        newTnx = await TrnxDetails.insertMany(tnxDetails);
        responseSteps.push({
          orgId: req.orgId,
          actionBy: req.actionBy,
          controller: "createPOSCTR",
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
          controller: "createPOSCTR",
          step: "insertTnx",
          status: "failed",
          message: `Transaction insert failed (${insertedCount} inserted)`,
          code: "TNX_INSERT_FAILED",
          details: err.message,
        });
        // continue processing item updates for best-effort
      }

      // Add Log activites
      const logData = {
        orgId: req.orgId,
        id: req.actionBy,
        refModel: "Sales_POS",
        action: `New Sales "${newData.code}" created by POS`,
      };
      req.log = logData;
      req.serverLog = responseSteps;

      // Compute summary counts and overall status
      const successCount = responseSteps.filter(
        (s) => s.status === "success",
      ).length;
      const failedCount = responseSteps.filter(
        (s) => s.status === "failed",
      ).length;
      const skippedCount = responseSteps.filter(
        (s) => s.status === "skipped",
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
        message: `POS Inv. #${newData.code} - process ${overallStatus}`,
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
module.exports = createPOSCTR;
