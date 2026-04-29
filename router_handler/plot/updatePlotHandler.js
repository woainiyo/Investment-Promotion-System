/**
 * 更新地块处理函数
 * 调用 utils/api/plot/index.js 中的 updatePlot 函数
 */

const plotUtils = require('../../utils/api/plot');
const geocode = require('../../utils/geocode');

/**
 * 更新地块处理函数
 * @param {Object} req - Express 请求对象
 * @param {Object} res - Express 响应对象
 */
exports.updatePlot = async (req, res) => {
  try {
    // 从请求体中提取参数
    const {
      plot_id,
      plot_name,
      plot_description,
      latitude,
      longitude,
      plot_status,
    } = req.body;

    console.log('收到更新地块请求:', req.body);

    // 参数验证
    if (!plot_id || typeof plot_id === 'undefined') {
      return res.cc('地块ID不能为空');
    }

    // 构建更新数据对象
    const updateData = {
      plot_id
    };

    // 可选字段验证和赋值
    if (plot_name !== undefined) {
      if (plot_name !== null && typeof plot_name !== 'string') {
        return res.cc('地块名称必须是字符串类型');
      }
      if (plot_name === null || (typeof plot_name === 'string' && plot_name.trim() !== '')) {
        updateData.plot_name = plot_name;
      }
    }

    // plot_status 验证
    if (plot_status !== undefined) {
      const validStatus = ['已租', '招租', '待更新'];
      if (plot_status !== null && !validStatus.includes(plot_status)) {
        return res.cc('地块状态必须是"已租"、"招租"或"待更新"之一');
      }
      if (plot_status === null || validStatus.includes(plot_status)) {
        updateData.plot_status = plot_status;
      }
    }

    if (plot_description !== undefined) {
      if (plot_description !== null && typeof plot_description !== 'string') {
        return res.cc('地块描述必须是字符串类型');
      }
      updateData.plot_description = plot_description;
    }

    // 经纬度验证
    if (latitude !== undefined || longitude !== undefined) {
      // 如果其中一个提供了，另一个也必须提供
      if ((latitude !== undefined && longitude === undefined) || 
          (latitude === undefined && longitude !== undefined)) {
        return res.cc('经纬度必须同时提供或同时不提供');
      }

      if (latitude !== undefined) {
        if (typeof latitude !== 'number') {
          return res.cc('纬度值必须是数字类型');
        }
        if (latitude < -90 || latitude > 90) {
          return res.cc('纬度值必须在-90到90之间');
        }
        updateData.latitude = latitude;
      }

      if (longitude !== undefined) {
        if (typeof longitude !== 'number') {
          return res.cc('经度值必须是数字类型');
        }
        if (longitude < -180 || longitude > 180) {
          return res.cc('经度值必须在-180到180之间');
        }
        updateData.longitude = longitude;
      }
    }



    // 调用 updatePlot 函数更新地块
    const updateResult = await plotUtils.updatePlot(updateData);

    // 检查更新结果
    if (!updateResult) {
      return res.cc('更新地块失败，未知错误');
    }

    if (!updateResult.success) {
      return res.cc(updateResult.message || '更新地块失败');
    }

    // 返回成功响应
    return res.send({
      status: 0,
      message: updateResult.message || '地块更新成功',
      data: {
        plot_id: updateResult.plot_id,
        affected_rows: updateResult.affectedRows
      }
    });

  } catch (error) {
    console.error('更新地块处理函数错误:', error);
    return res.cc(`更新地块失败: ${error.message}`);
  }
};