const express = require("express");
const CreateB2BCustomerCTR = require("../../../controller/sales/B2B/CreateB2BCustomerCTR");
const viewB2BCustomerCTR = require("../../../controller/sales/B2B/viewB2BCustomerCTR");
const updateB2BCustomerCTR = require("../../../controller/sales/B2B/updateB2BCustomerCTR");
const route = express.Router();

route.post("/customer-new", CreateB2BCustomerCTR);
route.post("/customer-view", viewB2BCustomerCTR);
route.post("/customer-update/:id", updateB2BCustomerCTR);
// route.post("/update-payment/:id", updatePOSPayCTR);
// route.post("/MO-Issue", moveOrderIssueCTR);
// route.get("/view/:id", viewMemberController);

module.exports = route;
