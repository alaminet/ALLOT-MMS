const Log = require("../../model/logActivities");

async function viewLogsActivitesCTR(req, res) {
  const data = req.body;
  try {
    const query = {
      isDeleted: { $ne: true },
    };

    if (data?.userId) {
      query.actionBy = data.userId;
    }

    if (data?.model) {
      query.refModel = data.model;
    }
    const Logs = await Log.find(query)
      .sort({ createdAt: -1 })
      .populate({ path: "actionBy", select: "name" });

    if (Logs.length === 0) {
      return res.status(404).send({ error: "No Logs found" });
    }
    res.status(200).send({
      message: "Logs retrieved",
      logs: Logs,
    });
  } catch (error) {
    res.status(500).send({ error: error.message || "Error retrieving" });
  }
}

module.exports = viewLogsActivitesCTR;
