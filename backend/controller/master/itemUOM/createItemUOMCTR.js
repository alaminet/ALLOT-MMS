const ItemUOM = require("../../../model/master/itemUOM");

async function createItemUOMCTR(req, res, next) {
  const data = req.body;
  try {
    if (!data.code) {
      return res.status(400).send({ error: "Code is required" });
    } else {
      const existingItemUOM = await ItemUOM.findOne({
        code: data.code?.toUpperCase().trim(),
      });
      if (existingItemUOM) {
        return res.status(400).send({ error: "UOM already exists" });
      } else {
        const newData = new ItemUOM({
          orgId: req.orgId,
          name: data.name.trim(),
          code: data.code.toUpperCase().trim(),
          createdBy: req.actionBy,
        });
        await newData.save();
        res.status(201).send({
          message: "New UOM Created",
        });

        // Add Log activites
        const logData = {
          orgId: req.orgId,
          id: req.actionBy,
          refModel: "Item_UOM",
          action: `New UOM ${newData.name} created`,
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
module.exports = createItemUOMCTR;
