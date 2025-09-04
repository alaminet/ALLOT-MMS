const express = require("express");
const createItemInfoCTR = require("../../controller/itemInfo/createItemInfoCTR");
const viewAllItemInfoCTR = require("../../controller/itemInfo/viewAllItemInfoCTR");
const updateItemInfoCTR = require("../../controller/itemInfo/updateItemInfoCTR");

const route = express.Router();

route.post("/new", createItemInfoCTR);
route.post("/update/:id", updateItemInfoCTR);
route.get("/view", viewAllItemInfoCTR);
// route.get("/view/:id", viewMemberController);

module.exports = route;
