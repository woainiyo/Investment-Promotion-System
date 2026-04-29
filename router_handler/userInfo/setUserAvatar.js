const dbUtils = require('../../utils/api/user/db');
const fs = require('fs');
const path = require('path');

exports.setUserAvatar = async (req, res) => {
    const { username } = req.auth;
    const { avatar } = req.body;
    
  
  // 参数校验
  if (!username) {
    return res.cc("用户名不能为空");
  }
  
  if (!avatar) {
    return res.cc("头像数据不能为空");
  }
  
  try {
    // 创建用户头像文件的路径
    const userAvatarDir = path.join(__dirname, '../../static/user');
    const avatarFilePath = path.join(userAvatarDir, `${username}.txt`);
    
    // 确保用户头像目录存在
    if (!fs.existsSync(userAvatarDir)) {
      fs.mkdirSync(userAvatarDir, { recursive: true });
    }
    
    // 将base64数据写入文件
    await fs.promises.writeFile(avatarFilePath, avatar, 'utf8');
    
    // 构建相对于static目录的路径（用于数据库存储）
    const avatarPathInDb = `user/${username}.txt`;
    
    // 调用 setUserAvatar 函数更新用户头像路径
    const result = await dbUtils.setUserAvatar(username, avatarPathInDb);
    
    // 处理更新结果
    if (result.success) {
      return res.send({
        status: 0,
        message: '头像更新成功',
        data: {
          avatarPath: avatarPathInDb
        }
      });
    } else {
      return res.send({
        status: 1,
        message: '头像更新失败，请重试'
      });
    }
    
  } catch (error) {
    console.error('更新用户头像失败:', error);
    return res.cc("头像更新失败，请重试");
  }
};