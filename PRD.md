# LUXE 轻奢女装电商网站 - 产品需求文档

## 1. 项目概述

### 1.1 项目背景
构建一个面向消费者的女装轻奢风格 B2C 电商网站，包含消费者前台和管理后台。

### 1.2 目标用户
- **消费者**: 追求品质与审美的女性用户，关注轻奢风格女装
- **管理员**: 店铺运营人员，需要管理商品、订单和用户

### 1.3 核心目标
- 提供优雅的线上购物体验
- 实现完整的商品浏览、购买流程
- 提供便捷的后台管理功能

## 2. 技术架构

### 2.1 技术选型

| 项目 | 选型 | 说明 |
|---|---|---|
| 框架 | Next.js 16.2.6 App Router | 全栈 React 框架 |
| 语言 | TypeScript strict mode | 类型安全 |
| 样式 | Tailwind CSS v4 | CSS-first 配置 |
| 数据库 | MySQL 8.0 | 关系型数据库 |
| ORM | Drizzle ORM | 轻量级、类型安全 |
| 认证 | JWT (jose 库) | HTTP-only Cookie 存储 |
| 密码 | bcryptjs | 加盐哈希 |
| 图片 | 本地 `/public/images/products/` | 开发阶段 |
| 状态管理 | React Context | 购物车 + 认证 |
| 表单验证 | zod | Schema 验证 |
| 包管理 | pnpm | 高性能包管理 |

### 2.2 Next.js 16 注意事项
- `proxy.ts` 替代 `middleware.ts`（Breaking Change）
- `params`/`searchParams` 全异步，必须 `await`
- `cookies()`/`headers()` 全异步
- Turbopack 为默认构建工具

## 3. 功能需求

### 3.1 消费者前台 (B2C)

| 功能 | 描述 | 优先级 |
|---|---|---|
| 首页 | 品牌展示、精选商品、分类浏览、品牌故事 | P0 |
| 商品列表 | 网格展示、分类筛选、搜索、排序 | P0 |
| 商品详情 | 图片画廊、尺码/颜色选择、加入购物车 | P0 |
| 用户注册/登录 | 邮箱+密码注册登录 | P0 |
| 购物车 | 添加/删除/修改数量、价格汇总 | P0 |
| 结算下单 | 收货地址填写、订单提交、模拟支付 | P0 |
| 订单历史 | 查看订单列表和详情 | P1 |
| 账户管理 | 查看个人信息 | P1 |

### 3.2 管理后台 (Admin)

| 功能 | 描述 | 优先级 |
|---|---|---|
| 管理登录 | 独立管理员登录入口 | P0 |
| 数据看板 | 总订单数、总收入、商品数、用户数统计 | P0 |
| 商品管理 | 新增/编辑/删除商品、图片上传 | P0 |
| 分类管理 | 新增/删除分类、层级结构 | P0 |
| 订单管理 | 查看订单、更新订单状态 | P0 |
| 用户管理 | 查看用户列表 | P1 |

## 4. 路由设计

### 4.1 前台路由

| 路径 | 说明 | 权限 | 类型 |
|---|---|---|---|
| `/` | 首页 | 公开 | 静态 |
| `/products` | 商品列表 | 公开 | 动态 |
| `/products/[slug]` | 商品详情 | 公开 | 动态 |
| `/cart` | 购物车 | 公开 | 静态 |
| `/checkout` | 结算 | 需登录 | 静态 |
| `/checkout/result` | 下单成功 | 需登录 | 动态 |
| `/orders` | 订单列表 | 需登录 | 静态 |
| `/account` | 账户信息 | 需登录 | 静态 |
| `/account/orders/[id]` | 订单详情 | 需登录 | 动态 |
| `/auth/login` | 登录 | 公开 | 静态 |
| `/auth/register` | 注册 | 公开 | 静态 |

### 4.2 后台路由

| 路径 | 说明 | 权限 |
|---|---|---|
| `/admin/login` | 管理员登录 | 公开 |
| `/admin` | 数据看板 | 管理员 |
| `/admin/products` | 商品管理 | 管理员 |
| `/admin/products/new` | 新增商品 | 管理员 |
| `/admin/products/[id]/edit` | 编辑商品 | 管理员 |
| `/admin/categories` | 分类管理 | 管理员 |
| `/admin/categories/new` | 新增分类 | 管理员 |
| `/admin/orders` | 订单管理 | 管理员 |
| `/admin/orders/[id]` | 订单详情 | 管理员 |
| `/admin/users` | 用户管理 | 管理员 |

### 4.3 API 路由

| 路径 | 方法 | 说明 | 权限 |
|---|---|---|---|
| `/api/auth/register` | POST | 用户注册 | 公开 |
| `/api/auth/login` | POST | 用户登录 | 公开 |
| `/api/auth/me` | GET | 获取当前用户 | 需登录 |
| `/api/admin/login` | POST | 管理员登录 | 公开 |
| `/api/admin/stats` | GET | 数据统计 | 管理员 |
| `/api/admin/orders` | GET | 所有订单 | 管理员 |
| `/api/admin/users` | GET | 用户列表 | 管理员 |
| `/api/products` | GET/POST | 商品列表/创建 | 公开/管理员 |
| `/api/products/[id]` | GET/PUT/DELETE | 商品详情/更新/删除 | 公开/管理员 |
| `/api/categories` | GET/POST | 分类列表/创建 | 公开/管理员 |
| `/api/categories/[id]` | PUT/DELETE | 更新/删除分类 | 管理员 |
| `/api/cart` | GET/POST/PUT/DELETE | 购物车 CRUD | 需登录 |
| `/api/orders` | GET/POST | 用户订单/下单 | 需登录 |
| `/api/orders/[id]` | GET | 订单详情 | 需登录 |
| `/api/orders/[id]/status` | PATCH | 更新订单状态 | 管理员 |
| `/api/addresses` | POST | 保存地址 | 需登录 |
| `/api/upload` | POST | 上传图片 | 管理员 |

## 5. 数据库设计

### 5.1 表结构

#### users (用户)
| 字段 | 类型 | 说明 |
|---|---|---|
| id | varchar(128) PK | CUID |
| email | varchar(255) UNIQUE | 登录邮箱 |
| name | varchar(255) | 用户名 |
| password | varchar(255) | bcrypt 哈希 |
| role | varchar(20) | CUSTOMER / ADMIN |
| phone | varchar(20) | 手机号 |
| created_at | datetime | 创建时间 |
| updated_at | datetime | 更新时间 |

#### addresses (地址)
| 字段 | 类型 | 说明 |
|---|---|---|
| id | varchar(128) PK | CUID |
| user_id | varchar(128) FK | 用户 ID |
| full_name | varchar(255) | 收件人 |
| phone | varchar(20) | 手机号 |
| street | varchar(500) | 街道地址 |
| city | varchar(100) | 城市 |
| state | varchar(100) | 省份 |
| zip_code | varchar(20) | 邮编 |
| country | varchar(100) | 国家 |
| is_default | boolean | 是否默认 |

#### categories (分类)
| 字段 | 类型 | 说明 |
|---|---|---|
| id | varchar(128) PK | CUID |
| name | varchar(255) UNIQUE | 分类名称 |
| slug | varchar(255) UNIQUE | URL 友好标识 |
| description | text | 描述 |
| parent_id | varchar(128) | 父分类 ID (自引用) |
| created_at | datetime | 创建时间 |
| updated_at | datetime | 更新时间 |

#### products (商品)
| 字段 | 类型 | 说明 |
|---|---|---|
| id | varchar(128) PK | CUID |
| name | varchar(255) | 商品名称 |
| slug | varchar(255) UNIQUE | URL 友好标识 |
| description | text | 商品描述 |
| price | decimal(10,2) | 价格 |
| compare_at_price | decimal(10,2) | 原价 (划线价) |
| stock | int | 库存数量 |
| images | JSON | 图片路径数组 |
| sizes | JSON | 尺码数组 |
| colors | JSON | 颜色数组 [{name, hex}] |
| is_featured | boolean | 是否精选 |
| is_published | boolean | 是否上架 |
| created_at | datetime | 创建时间 |
| updated_at | datetime | 更新时间 |

#### product_categories (商品-分类关联)
| 字段 | 类型 | 说明 |
|---|---|---|
| product_id | varchar(128) FK | 商品 ID |
| category_id | varchar(128) FK | 分类 ID |
| PK | (product_id, category_id) | 联合主键 |

#### cart_items (购物车)
| 字段 | 类型 | 说明 |
|---|---|---|
| id | varchar(128) PK | CUID |
| user_id | varchar(128) FK | 用户 ID |
| product_id | varchar(128) FK | 商品 ID |
| quantity | int | 数量 |
| size | varchar(50) | 所选尺码 |
| color | varchar(50) | 所选颜色 |
| UNIQUE | (user_id, product_id, size, color) | 防止重复 |

#### orders (订单)
| 字段 | 类型 | 说明 |
|---|---|---|
| id | varchar(128) PK | CUID |
| order_number | varchar(50) UNIQUE | 可读订单号 |
| user_id | varchar(128) FK | 用户 ID |
| status | varchar(20) | PENDING/PAID/SHIPPED/DELIVERED/CANCELLED |
| total_amount | decimal(10,2) | 订单总额 |
| shipping_fee | decimal(10,2) | 运费 |
| address_id | varchar(128) FK | 收货地址 |
| note | text | 备注 |
| paid_at / shipped_at / delivered_at / cancelled_at | datetime | 状态时间戳 |

#### order_items (订单商品快照)
| 字段 | 类型 | 说明 |
|---|---|---|
| id | varchar(128) PK | CUID |
| order_id | varchar(128) FK | 订单 ID |
| product_id | varchar(128) | 商品 ID |
| product_name | varchar(255) | 下单时商品名 (快照) |
| price | decimal(10,2) | 下单时价格 (快照) |
| quantity | int | 数量 |
| size / color / image | - | 属性快照 |

### 5.2 订单状态流转
```
PENDING → PAID → SHIPPED → DELIVERED
    ↓        ↓        ↓
CANCELLED (可在任一环节取消)
```

## 6. 认证方案

### 6.1 双域名认证系统
- **消费者认证**: JWT 存储在 `session` cookie，有效期 7 天
- **管理员认证**: JWT 存储在 `admin_session` cookie，有效期 2 小时
- 不同 `JWT_SECRET` 和 `ADMIN_JWT_SECRET` 环境变量

### 6.2 Auth Proxy (proxy.ts)
- Next.js 16 使用 `proxy.ts` 替代 `middleware.ts`
- 自动保护 `/admin/*`、`/api/admin/*`、`/api/auth/me`、`/api/cart`、`/api/orders` 路由
- 通过 URL 路径匹配进行路由级授权

## 7. UI/UX 设计

### 7.1 设计语言: 轻奢风

| 用途 | 色值 | 说明 |
|---|---|---|
| 主色 | `#c9a96e` | 香槟金，用于按钮、链接、价格 |
| 辅色 | `#b76e79` | 玫瑰金，用于辅助点缀 |
| 背景-暖白 | `#faf8f5` | 主背景色 |
| 背景-奶油 | `#f5f0eb` | 卡片、区块背景 |
| 文字-暖黑 | `#2d2a24` | 主文字色 |
| 文字-暖灰 | `#7a746e` | 辅助文字色 |
| 边框 | `#e8e3de` | 分割线、边框 |
| 成功 | `#7a9a6d` | 绿色 |
| 错误 | `#c46565` | 红色 |

### 7.2 字体
- **标题**: Playfair Display (Serif) — 优雅感
- **正文**: Inter (Sans-serif) — 清晰可读

### 7.3 设计原则
- 大量留白，突出商品图片
- 暖色调营造高级感
- 简洁的交互反馈 (hover 过渡、轻提示)
- 全宽图片展示，卡片式布局

## 8. 实施计划

### Phase 0: 基础设施
- 安装依赖、Drizzle ORM 配置、MySQL 数据库迁移
- 种子数据：管理员账号、测试用户、商品分类

### Phase 1: 认证系统
- proxy.ts、JWT 工具函数、登录/注册 API
- 登录/注册页面 (前台 + 后台)
- AuthProvider 客户端状态管理

### Phase 2: 后台商品管理
- 分类 CRUD API + 页面
- 商品 CRUD API + 页面 (含图片上传)
- 管理后台布局 (侧边栏导航)

### Phase 3: 前台商品展示
- 首页 (Hero Banner + 精选商品 + 分类展示 + 品牌故事)
- 商品列表 (分类筛选 + 搜索 + 排序)
- 商品详情 (图片画廊 + 尺码/颜色选择)

### Phase 4: 购物车 + 结算
- 购物车 CRUD (API + 页面)
- 结算流程 (地址表单 + 订单提交)
- 订单历史查看

### Phase 5: 后台订单 + 用户管理
- 订单列表/详情/状态更新
- 用户列表管理
- 数据看板统计

### Phase 6: 打磨
- 加载态、空状态、错误边界、404 页面
- SEO 元数据

## 9. 验证方式

1. `pnpm dev` 启动开发服务器
2. 注册消费者账号 → 浏览商品 → 加入购物车 → 结算下单 → 查看订单
3. 管理员登录 → 创建分类/商品 → 查看订单 → 更新订单状态 → 查看看板
4. `pnpm build` 确认生产构建成功

## 10. 安全注意事项

- 密码使用 bcryptjs 加盐哈希 (cost 10)
- JWT Secret 使用 32+ 位随机字符，存储于 `.env`
- HTTP-only Cookie 防止 XSS 窃取
- 同源策略 + SameSite Cookie 防止 CSRF
- 图片上传限制类型 (jpg/png/webp) 和大小 (5MB)
- Drizzle ORM 参数化查询防止 SQL 注入
