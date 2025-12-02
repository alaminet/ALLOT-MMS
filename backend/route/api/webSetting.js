const express = require("express");
const viewOrgUserCTR = require("../../controller/orgUser/viewOrgUserCTR");
const createWebSettingCTR = require("../../controller/webSetting/createWebSettingCTR");
const viewWebSettingCTR = require("../../controller/webSetting/viewWebSettingCTR");

const route = express.Router();

route.post("/new", createWebSettingCTR);
// route.post("/update/:id", updateOrgUserCTR);
route.get("/view", viewWebSettingCTR);
// route.get("/view/:id", viewMemberController);

module.exports = route;
