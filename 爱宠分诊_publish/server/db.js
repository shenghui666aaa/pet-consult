// 使用 Node 22 内置的 SQLite（node:sqlite），零原生依赖
const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const db = new DatabaseSync(path.join(__dirname, 'data.db'));
db.exec('PRAGMA journal_mode = WAL;');

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  openid TEXT UNIQUE NOT NULL,
  nickname TEXT DEFAULT '',
  avatar TEXT DEFAULT '',
  role TEXT DEFAULT 'owner',
  doctor_title TEXT DEFAULT '',
  doctor_hospital TEXT DEFAULT '',
  doctor_intro TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now', 'localtime'))
);

CREATE TABLE IF NOT EXISTS pets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  openid TEXT NOT NULL,
  name TEXT NOT NULL,
  species TEXT DEFAULT '',
  breed TEXT DEFAULT '',
  gender TEXT DEFAULT '',
  age INTEGER DEFAULT 0,
  weight TEXT DEFAULT '',
  photo TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now', 'localtime'))
);

CREATE TABLE IF NOT EXISTS consults (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  openid TEXT NOT NULL,
  pet_id INTEGER,
  pet_snapshot TEXT DEFAULT '{}',
  symptom TEXT DEFAULT '',
  images TEXT DEFAULT '[]',
  status TEXT DEFAULT 'pending',
  doctor_openid TEXT DEFAULT '',
  fee REAL DEFAULT 0,
  rating INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now', 'localtime')),
  accepted_at TEXT DEFAULT '',
  closed_at TEXT DEFAULT '',
  ai_result TEXT DEFAULT ''
);

CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  consult_id INTEGER NOT NULL,
  from_openid TEXT NOT NULL,
  type TEXT DEFAULT 'text',
  content TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now', 'localtime'))
);
`);

// 迁移：给旧库的 consults 表补 ai_result 字段
const consultsCols = db.prepare('PRAGMA table_info(consults)').all();
if (!consultsCols.some(c => c.name === 'ai_result')) {
  db.exec("ALTER TABLE consults ADD COLUMN ai_result TEXT DEFAULT ''");
}

module.exports = db;
