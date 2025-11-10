const express = require("express");
const createPurchaseOrderCTR = require("../../../controller/purchase/order/createPurchaseOrderCTR");
const viewPurchaseOrderCTR = require("../../../controller/purchase/order/viewPurchaseOrderCTR");
const viewSinglePurchaseOrderCTR = require("../../../controller/purchase/order/viewSinglePurchaseOrderCTR");

const route = express.Router();

route.post("/new", createPurchaseOrderCTR);
// route.post("/update/:id", updatePurchaseReqCTR);
route.post("/view", viewPurchaseOrderCTR);
route.post("/view-single", viewSinglePurchaseOrderCTR);
// route.get("/view/:id", viewMemberController);

module.exports = route;
