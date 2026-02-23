const SalesPOS = require("../../../model/Sales/SalesPOS");

async function updateBulkPOSPayCTR(req, res, next) {
  const paymentsData = req.body;
  try {
    if (!paymentsData || !Array.isArray(paymentsData)) {
      return res.status(400).send({ error: "Payments array is required" });
    }

    if (paymentsData.length === 0) {
      return res
        .status(400)
        .send({ error: "At least one payment is required" });
    }

    const logActivities = [];
    const updatePromises = [];

    // Process each payment in the array
    for (const payment of paymentsData) {
      if (!payment.actionId) {
        return res.status(400).send({
          error: "actionId is required for each payment",
        });
      }

      // Update SalesPOS document with the payment
      const updatePromise = SalesPOS.findByIdAndUpdate(
        payment.actionId,
        {
          $push: {
            "payments.payment": {
              amount: payment.amount,
              payBy: payment.payBy,
              payRef: payment.payRef || "",
              receBy: req.actionBy,
            },
          },
          updatedBy: req.actionBy,
        },
        { new: true },
      ).then((changedData) => {
        if (changedData) {
          // Prepare log data for each payment
          logActivities.push({
            orgId: req.orgId,
            id: req.actionBy,
            refModel: "Sales_POS",
            action: `Invoice "${changedData.code}" payment received - Amount: ${payment.amount} via ${payment.payBy}`,
          });
        }
        return changedData;
      });

      updatePromises.push(updatePromise);
    }

    // Wait for all updates to complete
    const results = await Promise.all(updatePromises);

    // Check if all updates were successful
    if (results.some((r) => !r)) {
      return res.status(404).send({ error: "One or more documents not found" });
    }

    res.status(200).send({
      message: `${results.length} invoice payments updated`,
      paymentCount: results.length,
    });

    // Pass all log activities to the next middleware
    if (logActivities.length > 0) {
      req.logs = logActivities;
    }
    next();
  } catch (error) {
    res.status(500).send({
      error: error.message || "Error updating bulk payments",
    });
  }
}
module.exports = updateBulkPOSPayCTR;
