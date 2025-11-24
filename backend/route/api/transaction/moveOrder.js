const express = require("express");
const createMoveOrder = require("../../../controller/Transaction/MoveOrder/createMoveOrder");
const viewSingleMoveOrderCTR = require("../../../controller/Transaction/MoveOrder/viewSingleMoveOrderCTR");
const updateMoveOrderCTR = require("../../../controller/Transaction/MoveOrder/updateMoveOrderCTR");
const viewMoveOrderCTR = require("../../../controller/Transaction/MoveOrder/viewMoveOrderCTR");

const route = express.Router();

route.post("/new", createMoveOrder);
route.post("/update/:id", updateMoveOrderCTR);
route.post("/view-single", viewSingleMoveOrderCTR);
route.post("/view", viewMoveOrderCTR);
// route.get("/view/:id", viewMemberController);

module.exports = route;
