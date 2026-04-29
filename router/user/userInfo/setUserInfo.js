const express = require("express");
const router = express.Router();
const registerHandler = require("../../../router_handler/userInfo/setUserBasicInfo");

router.post("/setUserBasicInfo", registerHandler.setUserBasicInfo);

module.exports = router;