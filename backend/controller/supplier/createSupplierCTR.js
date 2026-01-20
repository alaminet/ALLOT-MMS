const Supplier = require("../../model/supplier");

async function createSupplierCTR(req, res, next) {
  const data = req.body;
  const orgId = req.orgId;
  const orgPackage = req.orgPackage;
  try {
    const itemExistCount = await Supplier.countDocuments({ orgId: orgId });
    if (itemExistCount + 1 > orgPackage?.limit?.suppliers) {
      return res.status(400).send({ error: "Package limit exceeded" });
    }
    if (!data.name) {
      return res.status(400).send({ error: "Name is required" });
    } else {
      const existingData = await Supplier.findOne({
        name: data.name?.trim(),
        orgId: req.orgId,
      });
      if (existingData) {
        return res.status(400).send({ error: "Data already exists" });
      } else {
        const lastItem = await Supplier.findOne({}).sort({ code: -1 });
        const newData = new Supplier({
          orgId: req.orgId,
          code: lastItem?.code + 1 || 2000000001,
          name: data.name.trim(),
          email: data.email,
          phone: data.phone,
          TIN: data.TIN,
          taxInfo: data.taxInfo,
          type: data.type,
          officeAddress: data.officeAddress,
          paymentInfo: data.paymentInfo,
          createdBy: req.actionBy,
          updatedBy: req.actionBy,
        });
        await newData.save();
        res.status(201).send({
          message: "New data inserted",
        });

        // Add Log activites
        const logData = {
          orgId: req.orgId,
          id: req.actionBy,
          refModel: "Supplier",
          action: `New supplier "${newData.name}" created`,
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
module.exports = createSupplierCTR;
