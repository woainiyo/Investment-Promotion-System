/**
 * 腾讯地图 API 调用诊断脚本
 * 用于诊断为什么浏览器能访问但 Node.js 代码无法访问
 */

const https = require('https');
const config = require('./config');

console.log('=== 腾讯地图 API 调用诊断 ===\n');

// 测试 1: 检查配置
console.log('【测试 1】检查 API 配置');
console.log('API Key:', config.qqMap.key);
console.log('Suggestion URL:', config.qqMap.suggestionUrl);
console.log('✅ 配置检查完成\n');

// 测试 2: 构造与浏览器完全一致的 URL
console.log('【测试 2】构造测试 URL');
const testKeyword = '浙江省东阳市';
const testUrl = `${config.qqMap.suggestionUrl}?keyword=${encodeURIComponent(testKeyword)}&key=${config.qqMap.key}&page_size=10&page_index=1`;
console.log('测试 URL:', testUrl);
console.log('✅ URL 构造完成\n');

// 测试 3: 发起 HTTPS 请求（添加详细的日志）
console.log('【测试 3】发起 HTTPS 请求');
console.log('开始时间:', new Date().toISOString());

const request = https.get(testUrl, (response) => {
  console.log('\n--- 响应信息 ---');
  console.log('状态码:', response.statusCode);
  console.log('响应头:', JSON.stringify(response.headers, null, 2));
  
  let data = '';
  
  response.on('data', (chunk) => {
    console.log('接收数据块:', chunk.length, '字节');
    data += chunk;
  });
  
  response.on('end', () => {
    console.log('\n--- 响应完成 ---');
    console.log('总数据长度:', data.length, '字节');
    console.log('原始响应:');
    console.log(data);
    
    try {
      const result = JSON.parse(data);
      console.log('\n--- 解析成功 ---');
      console.log('status:', result.status);
      console.log('message:', result.message);
      console.log('result 数量:', result.result?.length || 0);
      
      if (result.status === 0) {
        console.log('\n✅ 测试通过！API 调用成功');
        console.log('前 3 条结果:');
        result.result.slice(0, 3).forEach((item, index) => {
          console.log(`  ${index + 1}. ${item.title} - ${item.address}`);
        });
      } else {
        console.log('\n❌ API 返回错误:', result.message);
      }
    } catch (parseError) {
      console.error('\n❌ 解析 JSON 失败:', parseError.message);
      console.error('原始数据:', data);
    }
  });
  
}).on('error', (error) => {
  console.error('\n--- 网络错误 ---');
  console.error('错误类型:', error.constructor.name);
  console.error('错误消息:', error.message);
  console.error('错误代码:', error.code);
  console.error('错误堆栈:', error.stack);
});

request.setTimeout(10000, () => {
  console.error('\n--- 请求超时 ---');
  console.error('超过 10 秒未收到响应');
  request.destroy();
});

// 测试 4: 对比浏览器和 Node.js 的差异
console.log('\n【测试 4】差异分析');
console.log('请在浏览器中打开以下 URL 进行对比:');
console.log(testUrl);
console.log('\n可能的差异点:');
console.log('1. User-Agent: 浏览器会自动添加，Node.js 默认不添加');
console.log('2. 代理设置：检查是否有公司代理影响');
console.log('3. SSL 证书验证：Node.js 可能在某些环境下验证严格');
console.log('4. 编码问题：中文参数的 URL 编码是否一致');
