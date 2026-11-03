# 爱宠分诊 · 宠物问诊小程序（MVP）

宠物主人生病时，通过小程序上传图文，向兽医发起线上问诊，获得初步判断与就医建议。

## 技术栈

| 模块 | 选择 | 说明 |
|------|------|------|
| 前端 | 微信小程序原生 | WXML / WXSS / JS |
| 后端 | Node.js + Express | 本地 REST 接口 |
| 数据库 | SQLite | 用 Node 22 内置 `node:sqlite`，零原生依赖、免编译 |
| 认证 | JWT | `wx.login` 换 openid 后签发 token |
| 咨询 | 图文消息 | 走 REST 接口，暂不接 IM SDK |
| 支付 | 免费/模拟 | MVP 先跑通，后续接微信支付 |

## 前置准备

1. **Node.js 22+**（本机已装 v22.22.3 ✓）
2. **微信开发者工具**
3. **小程序 AppID + AppSecret**：
   - AppID 已有：`wx65b8971743d7df57`
   - AppSecret 在 [微信公众平台](https://mp.weixin.qq.com) → 开发 → 开发管理 → 开发设置 → 开发者密码(AppSecret)

## 怎么跑起来

### 第一步：启动后端

```bash
cd server
npm install
```

先编辑 `server/.env`，把 `APPSECRET` 填上，然后：

```bash
npm start
```

看到 `后端已启动: http://127.0.0.1:3000` 即成功。

### 第二步：启动小程序

1. 微信开发者工具 →「导入项目」→ 选 `D:\爱宠分诊`
2. AppID 填 `wx65b8971743d7df57`
3. 右上角「详情 → 本地设置」勾选「**不校验合法域名**」
4. 点「编译」，首页若显示 `openid: xxx` 说明前后端已连通

### 第三步：真机预览（可选）

真机无法访问 `127.0.0.1`，把 [miniprogram/utils/request.js](miniprogram/utils/request.js) 里的 `BASE_URL` 改成电脑的局域网 IP（如 `http://192.168.1.10:3000`），手机与电脑连同一 Wi-Fi。

## 接口文档

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/health` | 健康检查 |
| POST | `/api/login` | `{code}` → 返回 token |
| GET | `/api/pets` | 我的宠物列表 |
| POST | `/api/pets` | 新增宠物 |
| GET / PUT / DELETE | `/api/pets/:id` | 详情 / 更新 / 删除 |
| GET | `/api/consults` | 我的问诊列表 |
| POST | `/api/consults` | 发起问诊 `{petId, symptom, images}` |
| GET | `/api/consults/doctor` | 医生视角：待接诊 + 已接诊 |
| POST | `/api/consults/:id/accept` | 医生接诊 |
| POST | `/api/consults/:id/close` | 关单 + 评价 `{rating}` |
| GET | `/api/consults/:id/messages` | 问诊消息 |
| POST | `/api/consults/:id/messages` | 发消息 `{type, content}` |

> 除 `/api/login`、`/api/health` 外，其余接口都需请求头 `Authorization: Bearer <token>`。

## 目录结构

```
D:\爱宠分诊
├── project.config.json          # 小程序项目配置
├── miniprogram/                 # 小程序前端
│   ├── app.js / app.json / app.wxss
│   ├── utils/request.js         # 后端请求封装
│   └── pages/                   # 页面
└── server/                      # Node 后端
    ├── index.js                 # Express 入口
    ├── config.js                # 读 .env 配置
    ├── db.js                    # SQLite 建表
    ├── .env                     # AppID / AppSecret / JWT 密钥
    ├── middleware/auth.js       # JWT 鉴权中间件
    └── routes/                  # auth / pets / consults / messages
```

## 数据模型（SQLite 表）

- **users**：id, openid(唯一), nickname, avatar, role(`owner`/`doctor`), doctor_title, doctor_hospital, doctor_intro, created_at
- **pets**：id, openid, name, species, breed, gender, age, weight, photo, created_at
- **consults**：id, openid, pet_id, pet_snapshot(JSON), symptom, images(JSON), status(`pending`/`accepted`/`closed`), doctor_openid, fee, rating, created_at, accepted_at, closed_at
- **messages**：id, consult_id, from_openid, type(`text`/`image`), content, created_at

## MVP 功能清单

- [x] 微信登录（`wx.login` → 后端换 openid → JWT）
- [ ] 宠物档案：新增 / 列表 / 编辑 / 删除（后端接口已就绪，前端页面待写）
- [ ] 发起图文问诊（后端接口已就绪，前端页面待写）
- [ ] 问诊列表 / 医生接诊列表（后端接口已就绪，前端页面待写）
- [ ] 图文对话（后端接口已就绪，前端页面待写）
- [ ] 简单评价

## 合规提醒（务必读）

- 线上问诊不能替代线下诊疗，必须展示免责声明
- 接诊医生需持有执业兽医资格证
- 上架「宠物医疗」类目需企业主体 + 《动物诊疗许可证》等资质
