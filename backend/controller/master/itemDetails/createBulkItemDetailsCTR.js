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

async function createBulkItemDetailsCTR(req, res, next) {
  const { model: modelName, items } = req.body;
  const Model = modelMap[modelName];

  try {
    if (!Model || typeof Model.find !== "function") {
      return res.status(400).send({ error: "Invalid model name" });
    }

    if (Model === ItemUOM && items.some((i) => !i.code?.trim())) {
      return res
        .status(400)
        .send({ error: "All ItemUOM entries must have a code" });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).send({ error: "No items provided" });
    }

    if (items.length > 100) {
      return res
        .status(400)
        .send({ error: "Maximum 100 items can be inserted at a time" });
    }

    const orgId = req.orgId;
    const actionBy = req.actionBy;

    // Fetch existing names and codes
    const nameList = items.map((i) => i.name.trim());
    const codeList = items
      .map((i) => i.code?.toUpperCase().trim())
      .filter(Boolean);

    const query = {
      orgId,
      name: { $in: nameList },
    };

    if (Model === ItemUOM && codeList.length > 0) {
      query.code = { $in: codeList };
    }
    const existing = await Model.find(query).select("name code");
    const existingNames = new Set(existing.map((e) => e.name.trim()));
    const existingCodes = new Set(existing.map((e) => e.code?.toUpperCase()));

    // Get last code
    const lastItem = await Model.findOne({}).sort({ _id: -1 }).select("code");
    const lastCode = parseInt(lastItem?.code, 10);
    const defaultCode =
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

    let nextCode = Number.isNaN(lastCode) ? defaultCode : lastCode + 1;

    // Prepare new items
    const newItems = items
      .filter(
        (i) =>
          !existingNames.has(i.name.trim()) &&
          (!i.code || !existingCodes.has(i.code?.toUpperCase()))
      )
      .map((i) => ({
        name: i.name.trim(),
        code: Model === ItemUOM ? i.code.toUpperCase().trim() : nextCode++,
        orgId,
        createdBy: actionBy,
        updatedBy: actionBy,
      }));

    if (newItems.length === 0) {
      return res.status(400).send({ error: "All items already exist" });
    }

    await Model.insertMany(newItems);

    // Add Log activites
    const logArr = newItems.map((log) => ({
      orgId: log.orgId,
      id: log.createdBy,
      refModel: "Item_Details",
      action: `New ${Model.modelName} "${log.name}" created`,
    }));
    req.log = logArr;
    next();

    //   Server Response
    res.status(201).send({
      message: `${newItems.length} items created`,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: error.message || "Error creating" });
  }
}
module.exports = createBulkItemDetailsCTR;
