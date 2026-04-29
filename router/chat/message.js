const express = require('express');
const router = express.Router();
const { getMessage } = require('../../router_handler/chat/aiChatHandler');

/**
 * @route POST /api/chat/message
 * @group Chat - 聊天相关接口
 * @summary 处理用户发送的AI聊天消息
 * @description 接收用户聊天消息，结合历史对话上下文调用AI生成回复
 * @param {Object} req - Express请求对象
 * @param {Object} req.body - 请求体参数
 * @param {string} req.body.content - 用户发送的聊天内容（必需）
 * @param {string} req.body.role - 消息角色，可选，默认为"user"
 * @param {Object} req.auth - JWT认证信息
 * @param {string} req.auth.username - 当前登录用户名
 * @returns {Object} 200 - 成功响应
 * @returns {number} 200.status - 状态码，0表示成功
 * @returns {string} 200.message - 响应消息
 * @returns {Object} 200.data - 响应数据
 * @returns {string} 200.data.reply - AI生成的回复内容
 * @returns {string} 200.data.timestamp - 回复时间戳
 * @returns {Object} 401 - 认证失败
 * @returns {Object} 400 - 参数错误
 * @returns {Object} 500 - 服务器内部错误
 * @security JWT
 * 
 * @example request - 请求示例
 * {
 *   "content": "你好，能帮我介绍一下这个系统吗？",
 *   "role": "user"
 * }
 * 
 * @example response - 成功响应示例
 * {
 *   "status": 0,
 *   "message": "success",
 *   "data": {
 *     "reply": "您好！我是您的智能助手...",
 *     "timestamp": "2024-01-15T10:30:00.000Z"
 *   }
 * }
 */
router.post('/message', getMessage);

module.exports = router;