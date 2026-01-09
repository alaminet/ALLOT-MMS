const bcrypt = require("bcrypt");
const Member = require("../../../model/super/memberSU");

async function createMemberSUCTR(req, res, next) {
  const data = req.body;

  try {
    if (/\s/.test(data.username)) {
      return res.status(400).send({ error: "Username cannot contain spaces" });
    }
    if (!data.email || !data.password || !data.username) {
      return res
        .status(400)
        .send({ error: "Email, and password are required" });
    } else {
      const existingMember = await Member.findOne({
        $or: [
          { email: data.email?.toLowerCase().trim() },
          { username: data.username?.toLowerCase().trim() },
        ],
      });
      if (existingMember) {
        return res.status(400).send({ error: "Member already exists" });
      } else {
        bcrypt.hash(data.password, 10, async function (err, hash) {
          const newMember = new Member({
            username: data.username?.toLowerCase().trim(),
            name: data.name.trim(),
            email: data.email.toLowerCase().trim(),
            password: hash,
            phone: data?.phone,
            access: data?.access,
            authorization: data?.authorization,
            createdBy: req.actionBy,
            updatedBy: req.actionBy,
          });
          await newMember.save();
          res.status(201).send({
            message: "New Member Created",
          });

          // Add Log activites
          const logData = {
            id: req.actionBy,
            refModel: "Member",
            action: `New user ${newMember.name} created`,
          };
          req.log = logData;
          next();
        });
      }
    }
  } catch (error) {
    res.status(500).send({ error: error.message || "Error create" });
  }
}
module.exports = createMemberSUCTR;
