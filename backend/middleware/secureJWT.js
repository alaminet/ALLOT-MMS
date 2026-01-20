const jwt = require("jsonwebtoken");
const Member = require("../model/member");
const Organization = require("../model/orgUser");
const OrgPackage = require("../model/super/orgPackage");

function secureJWT(req, res, next) {
  const token = req.headers.token;
  if (!token) return res.status(404).send({ error: "Token Not Found" });
  jwt.verify(token, process.env.JWT_SECRET, async (err, user) => {
    if (err) return res.status(403).send({ error: "Token expired" }); // Token expired or invalid
    const existingMember = await Member.findById(user.tokenRef);
    const existingOrg = await Organization.findOne({
      orgId: existingMember.orgId,
    });
    const existingOrgPackage = await OrgPackage.findOne({
      organization: existingOrg._id,
    });

    if (!existingOrg.status) {
      return res.status(404).send({ error: "Your Organization is not active" });
    }
    if (existingOrg?.isDeleted) {
      return res.status(404).send({ error: "Your Organization is deleted" });
    }
    if (existingOrgPackage?.dueDate < Date.now()) {
      return res
        .status(403)
        .send({ error: "Package expired — kindly renew to continue service." });
    }
    if (token !== existingMember?.token) {
      return res.status(403).send({ error: "Invalid Token" });
    } else {
      req.actionBy = existingMember._id;
      req.orgId = existingMember.orgId;
      next();
    }
  });
}
module.exports = secureJWT;
