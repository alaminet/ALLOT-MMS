const bcrypt = require("bcrypt");
const Member = require("../../../model/member");

async function createOrgMemberSUCTR(req, res, next) {
  const data = req.body;

  try {
    if (!data.email || !data.password) {
      return res
        .status(400)
        .send({ error: "Email, and password are required" });
    } else {
      const existingMember = await Member.findOne({
        email: data.email.toLowerCase().trim(),
      });
      if (existingMember) {
        return res.status(400).send({ error: "Email already exists" });
      } else {
        bcrypt.hash(data.password, 10, async function (err, hash) {
          const newMember = new Member({
            orgId: data.orgId,
            name: data.name.trim(),
            email: data.email.toLowerCase().trim(),
            password: hash,
            phone: data?.phone,
            access: data?.access,
            authorization: data?.authorization,
            createdBySU: req.actionBy,
            updatedBySU: req.actionBy,
          });
          await newMember.save();
          res.status(201).send({
            message: "New Member Created",
          });

          // Add Log activites
          const logData = {
            id: req.actionBy,
            refModel: "OrgMember",
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
module.exports = createOrgMemberSUCTR;
