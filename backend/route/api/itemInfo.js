const express = require("express");
const createItemInfoCTR = require("../../controller/itemInfo/createItemInfoCTR");


const route = express.Router();

route.post("/new", createItemInfoCTR);
// route.post("/update/:id", updateProductCTR);
// route.get("/view", viewAllProductCTR);
// route.get("/view/:id", secureJWT, viewMemberController);

module.exports = route;
