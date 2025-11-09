const ItemUOM = require("../../../model/master/itemUOM");
const ItemGroup = require("../../../model/master/itemGroup");
const ItemType = require("../../../model/master/itemType");
const CostCenter = require("../../../model/master/constCenter");
const StoreLocation = require("../../../model/master/storeLocation");

const modelMap = {
  ItemUOM,
  ItemGroup,
  ItemType,
  CostCenter,
  StoreLocation,
};

async function updateItemDetailsCTR(req, res, next) {
  const { id } = req.params;
  const data = req.body;
  const modelName = req.body.model;
  const Model = modelMap[modelName];

  try {
    if (!id) {
      return res.status(400).send({ error: "ID is required" });
    }
    //   Set a query filed
    const query = {
      orgId: req.orgId,
      _id: { $ne: id },
      name: data.name?.trim(),
    };

    if (data.code) {
      query.code = data.code?.toUpperCase()?.trim();
    }
    const dataExist = await Model.findOne(query);
    if (dataExist) {
      return res.status(400).send({ error: `${modelName} already exist` });
    } else {
      const changedData = await Model.findByIdAndUpdate(id, data, {
        new: true,
      }); // Exclude sensitive fields
      if (!changedData) {
        return res.status(404).send({ error: "Model not found" });
      }
      res.status(200).send({
        message: "Data updated",
      });

      // Add Log activites
      const actionTex =
        "isDeleted" in data
          ? `${Model.modelName} "${changedData.name}" deleted`
          : `${Model.modelName} "${changedData.name}" updated`;
      const logData = {
        orgId: req.orgId,
        id: req.actionBy,
        refModel: "Item_Details",
        action: actionTex,
      };
      req.log = logData;
      next();
    }
  } catch (error) {
    res.status(500).send({ error: error.message || "Error updating" });
  }
}
module.exports = updateItemDetailsCTR;
