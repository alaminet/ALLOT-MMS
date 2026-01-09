const TrnxReceive = require("../../../model/transaction/trnxReceive");
const TrnxIssue = require("../../../model/transaction/trnxIssue");
const TrnxDetails = require("../../../model/transaction/trnxDetails");
const Member = require("../../../model/member");

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

    // requester cost center
    const userCostCenter = await Member.findOne({ _id: req.actionBy })
      .select("costCenter")
      .populate("costCenter", "name")
      .lean();
    const userDept = userCostCenter?.costCenter?.name || null;

    // last 6 months transaction details summary
    const lastSixMonths = new Date();
    lastSixMonths.setMonth(lastSixMonths.getMonth() - 6);
    const createdAtFilter = { $gte: lastSixMonths };
    for (const reqItem of transactions?.itemDetails) {
      if (!reqItem.code) continue;
      const sixMonthUsedSummary = await TrnxDetails.aggregate([
        {
          $match: {
            orgId: req.orgId,
            itemCode: String(reqItem.code),
            createdAt: createdAtFilter,
            tnxQty: { $lt: 0 },
          },
        },
      ]);
      // attach summary to the reqItem
      reqItem.sixMonthUsedAll =
        sixMonthUsedSummary.reduce((sum, trnx) => trnx.tnxQty + sum, 0) * -1;
      reqItem.sixMonthUsedDept =
        sixMonthUsedSummary.reduce(
          (sum, trnx) =>
            trnx.costCenter == userDept ? trnx.tnxQty + sum : sum,
          0
        ) * -1;
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
