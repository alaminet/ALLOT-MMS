const WebSetting = require("../../model/webSetting");

async function viewWebSettingCTR(req, res) {
  try {
    const query = {
      isDeleted: false,
      orgId: req.orgId,
    };

    const qeryData = await WebSetting.findOne(query)
      .populate({
        path: ["createdBy", "updatedBy"],
        select: "name",
      })
      .lean();
    if (qeryData.length === 0) {
      return res.status(404).send({ error: "No data found" });
    }
    res.status(200).send({
      message: "Data retrieved",
      webSetting: qeryData,
    });
  } catch (error) {
    res.status(500).send({ error: error.message || "Error retrieving" });
  }
}

module.exports = viewWebSettingCTR;
