const express = require("express");
const route = express.Router();
const requisitionApi = require("./requisition");

route.use("/requisition", requisitionApi);

module.exports = route;
