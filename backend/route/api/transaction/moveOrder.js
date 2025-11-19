const express = require("express");
const createMoveOrder = require("../../../controller/Transaction/MoveOrder/createMoveOrder");
const viewSingleMoveOrderCTR = require("../../../controller/Transaction/MoveOrder/viewSingleMoveOrderCTR");

const route = express.Router();

route.post("/new", createMoveOrder);
// route.post("/update/:id", updatePurchaseReqCTR);
route.post("/view-single", viewSingleMoveOrderCTR);
// route.get("/view/:id", viewMemberController);

module.exports = route;
