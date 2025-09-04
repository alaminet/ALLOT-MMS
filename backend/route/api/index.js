const express = require("express");
const route = express.Router();
const memberApi = require("./member");
const masterAPI = require("./master");
const viewLogsActivitesCTR = require("../../controller/logActivities/viewLogsActivitesCTR");
const secureAPI = require("../../middleware/secureAPI");
const secureJWT = require("../../middleware/secureJWT");

route.use("/member", memberApi);
route.use("/master", secureAPI, secureJWT, masterAPI);
route.post("/logs", secureAPI, secureJWT, viewLogsActivitesCTR);

module.exports = route;
