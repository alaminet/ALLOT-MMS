const express = require("express");
const createCategoryCTR = require("../../controller/category/createCategoryCTR");
const viewAllCategoryCTR = require("../../controller/category/viewAllCategoryCTR");
const updateCategoryCTR = require("../../controller/category/updateCategoryCTR");

const route = express.Router();

route.post("/new", createCategoryCTR);

route.get("/view", viewAllCategoryCTR);
// route.get("/view/:id", secureJWT, viewMemberController);

route.post("/update/:id", updateCategoryCTR);

module.exports = route;
