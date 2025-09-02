const express = require("express");
const createProductCTR = require("../../controller/product/createProductCTR");
const viewAllProductCTR = require("../../controller/product/viewAllProductCTR");
const updateProductCTR = require("../../controller/product/updateProductCTR");

const route = express.Router();

route.post("/new", createProductCTR);
route.post("/update/:id", updateProductCTR);
route.get("/view", viewAllProductCTR);
// route.get("/view/:id", secureJWT, viewMemberController);

module.exports = route;
