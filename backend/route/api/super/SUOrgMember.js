const express = require("express");
const secureSUAPI = require("../../../middleware/secureSUAPI");
const secureSUJWT = require("../../../middleware/secureSUJWT");
const viewAllOrgMemberSUCTR = require("../../../controller/super/organization/viewAllOrgMemberSUCTR");
const updateOrgMemberSUCTR = require("../../../controller/super/organization/updateOrgMemberSUCTR");
const createOrgMemberSUCTR = require("../../../controller/super/organization/createOrgMemberSUCTR");

const route = express.Router();

route.post("/view", secureSUAPI, secureSUJWT, viewAllOrgMemberSUCTR);
route.post("/new", secureSUAPI, secureSUJWT, createOrgMemberSUCTR);
route.post("/update/:id", secureSUAPI, secureSUJWT, updateOrgMemberSUCTR);
// route.post("/access", secureSUAPI, secureSUJWT, getAccessSUCTR);
// // route.get("/view/:id", secureJWT, viewMemberController);

// route.post("/update/:id", secureSUAPI, secureSUJWT, updateMemberSUCTR);

module.exports = route;
