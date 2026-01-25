const express = require("express");
const createPOSCTR = require("../../../controller/sales/POS/createPOSCTR");
const route = express.Router();

route.post("/new", createPOSCTR);
// route.post("/MO-Issue", moveOrderIssueCTR);
// route.post("/update/:id", updatePurchaseReqCTR);
// route.post("/view", viewPurchaseReqCTR);
// route.get("/view/:id", viewMemberController);

module.exports = route;
