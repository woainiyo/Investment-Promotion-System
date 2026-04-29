const plotUtils = require('../../utils/api/plot')

/**
 * 根据地块ID获取地块详情处理函数
 * @param {Object} req - Express 请求对象
 * @param {Object} res - Express 响应对象
 */
exports.getPlotById = async (req, res) => {
  try {
    // 从请求参数中获取 plot_id
    const plot_id = req.query.plot_id || req.body.plot_id;
    
    // 参数校验
    if (!plot_id) {
      return res.send({
        status: -1,
        message: '地块ID不能为空'
      });
    }
    
    
    
    // 调用数据库方法查询地块详情（已包含租赁单元信息）
    const plot = await plotUtils.getLandPlotById(plot_id);
    
    // 检查查询结果
    if (!plot) {
      
      return res.send({
        status: 1,
        message: '未找到指定的地块信息'
      });
    }
    
    
    
    // 返回成功响应
    return res.send({
      status: 0,
      message: 'success',
      data: plot
    });
    
  } catch (error) {
    console.error('获取地块详情失败:', error);
    return res.send({
      status: -1,
      message: '获取地块详情失败'
    });
  }
};