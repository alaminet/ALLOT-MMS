const WebSetting = require("../../model/webSetting");

async function createWebSettingCTR(req, res) {
  const data = req.body;
  try {
    if (!req.orgId) {
      return res.status(400).send({ error: "Organization Id is required" });
    } else {
      const existingData = await WebSetting.findOne({
        orgId: req.orgId,
      });
      if (existingData) {
        const newData = await WebSetting.findByIdAndUpdate(
          existingData._id,
          data,
          {
            new: true,
          }
        );
        return res
          .status(201)
          .send({ message: "Web Setting updated", webSetting: newData });
      } else {
        const newData = new WebSetting({
          orgId: req.orgId,
          dashboard: data?.dashboard,
          accounts: data?.accounts,
          terms: data?.terms,
          createdBy: req.actionBy,
          updatedBy: req.actionBy,
        });
        await newData.save();
        res.status(201).send({
          message: "New data inserted",
          webSetting: newData,
        });
      }
    }
  } catch (error) {
    console.log(error);

    res.status(500).send({ error: error.message || "Error creating" });
  }
}
module.exports = createWebSettingCTR;
