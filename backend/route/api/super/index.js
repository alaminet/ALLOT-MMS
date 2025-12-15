const express = require("express");
const route = express.Router();
const SUmemberApi = require("./SUmember");
const secureSUAPI = require("../../../middleware/secureSUAPI");
const secureSUJWT = require("../../../middleware/secureSUJWT");
const viewLogsActivitesSUCTR = require("../../../controller/super/logActivities/viewLogsActivitesSUCTR");

route.use("/SUmember", SUmemberApi);
// route.use("/issue", issueApi);
// route.use("/move-order", moveOrderApi);
// route.post("/tnx-details", viewAllTnxDetails);
// route.post("/tnx-details/view", viewSingleTnxDetails);
route.post("/logs", secureSUAPI, secureSUJWT, viewLogsActivitesSUCTR);

module.exports = route;
