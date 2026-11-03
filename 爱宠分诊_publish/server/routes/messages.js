const router = require('express').Router();
const db = require('../db');

// GET /api/consults/:id/messages  某问诊单的全部消息
router.get('/:id/messages', (req, res) => {
  const list = db.prepare(
    'SELECT * FROM messages WHERE consult_id = ? ORDER BY id ASC'
  ).all(req.params.id);
  res.json(list);
});

// POST /api/consults/:id/messages  发送消息  body: { type, content }
router.post('/:id/messages', (req, res) => {
  const { type, content } = req.body || {};
  if (!content) return res.status(400).json({ error: '消息内容不能为空' });

  const info = db.prepare(
    'INSERT INTO messages (consult_id, from_openid, type, content) VALUES (?,?,?,?)'
  ).run(req.params.id, req.openid, type || 'text', content);

  res.json(db.prepare('SELECT * FROM messages WHERE id = ?').get(info.lastInsertRowid));
});

module.exports = router;
