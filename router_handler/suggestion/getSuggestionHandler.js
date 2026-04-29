/**
 * 地点搜索推荐处理函数
 * 调用 utils/api/suggestion/index.js 中的 getSuggestion 函数
 */

const suggestionUtils = require('../../utils/api/suggestion');

/**
 * 获取地点搜索推荐处理函数
 * @param {Object} req - Express 请求对象
 * @param {Object} req.body - 请求体参数
 * @param {string} req.body.keyword - 搜索关键词
 * @param {number} [req.body.lat] - 用户当前位置纬度
 * @param {number} [req.body.lng] - 用户当前位置经度
 * @param {number} [req.body.page_size=10] - 每页结果数量
 * @param {number} [req.body.page_index=1] - 页码
 * @param {string} [req.body.region] - 限定城市范围
 * @param {Object} res - Express 响应对象
 */
exports.getSuggestion = async (req, res) => {
  try {
    // 从请求体中提取参数
    const {
      keyword,
      lat,
      lng,
      page_size,
      page_index,
      region
    } = req.body;

    console.log('地点搜索推荐请求参数:', {
      keyword,
      lat,
      lng,
      page_size,
      page_index,
      region
    });

    // 参数验证
    if (!keyword) {
      return res.cc('搜索关键词不能为空');
    }

    // 构建选项对象
    const options = {};
    
    if (lat !== undefined && lat !== null) {
      options.lat = parseFloat(lat);
    }
    
    if (lng !== undefined && lng !== null) {
      options.lng = parseFloat(lng);
    }
    
    if (page_size !== undefined && page_size !== null) {
      options.page_size = parseInt(page_size);
    }
    
    if (page_index !== undefined && page_index !== null) {
      options.page_index = parseInt(page_index);
    }
    
    if (region !== undefined && region !== null) {
      options.region = String(region);
    }

    // 调用工具函数获取推荐结果
    const result = await suggestionUtils.getSuggestion(keyword, options);

    // 返回成功响应
    return res.send({
      status: 0,
      message: '查询成功',
      data: result
    });

  } catch (error) {
    console.error('地点搜索推荐处理函数错误:', error);
    
    // 根据错误类型返回相应错误信息
    if (error.code === 'INVALID_KEYWORD') {
      return res.cc(error.error);
    } else if (error.code === 'INVALID_LATITUDE' || error.code === 'INVALID_LONGITUDE') {
      return res.cc(error.error);
    } else if (error.code === 'INVALID_PAGE_SIZE' || error.code === 'INVALID_PAGE_INDEX') {
      return res.cc(error.error);
    } else if (error.code === 'API_ERROR') {
      return res.cc(`腾讯地图 API 调用失败：${error.error}`);
    } else if (error.code === 'TIMEOUT_ERROR') {
      return res.cc('请求超时，请稍后重试');
    } else if (error.code === 'NETWORK_ERROR') {
      return res.cc('网络连接失败，请检查网络设置');
    }
    
    // 其他错误
    return res.cc(`查询失败：${error.message || error.error}`);
  }
};
