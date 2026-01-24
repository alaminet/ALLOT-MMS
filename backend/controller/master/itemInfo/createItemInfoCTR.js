const ItemInfo = require("../../../model/master/itemInfo");

async function createItemInfoCTR(req, res, next) {
  const data = req.body;
  const orgId = req.orgId;
  const orgPackage = req.orgPackage;
  try {
    const itemExistCount = await ItemInfo.countDocuments({ orgId: orgId });
    if (itemExistCount + 1 > orgPackage?.limit?.items) {
      return res.status(400).send({ error: "Package limit exceeded" });
    }
    if (!data?.name) {
      return res.status(400).send({ error: "Name is required" });
    } else {
      const existingItemInfo = await ItemInfo.findOne({
        SKU: data?.SKU?.trim(),
        orgId: req.orgId,
      });
      if (existingItemInfo) {
        return res.status(400).send({ error: "Item already exists" });
      } else {
        const lastItem = await ItemInfo.findOne({}).sort({ code: -1 });
        // const lastCode = lastItem?.code + 1;
        // const lastCodeExist = await ItemInfo.findOne({ code: lastCode });
        // if (lastCodeExist) {

        // }
        const newItemInfo = new ItemInfo({
          orgId: req.orgId,
          code: lastItem?.code + 1 || 1000000001,
          name: data.name?.trim(),
          discription: data.discription?.trim(),
          SKU: data.SKU?.trim(),
          UOM: data.UOM,
          salePrice: data.salePrice,
          group: data.group,
          type: data.type,
          vat: data.vat,
          safetyStock: data.safetyStock,
          isShelfLife: data.isShelfLife,
          isSaleable: data.isSaleable,
          isSerialized: data.isSerialized,
          createdBy: req.actionBy,
          updatedBy: req.actionBy,
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
          action: `New item "${newItemInfo.name}" created`,
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
