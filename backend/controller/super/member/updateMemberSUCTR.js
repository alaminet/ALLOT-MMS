const Member = require("../../../model/super/memberSU");

async function updateMemberSUCTR(req, res, next) {
  const { id } = req.params;
  const updatedData = req.body;

  try {
    if (!id) {
      return res.status(400).send({ error: "ID is required" });
    }
    const dataExist = await Member.findOne({
      email: updatedData?.email?.toLowerCase().trim(),
      username: updatedData?.username?.toLowerCase().trim(),
      _id: { $ne: id },
    });
    if (dataExist) {
      return res.status(400).send({ error: "Email/Username already exist" });
    } else {
      updatedData.updatedBy = req.actionBy; // Track who made the update
      const updatedMember = await Member.findByIdAndUpdate(id, updatedData, {
        new: true,
      }).select("-password -otp -token"); // Exclude sensitive fields
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
module.exports = updateMemberSUCTR;
