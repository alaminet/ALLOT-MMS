const ItemInfo = require("../../model/itemInfo");

async function updateItemInfoCTR(req, res, next) {
  const { id } = req.params;
  const updatedData = req.body;

  try {
    if (!id) {
      return res.status(400).send({ message: "ID is required" });
    }
    const dataExist = await ItemInfo.findOne({
      SKU: updatedData.SKU?.toLowerCase().trim(),
      orgId: req.orgId,
      _id: { $ne: id },
    });
    if (dataExist) {
      return res.status(400).send({ message: "SKU already exist" });
    } else {
      const changedData = await ItemInfo.findByIdAndUpdate(id, updatedData, {
        new: true,
      }); // Exclude sensitive fields
      if (!changedData) {
        return res.status(404).send({ message: "Item not found" });
      }
      res.status(200).send({
        message: "Data updated",
      });

      // Add Log activites
      const actionTex =
        Object.keys(updatedData) == "isDeleted"
          ? `"${changedData.name}" deleted`
          : `"${changedData.name}" updated`;

      const logData = {
        orgId: changedData.orgId,
        id: req.actionBy,
        refModel: "Item_Info",
        action: actionTex,
      };
      req.log = logData;
      next();
    }
  } catch (error) {
    res.status(500).send({ message: error.message || "Error updating" });
  }
}
module.exports = updateItemInfoCTR;
