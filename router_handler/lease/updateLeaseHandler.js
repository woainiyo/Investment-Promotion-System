/**
 * 更新租赁单元处理函数
 * 调用 utils/api/lease/index.js 中的 updateLeaseUnit 函数
 */

const leaseUtils = require('../../utils/api/lease');

/**
 * 更新租赁单元处理函数
 * @param {Object} req - Express 请求对象
 * @param {Object} res - Express 响应对象
 */
exports.updateLease = async (req, res) => {
  try {
    // 从请求体中提取更新数据
    const updateData = req.body;
    console.log('updateData:', updateData);
    
    
    // 验证请求体是否存在
    if (!updateData || typeof updateData !== 'object') {
      return res.cc('请求数据格式无效');
    }
    
    // 验证必填字段 unit_id
    if (updateData.unit_id === undefined || updateData.unit_id === null) {
      return res.cc('租赁单元ID(unit_id)为必填字段');
    }
    
    // 验证 unit_id 类型
    if (typeof updateData.unit_id !== 'number' && typeof updateData.unit_id !== 'string') {
      return res.cc('租赁单元ID必须为数字或字符串类型');
    }
    
    // 检查是否有可更新的字段
    const hasUpdateFields = updateData.unit_name !== undefined || 
                           updateData.area !== undefined || 
                           updateData.rent_price !== undefined || 
                           updateData.unit_description !== undefined ||
                           updateData.unit_status !== undefined ||
                           updateData.enterprise_name !== undefined ||
                           updateData.business_settlement_time !== undefined;
    
    if (!hasUpdateFields) {
      return res.cc('至少需要提供一个要更新的字段');
    }
    
    // business_settlement_time 验证
    if (updateData.business_settlement_time !== undefined) {
      if (updateData.business_settlement_time !== null && typeof updateData.business_settlement_time !== 'string') {
        return res.cc('企业入驻时间必须是字符串格式');
      }
      // 验证日期格式
      if (updateData.business_settlement_time !== null) {
        const datePattern = /^\d{4}-\d{2}-\d{2}( \d{2}:\d{2}:\d{2})?$/;
        if (!datePattern.test(updateData.business_settlement_time)) {
          return res.cc('企业入驻时间格式无效，支持 YYYY-MM-DD 或 YYYY-MM-DD HH:mm:ss');
        }
      }
    }
    
    // 调用 updateLeaseUnit 函数
    const affectedRows = await leaseUtils.updateLeaseUnit(updateData);
    
    if (affectedRows === null) {
      return res.cc('更新租赁单元失败，请检查参数是否正确');
    }
    
    if (affectedRows === 0) {
      return res.cc('未找到对应的租赁单元，或数据未发生变化');
    }
    
    // 返回成功响应
    return res.send({
      status: 0,
      message: '更新成功',
      data: { affectedRows }
    });

  } catch (error) {
    console.error('更新租赁单元处理函数错误:', error);
    return res.cc(`更新租赁单元失败: ${error.message}`);
  }
};