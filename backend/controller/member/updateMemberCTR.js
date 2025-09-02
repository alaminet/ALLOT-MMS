const Member = require("../../model/member");

async function updateMemberCTR(req, res, next) {
  const { id } = req.params;
  const updatedData = req.body;

  try {
    if (!id) {
      return res.status(400).send({ message: "ID is required" });
    }
    const dataExist = await Member.findOne({
      email: updatedData?.email?.toLowerCase().trim(),
      _id: { $ne: id },
    });
    if (dataExist) {
      return res.status(400).send({ message: "Email already exist" });
    } else {
      const updatedMember = await Member.findByIdAndUpdate(id, updatedData, {
        new: true,
      }).select("-password -otp -token"); // Exclude sensitive fields
      if (!updatedMember) {
        return res.status(404).send({ message: "Member not found" });
      }
      res.status(200).send({
        message: "Member updated successfully",
        member: updatedMember,
      });

      // Add Log activites
      const actionTex =
        Object.keys(updatedData) == "deleted"
          ? `"${updatedMember.name}" ${Object.keys(updatedData)}`
          : `"${updatedMember.name}" ${Object.keys(updatedData)} updated`;

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
    res.status(500).send({ message: error.message || "Error updating" });
  }
}
module.exports = updateMemberCTR;
