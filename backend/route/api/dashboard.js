const express = require("express");
const viewDashboardCTR = require("../../controller/dashboard/viewDashboardCTR");

const route = express.Router();

route.get("/view", viewDashboardCTR);

module.exports = route;
