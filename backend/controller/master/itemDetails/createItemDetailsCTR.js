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

async function createItemDetailsCTR(req, res, next) {
  const data = req.body;
  const modelName = req.body.model;
  const Model = modelMap[modelName];

  try {
    if (!Model || typeof Model.find !== "function") {
      return res.status(400).send({ error: "Invalid model name" });
    }

    //   Set a query filed
    const query = {
      name: data.name.trim(),
      orgId: req.orgId,
    };
    if (data.code) {
      query.code = data.code?.toUpperCase().trim();
    }

    const existingItem = await Model.findOne(query);
    if (existingItem) {
      return res.status(400).send({ error: "UOM already exists" });
    } else {
      if (!data.code) {
        const modelDefaultsCode =
          modelName === "ItemGroup"
            ? 2001
            : modelName === "ItemType"
            ? 3001
            : modelName === "StoreLocation"
            ? 4001
            : modelName === "Transaction"
            ? 5001
            : modelName === "CostCenter"
            ? 6001
            : null;
        const lastItem = await Model.findOne({}).sort({ _id: -1 });
        const lastCode = parseInt(lastItem?.code, 10);
        query.code = Number.isNaN(lastCode) ? modelDefaultsCode : lastCode + 1;
      }

      query.createdBy = req.actionBy;
      query.updatedBy = req.actionBy;
      const newData = new Model(query);
      await newData.save();
      res.status(201).send({
        message: "Item Details Created",
      });

      // Add Log activites
      const logData = {
        orgId: req.orgId,
        id: req.actionBy,
        refModel: "Item_Details",
        action: `New ${Model.modelName} "${newData.name}" created`,
      };
      req.log = logData;
      next();
    }
  } catch (error) {
    console.log(error);

    res.status(500).send({ error: error.message || "Error creating" });
  }
}
module.exports = createItemDetailsCTR;
