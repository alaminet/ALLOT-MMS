const express = require("express");
const createItemInfoCTR = require("../../../controller/master/itemInfo/createItemInfoCTR");
const viewAllItemInfoCTR = require("../../../controller/master/itemInfo/viewAllItemInfoCTR");
const updateItemInfoCTR = require("../../../controller/master/itemInfo/updateItemInfoCTR");
const createBulkItemInfoCTR = require("../../../controller/master/itemInfo/createBulkItemInfoCTR");

const route = express.Router();

route.post("/new", createItemInfoCTR);
route.post("/new-bulk", createBulkItemInfoCTR);
route.post("/update/:id", updateItemInfoCTR);
route.post("/view", viewAllItemInfoCTR);
// route.get("/view/:id", viewMemberController);

module.exports = route;
