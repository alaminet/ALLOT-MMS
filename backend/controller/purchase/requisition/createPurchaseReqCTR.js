const PurchaseReq = require("../../../model/purchaseReq");

async function createPurchaseReqCTR(req, res, next) {
  const data = req.body;
  const orgId = req.orgId;
  const orgPackage = req.orgPackage;
  try {
    // Date Ranges
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfNow = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      23,
      59,
      59,
      999
    );
    const itemExistCount = await PurchaseReq.countDocuments({
      orgId: orgId,
      createdAt: { $gte: startOfMonth, $lte: endOfNow },
    });
    if (itemExistCount + 1 > orgPackage?.limit?.purchases) {
      return res.status(400).send({ error: "Package limit exceeded" });
    }
    if (!data.itemDetails) {
      return res.status(400).send({ error: "Item is required" });
    } else {
      const lastItem = await PurchaseReq.findOne({}).sort({ code: -1 });
      const newData = new PurchaseReq({
        orgId: req.orgId,
        code: lastItem?.code + 1 || 3000000001,
        reference: data.reference,
        type: data.type,
        costCenter: data.costCenter,
        requestedBy: data.requestedBy,
        checkedBy: data.checkedBy,
        approvedBy: data.approvedBy,
        note: data.note,
        itemDetails: data.itemDetails?.map((dtl) => ({
          name: dtl.name,
          SKU: dtl.SKU,
          code: dtl.code !== "" ? dtl.code : null,
          spec: dtl.spec,
          brand: dtl.brand,
          UOM: dtl.UOM,
          unitPrice: dtl.unitPrice || null,
          reqQty: dtl.reqQty,
          POQty: dtl.POQty,
          recQty: dtl.recQty,
          onHandQty: dtl.onHandQty,
          consumePlan: dtl.consumePlan,
          remarks: dtl.remarks,
        })),
        createdBy: req.actionBy,
        updatedBy: req.actionBy,
      });
      await newData.save();
      res.status(201).send({
        message: `New PR "${newData.code}" created`,
        data: newData?._id,
      });

      // Add Log activites
      const logData = {
        orgId: req.orgId,
        id: req.actionBy,
        refModel: "Purchase-Requisition",
        action: `New purchase requisition "${newData.code}" created`,
      };
      req.log = logData;
      next();
    }
  } catch (error) {
    console.log(error);

    res.status(500).send({ error: error.message || "Error creating" });
  }
}
module.exports = createPurchaseReqCTR;
