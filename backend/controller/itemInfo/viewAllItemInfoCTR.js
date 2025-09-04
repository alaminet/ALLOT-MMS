const ItemInfo = require("../../model/itemInfo");

async function viewAllItemInfoCTR(req, res) {
  try {
    const items = await ItemInfo.find({
      isDeleted: { $ne: true },
      orgId: req.orgId,
    })
      .sort({ createdAt: -1 })
      .populate({ path: "createdBy", select: "name" })
      .populate({ path: "updatedBy", select: "name" });
    if (items.length === 0) {
      return res.status(404).send({ message: "No data found" });
    }
    res.status(200).send({
      message: "Data retrieved",
      items: items,
    });
  } catch (error) {
    res.status(500).send({ message: error.message || "Error retrieving" });
  }
}

module.exports = viewAllItemInfoCTR;
