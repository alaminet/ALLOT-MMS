const express = require("express");
const route = express.Router();
const memberApi = require("./member");
const categoryApi = require("./category");
const productApi = require("./product");
const viewLogsActivitesCTR = require("../../controller/logActivities/viewLogsActivitesCTR");
const secureAPI = require("../../middleware/secureAPI");
const secureJWT = require("../../middleware/secureJWT");

route.use("/member", memberApi);
route.use("/category", secureAPI, secureJWT, categoryApi);
route.use("/product", secureAPI, secureJWT, productApi);
route.post("/logs", secureAPI, secureJWT, viewLogsActivitesCTR);

module.exports = route;
