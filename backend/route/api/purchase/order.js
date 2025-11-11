const express = require("express");
const createPurchaseOrderCTR = require("../../../controller/purchase/order/createPurchaseOrderCTR");
const viewPurchaseOrderCTR = require("../../../controller/purchase/order/viewPurchaseOrderCTR");
const viewSinglePurchaseOrderCTR = require("../../../controller/purchase/order/viewSinglePurchaseOrderCTR");
const updatePurchaseOrderCTR = require("../../../controller/purchase/order/updatePurchaseOrderCTR");

const route = express.Router();

route.post("/new", createPurchaseOrderCTR);
route.post("/update/:id", updatePurchaseOrderCTR);
route.post("/view", viewPurchaseOrderCTR);
route.post("/view-single", viewSinglePurchaseOrderCTR);
// route.get("/view/:id", viewMemberController);

module.exports = route;
