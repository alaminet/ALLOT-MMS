const express = require("express");
const viewDashboardCTR = require("../../controller/dashboard/viewDashboardCTR");

const route = express.Router();

route.post("/view", viewDashboardCTR);

module.exports = route;
