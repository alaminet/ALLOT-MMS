const OrgPackage = require("../../../model/super/orgPackage");

async function viewAllOrgPackageSUCTR(req, res) {
  const data = req.body;
  try {
    const query = {};
    if (data.scope === "own") {
      query["createdBy"] = req.actionBy;
    } else if (data.scope === "others") {
      query["createdBy"] = { $ne: req.actionBy };
    }
    const queryData = await OrgPackage.find(query)
      .sort({ createdAt: -1 })
      .populate({
        path: ["createdBy", "updatedBy", "organization", "affiliater"],
        select: "name orgId orgName",
      })
      .lean();
    if (queryData.length === 0) {
      return res.status(404).send({ error: "No data found" });
    }
    res.status(200).send({
      message: "Data retrieved",
      queryData: queryData,
    });
  } catch (error) {
    res.status(500).send({ error: error.message || "Error retrieving" });
  }
}

module.exports = viewAllOrgPackageSUCTR;
