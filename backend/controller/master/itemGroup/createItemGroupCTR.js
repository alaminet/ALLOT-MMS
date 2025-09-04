const ItemGroup = require("../../../model/master/itemGroup");

async function createItemGroupCTR(req, res, next) {
  const data = req.body;
  try {
    if (!data.name) {
      return res.status(400).send({ error: "Name is required" });
    } else {
      const existingItemGroup = await ItemGroup.findOne({
        code: data.name,
      });
      if (existingItemGroup) {
        return res.status(400).send({ error: "Group already exists" });
      } else {
        const lastItem = await ItemGroup.findOne({}).sort({ _id: -1 });
        const newData = new ItemGroup({
          orgId: req.orgId,
          name: data.name.trim(),
          code: lastItem?.code + 1 || 2001,
          createdBy: req.actionBy,
        });
        await newData.save();
        res.status(201).send({
          message: "New group Created",
        });

        // Add Log activites
        const logData = {
          orgId: req.orgId,
          id: req.actionBy,
          refModel: "Item_Group",
          action: `New group "${newData.name}" created`,
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
module.exports = createItemGroupCTR;
