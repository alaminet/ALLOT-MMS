const Organization = require("../../../model/orgUser");

async function updateOrganizationSUCTR(req, res, next) {
  const { id } = req.params;
  const updatedData = req.body;

  try {
    if (!id) {
      return res.status(400).send({ error: "ID is required" });
    }
    const dataExist = await Organization.findOne({
      orgName: updatedData?.orgName?.trim(),
      orgId: updatedData?.orgId,
      _id: { $ne: id },
    });
    if (dataExist) {
      return res.status(400).send({ error: "Data already exist" });
    } else {
      const changedData = await Organization.findByIdAndUpdate(
        id,
        updatedData,
        {
          new: true,
        }
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
          ? `"${changedData.orgName}" deleted`
          : `"${changedData.orgName}" updated`;

      const logData = {
        id: req.actionBy,
        refModel: "Organization",
        action: actionTex,
      };
      req.log = logData;
      next();
    }
  } catch (error) {
    res.status(500).send({ error: error.message || "Error updating" });
  }
}
module.exports = updateOrganizationSUCTR;
