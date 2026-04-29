/**
 * 删除租赁单元处理函数
 * 调用 utils/api/lease/index.js 中的 deleteLease 函数
 */

const leaseUtils = require('../../utils/api/lease');

/**
 * 删除租赁单元处理函数
 * @param {Object} req - Express 请求对象
 * @param {Object} res - Express 响应对象
 */
exports.deleteLease = async (req, res) => {
  try {
    // 从请求体中提取 unit_id
    const { unit_id } = req.body;
    
    // 参数验证
    if (!unit_id) {
      return res.cc('租赁单元ID不能为空');
    }
    
    // 验证 unit_id 是否为有效数字或字符串
    if (typeof unit_id !== 'number' && typeof unit_id !== 'string') {
      return res.cc('租赁单元ID必须为数字或字符串类型');
    }
    
    // 调用 deleteLease 函数
    const result = await leaseUtils.deleteLease(unit_id);
    
    if (!result) {
      return res.cc('删除租赁单元失败，请检查租赁单元ID是否正确');
    }
    
    // 返回成功响应
    return res.send({
      status: 0,
      message: '删除租赁单元成功',
      data: null
    });

  } catch (error) {
    console.error('删除租赁单元处理函数错误:', error);
    return res.cc(`删除租赁单元失败: ${error.message}`);
  }
};