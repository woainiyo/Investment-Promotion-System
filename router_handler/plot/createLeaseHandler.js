/**
 * 创建租赁单元处理函数
 * 调用 utils/api/lease/index.js 中的 createLease 函数
 */

const leaseUtils = require('../../utils/api/lease');

/**
 * 创建租赁单元处理函数
 * @param {Object} req - Express 请求对象
 * @param {Object} res - Express 响应对象
 */
exports.createLease = async (req, res) => {
  try {
    // 从请求体中提取租赁单元数组和可选的单位状态
    const {leaseUnits,plot_id} = req.body;
    
    // 验证输入是否为数组
    if (!Array.isArray(leaseUnits) || leaseUnits.length === 0) {
      return res.cc('请求体必须包含非空的租赁单元数组');
    }
    
    // 验证每个租赁单元的 business_settlement_time 格式（如果提供）
    for (let i = 0; i < leaseUnits.length; i++) {
      const unit = leaseUnits[i];
      
      if (unit.businessSettlementTime !== undefined && unit.businessSettlementTime !== null) {
        if (typeof unit.businessSettlementTime !== 'string') {
          return res.cc(`第 ${i + 1} 个租赁单元的企业入驻时间必须是字符串格式`);
        }
        // 验证日期格式
        const datePattern = /^\d{4}-\d{2}-\d{2}( \d{2}:\d{2}:\d{2})?$/;
        if (!datePattern.test(unit.businessSettlementTime)) {
          return res.cc(`第 ${i + 1} 个租赁单元的企业入驻时间格式无效，支持 YYYY-MM-DD 或 YYYY-MM-DD HH:mm:ss`);
        }
      }
    }
    
    // 参数验证已在 createLease 函数内部进行，这里直接调用
    const result = await leaseUtils.createLease(leaseUnits,plot_id);
    
    // 检查创建结果
    if (result === null || result === undefined) {
      return res.cc('创建租赁单元失败，请重试');
    }

    // 返回成功响应
    return res.send({
      status: 0,
      message: `成功创建 ${result.affectedRows} 个租赁单元`,
      data: {
        createdCount: result.affectedRows,
        firstInsertId: result.insertId
      }
    });

  } catch (error) {
    console.error('创建租赁单元处理函数错误:', error);
    return res.cc(`创建租赁单元失败: ${error.message}`);
  }
};