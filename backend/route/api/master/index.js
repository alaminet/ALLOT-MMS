const express = require("express");
const route = express.Router();
const itemInfoApi = require("./itemInfo");
const itemUOMApi = require("./itemUOM");
const itemGroupApi = require("./itemGroup");

route.use("/itemInfo", itemInfoApi);
route.use("/itemUOM", itemUOMApi);
route.use("/itemGroup", itemGroupApi);

module.exports = route;
