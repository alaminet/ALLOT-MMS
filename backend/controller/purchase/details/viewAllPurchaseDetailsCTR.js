const purchaseRequisition = require("../../../model/purchaseReq");
const purchaseOrder = require("../../../model/purchaseOrder");

const modelMap = {
  purchaseRequisition,
  purchaseOrder,
};

async function viewAllPurchaseDetailsCTR(req, res) {
  const data = req.body;
  const modelName = req.body.tnxType;
  try {
    // Set base query
    const query = {
      isDeleted: { $ne: true },
      orgId: req.orgId,
    };

    if (data.scope === "own") {
      query["createdBy"] = req.actionBy;
    } else if (data.scope === "others") {
      query["createdBy"] = { $ne: req.actionBy };
    }

    if (data.status && data.status !== "All") {
      query["status"] = data.status;
    }

    if (data.code) {
      query["itemDetails.code"] = data.code;
    }

    if (data.docRef) {
      query["code"] = data.docRef;
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

    // Build items array depending on tnxType
    let items = [];
    let pathList = ["createdBy", "updatedBy", "itemDetails.code"];
    if (modelName === "purchaseRequisition" || modelName === "all") {
      pathList.push("costCenter");
    }
    if (modelName && String(modelName).toLowerCase() === "all") {
      // Query all models in the modelMap and tag each result with its source
      const entries = Object.entries(modelMap);
      for (const [key, Model] of entries) {
        const docs = await Model.find(query)
          .populate({
            path: pathList,
            select: ["name", "SKU"],
          })
          .lean();
        if (docs && docs.length > 0) {
          const tagged = docs.map((d) => ({ ...d, tnxType: key }));
          items = items.concat(tagged);
        }
      }
    } else {
      // Query only the requested model
      const Model = modelMap[modelName];
      if (!Model) {
        return res.status(400).send({ error: "Invalid tnxType" });
      }

      const docs = await Model.find(query)
        .populate({
          path: pathList,
          select: ["name", "SKU"],
        })
        .lean();
      if (docs && docs.length > 0) {
        items = docs.map((d) => ({ ...d, tnxType: modelName }));
      }
    }

    if (!items || items.length === 0) {
      return res.status(404).send({ error: "No data found" });
    }

    // Filter itemDetails to exclude deleted items and, if data.code provided,
    // keep only details that match the provided code. This ensures final
    // response contains only relevant itemDetails.
    const codeStr = data.code ? String(data.code) : null;
    items = items.map((item) => {
      const filteredDetails = (item.itemDetails || []).filter((detail) => {
        if (!detail) return false;
        if (detail.isDeleted === true) return false;
        if (!codeStr) return true;

        // match detail.code whether populated or not
        const detCode = detail.code;
        if (!detCode) return false;
        if (typeof detCode === "object") {
          const id = detCode._id ? detCode._id : detCode;
          return String(id) === codeStr;
        }
        return String(detCode) === codeStr;
      });
      return { ...item, itemDetails: filteredDetails };
    });

    // Remove items with no remaining itemDetails after filtering
    items = items.filter(
      (item) => item.itemDetails && item.itemDetails.length > 0
    );

    if (!items || items.length === 0) {
      return res.status(404).send({ error: "No data found" });
    }

    // sort by createdAt descending for predictability
    items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.status(200).send({
      message: "Data retrieved",
      items: items,
    });
  } catch (error) {
    console.log(error);

    res.status(500).send({ error: error.message || "Error retrieving" });
  }
}

module.exports = viewAllPurchaseDetailsCTR;
