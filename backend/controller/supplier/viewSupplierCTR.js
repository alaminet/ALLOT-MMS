const Supplier = require("../../model/supplier");

async function viewSupplierCTR(req, res) {
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
    const items = await Supplier.find(query)
      .sort({ createdAt: -1 })
      .populate({
        path: ["createdBy", "updatedBy"],
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

module.exports = viewSupplierCTR;
