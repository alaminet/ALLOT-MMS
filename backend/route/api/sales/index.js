const express = require("express");
const route = express.Router();
const SalesPOSApi = require("./SalesPOS");

route.use("/SalesPOS", SalesPOSApi);
// route.use("/issue", issueApi);
// route.use("/move-order", moveOrderApi);
// route.post("/tnx-details", viewAllTnxDetails);
// route.post("/tnx-details/view", viewSingleTnxDetails);

module.exports = route;
