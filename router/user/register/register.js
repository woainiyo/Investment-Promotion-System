const express = require("express");
const router = express.Router();
const registerHandler = require("../../../router_handler/register/registerHandler");

router.post("/register", registerHandler.register);

module.exports = router;
