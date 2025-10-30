const express = require("express");
const route = express.Router();
const requisitionApi = require("./requisition");
const orderApi = require("./order");

route.use("/requisition", requisitionApi);
route.use("/order", orderApi);

module.exports = route;
