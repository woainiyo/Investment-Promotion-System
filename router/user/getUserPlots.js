const express = require("express");
const router = express.Router();
const getUserPlotsHandler = require("../../router_handler/user/getUserPlotsHandler");

/**
 * 根据用户名查询用户创建的所有地块及租赁单元路由
 * GET /api/user/plots?username=xxx
 */
router.get("/plots", getUserPlotsHandler.getUserPlotsByUserName);

module.exports = router;