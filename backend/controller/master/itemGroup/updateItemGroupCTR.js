const ItemGroup = require("../../../model/master/itemGroup");

async function updateItemGroupCTR(req, res, next) {
  const { id } = req.params;
  const updatedData = req.body;

  try {
    if (!id) {
      return res.status(400).send({ error: "ID is required" });
    }
    const dataExist = await ItemGroup.findOne({
      code: updatedData.code,
      orgId: req.orgId,
      _id: { $ne: id },
    });
    if (dataExist) {
      return res.status(400).send({ error: "Code already exist" });
    } else {
      const changedData = await ItemGroup.findByIdAndUpdate(id, updatedData, {
        new: true,
      }); // Exclude sensitive fields
      if (!changedData) {
        return res.status(404).send({ error: "Group not found" });
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
        orgId: req.orgId,
        id: req.actionBy,
        refModel: "Item_UOM",
        action: actionTex,
      };
      req.log = logData;
      next();
    }
  } catch (error) {
    console.log(error);

    res.status(500).send({ error: error.message || "Error updating" });
  }
}
module.exports = updateItemGroupCTR;
