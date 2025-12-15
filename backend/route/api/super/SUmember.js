const express = require("express");
const secureSUAPI = require("../../../middleware/secureSUAPI");
const secureSUJWT = require("../../../middleware/secureSUJWT");
const loginSUCTR = require("../../../controller/super/authentication/loginSUCTR");
const getAccessSUCTR = require("../../../controller/super/authentication/getAccessSUCTR");
const viewAllMemberSUCTR = require("../../../controller/super/member/viewAllMemberSUCTR");
const updateMemberSUCTR = require("../../../controller/super/member/updateMemberSUCTR");
const createMemberSUCTR = require("../../../controller/super/member/createMemberSUCTR");

const route = express.Router();

route.post("/new", secureSUAPI, secureSUJWT, createMemberSUCTR);
route.post("/login", secureSUAPI, loginSUCTR);
// route.post("/change-password", secureJWT, changesPasswordController);
// route.post("/reset-password", resetPasswordController);
// route.post("/forgot-password", forgotPasswordController);

route.post("/view", secureSUAPI, secureSUJWT, viewAllMemberSUCTR);
route.post("/access", secureSUAPI, secureSUJWT, getAccessSUCTR);
// route.get("/view/:id", secureJWT, viewMemberController);

route.post("/update/:id", secureSUAPI, secureSUJWT, updateMemberSUCTR);

module.exports = route;
