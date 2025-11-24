const express = require("express");
const creatTrnxIssueCTR = require("../../../controller/Transaction/Issue/creatTrnxIssueCTR");
const moveOrderIssueCTR = require("../../../controller/Transaction/Issue/moveOrderIssueCTR");

const route = express.Router();

route.post("/new", creatTrnxIssueCTR);
route.post("/MO-Issue", moveOrderIssueCTR);
// route.post("/update/:id", updatePurchaseReqCTR);
// route.post("/view", viewPurchaseReqCTR);
// route.get("/view/:id", viewMemberController);

module.exports = route;
