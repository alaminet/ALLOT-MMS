const MemberSU = require("../../../model/super/memberSU");

async function getAccessSUCTR(req, res) {
  const data = req.body;
  try {
    if (!data.id) {
      return res.status(400).send({ error: "ID are required" });
    } else {
      const existingMember = await MemberSU.findById(data.id);
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
module.exports = getAccessSUCTR;
