const express = require("express");
const route = express.Router();
const memberApi = require("./member");
const masterApI = require("./master");
const supplierApi = require("./supplier");
const purchaseApi = require("./purchase");
const transactionApi = require("./transaction");
const viewLogsActivitesCTR = require("../../controller/logActivities/viewLogsActivitesCTR");
const secureAPI = require("../../middleware/secureAPI");
const secureJWT = require("../../middleware/secureJWT");

route.use("/member", memberApi);
route.use("/master", secureAPI, secureJWT, masterApI);
route.use("/supplier", secureAPI, secureJWT, supplierApi);
route.use("/purchase", secureAPI, secureJWT, purchaseApi);
route.use("/transaction", secureAPI, secureJWT, transactionApi);
route.post("/logs", secureAPI, secureJWT, viewLogsActivitesCTR);

module.exports = route;
