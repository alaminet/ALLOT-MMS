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

async function viewAllItemDetailsCTR(req, res) {
  const data = req.body;
  const modelName = req.body.model;

  try {
    //   Set a query filed
    const query = {
      isDeleted: { $ne: true },
      orgId: req.orgId,
    };

    const itemDetails = modelName.map(async (model) => {
      const Model = modelMap[model];
      if (!Model || typeof Model.find !== "function") {
        throw new Error(`Invalid model name: ${model}`);
      }

      const results = await Model.find(query)
        .sort({ createdAt: -1 })
        .select("_id name code")
        .lean();
      return {
        modelName: model,
        data: results,
      };
    });
    const items = await Promise.all(itemDetails);
    if (items.length === 0) {
      return res.status(404).send({ error: "No data found" });
    }

    res.status(200).send({
      message: "Data retrieved",
      items: items,
    });
  } catch (error) {
    console.log(error);

    res.status(500).send({ error: error.message || "Error retrieving" });
  }
}

module.exports = viewAllItemDetailsCTR;
