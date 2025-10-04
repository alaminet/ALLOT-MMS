const ItemUOM = require("../../../model/master/itemUOM");
const ItemGroup = require("../../../model/master/itemGroup");
const ItemType = require("../../../model/master/itemType");
const CostCenter = require("../../../model/master/constCenter");
const StoreLocation = require("../../../model/master/storeLocation");
const Transaction = require("../../../model/master/transactionType");

const modelMap = {
  ItemUOM,
  ItemGroup,
  ItemType,
  CostCenter,
  StoreLocation,
  Transaction,
};

async function viewItemDetailsCTR(req, res) {
  const data = req.body;
  const modelName = req.body.model;
  const Model = modelMap[modelName];

  try {
    if (!Model || typeof Model.find !== "function") {
      return res.status(400).send({ error: "Invalid model name" });
    }

    //   Set a query filed
    const query = {
      isDeleted: false,
      orgId: req.orgId,
    };
    // Dynamically add createdBy filter
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

    const items = await Model.find(query)
      .sort({ createdAt: -1 })
      .populate({ path: "createdBy", select: "name" })
      .populate({ path: "updatedBy", select: "name" })
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

module.exports = viewItemDetailsCTR;
