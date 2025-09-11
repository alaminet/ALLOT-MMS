const express = require("express");
const createPurchaseReqCTR = require("../../controller/purchase/createPurchaseReqCTR");
const viewPurchaseReqCTR = require("../../controller/purchase/viewPurchaseReqCTR");
const updatePurchaseReqCTR = require("../../controller/purchase/updatePurchaseReqCTR");

const route = express.Router();

route.post("/new", createPurchaseReqCTR);
route.post("/update/:id", updatePurchaseReqCTR);
route.get("/view", viewPurchaseReqCTR);
// route.get("/view/:id", viewMemberController);

module.exports = route;
