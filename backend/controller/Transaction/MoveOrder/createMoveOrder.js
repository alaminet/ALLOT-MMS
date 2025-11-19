const TrnxMoveOrder = require("../../../model/transaction/trnxMoveOrder");

async function createMoveOrder(req, res, next) {
  const data = req.body;

  try {
    if (!data.itemDetails || data.itemDetails.length == 0) {
      return res.status(400).send({ error: "Item is required" });
    } else {
      const lastItem = await TrnxMoveOrder.findOne({}).sort({ _id: -1 });
      const newData = new TrnxMoveOrder({
        orgId: req.orgId,
        code: lastItem?.code + 1 || 100001,
        requestedBy: data.requestedBy,
        headerText: data?.headerText,
        reference: data?.reference,
        costCenter: data?.costCenter,
        itemDetails: data?.itemDetails?.map((dtl) => ({
          code: dtl.code !== "" ? dtl.code : null,
          SKU: dtl.SKU,
          name: dtl.name,
          UOM: dtl.UOM,
          onHand: Number(dtl.onHand),
          reqQty: Number(dtl.reqQty),
          reqPOVAT: Number(dtl.reqPOVAT),
          remarks: dtl.remarks,
        })),
        createdBy: req.actionBy,
        updatedBy: req.actionBy,
      });
      await newData.save();

      res.status(201).send({
        message: `New Move Order "${newData.code}" created`,
      });

      // Add Log activites
      const logData = {
        orgId: req.orgId,
        id: req.actionBy,
        refModel: "Move-Order",
        action: `New move order "${newData.code}" created`,
      };
      req.log = logData;
      next();
    }
  } catch (error) {
    console.log(error);

    res.status(500).send({ error: error.message || "Error creating" });
  }
}
module.exports = createMoveOrder;
