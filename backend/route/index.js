const express = require("express");
const route = express.Router();
const apiRoute = require("./api");
const addLogActivitiesCTR = require("../controller/logActivities/addLogActivitiesCTR");

route.use("/api", apiRoute, addLogActivitiesCTR);

module.exports = route;
