const history = require('../../utils/api/chat/chat');
const userDb = require('../../utils/api/user/db');

/**
 * 获取用户历史聊天记录
 * @param {Object} req - Express请求对象
 * @param {Object} req.auth - JWT认证信息
 * @param {string} req.auth.username - 当前登录用户名
 * @param {Object} req.query - 查询参数
 * @param {string} req.query.limit - 限制返回记录数（可选，默认10）
 * @param {string} req.query.offset - 分页偏移量（可选，默认0）
 * @param {Object} res - Express响应对象
 * @returns {Promise<void>}
 */
exports.getHistory = async function(req, res) {
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

        // 3. 获取查询参数
        const limit = parseInt(req.query.limit) || 10;
        const offset = parseInt(req.query.offset) || 0;

        // 参数验证
        if (limit <= 0 || limit > 100) {
            return res.cc('limit参数必须在1-100之间');
        }
        if (offset < 0) {
            return res.cc('offset参数不能为负数');
        }

        // 4. 获取用户历史聊天记录
        const historyMessages = await history.getChatMessagesByUserId(userId, limit, offset);
        if (historyMessages === null) {
            return res.cc('获取聊天历史记录失败');
        }

        // 5. 获取总记录数
        const totalCount = await history.getChatMessageCountByUserId(userId);

        // 6. 返回历史记录给客户端
        return res.send({
            status: 0,
            message: 'success',
            data: {
                messages: historyMessages,
                pagination: {
                    limit: limit,
                    offset: offset,
                    total: totalCount,
                    hasMore: offset + limit < totalCount
                },
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('获取聊天历史记录时发生错误:', error);
        return res.cc('服务器内部错误');
    }
};