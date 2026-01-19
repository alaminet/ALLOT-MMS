const express = require("express");
const secureSUAPI = require("../../../middleware/secureSUAPI");
const secureSUJWT = require("../../../middleware/secureSUJWT");
const viewAllOrganizationSUCTR = require("../../../controller/super/organization/viewAllOrganizationSUCTR");
const creatOrganizationSUCTR = require("../../../controller/super/organization/creatOrganizationSUCTR");
const updateOrganizationSUCTR = require("../../../controller/super/organization/updateOrganizationSUCTR");

const route = express.Router();

route.post("/new", secureSUAPI, secureSUJWT, creatOrganizationSUCTR);
route.post("/view", secureSUAPI, secureSUJWT, viewAllOrganizationSUCTR);
route.post("/update/:id", secureSUAPI, secureSUJWT, updateOrganizationSUCTR);
// route.post("/access", secureSUAPI, secureSUJWT, getAccessSUCTR);
// // route.get("/view/:id", secureJWT, viewMemberController);


module.exports = route;
