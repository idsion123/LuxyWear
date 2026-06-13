# LUXE — 轻奢女装电商网站

优雅、精致的轻奢女装 B2C 电商平台。消费者可浏览商品、管理购物车、下单购买；管理员可通过后台管理商品、订单和用户。

## 技术栈

| 项目 | 选型 |
|---|---|
| 框架 | Next.js 16.2 (App Router) |
| 语言 | TypeScript (Strict) |
| 样式 | Tailwind CSS v4 |
| 数据库 | MySQL 8.0 |
| ORM | Drizzle ORM |
| 认证 | JWT (jose) + bcryptjs |
| 状态管理 | React Context |
| 包管理 | pnpm 10.x |

## 快速开始

### 环境要求

- Node.js v24+
- MySQL 8.0+
- pnpm 10.x

### 安装

```bash
# 1. 克隆仓库
git clone <repo-url>
cd LuxyWear

# 2. 安装依赖（Windows 需 --ignore-scripts 绕过 pnpm EFTYPE bug）
pnpm install --ignore-scripts

# 3. 配置环境变量
cp .env.example .env
# 编辑 .env，填入数据库连接信息和 JWT 密钥
```

### 数据库

```bash
# 生成并运行迁移
pnpm db:generate
pnpm db:migrate

# 填充种子数据（6 个分类 + 175 个商品 + 测试用户）
pnpm db:seed
```

### 启动开发服务器

```bash
pnpm dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看。

### 测试账号

| 角色 | 邮箱 | 密码 |
|---|---|---|
| 管理员 | admin@fashion.com | admin123456 |
| 客户 | customer@test.com | customer123 |

## 项目结构

```
my-app/
├── app/
│   ├── (shop)/          # 消费者前台
│   ├── admin/           # 管理后台
│   ├── auth/            # 登录/注册
│   └── api/             # REST API
├── components/          # 共享组件
├── db/
│   ├── schema.ts        # 数据库定义（9 张表）
│   └── seed.ts          # 种子数据
├── lib/
│   ├── db.ts            # Drizzle 连接
│   └── auth.ts          # JWT 认证
├── store/               # React Context
└── public/images/       # 静态图片
```

## 功能特性

- **消费者前台**：首页展示、商品列表（搜索/筛选/排序）、商品详情、购物车、下单、订单历史
- **管理后台**：仪表盘、商品管理、分类管理、订单处理、用户管理
- **用户认证**：注册/登录、JWT Cookie 会话

## 配色

- 香槟金 `#c9a96e` — 主色
- 暖白 `#faf8f5` — 页面背景
- 奶油 `#f5f0eb` — 卡片背景
- 暖黑 `#2d2a24` — 正文
- 暖灰 `#7a746e` — 辅助文字

## Windows 注意事项

pnpm 10.x 在 Windows 上存在 `EFTYPE` 子进程 spawn 问题，请使用 `pnpm install --ignore-scripts` 安装依赖。`package.json` 中的脚本已内置绕开方案，日常 `pnpm dev` 可正常工作。
