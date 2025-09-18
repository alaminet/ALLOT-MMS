const PurchaseReq = require("../../../model/purchaseReq");

async function viewPurchaseReqCTR(req, res) {
  const data = req.body;

  try {
    const query = {
      deleted: { $ne: true },
      orgId: req.orgId,
    };
    if (data.scope === "own") {
      query["createdBy"] = req.actionBy;
    } else if (data.scope === "others") {
      query["createdBy"] = { $ne: req.actionBy };
    }
    const items = await PurchaseReq.find(query)
      .sort({ createdAt: -1 })
      .populate({
        path: ["createdBy", "updatedBy", "costCenter", "itemDetails.code"],
        select: "name code SKU",
      })
      .lean();
    if (items.length === 0) {
      return res.status(404).send({ error: "No data found" });
    } else {
      // Filtered Deleted line items
      const filteredItems = items
        .map((item) => {
          const filteredDetails = item.itemDetails.filter(
            (detail) => detail.isDeleted !== true
          );
          return filteredDetails.length > 0
            ? { ...item, itemDetails: filteredDetails }
            : null;
        })
        .filter(Boolean); // removes nulls
      res.status(200).send({
        message: "Data retrieved",
        items: filteredItems,
      });
    }
  } catch (error) {
    res.status(500).send({ error: error.message || "Error retrieving" });
  }
}

module.exports = viewPurchaseReqCTR;
