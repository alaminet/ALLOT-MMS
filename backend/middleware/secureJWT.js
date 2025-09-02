const jwt = require("jsonwebtoken");
const Member = require("../model/member");

function secureJWT(req, res, next) {
  const token = req.headers.token;
  if (!token) return res.status(404).send({ error: "Token Not Found" });
  jwt.verify(token, process.env.JWT_SECRET, async (err, user) => {
    if (err) return res.status(403).send({ error: "Token expired" }); // Token expired or invalid
    const existingMember = await Member.findById(user.tokenRef);

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
