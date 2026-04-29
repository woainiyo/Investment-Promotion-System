const fs = require('fs').promises;
const path = require('path');

// 获取用户头像处理函数 - 直接读取本地文件
exports.getUserAvatar = async (req, res) => {
  try {
    // 从 JWT token 中获取用户名（由 express-jwt 中间件解析）
    const username = req.auth.username;
    
    if (!username) {
      return res.cc('用户信息缺失');
    }
    
    // 构建用户头像文件路径: /static/user/username.txt
    const avatarFilePath = path.join(__dirname, '../../..', 'backend','static', 'user', `${username}.txt`);
    
    // 检查文件是否存在
    try {
      await fs.access(avatarFilePath);
    } catch (error) {
      // 文件不存在，返回空头像
      return res.send({
        status: 0,
        message: '用户头像不存在',
        data: {
          avatar: '', // 返回空字符串表示没有头像
          username: username
        }
      });
    }
    
    // 读取文件内容（base64格式的头像数据）
    const avatarBase64 = await fs.readFile(avatarFilePath, 'utf8');
    
    // 返回用户头像信息
    res.send({
      status: 0,
      message: '获取用户头像成功',
      data: {
        avatar: avatarBase64.trim(), // 去除可能的空白字符
        username: username
      }
    });
  } catch (error) {
    console.error('获取用户头像失败:', error);
    res.cc('获取用户头像失败');
  }
};