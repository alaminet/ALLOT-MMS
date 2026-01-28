const express = require("express");
const createPOSCTR = require("../../../controller/sales/POS/createPOSCTR");
const viewAllPOSCTR = require("../../../controller/sales/POS/viewAllPOSCTR");
const updatePOSCTR = require("../../../controller/sales/POS/updatePOSCTR");
const updatePOSPayCTR = require("../../../controller/sales/POS/updatePOSPayCTR");
const route = express.Router();

route.post("/new", createPOSCTR);
route.post("/update/:id", updatePOSCTR);
route.post("/update-payment/:id", updatePOSPayCTR);
route.post("/view", viewAllPOSCTR);
// route.post("/MO-Issue", moveOrderIssueCTR);
// route.get("/view/:id", viewMemberController);

module.exports = route;
