/**
 * 腾讯地图地点搜索推荐 API 模块
 * 调用腾讯地图 WebService API 的"地点搜索/建议"功能
 * API 文档：https://lbs.qq.com/service/webService/webServiceGuide/search/webServiceSuggestion
 */

const https = require('https');
const config = require('../../../config');

// 腾讯地图 API 配置（从 config 中统一读取）
const QQ_MAP_CONFIG = config.qqMap;

/**
 * 地点搜索推荐 - 根据关键词返回相关地点建议
 * @param {string} keyword - 搜索关键词（必填）
 * @param {Object} options - 可选参数对象
 * @param {number} [options.lat] - 用户当前位置纬度（用于距离排序）
 * @param {number} [options.lng] - 用户当前位置经度（用于距离排序）
 * @param {number} [options.page_size=10] - 每页结果数量（最大 20）
 * @param {number} [options.page_index=1] - 页码
 * @param {string} [options.region] - 限定城市范围（如"北京市"）
 * @returns {Promise<Object>} 包含推荐地点列表的对象
 */
function getSuggestion(keyword, options = {}) {
  return new Promise((resolve, reject) => {
    // 参数验证
    if (!keyword || typeof keyword !== 'string' || keyword.trim() === '') {
      const error = {
        error: '参数错误：搜索关键词不能为空',
        code: 'INVALID_KEYWORD'
      };
      console.error('Suggestion Error:', error.error);
      reject(error);
      return;
    }

    const {
      lat,
      lng,
      page_size = 10,
      page_index = 1,
      region = ''
    } = options;

    // 验证经纬度（如果提供）
    if (lat !== undefined && lat !== null) {
      if (typeof lat !== 'number' || lat < -90 || lat > 90) {
        const error = {
          error: '参数错误：纬度值必须在 -90 到 90 之间',
          code: 'INVALID_LATITUDE'
        };
        console.error('Suggestion Error:', error.error);
        reject(error);
        return;
      }
    }

    if (lng !== undefined && lng !== null) {
      if (typeof lng !== 'number' || lng < -180 || lng > 180) {
        const error = {
          error: '参数错误：经度值必须在 -180 到 180 之间',
          code: 'INVALID_LONGITUDE'
        };
        console.error('Suggestion Error:', error.error);
        reject(error);
        return;
      }
    }

    // 验证 page_size
    if (typeof page_size !== 'number' || page_size < 1 || page_size > 20) {
      const error = {
        error: '参数错误：每页结果数量必须在 1-20 之间',
        code: 'INVALID_PAGE_SIZE'
      };
      console.error('Suggestion Error:', error.error);
      reject(error);
      return;
    }

    // 验证 page_index
    if (typeof page_index !== 'number' || page_index < 1) {
      const error = {
        error: '参数错误：页码必须大于 0',
        code: 'INVALID_PAGE_INDEX'
      };
      console.error('Suggestion Error:', error.error);
      reject(error);
      return;
    }

    // 构建请求参数
    const params = {
      keyword: keyword.trim(),
      key: QQ_MAP_CONFIG.key,
      page_size,
      page_index
    };

    // 如果提供了经纬度，添加到参数中
    if (lat !== undefined && lat !== null && lng !== undefined && lng !== null) {
      params.location = `${lat},${lng}`;
    }

    // 如果提供了区域限制，添加到参数中
    if (region && typeof region === 'string') {
      params.region = region.trim();
    }

    // 构建查询字符串
    const queryString = Object.keys(params)
      .map(key => `${key}=${encodeURIComponent(params[key])}`)
      .join('&');

    const url = `${QQ_MAP_CONFIG.suggestionUrl}?${queryString}`;

    console.log(`Suggestion Request: ${url}`);
    console.log('API Key:', QQ_MAP_CONFIG.key.substring(0, 10) + '...'); // 只显示前 10 位

    // 发起 HTTPS 请求
    const request = https.get(url, (response) => {
      let data = '';
      
      // 接收数据
      response.on('data', (chunk) => {
        data += chunk;
      });
      
      // 请求完成
      response.on('end', () => {
        try {
          const result = JSON.parse(data);
          
          // 检查 API 响应状态
          if (result.status !== 0) {
            const error = {
              error: result.message || 'API 调用失败',
              code: 'API_ERROR',
              statusCode: result.status
            };
            console.error('Suggestion API Error:', error.error);
            reject(error);
            return;
          }

          // 提取推荐结果（兼容两种返回格式）
          // 新版 API 返回 data 字段，旧版返回 result 字段
          const apiResult = result.data || result.result;
          if (!apiResult) {
            const error = {
              error: 'API 返回空结果',
              code: 'EMPTY_RESULT'
            };
            console.error('Suggestion Error:', error.error);
            reject(error);
            return;
          }

          // 构造返回对象
          const suggestionInfo = {
            keyword: keyword.trim(),
            count: apiResult.length || 0,
            suggestions: apiResult.map(item => ({
              id: item.id || '',
              title: item.title || '',
              latitude: item.location?.lat || null,
              longitude: item.location?.lng || null,
              address: item.address || '',
              province: item.ad_info?.province || '',
              city: item.ad_info?.city || '',
              district: item.ad_info?.district || '',
              adcode: item.ad_info?.adcode || '',
              distance: item._distance || null // 如果有距离信息
            }))
          };

          console.log(`Suggestion Success: "${keyword}" -> ${suggestionInfo.count} 条结果`);
          resolve(suggestionInfo);

        } catch (parseError) {
          const error = {
            error: `解析响应数据失败：${parseError.message}`,
            code: 'PARSE_ERROR'
          };
          console.error('Suggestion Parse Error:', error.error);
          reject(error);
        }
      });
      
    }).on('error', (error) => {
      // 处理网络请求错误
      const formattedError = {
        error: `网络请求失败：${error.message}`,
        code: 'NETWORK_ERROR',
        originalError: error
      };
      console.error('Suggestion Network Error:', formattedError.error);
      reject(formattedError);
    });

    // 设置请求超时
    request.setTimeout(5000, () => {
      request.destroy();
      const error = {
        error: '请求超时',
        code: 'TIMEOUT_ERROR'
      };
      console.error('Suggestion Timeout Error:', error.error);
      reject(error);
    });
  });
}

module.exports = {
  getSuggestion
};
