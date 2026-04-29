const plotUtils = require('../../utils/api/plot')
const fs = require('fs').promises
const path = require('path')

/**
 * 读取用户头像Base64数据
 * @param {string} username - 用户名
 * @returns {Promise<string|null>} 头像Base64数据或null
 */
async function getUserAvatarBase64(username) {
  try {
    const avatarPath = path.join(__dirname, '../../static/user', `${username}.txt`);
    const base64Data = await fs.readFile(avatarPath, 'utf8');
    return base64Data.trim();
  } catch (error) {
    console.warn(`读取用户${username}头像失败:`, error.message);
    return null;
  }
}

exports.getALLPloatInfo = async (req, res) => {
  
  try {
    console.log('获取地块列表');
    // 调用 getAllLandPlots 方法查询数据库中 land_plot 表的所有记录
    const plots = await plotUtils.getAllLandPlots();
    
    // 检查查询结果
    if (plots === null) {
      // 查询失败
      return res.send({
        status: -1,
        message: '获取地块列表失败'
      });
    }
    
    // 为每个地块添加创建者头像信息
    if (plots && plots.length > 0) {
      for (const plot of plots) {
        if (plot.created_by_username) {
          const avatarBase64 = await getUserAvatarBase64(plot.created_by_username);
          plot.avatar = avatarBase64 || '';
        }
      }
    }
    
    // 返回成功响应
    return res.send({
      status: 0,
      message: '获取地块列表成功',
      data: plots
    });
    
  } catch (error) {
    console.error('获取地块列表失败:', error);
    // 返回失败响应
    return res.send({
      status: -1,
      message: '获取地块列表失败'
    });
  }
}