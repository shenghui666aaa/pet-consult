const router = require('express').Router();
const db = require('../db');
const ai = require('../ai');

// GET /api/consults  我的问诊列表
router.get('/', (req, res) => {
  const list = db.prepare('SELECT * FROM consults WHERE openid = ? ORDER BY id DESC').all(req.openid);
  res.json(list);
});

// GET /api/consults/doctor  医生视角（保留，供后续「转人工」使用）
router.get('/doctor', (req, res) => {
  const list = db.prepare('SELECT * FROM consults WHERE status = ? OR doctor_openid = ? ORDER BY id DESC')
    .all('pending', req.openid);
  res.json(list);
});

// GET /api/consults/:id
router.get('/:id', (req, res) => {
  const c = db.prepare('SELECT * FROM consults WHERE id = ?').get(req.params.id);
  if (!c) return res.status(404).json({ error: '问诊不存在' });
  res.json(c);
});

// POST /api/consults  发起问诊（AI 后台分诊）  body: { petId, symptom, images }
router.post('/', async (req, res) => {
  const { petId, symptom, images } = req.body || {};
  if (!petId || !symptom) return res.status(400).json({ error: '请选择宠物并填写症状' });

  const pet = db.prepare('SELECT * FROM pets WHERE id = ? AND openid = ?').get(petId, req.openid);
  if (!pet) return res.status(404).json({ error: '宠物不存在' });

  const snapshot = JSON.stringify({
    name: pet.name, species: pet.species, breed: pet.breed, age: pet.age, photo: pet.photo
  });

  const info = db.prepare(
    'INSERT INTO consults (openid, pet_id, pet_snapshot, symptom, images) VALUES (?,?,?,?,?)'
  ).run(req.openid, petId, snapshot, symptom, JSON.stringify(images || []));

  const consult = db.prepare('SELECT * FROM consults WHERE id = ?').get(info.lastInsertRowid);
  res.json(consult); // 立即返回，AI 在后台分析

  ai.triage(consult, pet)
    .then(result => {
      db.prepare("UPDATE consults SET status='answered', ai_result=? WHERE id=?").run(result, consult.id);
    })
    .catch(err => {
      console.error('AI 分诊失败:', err.message);
      db.prepare("UPDATE consults SET status='answered', ai_result=? WHERE id=?")
        .run('AI 分诊暂时不可用，请稍后重试，或立即带宠物线下就医。', consult.id);
    });
});

// POST /api/consults/:id/accept  医生接诊（保留，供后续「转人工」使用）
router.post('/:id/accept', (req, res) => {
  const c = db.prepare('SELECT * FROM consults WHERE id = ?').get(req.params.id);
  if (!c) return res.status(404).json({ error: '问诊不存在' });
  if (c.status !== 'pending') return res.status(400).json({ error: '该问诊已被接诊或关闭' });
  db.prepare("UPDATE consults SET status='accepted', doctor_openid=?, accepted_at=datetime('now','localtime') WHERE id=?")
    .run(req.openid, req.params.id);
  res.json(db.prepare('SELECT * FROM consults WHERE id = ?').get(req.params.id));
});

// POST /api/consults/:id/close  关单 + 评价（保留）
router.post('/:id/close', (req, res) => {
  const { rating } = req.body || {};
  db.prepare("UPDATE consults SET status='closed', rating=?, closed_at=datetime('now','localtime') WHERE id=?")
    .run(rating || 0, req.params.id);
  res.json({ ok: true });
});

module.exports = router;
