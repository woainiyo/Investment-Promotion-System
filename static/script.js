// 测试JavaScript文件
console.log('静态资源JavaScript文件加载成功！');

// 简单的测试函数
function testStaticResource() {
    alert('静态资源托管功能正常工作！');
    console.log('当前时间:', new Date().toLocaleString());
}

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    console.log('页面DOM加载完成');
    // 可以在这里添加更多交互逻辑
});