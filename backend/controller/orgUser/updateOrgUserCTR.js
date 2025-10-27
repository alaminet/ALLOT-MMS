const OrgUser = require("../../model/orgUser");

async function updateOrgUserCTR(req, res, next) {
  const { id } = req.params;
  const updatedData = req.body;

  try {
    if (!id) {
      return res.status(400).send({ error: "ID is required" });
    }
    const dataExist = await OrgUser.findOne({
      orgName: updatedData?.orgName?.trim(),
      orgId: req.orgId,
      _id: { $ne: id },
    });
    if (dataExist) {
      return res.status(400).send({ error: "Data already exist" });
    } else {
      const changedData = await OrgUser.findByIdAndUpdate(id, updatedData, {
        new: true,
      }); // Exclude sensitive fields
      if (!changedData) {
        return res.status(404).send({ error: "Data not found" });
      }
      res.status(200).send({
        message: "Data updated",
      });

      // Add Log activites
      const actionTex =
        Object.keys(updatedData) == "isDeleted"
          ? `"${changedData.orgName}" deleted`
          : `"${changedData.orgName}" updated`;

      const logData = {
        orgId: req.orgId,
        id: req.actionBy,
        refModel: "Org-User",
        action: actionTex,
      };
      req.log = logData;
      next();
    }
  } catch (error) {
    res.status(500).send({ error: error.message || "Error updating" });
  }
}
module.exports = updateOrgUserCTR;
