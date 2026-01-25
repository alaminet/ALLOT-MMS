const ItemInfo = require("../../../model/master/itemInfo");

async function createBulkItemInfoCTR(req, res, next) {
  const data = req.body;
  const orgId = req.orgId;
  const orgPackage = req.orgPackage;

  try {
    if (data.length > 100) {
      return res
        .status(400)
        .send({ error: "Maximum 100 items can be inserted at a time" });
    }
    const itemExistCount = await ItemInfo.countDocuments({ orgId: orgId });
    if (itemExistCount + data.length > orgPackage?.limit?.items) {
      return res.status(400).send({ error: "Package limit exceeded" });
    }

    // Step 1: Check for existing SKUs
    const skuSet = [...new Set(data.map((i) => i.SKU))];
    const existingSKUs = await ItemInfo.find({
      SKU: { $in: skuSet },
      orgId: req.orgId,
    }).select("SKU");
    const existingSKUSet = new Set(existingSKUs.map((i) => i.SKU));

    // Step 2: Filter out duplicates
    const newItems = data.filter((item) => !existingSKUSet.has(item.SKU));
    if (newItems.length === 0) {
      return res
        .status(400)
        .send({ error: "All SKUs already exist in the database" });
    }

    // Step 3: Get latest code
    const lastItem = await ItemInfo.findOne({})
      .sort({ code: -1 })
      .select("code");
    let nextCode = lastItem?.code || 1000000001;

    // Step 4: Prepare items for insertion
    const preparedItems = newItems.map((item) => ({
      ...item,
      orgId: req.orgId,
      createdBy: req.actionBy,
      updatedBy: req.actionBy,
      code: nextCode++,
      SKU: item?.SKU?.trim() || nextCode++,
    }));

    // Step 5: Insert into MongoDB
    await ItemInfo.insertMany(preparedItems);

    res.status(201).send({
      message: `${preparedItems.length} items Created`,
    });
    // Add Log activites
    const logArr = preparedItems.map((log) => ({
      orgId: log.orgId,
      id: log.createdBy,
      refModel: "Item_Info",
      action: `New item "${log.name}-${log.SKU}" created`,
    }));
    req.log = logArr;
    next();
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: error.message || "Error creating" });
  }
}
module.exports = createBulkItemInfoCTR;
