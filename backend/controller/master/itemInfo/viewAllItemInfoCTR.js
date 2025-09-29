const ItemInfo = require("../../../model/master/itemInfo");

async function viewAllItemInfoCTR(req, res) {
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
    const items = await ItemInfo.find(query)
      .sort({ createdAt: -1 })
      .populate({
        path: ["UOM", "group", "type", "createdBy", "updatedBy"],
        select: "name code",
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

module.exports = viewAllItemInfoCTR;
