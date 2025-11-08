const express = require("express");
const createTrnxRecCTR = require("../../../controller/Transaction/Recevie/createTrnxRecCTR");
const creatPOGRNRecCTR = require("../../../controller/Transaction/Recevie/creatPOGRNRecCTR");

const route = express.Router();

route.post("/new", createTrnxRecCTR);
route.post("/PO-GRN", creatPOGRNRecCTR);
// route.post("/update/:id", updatePurchaseReqCTR);
// route.post("/view", viewPurchaseReqCTR);
// route.get("/view/:id", viewMemberController);

module.exports = route;
