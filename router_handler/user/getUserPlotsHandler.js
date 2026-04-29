/**
 * 根据用户名查询用户创建的所有地块及租赁单元处理函数
 * 调用 utils/api/plot/index.js 中的 getLandPlotsByUserId 和 getLeaseUnitsByPlotId 方法
 */

const plotUtils = require('../../utils/api/plot');
const dbUtils = require('../../utils/api/user/db');

/**
 * 根据用户名查询用户创建的所有地块及租赁单元
 * @param {Object} req - Express 请求对象
 * @param {Object} res - Express 响应对象
 */
exports.getUserPlotsByUserName = async (req, res) => {
  try {
    // 1. 获取用户名参数
    const { username } = req.auth;
    console.log('测试')
    
    // 2. 参数校验
    if (!username || typeof username !== 'string' || username.trim() === '') {
      return res.cc('用户名不能为空');
    }
    
    console.log(`开始查询用户: ${username} 创建的地块信息`);
    
    // 3. 查询用户信息获取用户ID
    const user = await dbUtils.getUserInfo(username);
    if (!user) {
      return res.cc(`用户 "${username}" 不存在`);
    }
    const userId = user.Id;
    console.log(`找到用户ID: ${userId}`);
    
    // 4. 查询该用户创建的所有地块
    const plots = await plotUtils.getLandPlotsByUserId(userId);
    if (!plots || plots.length === 0) {
      console.log(`用户 ${username} 没有创建任何地块`);
      return res.send({
        status: 0,
        message: '查询成功',
        data: {
          username: username,
          plots: []
        }
      });
    }
    
    console.log(`找到 ${plots.length} 个地块`);
    
    // 5. 对每个地块查询其下的所有租赁单元
    const resultPlots = [];
    for (const plot of plots) {
      try {
        // 查询该地块下的所有租赁单元
        // console.log(`查询地块 ${plot.plot_id} 的租赁单元`)
        const leaseUnits = await plotUtils.getLeaseUnitsByPlotId(plot.plot_id);
            
        // 构建地块数据，包含租赁单元列表
        const plotWithLeases = {
          ...plot,
          lease_units: leaseUnits || []
        };
        
        resultPlots.push(plotWithLeases);
      } catch (leaseError) {
        console.error(`查询地块 ${plot.plot_id} 的租赁单元失败:`, leaseError);
        // 即使单个地块查询失败，也不中断整个流程
        const plotWithLeases = {
          ...plot,
          lease_units: [],
          error: `查询租赁单元失败: ${leaseError.message}`
        };
        resultPlots.push(plotWithLeases);
      }
    }
    
    // 6. 返回最终结果
    const response = {
      status: 0,
      message: '查询成功',
      data: {
        username: username,
        user_id: userId,
        plots: resultPlots
      }
    };
    
    console.log(`用户 ${username} 的地块查询完成，共 ${resultPlots.length} 个地块`);
    return res.send(response);
    
  } catch (error) {
    console.error('根据用户名查询地块失败:', error);
    return res.cc(`查询失败: ${error.message}`);
  }
};