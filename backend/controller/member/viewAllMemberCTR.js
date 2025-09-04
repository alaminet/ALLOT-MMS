const Member = require("../../model/member");

async function viewAllMemberCTR(req, res) {
  try {
    const members = await Member.find({
      deleted: { $ne: true },
      orgId: req.orgId,
    })
      .sort({ createdAt: -1 })
      .select("-password -otp -token"); // Exclude sensitive fields
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
