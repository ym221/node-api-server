# API 测试服务器

> 现代化、AI 友好、完全解耦的 Node.js API 测试服务器

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-4.x-lightgrey)](https://expressjs.com/)
[![MySQL](https://img.shields.io/badge/MySQL-8.x-orange)](https://www.mysql.com/)

## ✨ 特性

- 🤖 **AI 优先设计** - 模块化模板，AI 可快速生成真实可用的测试接口
- 🎯 **完全解耦** - 每个模块自包含，删除目录即清理所有相关内容
- 🎨 **现代化 UI** - 原生 JS + Tailwind CSS，无构建依赖
- 📦 **模块化架构** - 接口模块动态加载，互不影响
- 🔧 **强大工具** - 智能数据生成、接口控制、场景管理、日志分析
- 📝 **提示词管理** - 模块级提示词，记录业务逻辑和接口说明

## 🚀 快速开始

### 环境要求

- Node.js >= 18
- MySQL >= 8.0
- npm 或 yarn

### 安装步骤

1. **克隆项目**
```bash
git clone <repository-url>
cd node-api-server
```

2. **安装依赖**
```bash
npm install
```

3. **配置环境变量**
```bash
cp .env.example .env
```

编辑 `.env` 文件，配置数据库连接信息：
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=api_test_server
```

4. **初始化数据库**
```bash
# 方式1: 使用脚本（推荐）
npm run db:init

# 方式2: 手动执行
mysql -u root -p < scripts/db-init.sql
```

5. **编译 TypeScript**
```bash
npm run build
```

6. **启动服务器**
```bash
# 开发模式（热重载）
npm run dev

# 生产模式
npm start
```

7. **访问管理控制台**

打开浏览器访问：http://localhost:8088/admin

## 📁 项目结构

```
node-api-server/
├── src/
│   ├── core/                      # 核心层
│   │   ├── BaseModel.ts           # 数据模型基类
│   │   ├── Response.ts            # 响应封装
│   │   └── ErrorHandler.ts        # 错误处理
│   ├── config/                    # 配置层
│   │   ├── database.ts            # 数据库配置
│   │   ├── cors.ts                # CORS 配置
│   │   └── upload.ts              # 文件上传配置
│   ├── middlewares/               # 中间件
│   │   ├── requestLogger.ts       # 请求日志
│   │   ├── delay.ts               # 延迟模拟
│   │   ├── mockError.ts           # 错误模拟
│   │   └── interfaceControl.ts    # 接口控制
│   ├── utils/                     # 工具函数
│   │   ├── logger.ts              # 日志工具
│   │   ├── faker.ts               # 数据生成器
│   │   └── helpers.ts             # 辅助函数
│   ├── system/                    # 系统模块
│   │   ├── health.ts              # 健康检查
│   │   └── admin/                 # 管理 API
│   ├── template/                  # 接口模板（AI 参考）
│   │   ├── .prompt.md             # 模块提示词模板
│   │   ├── module.config.ts       # 模块配置
│   │   ├── schema.sql             # 数据库架构
│   │   ├── types.ts               # 类型定义
│   │   ├── model.ts               # 数据模型
│   │   ├── controller.ts          # 控制器
│   │   └── routes.ts              # 路由
│   ├── generated/                 # AI 生成的接口（.gitignore）
│   │   └── [模块名]/              # 每个模块都是自包含的
│   ├── routes/
│   │   └── index.ts               # 动态路由加载器
│   ├── app.ts                     # Express 应用
│   └── server.ts                  # 服务器入口
├── public/admin/                  # 前端管理控制台
│   ├── index.html                 # 主页面
│   ├── style.css                  # 样式
│   ├── app.js                     # 应用逻辑
│   ├── components/                # 组件库
│   └── pages/                     # 页面组件
├── scripts/
│   └── db-init.ts                 # 数据库初始化脚本
├── .cursor/rules/
│   └── ai-rules.md                # 全局 AI 提示词
├── .env                           # 环境变量
├── package.json
├── tsconfig.json
└── README.md
```

## 🤖 使用 AI 生成接口模块

### 方式 1：告诉 AI

```
根据以下接口文档生成模块到 src/generated/user/

【粘贴您的接口文档】
```

AI 会自动：
1. 复制模板到指定目录
2. 根据接口文档修改所有文件
3. 创建 `.prompt.md` 记录业务逻辑
4. 生成数据表 SQL

### 方式 2：手动创建

1. 复制模板：
```bash
cp -r src/template src/generated/your-module
```

2. 修改文件以实现您的业务逻辑

3. 创建 `.prompt.md` 记录模块信息

4. 编译并重启：
```bash
npm run build
npm run dev
```

## 📊 管理控制台功能

访问 http://localhost:8088/admin 使用以下功能：

### 概览仪表盘
- 系统统计（模块数、表数量、请求数、平均响应时间）
- 快速操作入口
- 模块列表预览

### 模块管理
- 查看所有已安装模块
- 查看模块详情（文件、提示词、SQL）
- 删除模块（一键清理）
- 清空模块数据

### 数据管理
- 浏览所有数据表
- 表数据 CRUD 操作
- **智能数据生成**：根据字段名和类型自动推断并生成测试数据
- 清空表数据

### 接口管理
- 查看所有接口配置
- 接口行为控制：
  - 启用/禁用接口
  - 设置延迟（固定或随机）
  - 模拟错误（固定或随机失败）
- 接口收藏

### 日志管理
- 实时查看请求日志
- 按级别、方法、状态码筛选
- 日志统计分析
- 清空日志

### 场景管理
- 预设场景：
  - 理想环境（无延迟无错误）
  - 网络慢（2-5秒延迟）
  - 网络快（0-100ms延迟）
  - 服务不稳定（30%错误率）
- 创建自定义场景
- 一键应用场景到所有接口

### 接口测试
- 内置 HTTP 客户端
- 支持 GET/POST/PUT/DELETE/PATCH
- 自定义请求头和请求体
- 查看响应结果和耗时
- 请求历史记录

## 🛠 API 文档

### 系统 API

所有管理 API 都在 `/api/_admin` 路径下：

#### 健康检查
- `GET /api/_admin/health` - 服务健康检查

#### 模块管理
- `GET /api/_admin/modules` - 获取模块列表
- `GET /api/_admin/modules/:moduleName` - 获取模块详情
- `DELETE /api/_admin/modules/:moduleName` - 删除模块
- `POST /api/_admin/modules/:moduleName/clear` - 清空模块数据

#### 数据表管理
- `GET /api/_admin/tables` - 获取数据表列表
- `GET /api/_admin/tables/:tableName/structure` - 获取表结构
- `GET /api/_admin/tables/:tableName/data` - 获取表数据（分页）
- `POST /api/_admin/tables/:tableName/data` - 创建记录
- `PUT /api/_admin/tables/:tableName/data/:id` - 更新记录
- `DELETE /api/_admin/tables/:tableName/data/:id` - 删除记录
- `POST /api/_admin/tables/:tableName/generate` - 智能生成测试数据
- `POST /api/_admin/tables/:tableName/truncate` - 清空表

#### 接口管理
- `GET /api/_admin/interfaces` - 获取接口配置列表
- `POST /api/_admin/interfaces` - 设置接口配置
- `POST /api/_admin/interfaces/reset` - 重置所有配置

#### 日志管理
- `GET /api/_admin/logs` - 获取日志列表
- `GET /api/_admin/logs/stats` - 获取日志统计
- `POST /api/_admin/logs/clear` - 清空日志

#### 场景管理
- `GET /api/_admin/scenarios` - 获取场景列表
- `POST /api/_admin/scenarios` - 创建自定义场景
- `POST /api/_admin/scenarios/apply` - 应用场景
- `DELETE /api/_admin/scenarios/:scenarioId` - 删除场景

## 💡 核心概念

### 完全解耦原则

每个接口模块都是完全自包含的：
- 包含自己的数据模型、控制器、路由
- 包含自己的提示词文件 (`.prompt.md`)
- 包含自己的数据库架构 (`schema.sql`)
- 删除模块目录即清除所有相关内容
- 模块之间互不影响

### AI 优先设计

- **模块化模板**：`src/template/` 提供标准化模板
- **自动发现机制**：新模块编译后自动注册
- **提示词驱动**：每个模块包含业务逻辑说明
- **快速生成**：AI 可在几秒内生成完整的可用接口

### 响应格式

支持三种响应格式，适配不同业务系统：

**ERP 格式**（大写字段）：
```json
{
  "Success": true,
  "Data": {...},
  "Message": "操作成功",
  "Code": 200
}
```

**B2B / Ebooking 格式**（小写字段）：
```json
{
  "success": true,
  "data": {...},
  "message": "操作成功",
  "code": 200
}
```

## 🧪 开发指南

### 创建新模块

参考 `src/template/` 目录中的示例代码。

### 使用 BaseModel

```typescript
import { BaseModel } from '../core/BaseModel';

export class UserModel extends BaseModel<User> {
  constructor() {
    super('users');
  }

  // 自定义查询
  async findByEmail(email: string) {
    return await this.findOne({ email });
  }
}
```

### 使用响应封装

```typescript
import { Res } from '../core/Response';

// 成功响应
return Res.success(res, data, 'B2B', '操作成功');

// 分页响应
return Res.paginated(res, list, total, page, pageSize, 'B2B');

// 错误响应
return Res.error(res, '操作失败', 'B2B', 400);
```

### 智能数据生成

```typescript
import { SmartFieldGenerator } from '../utils/faker';

const data = SmartFieldGenerator.generateBatch(
  [
    { name: 'username', type: 'varchar' },
    { name: 'email', type: 'varchar' },
  ],
  100
);
```

## 📝 配置说明

### 环境变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `PORT` | 服务器端口 | `8088` |
| `NODE_ENV` | 运行环境 | `development` |
| `DB_HOST` | 数据库主机 | `localhost` |
| `DB_PORT` | 数据库端口 | `3306` |
| `DB_USER` | 数据库用户名 | `root` |
| `DB_PASSWORD` | 数据库密码 | - |
| `DB_NAME` | 数据库名称 | `api_test_server` |
| `CORS_ORIGIN` | CORS 来源 | `*` |
| `LOG_LEVEL` | 日志级别 | `debug` |

## 🤝 贡献指南

欢迎贡献！请遵循以下原则：

1. 保持代码简洁和可读
2. 遵循 TypeScript 最佳实践
3. 添加必要的注释
4. 测试您的更改

## 📄 许可证

MIT License

## 🙋 常见问题

### 如何添加新接口？

使用 AI 生成或手动复制 `src/template/` 目录。

### 模块之间如何通信？

模块设计为完全解耦，如需通信，可以通过共享的数据表或 API 调用。

### 如何备份数据？

使用 MySQL 的 `mysqldump` 工具：
```bash
mysqldump -u root -p api_test_server > backup.sql
```

### 数据生成器支持哪些字段？

智能识别：name、email、phone、address、city、price、status、date 等常见字段。

## 📞 联系方式

如有问题或建议，欢迎提交 Issue。

---

**享受构建 API 测试服务器的乐趣！** 🎉

