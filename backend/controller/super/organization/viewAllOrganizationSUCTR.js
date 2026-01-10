const Organization = require("../../../model/orgUser");

async function viewAllOrganizationSUCTR(req, res) {
  const data = req.body;
  try {
    const query = {
      deleted: { $ne: true },
    };
    if (data.scope === "own") {
      query["createdBy"] = req.actionBy;
    } else if (data.scope === "others") {
      query["createdBy"] = { $ne: req.actionBy };
    }
    const organization = await Organization.find(query)
      .sort({ orgId: -1 })
      .populate({
        path: ["createdBy", "updatedBy"],
        select: "name",
      })
      .lean();
    if (organization.length === 0) {
      return res.status(404).send({ error: "No data found" });
    }
    res.status(200).send({
      message: "Data retrieved",
      organization: organization,
    });
  } catch (error) {
    res.status(500).send({ error: error.message || "Error retrieving" });
  }
}

module.exports = viewAllOrganizationSUCTR;
