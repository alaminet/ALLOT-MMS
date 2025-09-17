const PurchaseReq = require("../../../model/purchaseReq");

async function viewPurchaseReqCTR(req, res) {
  try {
    const items = await PurchaseReq.find({
      isDeleted: { $ne: true },
      orgId: req.orgId,
    })
      .sort({ createdAt: -1 })
      .populate({
        path: ["createdBy", "updatedBy", "costCenter", "itemDetails.code"],
        select: "name code SKU",
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

module.exports = viewPurchaseReqCTR;
