const TrnxDetails = require("../../model/transaction/trnxDetails");
const PurchaseReq = require("../../model/purchaseReq");
const Member = require("../../model/member");
const ItemInfo = require("../../model/master/itemInfo");

async function viewDashboardCTR(req, res) {
  try {
    const orgId = req.orgId;
    const actionBy = req.actionBy;

    const memberDlts = await Member.findById(actionBy)
      .select("-access")
      .populate({ path: "costCenter", select: "name" })
      .lean();

    if (!memberDlts?.costCenter?.name) {
      return res
        .status(400)
        .send({ error: "Cost center not found for member" });
    }

    const costCenter = memberDlts.costCenter.name;

    // Date Ranges
    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
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
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 6); // includes today
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);

    const baseQuery = {
      orgId,
      tnxQty: { $lte: 0 },
      isDeleted: false,
    };

    if (!memberDlts.isAdmin) {
      baseQuery.costCenter = costCenter;
    }

    //   last 10 transactions
    const recentTransactions = await TrnxDetails.find(baseQuery)
      .sort({ issuedAt: -1 }) // newest first
      .select("itemName tnxQty itemPrice issuedAt tnxRef")
      .limit(10)
      .lean();

    // last 10 PR
    const baseQueryPR = {
      orgId,
      isDeleted: false,
      "itemDetails.isDeleted": false,
    };
    if (!memberDlts.isAdmin) {
      baseQueryPR.costCenter = memberDlts.costCenter._id;
    }
    const recentPurchaseReqs = await PurchaseReq.find(baseQueryPR)
      .sort({ createdAt: -1 }) // newest first
      .select("createdAt code type itemDetails requestedBy")
      .limit(10)
      .lean();

    const [daily, weekly, monthly, last7Days, yearly, weeklyPR, monthlyPR] =
      await Promise.all([
        TrnxDetails.find({
          ...baseQuery,
          documentAt: { $gte: startOfToday, $lte: endOfNow },
        }).lean(),
        TrnxDetails.find({
          ...baseQuery,
          documentAt: { $gte: sevenDaysAgo, $lte: endOfNow },
        }).lean(),
        TrnxDetails.find({
          ...baseQuery,
          documentAt: { $gte: startOfMonth, $lte: endOfNow },
        }).lean(),
        TrnxDetails.find({
          ...baseQuery,
          documentAt: { $gte: sevenDaysAgo, $lte: endOfNow },
        }).lean(),
        TrnxDetails.find({
          ...baseQuery,
          documentAt: { $gte: startOfYear, $lte: endOfYear },
        }).lean(),

        // for PR details
        PurchaseReq.find({
          ...baseQueryPR,
          createdAt: { $gte: sevenDaysAgo, $lte: endOfNow },
        }).lean(),
        PurchaseReq.find({
          ...baseQueryPR,
          createdAt: { $gte: startOfMonth, $lte: endOfNow },
        }).lean(),
      ]);

    // for Tnx details
    const sumQty = (arr) => arr.reduce((sum, d) => sum + (d.tnxQty || 0), 0);
    const sumVal = (arr) =>
      arr.reduce((sum, d) => sum + (d.itemPrice || 0) * (d.tnxQty || 0), 0);

    // for PR details
    const sumPRQty = (arr) =>
      arr?.reduce((total, doc) => {
        const itemSum =
          doc?.itemDetails
            ?.filter((d) => d?.isDeleted === false)
            .reduce((sum, d) => sum + (d?.reqQty || 0), 0) || 0;
        return total + itemSum;
      }, 0);
    const sumPRVal = (arr) =>
      arr?.reduce((total, doc) => {
        const itemSum =
          doc?.itemDetails
            ?.filter((d) => d?.isDeleted === false)
            .reduce(
              (sum, d) => sum + (d?.unitPrice || 0) * (d?.reqQty || 0),
              0
            ) || 0;
        return total + itemSum;
      }, 0);

    const dailySummary = {
      qty: sumQty(daily),
      value: Math.round(sumVal(daily)),
    };

    const weeklySummary = {
      qty: sumQty(weekly),
      value: Math.round(sumVal(weekly)),
    };

    const monthlySummary = {
      qty: sumQty(monthly),
      value: Math.round(sumVal(monthly) || 0),
    };

    const weeklyPRSummary = {
      qty: sumPRQty(weeklyPR),
      value: Math.round(sumPRVal(weeklyPR)),
    };

    const monthlyPRSummary = {
      qty: sumPRQty(monthlyPR),
      value: Math.round(sumPRVal(monthlyPR)),
    };
    const sevenDayBreakdown = {};
    // Step 1: Pre-fill keys 1–7 with actual date names
    for (let i = 0; i < 7; i++) {
      const date = new Date(now);
      date.setDate(now.getDate() - (6 - i)); // oldest to newest
      const key = i + 1; // numeric key: 1 to 7
      sevenDayBreakdown[key] = {
        qty: 0,
        value: 0,
        name: date.toISOString().slice(0, 10), // "YYYY-MM-DD"
      };
    }

    // Step 2: Merge actual transaction data
    for (const tx of last7Days) {
      const txDate = new Date(tx.issuedAt).toISOString().slice(0, 10); // "YYYY-MM-DD"
      // Match transaction date to one of the 7 pre-filled entries
      for (let i = 1; i <= 7; i++) {
        if (sevenDayBreakdown[i].name === txDate) {
          const qty = tx.tnxQty || 0;
          const price = tx.itemPrice || 0;
          const value = price * qty;
          sevenDayBreakdown[i].qty += qty;
          sevenDayBreakdown[i].value += Math.round(value);
          break;
        }
      }
    }

    //Monthly Qty & Values
    const monthNames = [
      "JAN",
      "FEB",
      "MAR",
      "APR",
      "MAY",
      "JUN",
      "JUL",
      "AUG",
      "SEP",
      "OCT",
      "NOV",
      "DEC",
    ];
    const monthlyBreakdown = {};
    for (let m = 0; m < 12; m++) {
      const key = m + 1; // 1 to 12
      monthlyBreakdown[key] = { qty: 0, value: 0, name: monthNames[m] };
    }
    for (const tx of yearly) {
      const date = new Date(tx.issuedAt);
      const monthKey = date.getMonth() + 1; // 1 to 12

      if (!monthlyBreakdown[monthKey]) {
        monthlyBreakdown[monthKey] = { qty: 0, value: 0 };
      }
      const qty = tx.tnxQty || 0;
      const price = tx.itemPrice || 0;
      const value = price * qty;
      monthlyBreakdown[monthKey].qty += qty;
      monthlyBreakdown[monthKey].value += Math.round(value);
    }

    //   Liqued Stock
    const liqStock = await ItemInfo.find({
      SKU: { $in: [3100000143, 3100000147] },
    });

    // Type wise stock
    const typeWiseStock = await ItemInfo.aggregate([
      { $match: { orgId, isDeleted: false } },
      { $unwind: "$stock" },
      {
        $lookup: {
          from: "item_types",
          localField: "type",
          foreignField: "_id",
          as: "typeInfo",
        },
      },
      { $unwind: "$typeInfo" },
      {
        $group: {
          _id: "$typeInfo.name",
          totalQty: { $sum: "$stock.onHandQty" },
          totalValue: {
            $sum: { $multiply: ["$stock.onHandQty", "$avgPrice"] },
          },
        },
      },
    ]);

    res.status(200).send({
      message: "Dashboard data retrieved",
      data: {
        daily: dailySummary,
        weekly: weeklySummary,
        weeklyPR: weeklyPRSummary,
        monthly: monthlySummary,
        monthlyPR: monthlyPRSummary,
        last7Days: sevenDayBreakdown,
        yearly: monthlyBreakdown,
        recentTransactions: recentTransactions,
        recentPurchaseReqs: recentPurchaseReqs,
        liqStock: liqStock,
        typeWiseStock: typeWiseStock,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message || "Error retrieving" });
  }
}

module.exports = viewDashboardCTR;
