/**
 * 创建地块处理函数
 * 调用 utils/api/plot/index.js 中的 createLandPlot 函数
 */

const plotUtils = require('../../utils/api/plot');
const geocode = require('../../utils/geocode');
const userUtils = require('../../utils/api/user/db');

/**
 * 创建地块处理函数
 * @param {Object} req - Express 请求对象
 * @param {Object} res - Express 响应对象
 */
exports.createPlot = async (req, res) => {
  try {
    // 从请求体中提取参数
    const {
      plot_name,
      description,
      longitude,
      latitude,
      plot_status
    } = req.body;
    
    console.log("创建地块信息",req.body);

    // 从 JWT auth 中获取用户名
    const username = req.auth.username;
    console.log("用户名",username);
    if (!username) {
      return res.cc('用户身份验证失败');
    }

    // 根据用户名查询用户ID
    const user = await userUtils.getUserInfo(username);
    if (!user) {
      return res.cc('用户不存在');
    }
    const userId = user.Id;

    // 参数验证
    if (!plot_name || typeof plot_name !== 'string') {
      return res.cc('地块名称不能为空str');
    }
    
    if (description !== undefined && description !== null && typeof description !== 'string') {
      return res.cc('地块描述必须是字符串类型');
    }
    
    if (typeof longitude !== 'number' || longitude < -180 || longitude > 180) {
      return res.cc('经度值必须在-180到180之间');
    }
    
    if (typeof latitude !== 'number' || latitude < -90 || latitude > 90) {
      return res.cc('纬度值必须在-90到90之间');
    }

    // 调用地理编码工具获取行政区划信息
    let geocodeResult;
    try {
      geocodeResult = await geocode.reverseGeocode(latitude, longitude);
    } catch (geoError) {
      console.error('地理编码失败:', geoError);
      return res.cc(`地理编码失败: ${geoError.error || geoError.message}`);
    }
    
    // 验证地理编码结果
    if (!geocodeResult.province || !geocodeResult.city || !geocodeResult.district) {
      return res.cc('无法获取有效的行政区划信息，请检查经纬度是否正确');
    }
    
    // 调用 createLandPlot 函数创建地块，传入用户ID
    const plotId = await plotUtils.createLandPlot(
      plot_name,
      description,
      latitude,
      longitude,
      geocodeResult.province,
      geocodeResult.city,
      geocodeResult.district,
      plot_status || '招租',
      userId
    );

    // 检查创建结果
    if (plotId === null || plotId === undefined) {
      return res.cc('创建地块失败，请重试');
    }

    // 返回成功响应
    return res.send({
      status: 0,
      message: '地块创建成功',
      data: {
        plot_id: plotId
      }
    });

  } catch (error) {
    console.error('创建地块处理函数错误:', error);
    return res.cc(`创建地块失败: ${error.message}`);
  }
};