const OrgUser = require("../../model/orgUser");

async function viewOrgUserCTR(req, res) {
  try {
    const query = {
      isDeleted: false,
      orgId: req.orgId,
    };

    const qeryData = await OrgUser.findOne(query)
      .populate({
        path: ["createdBy", "updatedBy", "createdBySU", "updatedBySU"],
        select: "name",
      })
      .lean();
    if (qeryData.length === 0) {
      return res.status(404).send({ error: "No data found" });
    }
    res.status(200).send({
      message: "Data retrieved",
      businessSettings: qeryData,
    });
  } catch (error) {
    res.status(500).send({ error: error.message || "Error retrieving" });
  }
}

module.exports = viewOrgUserCTR;
