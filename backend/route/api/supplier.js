const express = require("express");
const createSupplierCTR = require("../../controller/supplier/createSupplierCTR");
const updateSupplierCTR = require("../../controller/supplier/updateSupplierCTR");
const viewSupplierCTR = require("../../controller/supplier/viewSupplierCTR");

const route = express.Router();

route.post("/new", createSupplierCTR);
route.post("/update/:id", updateSupplierCTR);
route.get("/view", viewSupplierCTR);
// route.get("/view/:id", viewMemberController);

module.exports = route;
