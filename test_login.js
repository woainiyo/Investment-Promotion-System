const axios = require('axios');

async function testLogin() {
    try {
        console.log('开始测试登录功能...');
        
        // 测试登录请求
        const response = await axios.post('http://localhost:3000/api/login', {
            username: 'testuser',
            password: 'testuser' // 假设密码是用户名
        });
        
        console.log('登录响应状态:', response.status);
        console.log('登录响应数据:', JSON.stringify(response.data, null, 2));
        
        // 检查是否包含头像信息
        if (response.data.userInfo && response.data.userInfo.avatar) {
            console.log('✅ 成功获取用户头像Base64数据');
            console.log('头像数据长度:', response.data.userInfo.avatar.length);
            console.log('头像数据预览:', response.data.userInfo.avatar.substring(0, 50) + '...');
        } else {
            console.log('⚠️ 未获取到用户头像数据');
        }
        
    } catch (error) {
        console.error('测试失败:', error.response?.data || error.message);
    }
}

testLogin();