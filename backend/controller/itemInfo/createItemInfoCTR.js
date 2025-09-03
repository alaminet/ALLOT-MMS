const ItemInfo = require("../../model/itemInfo");

async function createItemInfoCTR(req, res, next) {
  const data = req.body;
  try {
    if (!data.name) {
      return res.status(400).send({ error: "Name is required" });
    } else {
      const existingItemInfo = await ItemInfo.findOne({
        SKU: data.SKU?.toLowerCase().trim(),
      });
      if (existingItemInfo) {
        return res.status(400).send({ error: "Item already exists" });
      } else {
        const lastItem = await ItemInfo.findOne({}).sort({ _id: -1 });
        const newItemInfo = new ItemInfo({
          orgId: req.orgId,
          code: lastItem?.code + 1 || 1000000001,
          name: data.name.trim(),
          discription: data.discription.trim(),
          SKU: data.SKU.toLowerCase().trim(),
          UOM: data.UOM,
          group: data.group,
          type: data.type,
          safetyStock: data.safetyStock,
          isShelfLife: data.isShelfLife,
          createdBy: data.createdBy,
        });
        await newItemInfo.save();
        res.status(201).send({
          message: "New Item Created",
        });

        // Add Log activites
        const logData = {
          orgId: newItemInfo.orgId,
          id: req.actionBy,
          refModel: "Item_Info",
          action: `New item ${newItemInfo.name} created`,
        };
        req.log = logData;
        next();
      }
    }
  } catch (error) {
    console.log(error);

    res.status(500).send({ error: error.message || "Error creating" });
  }
}
module.exports = createItemInfoCTR;
