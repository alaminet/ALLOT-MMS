const Category = require("../../model/category");

async function updateCategoryCTR(req, res, next) {
  const { id } = req.params;
  const updatedData = req.body;

  try {
    if (!id) {
      return res.status(400).send({ message: "ID is required" });
    }
    const dataExist = await Category.findOne({
      code: updatedData?.code?.trim(),
      _id: { $ne: id },
    });
    if (dataExist) {
      return res.status(400).send({ message: "Code already exist" });
    } else {
      const updatedCategory = await Category.findByIdAndUpdate(
        id,
        updatedData,
        {
          new: true,
        }
      ); // Exclude sensitive fields
      if (!updatedCategory) {
        return res.status(404).send({ message: "Category not found" });
      }
      res.status(200).send({
        message: "Category updated",
      });

      // Add Log activites
      const actionTex =
        Object.keys(updatedData) == "deleted"
          ? `"${updatedCategory.name}" deleted`
          : `"${updatedCategory.name}" updated`;

      const logData = {
        id: req.actionBy,
        refModel: "Category",
        action: actionTex,
      };
      req.log = logData;
      next();
    }
  } catch (error) {
    res.status(500).send({ message: error.message || "Error updating" });
  }
}
module.exports = updateCategoryCTR;
