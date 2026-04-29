const dbUtils = require('../../utils/api/user/db');

exports.setUserBasicInfo = async (req, res) => {
  
  const {nickname, signature} = req.body;
  const username = req.auth.username;
  // 参数校验
  if (!username) {
    return res.cc('用户名不能为空');
  }
  
  try {
    // 调用 setUserInfo 更新用户信息
    const result = await dbUtils.setUserInfo(username, nickname, signature);
    
    // 处理更新结果
    if (result.success) {
      return res.send({
        status: 0,
        message: '保存成功'
      });
    } else {
      return res.send({
        status: 1,
        message: '保存失败，请重试'
      });
    }
  } catch (error) {
    console.error('更新用户基本信息失败:', error);
    return res.cc('保存失败，请重试');
  }
}