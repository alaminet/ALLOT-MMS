const TrnxReceive = require("../../../model/transaction/trnxReceive");
const TrnxIssue = require("../../../model/transaction/trnxIssue");

async function viewSingleTnxDetails(req, res) {
  const data = req.body;
  try {
    const query = {
      isDeleted: false,
      orgId: req.orgId,
      code: data?.tnxId,
    };
    if (data?.scope === "own") {
      query["createdBy"] = req.actionBy;
    } else if (data?.scope === "others") {
      query["createdBy"] = { $ne: req.actionBy };
    }

    if (!data?.tnxType) {
      return res.status(404).send({ error: "Transaction type not found" });
    }

    let transactions = [];

    if (data.tnxType === "receive") {
      transactions = await TrnxReceive.findOne(query)
        .sort({ createdAt: -1 })
        .populate({ path: ["createdBy", "updatedBy"], select: "name" })
        .lean();
    } else if (data.tnxType === "issue") {
      transactions = await TrnxIssue.findOne(query)
        .sort({ createdAt: -1 })
        .populate({ path: ["createdBy", "updatedBy"], select: "name" })
        .lean();
    } else {
      return res.status(400).send({ error: "Invalid transaction type" });
    }

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

module.exports = viewSingleTnxDetails;
