const express = require("express");
const route = express.Router();
const receiveApi = require("./receive");
const issueApi = require("./issue");
const viewAllTnxDetails = require("../../../controller/Transaction/Transaction/viewAllTnxDetails");

route.use("/receive", receiveApi);
route.use("/issue", issueApi);
route.post("/tnx-details", viewAllTnxDetails);

module.exports = route;
