const OrgUser = require("../../model/orgUser");

async function createOrgUserCTR(req, res, next) {
  const data = req.body;
  try {
    if (!data.orgName) {
      return res.status(400).send({ error: "Name is required" });
    } else {
      const existingData = await OrgUser.findOne({
        name: data.orgName?.trim(),
        orgId: req.orgId,
      });
      if (existingData) {
        return res.status(400).send({ error: "Data already exists" });
      } else {
        const lastItem = await OrgUser.findOne({}).sort({ orgId: -1 });
        const newData = new OrgUser({
          orgId: lastItem?.orgId + 1 || 1001,
          orgName: data?.orgName?.trim(),
          TIN: data?.TIN,
          trade: data?.trade,
          email: data?.email,
          phone: data?.phone,
          taxInfo: data?.taxInfo,
          officeAddress: data?.officeAddress,
          businessAddress: data?.businessAddress,
          paymentInfo: data.paymentInfo,
          createdBy: req.actionBy,
          updatedBy: req.actionBy,
        });
        await newData.save();
        res.status(201).send({
          message: "New data inserted",
        });

        // Add Log activites
        const logData = {
          orgId: req.orgId,
          id: req.actionBy,
          refModel: "Org-User",
          action: `New Organization "${newData.name}" created`,
        };
        req.log = logData;
        next();
      }
    }
  } catch (error) {
    console.log(error);

    res.status(500).send({ error: error.message || "Error creating" });
  }
}
module.exports = createOrgUserCTR;
