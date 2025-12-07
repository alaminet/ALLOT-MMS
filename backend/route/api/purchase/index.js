const express = require("express");
const route = express.Router();
const requisitionApi = require("./requisition");
const orderApi = require("./order");
const viewAllPurchaseDetailsCTR = require("../../../controller/purchase/details/viewAllPurchaseDetailsCTR");

route.use("/requisition", requisitionApi);
route.use("/order", orderApi);
route.post("/purchase-details", viewAllPurchaseDetailsCTR);

module.exports = route;
