/**
 * 腾讯地图地点搜索推荐 API 测试脚本
 * 用于验证修复后的代码是否正常工作
 */

const suggestionUtils = require('./utils/api/suggestion');

async function runTests() {
  console.log('=== 地点搜索推荐 API 测试 ===\n');
  
  // 测试 1: 基本搜索（无位置信息）
  console.log('【测试 1】基本关键词搜索："浙江省东阳市"');
  try {
    const result = await suggestionUtils.getSuggestion('浙江省东阳市', {
      page_size: 5
    });
    
    console.log('✅ 成功！返回结果数量:', result.count);
    console.log('前 3 条结果:');
    result.suggestions.slice(0, 3).forEach((item, index) => {
      console.log(`  ${index + 1}. ${item.title}`);
      console.log(`     地址：${item.address}`);
      console.log(`     坐标：${item.latitude},${item.longitude}`);
    });
    console.log();
  } catch (error) {
    console.error('❌ 失败:', error.error || error.message);
    console.log();
  }
  
  // 测试 2: 带位置的搜索
  console.log('【测试 2】带位置搜索："咖啡厅"（北京天安门附近）');
  try {
    const result = await suggestionUtils.getSuggestion('咖啡厅', {
      lat: 39.90872,
      lng: 116.39747,
      page_size: 3
    });
    
    console.log('✅ 成功！返回结果数量:', result.count);
    console.log('结果列表:');
    result.suggestions.forEach((item, index) => {
      console.log(`  ${index + 1}. ${item.title}`);
      console.log(`     地址：${item.address}`);
      console.log(`     距离：${item.distance ? item.distance + '米' : '未知'}`);
    });
    console.log();
  } catch (error) {
    console.error('❌ 失败:', error.error || error.message);
    console.log();
  }
  
  // 测试 3: 限定城市范围
  console.log('【测试 3】限定城市范围："地铁站"（上海市）');
  try {
    const result = await suggestionUtils.getSuggestion('地铁站', {
      region: '上海市',
      page_size: 3
    });
    
    console.log('✅ 成功！返回结果数量:', result.count);
    console.log('结果列表:');
    result.suggestions.forEach((item, index) => {
      console.log(`  ${index + 1}. ${item.title} - ${item.district}`);
    });
    console.log();
  } catch (error) {
    console.error('❌ 失败:', error.error || error.message);
    console.log();
  }
  
  // 测试 4: 空关键词（应该失败）
  console.log('【测试 4】错误测试：空关键词');
  try {
    await suggestionUtils.getSuggestion('', {
      page_size: 5
    });
    console.error('❌ 应该抛出错误但未抛出');
  } catch (error) {
    console.log('✅ 正确抛出错误:', error.error);
  }
  console.log();
  
  // 测试 5: 无效的经纬度（应该失败）
  console.log('【测试 5】错误测试：无效经纬度');
  try {
    await suggestionUtils.getSuggestion('测试', {
      lat: 100, // 超出范围
      lng: 116
    });
    console.error('❌ 应该抛出错误但未抛出');
  } catch (error) {
    console.log('✅ 正确抛出错误:', error.error);
  }
  console.log();
  
  console.log('=== 测试完成 ===');
}

runTests().catch(console.error);
