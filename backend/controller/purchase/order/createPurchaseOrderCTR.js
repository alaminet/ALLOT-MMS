const PurchaseOrder = require("../../../model/purchaseOrder");
const PurchaseReq = require("../../../model/purchaseReq");

async function createPurchaseOrderCTR(req, res, next) {
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
    const itemExistCount = await PurchaseOrder.countDocuments({
      orgId: orgId,
      createdAt: { $gte: startOfMonth, $lte: endOfNow },
    });
    if (itemExistCount + 1 > orgPackage?.limit?.purchases) {
      return res.status(400).send({ error: "Package limit exceeded" });
    }
    if (!data.itemDetails || data.itemDetails.length == 0) {
      return res.status(400).send({ error: "Item is required" });
    } else {
      const lastItem = await PurchaseOrder.findOne({}).sort({ code: -1 });
      const newData = new PurchaseOrder({
        orgId: req.orgId,
        code: lastItem?.code + 1 || 4000000001,
        type: data?.type,
        supplier: data?.supplier,
        requestedBy: data.requestedBy,
        checkedBy: data?.checkedBy,
        approvedBy: data?.approvedBy,
        note: data?.note,
        delveryTerms: data?.delveryTerms,
        deliveryLocation: data?.deliveryLocation,
        billingLocation: data?.billingLocation,
        requiredDoc: data?.requiredDoc,
        paymentTerms: data?.paymentTerms,
        paymentMode: data?.paymentMode,
        POCurrency: data?.POCurrency,
        deliveryTarget: new Date(data?.deliveryTarget),
        itemDetails: data?.itemDetails?.map((dtl) => ({
          code: dtl.code !== "" ? dtl.code : null,
          PRRef: dtl.PRRef !== "" ? dtl.PRRef : null,
          PRLineId: dtl.PRLineId,
          PRCode: dtl.PRCode,
          SKU: dtl.SKU,
          name: dtl.name,
          spec: dtl.spec,
          UOM: dtl.UOM,
          POQty: Number(dtl.POQty),
          POPrice: Number(dtl.POPrice),
          reqPOVAT: Number(dtl.reqPOVAT),
          remarks: dtl.remarks,
        })),
        createdBy: req.actionBy,
        updatedBy: req.actionBy,
      });
      await newData.save();

      for (const dtl of newData.itemDetails) {
        const prId = dtl.PRRef;
        const prLineId = dtl.PRLineId;
        const qty = Number(dtl.POQty || 0);
        if (!prId || !prLineId || !qty) continue;

        await PurchaseReq.updateOne(
          { _id: prId, "itemDetails._id": prLineId },
          { $inc: { "itemDetails.$.POQty": qty } }
        );
      }
      res.status(201).send({
        message: `New PR "${newData.code}" created`,
      });

      // Add Log activites
      const logData = {
        orgId: req.orgId,
        id: req.actionBy,
        refModel: "Purchase-Order",
        action: `New purchase Order "${newData.code}" created`,
      };
      req.log = logData;
      next();
    }
  } catch (error) {
    console.log(error);

    res.status(500).send({ error: error.message || "Error creating" });
  }
}
module.exports = createPurchaseOrderCTR;
