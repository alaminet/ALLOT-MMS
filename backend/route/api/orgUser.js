const express = require("express");
const createOrgUserCTR = require("../../controller/orgUser/createOrgUserCTR");
const viewOrgUserCTR = require("../../controller/orgUser/viewOrgUserCTR");
const updateOrgUserCTR = require("../../controller/orgUser/updateOrgUserCTR");

const route = express.Router();

route.post("/new", createOrgUserCTR);
route.post("/update/:id", updateOrgUserCTR);
route.get("/view", viewOrgUserCTR);
// route.get("/view/:id", viewMemberController);

module.exports = route;
