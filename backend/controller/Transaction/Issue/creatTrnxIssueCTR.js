const TrnxIssue = require("../../../model/transaction/trnxIssue");
const TrnxDetails = require("../../../model/transaction/trnxDetails");
const ItemInfo = require("../../../model/master/itemInfo");

async function creatTrnxIssueCTR(req, res, next) {
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

      const lastItem = await TrnxIssue.findOne({}).sort({ _id: -1 });
      const newData = new TrnxIssue({
        orgId: req.orgId,
        code: lastItem?.code ? lastItem.code + 1 : 10001,
        tnxType: data.tnxType,
        referance: data.referance,
        costCenter: data.costCenter,
        headerText: data.headerText,
        documentAt: new Date(data.documentAt),
        issuedAt: new Date(data.issuedAt),
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
      const newTnx = await TrnxDetails.insertMany(tnxDetails);

      // Item Info Updated
      for (const element of newData.itemDetails) {
        const item = await ItemInfo.findOne({ code: element.code });
        if (!item) continue;

        const newQty = element.issueQty * -1;
        const newPrice = element.issuePrice;

        // Find existing stock entry by location
        const index = item.stock.findIndex(
          (s) => s.location === element.location
        );

        let existingQty = 0;
        let existingPrice = item.avgPrice || 0;

        if (index !== -1) {
          // Overwrite existing stock entry
          const existingLoc = item.stock[index];
          existingQty = existingLoc.issueQty || 0;

          item.stock[index] = {
            location: element.location,
            recQty: existingLoc.recQty || 0,
            issueQty: existingQty + newQty,
            onHandQty: (existingLoc.onHandQty || 0) - newQty,
          };
        } else {
          // Insert new stock entry
          item.stock.push({
            location: element.location,
            recQty: 0,
            issueQty: newQty,
            onHandQty: newQty,
          });
        }

        // Calculate avgPrice using weighted average
        const totalQty = existingQty - newQty;
        item.avgPrice =
          totalQty > 0
            ? (existingQty * existingPrice - newQty * newPrice) / totalQty
            : newPrice;

        // item.lastPrice = newPrice;
        await item.save();
      }
      res.status(201).send({
        message: "New data inserted",
      });

      // Add Log activites
      const logData = {
        orgId: req.orgId,
        id: req.actionBy,
        refModel: "Goods-Issue",
        action: `Goods issued ID #${newData.code}`,
      };
      req.log = logData;
      next();
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: error.message || "Error creating" });
  }
}
module.exports = creatTrnxIssueCTR;
