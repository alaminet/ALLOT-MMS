const express = require("express");
const route = express.Router();
const SalesPOSApi = require("./SalesPOS");
const SalesB2BApi = require("./SalesB2B");

route.use("/SalesPOS", SalesPOSApi);
route.use("/SalesB2B", SalesB2BApi);
// route.use("/issue", issueApi);
// route.use("/move-order", moveOrderApi);
// route.post("/tnx-details", viewAllTnxDetails);
// route.post("/tnx-details/view", viewSingleTnxDetails);

module.exports = route;
