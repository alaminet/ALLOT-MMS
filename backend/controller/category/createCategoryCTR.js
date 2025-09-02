const Category = require("../../model/category");

async function createCategoryCTR(req, res, next) {
  const data = req.body;
  try {
    if (!data.name || !data.code) {
      return res.status(400).send({ error: "Name and Code are required" });
    } else {
      const existingCategory = await Category.findOne({
        code: data.code?.trim(),
      });
      if (existingCategory) {
        return res.status(400).send({ error: "Category already exists" });
      } else {
        const newCategory = new Category({
          name: data.name.trim(),
          code: data.code.trim(),
          discription: data.discription,
          size: data.size?.map((size) => ({
            name: size.name,
            attribute: size.attribute?.map((att) => ({
              name: att.name,
              value: att.value,
            })),
          })),
          createdBy: data.createdBy,
        });
        await newCategory.save();
        res.status(201).send({
          message: "New Category Created",
        });

        // Add Log activites
        const logData = {
          id: req.actionBy,
          refModel: "Category",
          action: `New category ${newCategory.name} created`,
        };
        req.log = logData;
        next();
      }
    }
  } catch (error) {
    res.status(500).send({ error: error.message || "Error creating" });
  }
}
module.exports = createCategoryCTR;
