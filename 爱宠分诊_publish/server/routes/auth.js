const router = require('express').Router();
const jwt = require('jsonwebtoken');
const config = require('../config');
const db = require('../db');

// POST /api/login   body: { code }  （wx.login 拿到的临时 code）
router.post('/login', async (req, res) => {
  const { code } = req.body || {};
  if (!code) return res.status(400).json({ error: '缺少 code' });

  const url = 'https://api.weixin.qq.com/sns/jscode2session'
    + `?appid=${config.appid}`
    + `&secret=${config.appSecret}`
    + `&js_code=${code}`
    + '&grant_type=authorization_code';

  const r = await fetch(url);
  const data = await r.json();
  if (!data.openid) {
    return res.status(400).json({ error: data.errmsg || '登录失败' });
  }

  const openid = data.openid;
  let user = db.prepare('SELECT * FROM users WHERE openid = ?').get(openid);
  if (!user) {
    db.prepare('INSERT INTO users (openid) VALUES (?)').run(openid);
    user = db.prepare('SELECT * FROM users WHERE openid = ?').get(openid);
  }

  const token = jwt.sign({ openid }, config.jwtSecret, { expiresIn: '30d' });
  res.json({ token, openid, user });
});

module.exports = router;
