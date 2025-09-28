const express = require("express");
const route = express.Router();
const receiveApi = require("./receive");
// const itemDetailsApi = require("./itemDetails");

route.use("/receive", receiveApi);
// route.use("/itemDetails", itemDetailsApi);

module.exports = route;
