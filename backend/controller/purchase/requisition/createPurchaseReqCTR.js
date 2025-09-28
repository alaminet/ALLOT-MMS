const PurchaseReq = require("../../../model/purchaseReq");

async function createPurchaseReqCTR(req, res, next) {
  const data = req.body;
  try {
    if (!data.itemDetails) {
      return res.status(400).send({ error: "Item is required" });
    } else {
      const lastItem = await PurchaseReq.findOne({}).sort({ _id: -1 });
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
        message: "New data inserted",
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
