const TrnxReceive = require("../../../model/transaction/trnxReceive");
const TrnxDetails = require("../../../model/transaction/trnxDetails");
const ItemInfo = require("../../../model/master/itemInfo");
const PurchaseOrder = require("../../../model/purchaseOrder");
const PurchaseReq = require("../../../model/purchaseReq");

async function creatPOGRNRecCTR(req, res, next) {
  const data = req.body;
  try {
    if (!data.itemDetails) {
      return res.status(400).send({ error: "Item is required" });
    } else {
      const lastItem = await TrnxReceive.findOne({}).sort({ _id: -1 });
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
      await newData.save();

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
      const newTnx = await TrnxDetails.insertMany(tnxDetails);

      // Item Info Updated
      for (const element of newData.itemDetails) {
        const item = await ItemInfo.findOne({ code: element?.code });
        if (!item) continue;

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
      }

      // Update PO GRN Qty and PO RecQty
      for (const item of data.itemDetails) {
        // Update PO GRN Qty
        const poId = data.sourceRef;
        const poLineId = item.POLineID;
        const qty = Number(item.receiveQty || 0);
        if (!poId || !poLineId || !qty) continue;
        await PurchaseOrder.updateOne(
          { code: poId, "itemDetails._id": poLineId },
          { $inc: { "itemDetails.$.GRNQty": qty } }
        );
        //Update PR RecQty
        const prId = item.PRRef;
        const prLineId = item.PRLineId;
        const recQty = Number(item.receiveQty || 0);
        if (!prId || !prLineId || !recQty) continue;
        await PurchaseReq.updateOne(
          { _id: prId, "itemDetails._id": prLineId },
          { $inc: { "itemDetails.$.recQty": recQty } }
        );
      }
      res.status(201).send({
        message: `Goods received ID #${newData.code}`,
      });

      // Add Log activites
      const logData = {
        orgId: req.orgId,
        id: req.actionBy,
        refModel: "Goods-Receive",
        action: `Goods received ID #${newData.code}`,
      };
      req.log = logData;
      next();
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: error.message || "Error creating" });
  }
}
module.exports = creatPOGRNRecCTR;
