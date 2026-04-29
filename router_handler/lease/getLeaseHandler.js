/**
 * 获取租赁单元处理函数
 * 调用 utils/api/lease/index.js 中的 getLeaseUnitsByPlotId 函数
 */

const leaseUtils = require('../../utils/api/lease');

/**
 * 根据地块ID获取租赁单元列表处理函数
 * @param {Object} req - Express 请求对象
 * @param {Object} res - Express 响应对象
 */
exports.getLeaseUnitsByPlotId = async (req, res) => {
  
  try {
    // 从请求参数中提取 plotId
    const { plotId } = req.params;    
    // 验证 plotId 是否存在
    if (!plotId) {
      return res.cc('地块ID不能为空');
    }
    
    // 调用 getLeaseUnitsByPlotId 函数
    const leaseUnits = await leaseUtils.getLeaseUnitsByPlotId(plotId);
    
    // 返回成功响应
    return res.send({
      status: 0,
      message: '查询成功',
      data: leaseUnits
    });

  } catch (error) {
    console.error('查询租赁单元列表处理函数错误:', error);
    return res.cc(`查询租赁单元列表失败: ${error.message}`);
  }
};