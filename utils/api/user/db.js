const db = require('../../db/index')

exports.queryByUserName = async (userName) => {
    let connection = null
    try {
        connection = await db.getConnection();
        const sql = "SELECT * FROM user WHERE username = ?";
        const [result] = await connection.execute(sql, [userName]);
        return result
    }
    catch (e) {
        return null
    }
    finally {
        if (connection) {
            connection.release()
        }
    }
}

exports.getUserInfo = async (userName) => {
    let connection = null
    try {
        connection = await db.getConnection();
        const sql = "SELECT Id, username, nickname, pic as avatar,signature as introduction FROM user WHERE username = ?";
        const [result] = await connection.execute(sql, [userName]);
        // 如果查询到结果，返回第一个用户信息对象
        if (result && result.length > 0) {
            return result[0];
        }
        
        return null;
    }
    catch (e) {
        console.error('获取用户信息失败:', e);
        return null;
    }
    finally {
        if (connection) {
            connection.release()
        }
    }
}

exports.setUserInfo = async (username, nickname='', signature='') => {
    let connection = null
    try {
        connection = await db.getConnection();
        const sql = "UPDATE user SET nickname = ?,signature = ? WHERE username = ?";
        const [result] = await connection.execute(sql, [nickname, signature, username]);
        
        // 返回更新结果
        return {
            success: result.affectedRows > 0,
            affectedRows: result.affectedRows,
            message: result.affectedRows > 0 ? '用户信息更新成功' : '用户不存在或更新失败'
        };
    }
    catch (e) {
        console.error('更新用户信息失败:', e);
        return {
            success: false,
            error: e.message,
            message: '更新用户信息失败'
        };
    }
    finally {
        if (connection) {
            connection.release()
        }
    }
}

exports.setUserAvatar = async (username, avatarPath) => {
    let connection = null
    try {
        connection = await db.getConnection();
        const sql = "UPDATE user SET pic = ? WHERE username = ?";
        const [result] = await connection.execute(sql, [avatarPath, username]);
        
        // 返回更新结果
        return {
            success: result.affectedRows > 0,
            affectedRows: result.affectedRows,
            message: result.affectedRows > 0 ? '用户头像路径更新成功' : '用户不存在或更新失败'
        };
    }
    catch (e) {
        console.error('更新用户头像路径失败:', e);
        return {
            success: false,
            error: e.message,
            message: '更新用户头像路径失败'
        };
    }
    finally {
        if (connection) {
            connection.release()
        }
    }
}