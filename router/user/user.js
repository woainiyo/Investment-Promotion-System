const loginRouter = require("./login/login");
const registerRouter = require("./register/register");
const userInfoRouter = require("./userInfo/getUserBasicInfo");
const setUserInfoRouter = require("./userInfo/setUserInfo");
const setUserAvatarRouter = require("./userInfo/setUserAvatar");
const getUserAvatarRouter = require("./userInfo/getUserAvatar");
const getUserPlotsRouter = require("./getUserPlots");

const express = require("express");
const router = express.Router();

router.use(loginRouter);
router.use(registerRouter);
router.use(userInfoRouter);
router.use(setUserInfoRouter);
router.use(setUserAvatarRouter);
router.use(getUserAvatarRouter);
router.use(getUserPlotsRouter);

module.exports = router;