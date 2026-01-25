const express = require("express");
const route = express.Router();
const memberApi = require("./member");
const masterApI = require("./master");
const supplierApi = require("./supplier");
const purchaseApi = require("./purchase");
const transactionApi = require("./transaction");
const dashboardApi = require("./dashboard");
const orgUserApi = require("./orgUser");
const webSettingApi = require("./webSetting");
const superApi = require("./super");
const salesApi = require("./sales");
const viewLogsActivitesCTR = require("../../controller/logActivities/viewLogsActivitesCTR");
const secureAPI = require("../../middleware/secureAPI");
const secureJWT = require("../../middleware/secureJWT");
const addLogActivitiesCTR = require("../../controller/logActivities/addLogActivitiesCTR");
const addLogActivitiesSUCTR = require("../../controller/super/logActivities/addLogActivitiesSUCTR");

route.use("/member", memberApi, addLogActivitiesCTR);
route.use("/master", secureAPI, secureJWT, masterApI, addLogActivitiesCTR);
route.use("/supplier", secureAPI, secureJWT, supplierApi, addLogActivitiesCTR);
route.use("/purchase", secureAPI, secureJWT, purchaseApi, addLogActivitiesCTR);
route.use("/sales", secureAPI, secureJWT, salesApi, addLogActivitiesCTR);
route.use(
  "/transaction",
  secureAPI,
  secureJWT,
  transactionApi,
  addLogActivitiesCTR,
);
route.use(
  "/dashboard",
  secureAPI,
  secureJWT,
  dashboardApi,
  addLogActivitiesCTR,
);
route.use("/orgUser", secureAPI, secureJWT, orgUserApi, addLogActivitiesCTR);
route.use(
  "/webSetting",
  secureAPI,
  secureJWT,
  webSettingApi,
  addLogActivitiesCTR,
);
route.post("/logs", secureAPI, secureJWT, viewLogsActivitesCTR);

// Supper
route.use("/super", superApi, addLogActivitiesSUCTR);

module.exports = route;
