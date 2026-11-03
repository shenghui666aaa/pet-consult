const express = require('express');
const path = require('path');
const config = require('./config');
const auth = require('./middleware/auth');

const app = express();
app.use(express.json());

// 简单请求日志
app.use((req, res, next) => {
  console.log(`${new Date().toLocaleTimeString()}  ${req.method}  ${req.url}`);
  next();
});

app.get('/api/health', (req, res) => res.json({ ok: true }));

// 路由
app.use('/api', require('./routes/auth'));
app.use('/api/pets', auth, require('./routes/pets'));
app.use('/api/consults', auth, require('./routes/consults'));
app.use('/api/consults', auth, require('./routes/messages'));

// 图片上传 + 静态托管上传的文件
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/upload', auth, require('./routes/upload'));

app.listen(config.port, () => {
  console.log(`后端已启动: http://127.0.0.1:${config.port}`);
  console.log(`健康检查: http://127.0.0.1:${config.port}/api/health`);
});
