const TrnxMoveOrder = require("../../../model/transaction/trnxMoveOrder");

async function updateMoveOrderCTR(req, res, next) {
  const { id } = req.params;
  const updatedData = req.body;

  try {
    if (!id) {
      return res.status(400).send({ error: "ID is required" });
    }
    const dataExist = await TrnxMoveOrder.findOne({
      code: updatedData.code?.trim(),
      orgId: req.orgId,
      _id: { $ne: id },
    });
    if (dataExist) {
      return res.status(400).send({ error: "Data already exist" });
    } else {
      if (updatedData.field === "isDeleted") {
        const changedData = await TrnxMoveOrder.findOneAndUpdate(
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
          refModel: "Move-Order",
          action: `"${matchedItem?.name}" deleted from MO "${changedData.code}"`,
        };
        req.log = logData;
        next();
      } else {
        const changedData = await TrnxMoveOrder.findByIdAndUpdate(
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
          refModel: "Move-Order",
          action: `MO "${changedData.code}" updated`,
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
module.exports = updateMoveOrderCTR;
