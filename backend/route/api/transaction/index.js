const express = require("express");
const route = express.Router();
const receiveApi = require("./receive");
const issueApi = require("./issue");

route.use("/receive", receiveApi);
route.use("/issue", issueApi);

module.exports = route;
