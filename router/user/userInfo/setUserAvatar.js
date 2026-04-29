const express = require("express");
const router = express.Router();
const registerHandler = require("../../../router_handler/userInfo/setUserAvatar");

router.post("/setUserAvatar", registerHandler.setUserAvatar);

module.exports = router;