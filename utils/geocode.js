/**
 * 腾讯地图逆地理编码工具函数
 * 直接通过 HTTPS 请求调用腾讯地图 WebService API
 */

const https = require('https');
const config = require('../config');

// 腾讯地图 API 配置（从 config 中统一读取）
const QQ_MAP_CONFIG = config.qqMap;

/**
 * 逆地理编码函数 - 将经纬度转换为详细地址信息
 * @param {number} lat - 纬度值 (-90 到 90)
 * @param {number} lng - 经度值 (-180 到 180)
 * @returns {Promise<Object>} 包含详细地址信息的对象
 */
function reverseGeocode(lat, lng) {
  return new Promise((resolve, reject) => {
    // 参数验证
    if (typeof lat !== 'number' || typeof lng !== 'number') {
      const error = {
        error: '参数错误：纬度和经度必须是数字类型',
        code: 'INVALID_PARAMETERS'
      };
      reject(error);
      return;
    }
    
    if (lat < -90 || lat > 90) {
      const error = {
        error: '参数错误：纬度值必须在 -90 到 90 之间',
        code: 'INVALID_LATITUDE'
      };
      reject(error);
      return;
    }
    
    if (lng < -180 || lng > 180) {
      const error = {
        error: '参数错误：经度值必须在 -180 到 180 之间',
        code: 'INVALID_LONGITUDE'
      };
      reject(error);
      return;
    }

    // 构建请求参数
    const location = `${lat},${lng}`;
    const url = `${QQ_MAP_CONFIG.baseUrl}?location=${location}&key=${QQ_MAP_CONFIG.key}&get_poi=0`;

    // 发起HTTPS请求
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
            reject(error);
            return;
          }
          
          // 提取地址信息
          const apiResult = result.result;
          if (!apiResult) {
            const error = {
              error: 'API 返回空结果',
              code: 'EMPTY_RESULT'
            };
            reject(error);
            return;
          }

          // 构造返回对象
          const addressInfo = {
            formattedAddress: apiResult.address || '',
            province: apiResult.ad_info?.province || '',
            city: apiResult.ad_info?.city || '',
            district: apiResult.ad_info?.district || '',
            adcode: apiResult.ad_info?.adcode || '',
            addressComponent: {
              nation: apiResult.ad_info?.nation || '',
              province: apiResult.ad_info?.province || '',
              city: apiResult.ad_info?.city || '',
              district: apiResult.ad_info?.district || '',
              adcode: apiResult.ad_info?.adcode || '',
              ...apiResult.address_component
            },
            location: {
              lat: lat,
              lng: lng
            },
            level: apiResult.level || ''
          };
          resolve(addressInfo);

        } catch (parseError) {
          const error = {
            error: `解析响应数据失败：${parseError.message}`,
            code: 'PARSE_ERROR'
          };
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
      reject(formattedError);
    });

    // 设置请求超时
    request.setTimeout(5000, () => {
      request.destroy();
      const error = {
        error: '请求超时',
        code: 'TIMEOUT_ERROR'
      };
      reject(error);
    });
  });
}

module.exports = {
  reverseGeocode
};
