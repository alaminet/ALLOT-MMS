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

    if (data?.payStatus === "due") {
      query["payments.duePay"] = { $gt: 0 };
    }
    if (data?.payStatus === "paid") {
      query["payments.duePay"] = { $eq: 0 };
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
