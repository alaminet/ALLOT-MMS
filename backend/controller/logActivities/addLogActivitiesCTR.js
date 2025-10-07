const Log = require("../../model/logActivities");

async function addLogActivitiesCTR(req, res) {
  const log = req.log;

  try {
    if (Array.isArray(log)) {
      await Log.insertMany(
        log.map((l) => ({
          orgId: l.orgId,
          action: l.action,
          actionBy: l.id,
          refModel: l.refModel,
        }))
      );
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
