const Member = require("../../model/member");

async function viewAllMemberCTR(req, res) {
  const data = req.body;

  try {
    const query = {
      deleted: { $ne: true },
      orgId: req.orgId,
    };
    if (data.scope === "own") {
      query["createdBy"] = req.actionBy;
    } else if (data.scope === "others") {
      query["createdBy"] = { $ne: req.actionBy };
    }
    const members = await Member.find(query)
      .sort({ createdAt: -1 })
      .select("email isAdmin name phone status createdAt costCenter access"); // Exclude sensitive fields
    if (members.length === 0) {
      return res.status(404).send({ error: "No members found" });
    }
    res.status(200).send({
      message: "Members retrieved",
      members: members,
    });
  } catch (error) {
    res.status(500).send({ error: error.message || "Error retrieving" });
  }
}

module.exports = viewAllMemberCTR;
