const express = require("express");
const router = express.Router();
const registerHandler = require("../../../router_handler/userInfo/getUserBasicInfo");

router.post("/getUserBasicInfo", registerHandler.getUserBasicInfo);

module.exports = router;