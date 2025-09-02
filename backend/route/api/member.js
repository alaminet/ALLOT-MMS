const express = require("express");
const createMemberCTR = require("../../controller/member/createMemberCTR");
const loginCTR = require("../../controller/authentication/loginCTR");
const secureAPI = require("../../middleware/secureAPI");
const secureJWT = require("../../middleware/secureJWT");
const viewAllMemberCTR = require("../../controller/member/viewAllMemberCTR");
const updateMemberCTR = require("../../controller/member/updateMemberCTR");
const getAccessCTR = require("../../controller/authentication/getAccessCTR");

const route = express.Router();

route.post("/new", secureJWT, createMemberCTR);
route.post("/login", secureAPI, loginCTR);
// route.post("/change-password", secureJWT, changesPasswordController);
// route.post("/reset-password", resetPasswordController);
// route.post("/forgot-password", forgotPasswordController);

route.get("/view", secureAPI, secureJWT, viewAllMemberCTR);
route.post("/access", secureAPI, secureJWT, getAccessCTR);
// route.get("/view/:id", secureJWT, viewMemberController);

route.post("/update/:id", secureJWT, updateMemberCTR);

module.exports = route;
