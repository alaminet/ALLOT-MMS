const PurchaseOrder = require("../../../model/purchaseOrder");

async function updatePurchaseOrderCTR(req, res, next) {
  const { id } = req.params;
  const updatedData = req.body;

  try {
    if (!id) {
      return res.status(400).send({ error: "ID is required" });
    }
    const dataExist = await PurchaseOrder.findOne({
      code: updatedData.code?.trim(),
      orgId: req.orgId,
      _id: { $ne: id },
    });
    if (dataExist) {
      return res.status(400).send({ error: "Data already exist" });
    } else {
      if (updatedData.field === "isDeleted") {
        const changedData = await PurchaseOrder.findOneAndUpdate(
          { "itemDetails._id": updatedData.lineID },
          {
            $set: { "itemDetails.$.isDeleted": updatedData.data },
            updatedBy: req.actionBy,
          },
          { new: true }
        );
        res.status(200).send({
          message: "Line Deleted",
        });

        // matched line items
        const matchedItem = changedData.itemDetails.find(
          (item) => item._id.toString() === updatedData.lineID
        );
        // Add Log activities
        const logData = {
          orgId: req.orgId,
          id: req.actionBy,
          refModel: "Purchase-Order",
          action: `"${matchedItem?.name}" deleted from PO "${changedData.code}"`,
        };
        req.log = logData;
        next();
      } else {
        const changedData = await PurchaseOrder.findByIdAndUpdate(
          id,
          {
            ...updatedData,
            updatedBy: req.actionBy,
          },
          {
            new: true,
          }
        ); // Exclude sensitive fields
        res.status(200).send({
          message: "Data updated",
        });
        // Add Log activities
        const logData = {
          orgId: req.orgId,
          id: req.actionBy,
          refModel: "Purchase-Order",
          action: `PO "${changedData.code}" updated`,
        };
        req.log = logData;
        next();
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: error.message || "Error updating" });
  }
}
module.exports = updatePurchaseOrderCTR;
