const express = require("express");
const createItemUOMCTR = require("../../../controller/master/itemUOM/createItemUOMCTR");
const updateItemUOMCTR = require("../../../controller/master/itemUOM/updateItemUOMCTR");
const viewAllItemUOMCTR = require("../../../controller/master/itemUOM/viewAllItemUOMCTR");

const route = express.Router();

route.post("/new", createItemUOMCTR);
route.post("/update/:id", updateItemUOMCTR);
route.get("/view", viewAllItemUOMCTR);
// route.get("/view/:id", viewMemberController);

module.exports = route;
