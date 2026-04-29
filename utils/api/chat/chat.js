const db = require('../../db/index');

/**
 * 向 chat_messages 表插入一条记录
 * @param {string} userId - 用户ID（外键）
 * @param {string} role - 消息角色（enum类型，如 'user' 或 'assistant'）
 * @param {string} content - 消息内容
 * @returns {Object} 操作结果
 */
exports.insertChatMessage = async (userId, role, content) => {
    let connection = null;
    try {
        connection = await db.getConnection();
        
        // 插入聊天消息
        const sql = "INSERT INTO chat_messages (user_id, role, content) VALUES (?, ?, ?)";
        const [result] = await connection.execute(sql, [userId, role, content]);
        
        return {
            success: true,
            messageId: result.insertId,
            affectedRows: result.affectedRows,
            message: '聊天消息插入成功'
        };
    } catch (e) {
        console.error('插入聊天消息失败:', e);
        return {
            success: false,
            error: e.message,
            message: '插入聊天消息失败'
        };
    } finally {
        if (connection) {
            connection.release();
        }
    }
};

/**
 * 根据用户ID查询聊天消息
 * @param {string} userId - 用户ID
 * @param {number} limit - 限制返回的消息数量（可选，默认为50）
 * @param {number} offset - 分页偏移量（可选，默认为0）
 * @returns {Array} 聊天消息数组
 */
exports.getChatMessagesByUserId = async (userId, limit = 10, offset = 0) => {

    let connection = null;
    try {
        connection = await db.getConnection();
        // console.log(typeof limit, limit);
        // console.log(typeof offset, offset);
            
        // 查询用户的所有聊天消息，按创建时间降序排列
        const sql = `
            SELECT role,content 
            FROM chat_messages 
            WHERE user_id = ? 
            ORDER BY created_at DESC 
            LIMIT ${limit} OFFSET ${offset}
            `;
        const [result] = await connection.execute(sql, [userId]);
        console.log('获取的聊天消息', result)
        return result;
    } catch (e) {
        console.error('获取聊天消息失败:', e);
        return null;
    } finally {
        if (connection) {
            connection.release();
        }
    }
};

/**
 * 获取用户聊天消息总数
 * @param {string} userId - 用户ID
 * @returns {number} 消息总数
 */
exports.getChatMessageCountByUserId = async (userId) => {
    let connection = null;
    try {
        connection = await db.getConnection();
        
        // 查询用户聊天消息总数
        const sql = "SELECT COUNT(*) as total FROM chat_messages WHERE user_id = ?";
        const [result] = await connection.execute(sql, [userId]);
        console.log('获取的聊天消息总数', result)
        return result[0].total || 0;
    } catch (e) {
        console.error('获取聊天消息总数失败:', e);
        return 0;
    } finally {
        if (connection) {
            connection.release();
        }
    }
};

/**
 * 清除指定用户的所有聊天记录
 * @param {string} userId - 用户ID
 * @returns {Object} 操作结果
 */
exports.clearChatHistoryByUserId = async (userId) => {
    let connection = null;
    try {
        connection = await db.getConnection();
        
        // 先查询要删除的记录数量
        const countSql = "SELECT COUNT(*) as total FROM chat_messages WHERE user_id = ?";
        const [countResult] = await connection.execute(countSql, [userId]);
        const deletedCount = countResult[0].total || 0;
        
        // 删除用户的所有聊天记录
        const deleteSql = "DELETE FROM chat_messages WHERE user_id = ?";
        const [result] = await connection.execute(deleteSql, [userId]);
        
        return {
            success: true,
            deletedCount: deletedCount,
            affectedRows: result.affectedRows,
            message: `成功清除${deletedCount}条聊天记录`
        };
    } catch (e) {
        console.error('清除聊天记录失败:', e);
        return {
            success: false,
            error: e.message,
            message: '清除聊天记录失败'
        };
    } finally {
        if (connection) {
            connection.release();
        }
    }
};