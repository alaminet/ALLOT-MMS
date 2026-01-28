const SalesPOS = require("../../../model/Sales/SalesPOS");

async function updatePOSCTR(req, res, next) {
  const { id } = req.params;
  const updatedData = req.body;

  try {
    if (!id) {
      return res.status(400).send({ error: "ID is required" });
    }
    const dataExist = await SalesPOS.findOne({
      code: updatedData.code?.trim(),
      orgId: req.orgId,
      _id: { $ne: id },
    });
    if (dataExist) {
      return res.status(400).send({ error: "Invoice already exist" });
    } else {
      const changedData = await SalesPOS.findByIdAndUpdate(
        id,
        { ...updatedData, updatedBy: req.actionBy },
        {
          new: true,
        },
      ); // Exclude sensitive fields
      if (!changedData) {
        return res.status(404).send({ error: "Data not found" });
      }
      res.status(200).send({
        message: "Data updated",
      });

      // Add Log activites
      const actionTex =
        Object.keys(updatedData) == "isDeleted"
          ? `"${changedData.code}" deleted`
          : `"${changedData.code}" updated`;

      const logData = {
        orgId: req.orgId,
        id: req.actionBy,
        refModel: "Sales_POS",
        action: actionTex,
      };
      req.log = logData;
      next();
    }
  } catch (error) {
    res.status(500).send({ error: error.message || "Error updating" });
  }
}
module.exports = updatePOSCTR;
