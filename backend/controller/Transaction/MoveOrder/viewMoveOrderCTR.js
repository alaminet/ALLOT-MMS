const TrnxMoveOrder = require("../../../model/transaction/trnxMoveOrder");

async function viewMoveOrderCTR(req, res) {
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

    if (data?.status) {
      query["status"] = data.status;
    }

    const items = await TrnxMoveOrder.find(query)
      .sort({ createdAt: -1 })
      .populate({
        path: ["createdBy", "updatedBy", "costCenter", "itemDetails.code"],
        select: "name code SKU avgPrice stock",
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

module.exports = viewMoveOrderCTR;
