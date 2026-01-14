const OrgMember = require("../../../model/member");

async function viewAllOrgMemberSUCTR(req, res) {
  const data = req.body;

  try {
    const query = {};
    if (data?.scope === "own") {
      query["createdBy"] = req.actionBy;
    } else if (data.scope === "others") {
      query["createdBy"] = { $ne: req.actionBy };
    }
    const dataRetrived = await OrgMember.find(query)
      .select("-password")
      .sort({ orgId: -1 })
      .populate({
        path: ["createdBy", "updatedBy"],
        select: "name",
      })
      .lean();
    if (dataRetrived.length === 0) {
      return res.status(404).send({ error: "No data found" });
    }
    res.status(200).send({
      message: "Data retrieved",
      data: dataRetrived,
    });
  } catch (error) {
    res.status(500).send({ error: error.message || "Error retrieving" });
  }
}

module.exports = viewAllOrgMemberSUCTR;
