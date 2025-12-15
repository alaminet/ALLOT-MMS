const express = require("express");
const route = express.Router();
const apiRoute = require("./api");

route.use("/api", apiRoute);

module.exports = route;
