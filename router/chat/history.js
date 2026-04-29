const express = require('express');
const router = express.Router();
const { getHistory } = require('../../router_handler/chat/getHistoryHandler');

/**
 * @route GET /api/chat/history
 * @group Chat - 聊天相关接口
 * @summary 获取用户历史聊天记录
 * @description 获取当前登录用户的所有历史聊天记录，支持分页查询
 * @param {Object} req - Express请求对象
 * @param {Object} req.query - 查询参数
 * @param {string} req.query.limit - 限制返回记录数，范围1-100，默认10
 * @param {string} req.query.offset - 分页偏移量，非负整数，默认0
 * @param {Object} req.auth - JWT认证信息
 * @param {string} req.auth.username - 当前登录用户名
 * @returns {Object} 200 - 成功响应
 * @returns {number} 200.status - 状态码，0表示成功
 * @returns {string} 200.message - 响应消息
 * @returns {Object} 200.data - 响应数据
 * @returns {Array} 200.data.messages - 聊天记录数组
 * @returns {Object} 200.data.pagination - 分页信息
 * @returns {number} 200.data.pagination.limit - 每页记录数
 * @returns {number} 200.data.pagination.offset - 当前偏移量
 * @returns {number} 200.data.pagination.total - 总记录数
 * @returns {boolean} 200.data.pagination.hasMore - 是否还有更多数据
 * @returns {string} 200.data.timestamp - 响应时间戳
 * @returns {Object} 401 - 认证失败
 * @returns {Object} 400 - 参数错误
 * @returns {Object} 500 - 服务器内部错误
 * @security JWT
 * 
 * @example request - 请求示例
 * GET /api/chat/history?limit=5&offset=0
 * 
 * @example response - 成功响应示例
 * {
 *   "status": 0,
 *   "message": "success",
 *   "data": {
 *     "messages": [
 *       {
 *         "role": "user",
 *         "content": "你好"
 *       },
 *       {
 *         "role": "assistant", 
 *         "content": "你好！有什么我可以帮助你的吗？"
 *       }
 *     ],
 *     "pagination": {
 *       "limit": 10,
 *       "offset": 0,
 *       "total": 25,
 *       "hasMore": true
 *     },
 *     "timestamp": "2024-01-15T10:30:00.000Z"
 *   }
 * }
 */
router.get('/history', getHistory);

module.exports = router;