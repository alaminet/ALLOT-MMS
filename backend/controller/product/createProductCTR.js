const Product = require("../../model/product");

async function createProductCTR(req, res, next) {
  const data = req.body;
  try {
    if (!data.name || !data.code) {
      return res.status(400).send({ error: "Name and Code are required" });
    } else {
      const existingProduct = await Product.findOne({
        code: data.code?.trim(),
      });
      if (existingProduct) {
        return res.status(400).send({ error: "Product already exists" });
      } else {
        const newProduct = new Product({
          name: data.name.trim(),
          code: data.code.trim(),
          category: data.category,
          discription: data.discription,
          purchasePrice: data.purchasePrice,
          salePrice: data.salePrice,
          safetyStock: data.safetyStock,
          createdBy: data.createdBy,
        });
        await newProduct.save();
        res.status(201).send({
          message: "New Product Created",
        });

        // Add Log activites
        const logData = {
          id: req.actionBy,
          refModel: "Product",
          action: `New product ${newProduct.name} created`,
        };
        req.log = logData;
        next();
      }
    }
  } catch (error) {
    res.status(500).send({ error: error.message || "Error creating" });
  }
}
module.exports = createProductCTR;
