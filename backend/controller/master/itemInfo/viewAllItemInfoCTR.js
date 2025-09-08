const ItemInfo = require("../../../model/master/itemInfo");

async function viewAllItemInfoCTR(req, res) {
  try {
    const items = await ItemInfo.find({
      isDeleted: { $ne: true },
      orgId: req.orgId,
    })
      .sort({ createdAt: -1 })
      .populate({
        path: ["UOM", "group", "type", "createdBy", "updatedBy"],
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

module.exports = viewAllItemInfoCTR;
