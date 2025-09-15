const PurchaseReq = require("../../model/purchaseReq");

async function updatePurchaseReqCTR(req, res, next) {
  const { id } = req.params;
  const updatedData = req.body;

  try {
    if (!id) {
      return res.status(400).send({ error: "ID is required" });
    }
    const dataExist = await PurchaseReq.findOne({
      code: updatedData.code?.trim(),
      orgId: req.orgId,
      _id: { $ne: id },
    });
    if (dataExist) {
      return res.status(400).send({ error: "Data already exist" });
    } else {
      const changedData = await PurchaseReq.findByIdAndUpdate(
        id,
        {
          orgId: updatedData.orgId,
          code: updatedData?.code,
          reference: updatedData.reference,
          type: updatedData.type,
          costCenter: updatedData.costCenter,
          requestedBy: updatedData.requestedBy,
          checkedBy: updatedData.checkedBy,
          approvedBy: updatedData.approvedBy,
          note: updatedData.note,
          itemDetails: updatedData.itemDetails.map((dtl) => ({
            name: dtl.name,
            code: dtl.code !== "" ? dtl.code : null,
            spec: dtl.spec,
            UOM: dtl.UOM,
            brand: dtl.brand,
            unitPrice: dtl.unitPrice,
            reqQty: dtl.reqQty,
            onHandQty: dtl.onHandQty,
            consumePlan: dtl.consumePlan,
            remarks: dtl.remarks,
          })),
          updatedBy: updatedData.updatedBy,
        },
        {
          new: true,
        }
      ); // Exclude sensitive fields
      if (!changedData) {
        return res.status(404).send({ error: "Data not found" });
      }
      res.status(200).send({
        message: "Data updated",
      });

      // Add Log activites
      const actionTex =
        Object.keys(updatedData) == "isDeleted"
          ? `PR "${changedData.code}" deleted`
          : `PR "${changedData.code}" updated`;

      const logData = {
        orgId: req.orgId,
        id: req.actionBy,
        refModel: "Purchase",
        action: actionTex,
      };
      req.log = logData;
      next();
    }
  } catch (error) {
    console.log(error);

    res.status(500).send({ error: error.message || "Error updating" });
  }
}
module.exports = updatePurchaseReqCTR;
