const Log = require("../../model/logActivities");
const ServerLog = require("../../model/serverLog");

async function addLogActivitiesCTR(req, res) {
  const log = req.log;
  const serverLog = req.serverLog;

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
    if (serverLog) {
      await ServerLog.insertMany(
        serverLog?.map((l) => ({
          orgId: l?.orgId || null,
          step: l?.step || null,
          status: l?.status || null,
          message: l?.message || null,
          code: l?.code || null,
          details: l?.details || null,
          controller: l?.controller || null,
          actionBy: l?.actionBy || null,
        }))
      );
    }
  } catch (error) {
    res.status(500).send({ error: error.message || "Error create" });
  }
}
module.exports = addLogActivitiesCTR;
