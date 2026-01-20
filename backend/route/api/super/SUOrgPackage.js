const express = require("express");
const secureSUAPI = require("../../../middleware/secureSUAPI");
const secureSUJWT = require("../../../middleware/secureSUJWT");
const createOrgPackageSUCTR = require("../../../controller/super/orgPackage/createOrgPackageSUCTR");
const viewAllOrgPackageSUCTR = require("../../../controller/super/orgPackage/viewAllOrgPackageSUCTR");

const route = express.Router();

route.post("/new", secureSUAPI, secureSUJWT, createOrgPackageSUCTR);
route.post("/view", secureSUAPI, secureSUJWT, viewAllOrgPackageSUCTR);
// route.post("/update/:id", secureSUAPI, secureSUJWT, updateOrganizationSUCTR);
// route.post("/access", secureSUAPI, secureSUJWT, getAccessSUCTR);
// // route.get("/view/:id", secureJWT, viewMemberController);

module.exports = route;
