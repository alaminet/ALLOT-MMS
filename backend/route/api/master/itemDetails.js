const express = require("express");
const viewItemDetailsCTR = require("../../../controller/master/itemDetails/viewItemDetailsCTR");
const createItemDetailsCTR = require("../../../controller/master/itemDetails/createItemDetailsCTR");
const updateItemDetailsCTR = require("../../../controller/master/itemDetails/updateItemDetailsCTR");
const viewAllItemDetailsCTR = require("../../../controller/master/itemDetails/viewAllItemDetailsCTR");

const route = express.Router();

route.post("/new", createItemDetailsCTR);
route.post("/update/:id", updateItemDetailsCTR);
route.post("/view", viewItemDetailsCTR);
route.post("/viewAll", viewAllItemDetailsCTR);
// route.get("/view/:id", viewMemberController);

module.exports = route;
