const db = require("../../utils/db");

/**
 * 生成随机昵称
 * @returns {string} 随机生成的昵称
 */
function generateRandomNickname() {
  const adjectives = ['快乐', '幸福', '幸运', '阳光', '温暖', '开心', '甜蜜', '美好', '可爱', '聪明'];
  const nouns = ['小猫', '小狗', '兔子', '熊猫', '星星', '月亮', '太阳', '花朵', '糖果', '精灵'];
  const randomAdj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
  const randomNum = Math.floor(Math.random() * 1000);
  return `${randomAdj}${randomNoun}${randomNum}`;
}

module.exports.register = async function (req, res) {
  const userInfo = req.body;
  let connection = null;
    
  if (!(userInfo && userInfo.username && userInfo.password)){
    return res.cc("账号密码不能为空");
  }
  try {
    connection = await db.getConnection();
    // 如果前端提供了 nickname 则使用，否则随机生成一个
    const nickname = userInfo.nickname && userInfo.nickname.trim() !== '' 
      ? userInfo.nickname.trim() 
      : generateRandomNickname();
    
    const sql = "INSERT INTO user (id,username,password,nickname) VALUES(?,?,?,?)";
    const [result] = await connection.execute(
      sql,
      [+new Date(),
      userInfo.username,
      userInfo.password,
      nickname]
    );
    
    if(result.affectedRows === 1){
      res.send({
        message:'注册成功',
        status:0
      })
    }
    else res.cc('注册失败')

  } catch (e) {
    return res.cc(e);
  } finally {
    if (connection) connection.release();
  }
}
