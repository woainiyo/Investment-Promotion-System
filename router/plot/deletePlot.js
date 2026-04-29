const express = require('express');
const router = express.Router();
const { deletePlot } = require('../../router_handler/plot/deletePlotHandler');

/**
 * @route DELETE /plot/deletePlot
 * @group Plot - 地块相关接口
 * @summary 删除指定地块
 * @description 根据地块ID删除地块信息，只有地块创建者才有权限删除
 * @param {Object} req - Express请求对象
 * @param {Object} req.body - 请求体参数
 * @param {number} req.body.plot_id - 要删除的地块ID（必需）
 * @param {Object} req.auth - JWT认证信息
 * @param {string} req.auth.username - 当前登录用户名
 * @returns {Object} 200 - 成功响应
 * @returns {number} 200.status - 状态码，0表示成功
 * @returns {string} 200.message - 响应消息
 * @returns {Object} 401 - 认证失败
 * @returns {Object} 400 - 参数错误或权限不足
 * @returns {Object} 500 - 服务器内部错误
 * @security JWT
 * 
 * @example request - 请求示例
 * DELETE /plot/deletePlot
 * {
 *   "plot_id": 123
 * }
 * 
 * @example response - 成功响应示例
 * {
 *   "status": 0,
 *   "message": "地块删除成功"
 * }
 * 
 * @example error_response - 错误响应示例
 * {
 *   "status": 1,
 *   "message": "您没有权限删除此地块"
 * }
 */
router.delete('/deletePlot', deletePlot);

module.exports = router;