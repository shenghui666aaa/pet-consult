// 从环境变量（.env）读取配置
module.exports = {
  appid: process.env.APPID,
  appSecret: process.env.APPSECRET,
  port: Number(process.env.PORT) || 3000,
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-me',
  deepseekApiKey: process.env.DEEPSEEK_API_KEY
};
