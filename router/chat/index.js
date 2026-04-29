const express = require('express');
const router = express.Router();

// 引入聊天相关子路由
const messageRouter = require('./message');
const historyRouter = require('./history');
const clearRouter = require('./clear');

/**
 * @module ChatRoutes
 * @description 聊天功能主路由模块
 * 
 * 路由前缀: /api/chat
 * 
 * 包含的子路由:
 * - /message - AI聊天消息处理接口
 * - /history - 用户历史聊天记录查询接口
 * - /clear - 用户历史聊天记录清除接口
 * 
 * 所有接口均需要JWT认证保护
 */

// 挂载子路由
router.use(messageRouter);
router.use(historyRouter);
router.use(clearRouter);

module.exports = router;