const express = require("express");
const router = express.Router();

const loginHandler = require("../../../router_handler/login/loginHandler");

// 登录接口
router.post("/login", loginHandler.login);

module.exports = router;
