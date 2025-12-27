const TrnxMoveOrder = require("../../../model/transaction/trnxMoveOrder");
const TrnxDetails = require("../../../model/transaction/trnxDetails");

async function viewSingleMoveOrderCTR(req, res) {
  const data = req.body;

  try {
    const query = {
      isDeleted: false,
      orgId: req.orgId,
    };
    if (data.scope === "own") {
      query["createdBy"] = req.actionBy;
    } else if (data.scope === "others") {
      query["createdBy"] = { $ne: req.actionBy };
    }

    if (data?.MOid) {
      query["_id"] = data.MOid;
    }
    if (data?.code) {
      query["code"] = data.code;
    }

    const items = await TrnxMoveOrder.findOne(query)
      .sort({ createdAt: -1 })
      .populate({
        path: ["createdBy", "updatedBy", "costCenter", "itemDetails.code"],
        select: "name code SKU stock avgPrice",
      })
      .lean();
    if (!items) {
      return res.status(404).send({ error: "No data found" });
    }

    // Filtered Deleted line items
    const filteredDetails = items.itemDetails.filter((d) => !d.isDeleted);
    if (filteredDetails.length > 0) {
      items.itemDetails = filteredDetails;
    }
    if (items.itemDetails.length === 0) {
      return res.status(404).send({ error: "No data found" });
    }

    // // last 6 months transaction details summary
    // const lastSixMonths = new Date();
    // lastSixMonths.setMonth(lastSixMonths.getMonth() - 6);
    // const createdAtFilter = { $gte: lastSixMonths };
    // for (const reqItem of items?.itemDetails) {
    //   if (!reqItem.code) continue;
    //   const sixMonthUsedSummary = await TrnxDetails.aggregate([
    //     {
    //       $match: {
    //         orgId: req.orgId,
    //         itemCode: String(reqItem.code.code),
    //         createdAt: createdAtFilter,
    //         tnxQty: { $lt: 0 },
    //       },
    //     },
    //   ]);
    //   // attach summary to the reqItem
    //   reqItem.sixMonthUsed =
    //     sixMonthUsedSummary.reduce((sum, trnx) => trnx.tnxQty + sum, 0) * -1;
    // }

    const now = new Date();

    // last six months start
    const lastSixMonths = new Date();
    lastSixMonths.setMonth(lastSixMonths.getMonth() - 6);

    // start of current month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    for (const reqItem of items?.itemDetails) {
      if (!reqItem.code) continue;

      const summary = await TrnxDetails.aggregate([
        {
          $match: {
            orgId: req.orgId,
            itemCode: String(reqItem.code.code),
            tnxQty: { $lt: 0 },
          },
        },
        {
          $facet: {
            sixMonthUsed: [
              { $match: { createdAt: { $gte: lastSixMonths } } },
              {
                $group: {
                  _id: null,
                  total: { $sum: "$tnxQty" },
                },
              },
            ],
            runningMonthUsed: [
              { $match: { createdAt: { $gte: startOfMonth } } },
              {
                $group: {
                  _id: null,
                  total: { $sum: "$tnxQty" },
                },
              },
            ],
          },
        },
      ]);

      // attach both summaries
      reqItem.sixMonthUsed = (summary[0].sixMonthUsed[0]?.total || 0) * -1;
      reqItem.runningMonthUsed =
        (summary[0].runningMonthUsed[0]?.total || 0) * -1;
    }

    res.status(200).send({
      message: "Data retrieved",
      items: items,
    });
  } catch (error) {
    console.log(error);

    res.status(500).send({ error: error.message || "Error retrieving" });
  }
}

module.exports = viewSingleMoveOrderCTR;
