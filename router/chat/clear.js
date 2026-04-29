const express = require('express');
const router = express.Router();
const { clearHistory } = require('../../router_handler/chat/clearHistoryHandler');

/**
 * @route DELETE /api/chat/clear
 * @group Chat - 聊天相关接口
 * @summary 清除用户历史聊天记录
 * @description 清除当前登录用户的所有历史聊天记录
 * @param {Object} req - Express请求对象
 * @param {Object} req.auth - JWT认证信息
 * @param {string} req.auth.username - 当前登录用户名
 * @returns {Object} 200 - 成功响应
 * @returns {number} 200.status - 状态码，0表示成功
 * @returns {string} 200.message - 响应消息
 * @returns {Object} 200.data - 响应数据
 * @returns {number} 200.data.deletedCount - 被清除的记录数量
 * @returns {string} 200.data.message - 操作结果描述
 * @returns {string} 200.data.timestamp - 操作时间戳
 * @returns {Object} 401 - 认证失败
 * @returns {Object} 400 - 参数错误
 * @returns {Object} 500 - 服务器内部错误
 * @security JWT
 * 
 * @example request - 请求示例
 * DELETE /api/chat/clear
 * 
 * @example response - 成功响应示例
 * {
 *   "status": 0,
 *   "message": "success",
 *   "data": {
 *     "deletedCount": 15,
 *     "message": "成功清除15条聊天记录",
 *     "timestamp": "2024-01-15T10:30:00.000Z"
 *   }
 * }
 * 
 * @example error_response - 错误响应示例
 * {
 *   "status": 1,
 *   "message": "用户不存在"
 * }
 */
router.delete('/clear', clearHistory);

module.exports = router;