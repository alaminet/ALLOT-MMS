const Member = require("../../model/member");

async function getAccessCTR(req, res) {
  const data = req.body;
  try {
    if (!data.id) {
      return res.status(400).send({ error: "ID are required" });
    } else {
      const existingMember = await Member.findById(data.id).populate(
        "costCenter"
      );
      if (!existingMember) {
        return res.status(400).send({ error: "Member not exists" });
      } else if (!existingMember.status) {
        return res.status(403).send({ error: "Your Accounts is blocked" });
      } else {
        res.status(200).send({
          message: "Access retrieved successfully",
          member: {
            id: existingMember._id,
            name: existingMember.name,
            email: existingMember.email,
            phone: existingMember.phone,
            costCenter: existingMember.costCenter._id,
            costCenterName: existingMember.costCenter.name,
            access: existingMember.access,
            authorization: existingMember.authorization,
            isAdmin: existingMember.isAdmin,
            token: existingMember.token,
          },
        });
      }
    }
  } catch (error) {
    res.status(500).send({ error: error.message || "Error access" });
  }
}
module.exports = getAccessCTR;
