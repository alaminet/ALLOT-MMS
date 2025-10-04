const TrnxReceive = require("../../../model/transaction/trnxReceive");
const TrnxDetails = require("../../../model/transaction/trnxDetails");
const ItemInfo = require("../../../model/master/itemInfo");

async function createTrnxRecCTR(req, res, next) {
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
          unitPrice: dtl.unitPrice,
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
        itemCode: item.code,
        itemSKU: item.SKU,
        itemName: item.name,
        itemUOM: item.UOM,
        itemPrice: item.unitPrice,
        tnxQty: item.receiveQty,
        location: item.location,
        createdBy: newData.createdBy,
        updatedBy: newData.updatedBy,
      }));
      const newTnx = await TrnxDetails.insertMany(tnxDetails);

      // Item Info Updated
      for (const element of newData.itemDetails) {
        const item = await ItemInfo.findOne({ code: element.code });
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
        item.avgPrice =
          totalQty > 0
            ? (existingQty * existingPrice + newQty * newPrice) / totalQty
            : newPrice;

        item.lastPrice = newPrice;

        await item.save();
      }
      res.status(201).send({
        message: "New data inserted",
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
module.exports = createTrnxRecCTR;
