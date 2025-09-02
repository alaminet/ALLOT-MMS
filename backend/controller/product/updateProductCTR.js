const Product = require("../../model/product");

async function updateProductCTR(req, res, next) {
  const { id } = req.params;
  const updatedData = req.body;

  try {
    if (!id) {
      return res.status(400).send({ message: "ID is required" });
    }
    const dataExist = await Product.findOne({
      code: updatedData?.code?.trim(),
      _id: { $ne: id },
    });
    if (dataExist) {
      return res.status(400).send({ message: "Code already exist" });
    } else {
      const updatedProduct = await Product.findByIdAndUpdate(id, updatedData, {
        new: true,
      }); // Exclude sensitive fields
      if (!updatedProduct) {
        return res.status(404).send({ message: "Product not found" });
      }
      res.status(200).send({
        message: "Product updated",
      });

      // Add Log activites
      const actionTex =
        Object.keys(updatedData) == "deleted"
          ? `"${updatedProduct.name}" deleted`
          : `"${updatedProduct.name}" updated`;

      const logData = {
        id: req.actionBy,
        refModel: "Product",
        action: actionTex,
      };
      req.log = logData;
      next();
    }
  } catch (error) {
    res.status(500).send({ message: error.message || "Error updating" });
  }
}
module.exports = updateProductCTR;
