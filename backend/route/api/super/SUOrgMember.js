const express = require("express");
const viewAllOrganizationSUCTR = require("../../../controller/super/organization/viewAllOrganizationSUCTR");
const secureSUAPI = require("../../../middleware/secureSUAPI");
const secureSUJWT = require("../../../middleware/secureSUJWT");
const createOrgUserCTR = require("../../../controller/orgUser/createOrgUserCTR");
const viewAllOrgMemberSUCTR = require("../../../controller/super/organization/viewAllOrgMemberSUCTR");
const updateOrgMemberSUCTR = require("../../../controller/super/organization/updateOrgMemberSUCTR");

const route = express.Router();

route.post("/view", secureSUAPI, secureSUJWT, viewAllOrgMemberSUCTR);
route.post("/new", secureSUAPI, secureSUJWT, viewAllOrgMemberSUCTR);
route.post("/update/:id", secureSUAPI, secureSUJWT, updateOrgMemberSUCTR);
// route.post("/access", secureSUAPI, secureSUJWT, getAccessSUCTR);
// // route.get("/view/:id", secureJWT, viewMemberController);

// route.post("/update/:id", secureSUAPI, secureSUJWT, updateMemberSUCTR);

module.exports = route;
