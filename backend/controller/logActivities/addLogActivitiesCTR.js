const Log = require("../../model/logActivities");

async function addLogActivitiesCTR(req, res) {
  const log = req.log;

  try {
    if (!log.id || !log.refModel || !log.action || !log.orgId) {
      return res.status(400).send({ error: "id, Model & Action are required" });
    } else {
      const addLog = new Log({
        orgId: log.orgId,
        action: log.action,
        actionBy: log.id,
        refModel: log.refModel,
      });
      await addLog.save();
    }
  } catch (error) {
    res.status(500).send({ error: error.message || "Error create" });
  }
}
module.exports = addLogActivitiesCTR;
