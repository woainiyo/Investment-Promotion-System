/**
 * 根据租赁单元ID获取租赁单元详情处理函数
 * 调用 utils/api/lease/index.js 中的 getLeaseUnitsByUnitId 函数
 */

const leaseUtils = require('../../utils/api/lease');

/**
 * 根据租赁单元ID获取租赁单元详情处理函数
 * @param {Object} req - Express 请求对象
 * @param {Object} res - Express 响应对象
 */
exports.getLeaseUnitsByUnitId = async (req, res) => {
  try {
    // 从请求参数中提取 unitId
    const { unitId } = req.params;
    
    // 验证 unitId 是否存在
    if (!unitId) {
      return res.cc('租赁单元ID不能为空');
    }
    
    // 调用 getLeaseUnitsByUnitId 函数
    const leaseUnit = await leaseUtils.getLeaseUnitsByUnitId(unitId);
    
    // 检查查询结果
    if (!leaseUnit) {
      return res.send({
        status: -1,
        message: '未找到指定的租赁单元'
      });
    }
    
    // 返回成功响应
    return res.send({
      status: 0,
      message: '查询成功',
      data: leaseUnit
    });

  } catch (error) {
    console.error('查询租赁单元详情处理函数错误:', error);
    return res.cc(`查询租赁单元详情失败: ${error.message}`);
  }
};