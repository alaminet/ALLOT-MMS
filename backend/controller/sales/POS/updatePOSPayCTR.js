const SalesPOS = require("../../../model/Sales/SalesPOS");

async function updatePOSPayCTR(req, res, next) {
  const { id } = req.params;
  const updatedData = req.body;

  try {
    if (!id) {
      return res.status(400).send({ error: "ID is required" });
    }
    const changedData = await SalesPOS.findByIdAndUpdate(
      id,
      {
        $push: { "payments.payment": { ...updatedData, receBy: req.actionBy } },
        updatedBy: req.actionBy,
      },
      {
        new: true,
      },
    ); // Exclude sensitive fields
    if (!changedData) {
      return res.status(404).send({ error: "Data not found" });
    }
    res.status(200).send({
      message: "Payment Updated",
    });

    // Add Log activites

    const logData = {
      orgId: req.orgId,
      id: req.actionBy,
      refModel: "Sales_POS",
      action: `Invoice "${changedData.code}" payment received - Amount: ${updatedData.amount} via ${updatedData.payBy}`,
    };
    req.log = logData;
    next();
  } catch (error) {
    res.status(500).send({ error: error.message || "Error updating" });
  }
}
module.exports = updatePOSPayCTR;
