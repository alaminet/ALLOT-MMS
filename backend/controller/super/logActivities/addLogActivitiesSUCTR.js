const Log = require("../../../model/super/SULog");

async function addLogActivitiesSUCTR(req, res) {
  const log = req.log;

  try {
    if (Array.isArray(log)) {
      await Log.insertMany(
        log.map((l) => ({
          action: l.action,
          actionBy: l.id,
          refModel: l.refModel,
        }))
      );
    } else {
      const addLog = new Log({
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
module.exports = addLogActivitiesSUCTR;
