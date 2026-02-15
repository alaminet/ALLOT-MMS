const SalesPOS = require("../../../model/Sales/SalesPOS");

async function viewAllPOSCTR(req, res) {
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

    // payment status filtering: need to compare sum(payments.payment.amount) vs payments.totalBill
    let aggregateMatchIds = null;
    if (data?.payStatus === "due" || data?.payStatus === "paid") {
      // build match stage from current query
      const matchStage = { $match: query };

      // compute paidAmount and dueAmount
      const addFieldsStage = {
        $addFields: {
          paidAmount: { $sum: "$payments.payment.amount" },
        },
      };
      const addDueStage = {
        $addFields: {
          dueAmount: { $subtract: ["$payments.totalBill", "$paidAmount"] },
        },
      };

      // select documents depending on payStatus
      const dueMatch = { $match: { dueAmount: { $gt: 0 } } };
      const paidMatch = { $match: { dueAmount: { $lte: 0 } } };

      const pipeline = [matchStage, addFieldsStage, addDueStage];
      pipeline.push(data?.payStatus === "due" ? dueMatch : paidMatch);
      const aggRes = await SalesPOS.aggregate(pipeline).project({ _id: 1 });
      aggregateMatchIds = aggRes.map((d) => d._id);
      // if no ids matched, respond with 404 early
      if (!aggregateMatchIds || aggregateMatchIds.length === 0) {
        return res.status(404).send({ error: "No data found" });
      }
      // restrict subsequent find to these ids
      query["_id"] = { $in: aggregateMatchIds };
    }
    if (data?.SKU) {
      query["products.SKU"] = data?.SKU;
    }
    if (data?.number) {
      query["billing.number"] = { $regex: data?.number, $options: "i" };
    }
    if (data?.code) {
      query["code"] = data?.code;
    }

    const items = await SalesPOS.find(query)
      .sort({ createdAt: -1 })
      .populate({
        path: [
          "createdBy",
          "updatedBy",
          "createdBySU",
          "updatedBySU",
          "payments.payment.receBy",
        ],
        select: "name",
      })
      .lean();
    if (items.length === 0) {
      return res.status(404).send({ error: "No data found" });
    }
    res.status(200).send({
      message: "Data retrieved",
      items: items,
    });
  } catch (error) {
    res.status(500).send({ error: error.message || "Error retrieving" });
  }
}

module.exports = viewAllPOSCTR;
