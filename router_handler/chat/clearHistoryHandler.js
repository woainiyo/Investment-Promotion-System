const history = require('../../utils/api/chat/chat');
const userDb = require('../../utils/api/user/db');

/**
 * 清除用户历史聊天记录
 * @param {Object} req - Express请求对象
 * @param {Object} req.auth - JWT认证信息
 * @param {string} req.auth.username - 当前登录用户名
 * @param {Object} res - Express响应对象
 * @returns {Promise<void>}
 */
exports.clearHistory = async function(req, res) {
    try {
        // 1. 从JWT认证中提取用户名
        const username = req.auth?.username;
        if (!username) {
            return res.cc('用户身份验证失败');
        }

        // 2. 根据用户名查询用户ID
        const userInfo = await userDb.getUserInfo(username);
        if (!userInfo) {
            return res.cc('用户不存在');
        }
        const userId = userInfo.Id;

        // 3. 清除用户历史聊天记录
        const clearResult = await history.clearChatHistoryByUserId(userId);
        
        if (!clearResult.success) {
            return res.cc(clearResult.message || '清除聊天记录失败');
        }

        // 4. 返回清除结果给客户端
        return res.send({
            status: 0,
            message: 'success',
            data: {
                deletedCount: clearResult.deletedCount,
                message: clearResult.message,
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('清除聊天历史记录时发生错误:', error);
        return res.cc('服务器内部错误');
    }
};