const dbUtils = require("../../utils/api/user/db");
const jwt = require("jsonwebtoken");
const config = require("../../config");
const fs = require("fs").promises;
const path = require("path");

let token = null;

/**
 * 读取用户头像Base64数据
 * @param {string} username - 用户名
 * @returns {Promise<string|null>} 头像Base64数据或null
 */
async function getUserAvatarBase64(username) {
  try {
    const avatarPath = path.join(
      __dirname,
      "../../static/user",
      `${username}.txt`
    );
    const base64Data = await fs.readFile(avatarPath, "utf8");
    return base64Data.trim();
  } catch (error) {
    console.warn(`读取用户${username}头像失败:`, error.message);
    return null;
  }
}

/**
 * 用户登录处理函数
 * @param {Object} req - Express请求对象
 * @param {Object} req.body - 请求体参数
 * @param {string} req.body.username - 用户名
 * @param {string} req.body.password - 密码
 * @param {Object} res - Express响应对象
 * @returns {Promise<void>}
 */
exports.login = async (req, res) => {
  const userInfo = req.body;
  console.log("登录请求参数:", userInfo);
  // 参数验证
  if (!(userInfo && userInfo.username && userInfo.password)) {
    return res.cc("用户名或密码不能为空");
  }
  try {
    // 查询用户信息
    const result = await dbUtils.queryByUserName(userInfo.username);
    console.log("查询用户信息结果:", result);
    // 验证用户名和密码
    if (result.length === 1 && result[0].password === userInfo.password) {
      // 获取用户头像Base64数据
      const avatarBase64 = await getUserAvatarBase64(userInfo.username);
      // 构造返回的用户信息
      const returnUserInfo = {
        ...result[0],
        avatar: avatarBase64 || "", // 如果没有头像文件，返回空字符串
      };

      // 返回登录成功响应
      return res.send({
        message: "登录成功",
        status: 0,
        token: jwt.sign({ username: userInfo.username }, config.secretKey, {
          expiresIn: config.expiresIn,
        }),
        userInfo: returnUserInfo,
      });
    } else {
      return res.cc("登录失败.用户名或密码错误");
    }
  } catch (error) {
    console.error("登录处理错误:", error);
    return res.cc("服务器内部错误");
  }
};
