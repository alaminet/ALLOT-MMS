const Category = require("../../model/category");

async function viewAllCategoryCTR(req, res) {
  try {
    const categories = await Category.find({ deleted: { $ne: true } })
      .sort({ createdAt: -1 })
      .populate({ path: "createdBy", select: "name" });
    if (categories.length === 0) {
      return res.status(404).send({ message: "No categories found" });
    }
    res.status(200).send({
      message: "Categories retrieved",
      categories: categories,
    });
  } catch (error) {
    res.status(500).send({ message: error.message || "Error retrieving" });
  }
}

module.exports = viewAllCategoryCTR;
