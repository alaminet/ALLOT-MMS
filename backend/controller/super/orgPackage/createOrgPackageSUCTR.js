const OrgPackage = require("../../../model/super/orgPackage");

async function createOrgPackageSUCTR(req, res, next) {
  const data = req.body;
  try {
    if (!data.organization) {
      return res.status(400).send({ error: "Name is required" });
    } else {
      const existingData = await OrgPackage.findOne({
        organization: data.organization,
      });
      if (existingData) {
        return res.status(400).send({ error: "Package already exists" });
      } else {
        const newData = new OrgPackage({
          organization: data?.organization,
          affiliater: data?.affiliater,
          affaliteAmount: data?.affaliteAmount,
          dueDate: data?.dueDate,
          module: data?.module,
          authorization: data?.authorization,
          limit: data?.limit,
          price: data?.price,
          createdBy: req.actionBy,
          updatedBy: req.actionBy,
        });
        await newData.save();
        res.status(201).send({
          message: "New data inserted",
        });

        // Add Log activites
        const logData = {
          id: req.actionBy,
          refModel: "Organization-Package",
          action: `New package created for "${newData.organization}"`,
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
module.exports = createOrgPackageSUCTR;
