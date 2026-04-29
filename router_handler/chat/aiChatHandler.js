const history = require('../../utils/api/chat/chat');
const chat = require('../../utils/aiEnhanced');
const userDb = require('../../utils/api/user/db');

/**
 * 处理AI聊天消息
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @returns {Promise<void>}
 */
exports.getMessage = async function(req, res) {
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

        // 3. 从请求体中获取用户消息
        const { content, role = 'user' } = req.body;
        if (!content || typeof content !== 'string') {
            return res.cc('消息内容不能为空');
        }

        // 4. 构造当前消息对象
        const currentMessage = { role, content };
        // console.log('当前用户', userId)
        // 5. 获取用户历史聊天记录
        const historyMessages = await history.getChatMessagesByUserId(userId, 10, 0);
        if (historyMessages === null) {
            return res.cc('获取聊天历史记录失败');
        }
        // console.log('历史消息', historyMessages)
        // 6. 调用AI获取回复
        const aiResponse = await chat.getAIResponse(currentMessage, historyMessages);
        
        // 7. 保存用户消息到数据库
        const saveUserMessageResult = await history.insertChatMessage(userId, 'user', content);
        if (!saveUserMessageResult.success) {
            console.error('保存用户消息失败:', saveUserMessageResult.error);
        }

        // 8. 保存AI回复到数据库
        const saveAiMessageResult = await history.insertChatMessage(userId, 'assistant', aiResponse);
        if (!saveAiMessageResult.success) {
            console.error('保存AI消息失败:', saveAiMessageResult.error);
        }

        // 9. 返回AI回复给客户端
        return res.send({
            status: 0,
            message: 'success',
            data: {
                reply: aiResponse,
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('处理聊天消息时发生错误:', error);
        return res.cc('服务器内部错误');
    }
};

