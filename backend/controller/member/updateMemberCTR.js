const Member = require("../../model/member");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

async function updateMemberCTR(req, res, next) {
  const { id } = req.params;
  const updatedData = req.body;

  try {
    if (!id) {
      return res.status(400).send({ error: "ID is required" });
    }
    const dataExist = await Member.findOne({
      email: updatedData?.email?.toLowerCase().trim(),
      _id: { $ne: id },
    });
    if (dataExist) {
      return res.status(400).send({ error: "Email already exist" });
    } else {
      let updatedMember = {};
      updatedData.updatedBy = req.actionBy; // Track who made the update
      if (updatedData?.password) {
        const tokenRef = id;
        const token = jwt.sign({ tokenRef }, process.env.JWT_SECRET, {
          expiresIn: "9h",
        });
        bcrypt.hash(updatedData?.password, 10, async function (err, hash) {
          updatedData.password = hash;
          updatedData.token = token;
          updatedMember = await Member.findByIdAndUpdate(id, updatedData, {
            new: true,
          }).select("-password -otp -token"); // Exclude sensitive fields
        });
      } else {
        updatedMember = await Member.findByIdAndUpdate(id, updatedData, {
          new: true,
        }).select("-password -otp -token"); // Exclude sensitive fields
      }

      if (!updatedMember) {
        return res.status(404).send({ error: "Member not found" });
      }
      res.status(200).send({
        message: "Member updated successfully",
        member: updatedMember,
      });

      // Add Log activites
      const actionTex =
        Object.keys(updatedData) == "deleted"
          ? `"${updatedMember.name}" ${Object.keys(updatedData)}`
          : `"${updatedMember.name}" updated`;

      const logData = {
        orgId: updatedMember.orgId,
        id: req.actionBy,
        refModel: "Member",
        action: actionTex,
      };
      req.log = logData;
      next();
    }
  } catch (error) {
    res.status(500).send({ error: error.message || "Error updating" });
  }
}
module.exports = updateMemberCTR;
