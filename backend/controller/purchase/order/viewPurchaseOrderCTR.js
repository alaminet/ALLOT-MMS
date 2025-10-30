const PurchaseOrder = require("../../../model/purchaseOrder");

async function viewPurchaseOrderCTR(req, res) {
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

    if (data?.prId) {
      query["_id"] = data.prId;
    }

    const items = await PurchaseOrder.find(query)
      .sort({ createdAt: -1 })
      .populate({
        path: ["createdBy", "updatedBy", "supplier", "itemDetails.code"],
        select: "name code SKU",
      })
      .lean();
    if (items.length === 0) {
      return res.status(404).send({ error: "No data found" });
    } else {
      // Filtered Deleted line items
      const filteredItems = items.reduce((acc, item) => {
        const filteredDetails = item.itemDetails.filter((d) => !d.isDeleted);
        if (filteredDetails.length > 0) {
          acc.push({ ...item, itemDetails: filteredDetails });
        }
        return acc;
      }, []);
      res.status(200).send({
        message: "Data retrieved",
        items: filteredItems,
      });
    }
  } catch (error) {
    res.status(500).send({ error: error.message || "Error retrieving" });
  }
}

module.exports = viewPurchaseOrderCTR;
