const express = require("express");
const route = express.Router();
const itemInfoApi = require("./itemInfo");
const itemUOMApi = require("./itemUOM");


route.use("/itemInfo", itemInfoApi);
route.use("/itemUOM", itemUOMApi);


module.exports = route;
