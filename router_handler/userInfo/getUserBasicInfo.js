const dbUtils = require('../../utils/api/user/db');

exports.getUserBasicInfo = async (req, res) => {
  const { username } = req.auth;
  
  // 参数校验
  if (!username) {
    return res.cc("用户名不能为空");
  }
  try {
    // 调用 getUserInfo 函数查询用户信息
    const userInfo = await dbUtils.getUserInfo(username);
    // 检查用户是否存在
    if (!userInfo) {
      return res.cc("用户不存在");
    }
    
    // 返回成功响应
    return res.send({
      message: '获取用户基本信息成功',
      status: 0,
      data: {...userInfo ,username: ''}
    });
    
  } catch (error) {
    console.error('获取用户基本信息失败:', error);
    return res.cc("获取用户基本信息失败");
  }
};