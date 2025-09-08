const express = require("express");
const route = express.Router();
const itemInfoApi = require("./itemInfo");
const itemUOMApi = require("./itemUOM");
const itemGroupApi = require("./itemGroup");
const itemDetailsApi = require("./itemDetails");

route.use("/itemInfo", itemInfoApi);
route.use("/itemUOM", itemUOMApi);
route.use("/itemGroup", itemGroupApi);
route.use("/itemDetails", itemDetailsApi);

module.exports = route;
