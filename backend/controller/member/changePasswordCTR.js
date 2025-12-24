const Member = require("../../model/member");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

async function changePasswordCTR(req, res) {
  const { id, newPassword, oldPassword } = req.body;
  try {
    if (!id || !newPassword || !oldPassword) {
      return res.status(400).send({ error: "ID and password are required" });
    } else {
      const existingMember = await Member.findById(id);
      if (!existingMember) {
        return res.status(400).send({ error: "Member not exists" });
      } else {
        const isPasswordValid = await bcrypt.compare(
          oldPassword,
          existingMember.password
        );
        if (!isPasswordValid) {
          return res.status(400).send({ error: "Invalid Old password" });
        } else {
          bcrypt.hash(newPassword, 10, async function (err, hash) {
            if (err) {
              return res.status(500).send({ error: "Error hashing password" });
            }
            existingMember.password = hash;
            await existingMember.save();

            res.status(200).send({
              message: "Password change successful",
            });
          });
        }
      }
    }
  } catch (error) {
    res.status(500).send({ error: error.message || "Password change error" });
  }
}
module.exports = changePasswordCTR;
