const express = require("express");
const createItemGroupCTR = require("../../../controller/master/itemGroup/createItemGroupCTR");
const updateItemGroupCTR = require("../../../controller/master/itemGroup/updateItemGroupCTR");
const viewAllItemGroupCTR = require("../../../controller/master/itemGroup/viewAllItemGroupCTR");

const route = express.Router();

route.post("/new", createItemGroupCTR);
route.post("/update/:id", updateItemGroupCTR);
route.get("/view", viewAllItemGroupCTR);
// route.get("/view/:id", viewMemberController);

module.exports = route;
