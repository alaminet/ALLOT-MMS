const express = require("express");
const route = express.Router();
const itemInfoApi = require("./itemInfo");
const itemDetailsApi = require("./itemDetails");

route.use("/itemInfo", itemInfoApi);
route.use("/itemDetails", itemDetailsApi);

module.exports = route;
