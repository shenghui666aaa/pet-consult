const jwt = require('jsonwebtoken');
const config = require('../config');

// 校验请求头 Authorization: Bearer <token>，解析出 openid 挂到 req.openid
module.exports = (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.replace(/^Bearer\s+/i, '');
  if (!token) return res.status(401).json({ error: '未登录' });

  try {
    const payload = jwt.verify(token, config.jwtSecret);
    req.openid = payload.openid;
    next();
  } catch (e) {
    res.status(401).json({ error: '登录已过期，请重新进入' });
  }
};
