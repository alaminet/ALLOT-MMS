const TrnxDetails = require("../../../model/transaction/trnxDetails");

async function viewAllTnxDetails(req, res) {
  const data = req.body;
  try {
    const query = {
      isDeleted: false,
      orgId: req.orgId,
    };
    if (data.scope === "own") {
      query["createdBy"] = req.actionBy;
    } else if (data.scope === "others") {
      query["createdBy"] = { $ne: req.actionBy };
    }
    if (data.tnxType !== "All") {
      query["tnxType"] = data.tnxType;
    }
    if (data.code) {
      query["itemCode"] = data.code;
    }
    // Dynamically add createdAt filter
    if (
      data?.startDate !== "Invalid date" ||
      data?.endDate !== "Invalid date"
    ) {
      query.createdAt = {};
      if (data?.startDate !== "Invalid date") {
        query.createdAt.$gte = new Date(data.startDate);
      }
      if (data?.endDate !== "Invalid date") {
        query.createdAt.$lte = new Date(data.endDate);
      }
    }
    const transactions = await TrnxDetails.find(query)
      .sort({ createdAt: -1 })
      .populate({
        path: ["createdBy", "updatedBy"],
        select: "name",
      })
      .lean();
    if (transactions.length === 0) {
      return res.status(404).send({ error: "No data found" });
    }
    res.status(200).send({
      message: "Data retrieved",
      transactions: transactions,
    });
  } catch (error) {
    res.status(500).send({ error: error.message || "Error retrieving" });
  }
}

module.exports = viewAllTnxDetails;
