const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Member = require("../../model/member");

async function loginCTR(req, res, next) {
  const data = req.body;
  try {
    if (!data.email || !data.password) {
      return res
        .status(400)
        .send({ error: "Email, and password are required" });
    } else {
      const existingMember = await Member.findOne({
        email: data.email?.toLowerCase().trim(),
      });
      if (!existingMember) {
        return res.status(400).send({ error: "Member not exists" });
      } else if (!existingMember?.status) {
        return res.status(403).send({ error: "Your Accounts is blocked" });
      } else {
        const isPasswordValid = await bcrypt.compare(
          data.password,
          existingMember.password
        );
        if (!isPasswordValid) {
          return res.status(400).send({ error: "Invalid password" });
        } else {
          const tokenRef = existingMember.id;
          const token = jwt.sign({ tokenRef }, process.env.JWT_SECRET, {
            expiresIn: "9h",
          });

          // Update lastLogin time
          existingMember.token = token;
          await existingMember.save();
          res.status(200).send({
            message: "Login successful",
            member: {
              id: existingMember._id,
              name: existingMember.name,
              email: existingMember.email,
              phone: existingMember.phone,
              access: existingMember.access,
              isAdmin: existingMember.isAdmin,
              token: existingMember.token,
            },
          });

          // Add Log activites
          const logData = {
            orgId: existingMember.orgId,
            id: existingMember._id,
            refModel: "Member",
            action: `User ${existingMember.name} loggedin`,
          };
          req.log = logData;
          next();
        }
      }
    }
  } catch (error) {
    console.log(error);

    res.status(500).send({ error: error.message || "Error login" });
  }
}
module.exports = loginCTR;
