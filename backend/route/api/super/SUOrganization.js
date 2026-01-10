const express = require("express");
const viewAllOrganizationSUCTR = require("../../../controller/super/organization/viewAllOrganizationSUCTR");
const secureSUAPI = require("../../../middleware/secureSUAPI");
const secureSUJWT = require("../../../middleware/secureSUJWT");

const route = express.Router();

route.post("/view", secureSUAPI, secureSUJWT, viewAllOrganizationSUCTR);
// route.post("/access", secureSUAPI, secureSUJWT, getAccessSUCTR);
// // route.get("/view/:id", secureJWT, viewMemberController);

// route.post("/update/:id", secureSUAPI, secureSUJWT, updateMemberSUCTR);

module.exports = route;
