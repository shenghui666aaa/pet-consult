const router = require('express').Router();
const db = require('../db');

// GET /api/pets  当前用户的宠物列表
router.get('/', (req, res) => {
  const pets = db.prepare('SELECT * FROM pets WHERE openid = ? ORDER BY id DESC').all(req.openid);
  res.json(pets);
});

// POST /api/pets  新增宠物
router.post('/', (req, res) => {
  const { name, species, breed, gender, age, weight, photo } = req.body || {};
  if (!name) return res.status(400).json({ error: '宠物名字必填' });

  const info = db.prepare(
    'INSERT INTO pets (openid, name, species, breed, gender, age, weight, photo) VALUES (?,?,?,?,?,?,?,?)'
  ).run(req.openid, name, species || '', breed || '', gender || '', age || 0, weight || '', photo || '');

  res.json(db.prepare('SELECT * FROM pets WHERE id = ?').get(info.lastInsertRowid));
});

// GET /api/pets/:id
router.get('/:id', (req, res) => {
  const pet = db.prepare('SELECT * FROM pets WHERE id = ? AND openid = ?').get(req.params.id, req.openid);
  if (!pet) return res.status(404).json({ error: '宠物不存在' });
  res.json(pet);
});

// PUT /api/pets/:id  更新宠物
router.put('/:id', (req, res) => {
  const pet = db.prepare('SELECT * FROM pets WHERE id = ? AND openid = ?').get(req.params.id, req.openid);
  if (!pet) return res.status(404).json({ error: '宠物不存在' });

  const { name, species, breed, gender, age, weight, photo } = req.body || {};
  db.prepare(
    'UPDATE pets SET name=?, species=?, breed=?, gender=?, age=?, weight=?, photo=? WHERE id=?'
  ).run(
    name ?? pet.name, species ?? pet.species, breed ?? pet.breed,
    gender ?? pet.gender, age ?? pet.age, weight ?? pet.weight, photo ?? pet.photo,
    req.params.id
  );

  res.json(db.prepare('SELECT * FROM pets WHERE id = ?').get(req.params.id));
});

// DELETE /api/pets/:id
router.delete('/:id', (req, res) => {
  const pet = db.prepare('SELECT * FROM pets WHERE id = ? AND openid = ?').get(req.params.id, req.openid);
  if (!pet) return res.status(404).json({ error: '宠物不存在' });
  db.prepare('DELETE FROM pets WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

module.exports = router;
