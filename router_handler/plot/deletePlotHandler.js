const plotUtils = require('../../utils/api/plot');
const userUtils = require('../../utils/api/user/db');

/**
 * 删除地块处理函数
 * @param {Object} req - Express请求对象
 * @param {Object} req.body - 请求体参数
 * @param {number|string} req.body.plot_id - 要删除的地块ID
 * @param {Object} req.auth - JWT认证信息
 * @param {string} req.auth.username - 当前登录用户名
 * @param {Object} res - Express响应对象
 * @returns {Promise<void>}
 */
exports.deletePlot = async (req, res) => {
    try {
        // 1. 从请求体中获取plot_id
        const { plot_id } = req.body;
        
        // 2. 验证plot_id是否存在且合法
        if (!plot_id) {
            return res.cc('地块ID不能为空');
        }
        
        // 验证plot_id是否为有效数字
        const plotIdNum = Number(plot_id);
        if (isNaN(plotIdNum) || plotIdNum <= 0) {
            return res.cc('地块ID必须是正整数');
        }
        
        // 3. 从JWT中获取当前用户名
        const username = req.auth?.username;
        if (!username) {
            return res.cc('用户身份验证失败');
        }
        
        // 4. 根据用户名查询用户ID
        const userInfo = await userUtils.getUserInfo(username);
        if (!userInfo) {
            return res.cc('用户不存在');
        }
        const userId = userInfo.Id;
        
        // 5. 调用数据库工具函数执行删除操作
        const deleteResult = await plotUtils.deleteLandPlot(plotIdNum, userId);
        
        // 6. 处理删除结果
        if (deleteResult.success) {
            return res.send({
                status: 0,
                message: deleteResult.message,
                data: {
                    deletedLeaseUnits: deleteResult.deletedLeaseUnits || 0,
                    plot_id: deleteResult.plot_id
                }
            });
        } else {
            return res.cc(deleteResult.message);
        }
        
    } catch (error) {
        console.error('删除地块处理函数错误:', error);
        return res.cc(`删除地块失败: ${error.message}`);
    }
};