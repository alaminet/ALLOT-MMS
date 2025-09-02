const Product = require("../../model/product");

async function viewAllProductCTR(req, res) {
  try {
    const products = await Product.find({ deleted: { $ne: true } })
      .sort({ createdAt: -1 })
      .populate({ path: "category", select: "name" })
      .populate({ path: "createdBy", select: "name" });
    if (products.length === 0) {
      return res.status(404).send({ message: "No products found" });
    }
    res.status(200).send({
      message: "Products retrieved",
      products: products,
    });
  } catch (error) {
    res.status(500).send({ message: error.message || "Error retrieving" });
  }
}

module.exports = viewAllProductCTR;
