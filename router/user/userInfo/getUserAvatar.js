const express = require("express");
const router = express.Router();
const getUserAvatarHandler = require("../../../router_handler/userInfo/getUserAvatarHandler");

router.post("/getUserAvatar", getUserAvatarHandler.getUserAvatar);

module.exports = router;