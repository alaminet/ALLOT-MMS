const express = require("express");
const createPurchaseReqCTR = require("../../../controller/purchase/requisition/createPurchaseReqCTR");
const viewPurchaseReqCTR = require("../../../controller/purchase/requisition/viewPurchaseReqCTR");
const updatePurchaseReqCTR = require("../../../controller/purchase/requisition/updatePurchaseReqCTR");
const viewSinglePurchaseReq = require("../../../controller/purchase/requisition/viewSinglePurchaseReq");

const route = express.Router();

route.post("/new", createPurchaseReqCTR);
route.post("/update/:id", updatePurchaseReqCTR);
route.post("/view", viewPurchaseReqCTR);
route.post("/view-single", viewSinglePurchaseReq);
// route.get("/view/:id", viewMemberController);

module.exports = route;
