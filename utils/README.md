# 腾讯地图逆地理编码工具使用说明

## 📋 概述

这是一个独立的Node.js工具脚本，使用腾讯地图WebService API实现经纬度到详细地址信息的转换。

## 📁 文件结构

```
utils/
├── geocode.js          # 核心工具函数（生产环境使用）
├── geocode-example.js  # 完整使用示例
├── test-geocode.js     # 快速功能测试
├── mock-test.js        # 模拟测试（绕过API限制）
└── README.md          # 本说明文档
```

## 🚀 核心功能

### reverseGeocode(lat, lng)

**功能**: 将经纬度坐标转换为详细地址信息

**参数**:
- `lat` (number): 纬度值，范围 -90 到 90
- `lng` (number): 经度值，范围 -180 到 180

**返回值**: Promise<Object> 包含以下字段：
- `formattedAddress`: 格式化后的完整地址
- `province`: 省份
- `city`: 城市
- `district`: 区县
- `adcode`: 区域编码
- `addressComponent`: 完整的地址组件对象
- `location`: 原始坐标信息
- `level`: 精度级别

## 💡 使用示例

### 基础使用
```javascript
const { reverseGeocode } = require('./utils/geocode');

async function getAddress() {
  try {
    const result = await reverseGeocode(39.9042, 116.4074);
    // 地址:
    // 省份:
    // 城市:
  } catch (error) {
    console.error('查询失败:', error.error);
  }
}
```

### 批量查询
```javascript
const { reverseGeocode } = require('./utils/geocode');

async function batchQuery() {
  const coordinates = [
    { lat: 39.9042, lng: 116.4074 }, // 北京
    { lat: 31.2304, lng: 121.4737 }, // 上海
    { lat: 23.1291, lng: 113.2644 }  // 广州
  ];

  const results = await Promise.all(
    coordinates.map(coord => 
      reverseGeocode(coord.lat, coord.lng)
        .then(result => ({ ...coord, success: true, data: result }))
        .catch(error => ({ ...coord, success: false, error }))
    )
  );

  results.forEach(result => {
    if (result.success) {
      // 输出: 39.9042,116.4074: 北京市东城区天安门广场
    } else {
      // 输出: 无效坐标: 查询失败 - INVALID_LAT_LNG
    }
  });
}
```

## ⚠️ 错误处理

函数会抛出包含以下字段的错误对象：
- `error`: 错误描述信息
- `code`: 错误代码
- `statusCode`: API状态码（如适用）

常见错误代码：
- `INVALID_PARAMETERS`: 参数类型错误
- `INVALID_LATITUDE`: 纬度超出范围
- `INVALID_LONGITUDE`: 经度超出范围
- `API_ERROR`: API调用失败
- `NETWORK_ERROR`: 网络请求失败
- `TIMEOUT_ERROR`: 请求超时

## 🔧 技术特点

1. **纯工具函数**: 不依赖Express或其他框架
2. **Promise支持**: 完美支持async/await语法
3. **错误处理完善**: 全面的参数验证和异常捕获
4. **零依赖**: 仅使用Node.js内置模块
5. **高性能**: 支持并发查询，5秒超时保护

## 🧪 测试验证

### 快速测试
```bash
node utils/test-geocode.js
```

### 模拟测试（绕过API限制）
```bash
node utils/mock-test.js
```

### 完整示例
```bash
node utils/geocode-example.js
```

## 🔐 API配置

工具使用以下腾讯地图API配置：
- **API Key**: 4X2BZ-BWTK4-7HZUG-F73HH-VQVH7-HQBL4
- **API地址**: https://apis.map.qq.com/ws/geocoder/v1/
- **请求超时**: 5秒

## 📝 注意事项

1. **调用限制**: 腾讯地图API有每日调用量限制
2. **网络要求**: 需要能够访问腾讯地图API服务
3. **参数范围**: 严格验证坐标参数的有效性
4. **错误日志**: 所有错误都会在控制台输出详细信息

## 🔄 版本兼容性

- Node.js >= 12.0.0
- 与Express项目完全兼容
- 支持CommonJS模块系统

## 🆘 故障排除

如果遇到问题，请按以下步骤排查：

1. **检查网络连接**: 确保能够访问外部API
2. **验证API密钥**: 确认密钥有效且未超过调用限制
3. **检查参数格式**: 确保传入的坐标是有效的数字
4. **查看错误日志**: 控制台会输出详细的错误信息
5. **运行测试脚本**: 使用mock-test.js验证逻辑正确性

## 📚 相关资源

- [腾讯地图WebService API文档](https://lbs.qq.com/service/webService/webServiceGuide/webServiceGcoder)
- [逆地理编码接口说明](https://lbs.qq.com/service/webService/webServiceGuide/webServiceGcoder)