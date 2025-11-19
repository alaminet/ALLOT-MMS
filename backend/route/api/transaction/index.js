const express = require("express");
const route = express.Router();
const receiveApi = require("./receive");
const issueApi = require("./issue");
const moveOrderApi = require("./moveOrder");
const viewAllTnxDetails = require("../../../controller/Transaction/Transaction/viewAllTnxDetails");
const viewSingleTnxDetails = require("../../../controller/Transaction/Transaction/viewSingleTnxDetails");

route.use("/receive", receiveApi);
route.use("/issue", issueApi);
route.use("/move-order", moveOrderApi);
route.post("/tnx-details", viewAllTnxDetails);
route.post("/tnx-details/view", viewSingleTnxDetails);

module.exports = route;
