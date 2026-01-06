全新 API 测试服务器项目计划
项目概述
从零构建一个现代化、AI友好、解耦的 Node.js API 测试服务器，专注于让 AI 快速生成真实可用的测试接口，并提供强大的可视化管理功能。

---

核心设计原则
1. 完全解耦原则
✅ 接口模块自包含：每个生成的接口模块包含自己的提示词（.prompt.md）
✅ 删除即清理：删除模块目录自动清除所有相关内容
✅ 全局提示词极简：只说明规则和读取方式，不记录具体接口
2. AI 优先设计
模块化模板，AI 复制即用
提示词文件标准化
自动发现和注册机制
3. 现代化 UI
原生 JS + Tailwind CSS（无构建依赖）
左侧导航 + 右侧面板布局（VS Code 风格）
组件化 HTML 模板
---

技术栈
后端
核心：Node.js 18+ + Express 4.x + TypeScript 5.x
数据库：MySQL 8.x
工具库：Faker.js（数据生成）、Winston（日志）、Multer（文件上传）
前端（管理控制台）
框架：原生 JavaScript（无构建步骤）
样式：Tailwind CSS 3.x（通过 CDN）
组件：自定义轻量组件（Modal、Table、Form）
布局：左侧导航 + 右侧面板
---

项目结构
node-api-server/
├── src/
│   ├── core/                      # 核心层
│   │   ├── BaseModel.ts           # 数据模型基类
│   │   ├── Response.ts            # 响应封装（ERP/B2B/Ebooking）
│   │   └── ErrorHandler.ts        # 错误处理
│   │
│   ├── config/                    # 配置层
│   │   ├── database.ts
│   │   ├── cors.ts
│   │   └── upload.ts
│   │
│   ├── middlewares/               # 中间件
│   │   ├── requestLogger.ts       # 请求日志
│   │   ├── delay.ts               # 延迟模拟
│   │   ├── mockError.ts           # 错误模拟
│   │   └── interfaceControl.ts    # 接口控制
│   │
│   ├── utils/                     # 工具函数
│   │   ├── logger.ts              # Winston 日志
│   │   ├── faker.ts               # 数据生成器
│   │   └── helpers.ts             # 通用辅助函数
│   │
│   ├── system/                    # 系统模块（固定）
│   │   ├── health.ts              # 健康检查
│   │   └── admin/                 # 管理 API
│   │       ├── modules.ts         # 模块管理
│   │       ├── tables.ts          # 数据表管理
│   │       ├── interfaces.ts      # 接口管理
│   │       ├── logs.ts            # 日志管理
│   │       └── scenarios.ts       # 场景管理
│   │
│   ├── template/                  # 接口模板（AI 参考）
│   │   ├── .prompt.md             # 模块级提示词模板
│   │   ├── module.config.ts
│   │   ├── schema.sql
│   │   ├── types.ts
│   │   ├── model.ts
│   │   ├── controller.ts
│   │   └── routes.ts
│   │
│   ├── generated/                 # AI 生成的接口（.gitignore）
│   │   └── [模块名]/
│   │       ├── .prompt.md         # ⭐ 模块专属提示词
│   │       ├── module.config.ts   # 配置（接口列表、表名）
│   │       ├── schema.sql
│   │       ├── types.ts
│   │       ├── model.ts
│   │       ├── controller.ts
│   │       └── routes.ts
│   │
│   ├── routes/
│   │   └── index.ts               # 动态路由加载器
│   │
│   ├── app.ts
│   └── server.ts
│
├── public/                        # 前端资源
│   └── admin/
│       ├── index.html             # 主页面（单页应用）
│       ├── style.css              # 自定义样式
│       ├── app.js                 # 应用逻辑
│       └── components/            # 组件库
│           ├── sidebar.js
│           ├── table.js
│           ├── modal.js
│           └── form.js
│
├── scripts/
│   └── db-init.ts                 # 数据库初始化脚本
│
├── .cursor/
│   └── rules/
│       └── ai-rules.mdc           # ⭐ 全局 AI 提示词（极简版）
│
├── .env.example
├── .gitignore                     # 忽略 src/generated/
├── package.json
├── tsconfig.json
└── README.md
---

核心功能模块
1. 管理控制台（单页应用）
布局设计
┌─────────────────────────────────────────┐
│  Header: API 测试服务器                    │
├──────────┬──────────────────────────────┤
│          │                              │
│ Sidebar  │  Main Panel                  │
│          │                              │
│ • 概览   │  [动态内容区域]                │
│ • 模块   │                              │
│ • 数据   │                              │
│ • 接口   │                              │
│ • 日志   │                              │
│ • 场景   │                              │
│ • 测试   │                              │
│          │                              │
└──────────┴──────────────────────────────┘
功能页面
📊 概览仪表盘
系统统计（接口数、模块数、表数量、请求数）
最近操作历史
📦 模块管理
模块列表（卡片视图）
查看模块详情（接口列表、数据表）
删除模块（一键清理）
清空模块数据
💾 数据管理
数据表列表
表数据 CRUD（可视化表单编辑器）
批量智能生成：根据表结构自动推断字段类型
数据模板：预设业务场景（用户、订单、商品等）
CSV/JSON 导出
🔌 接口管理
接口列表（分组显示）
接口行为控制（成功/失败/延迟/禁用）
接口收藏
📝 日志管理
实时请求日志
筛选（方法、状态码、URL）
性能分析
🎬 场景管理
预设场景（网络慢、服务不稳定、理想环境）
一键应用
🧪 接口测试
内置 HTTP 客户端
选择接口 → 填写参数 → 发送请求 → 查看响应
---

2. AI 提示词管理（完全解耦）
全局提示词（.cursor/rules/ai-rules.mdc）
内容精简到极致：

# Node API 测试服务器 - AI 规则

## 基本规则
- 使用中文
- 接口生成到 `src/generated/[模块名]/`
- 每个模块**必须包含** `.prompt.md` 文件

## 接口生成流程

1. 用户提供接口文档
2. 复制 `src/template/` 到 `src/generated/[模块名]/`
3. 修改所有文件
4. **创建 `.prompt.md`**：记录该模块的业务逻辑、接口说明、注意事项

## 提示词规则

### 模块级提示词（`src/generated/[模块名]/.prompt.md`）
记录内容：
- 业务背景
- 接口列表及说明
- 数据表说明
- 特殊逻辑
- 已知问题

### 全局提示词（本文件）
- ❌ 不记录具体接口
- ❌ 不记录业务逻辑
- ✅ 只记录通用规则

## 核心工具
- `BaseModel`：数据模型基类（见 `src/core/BaseModel.ts`）
- `Res`：响应封装（见 `src/core/Response.ts`）
- `Faker`：数据生成（见 `src/utils/faker.ts`）

## 响应格式
- ERP：`Res.success(res, data, 'ERP')`
- B2B：`Res.success(res, data, 'B2B')`
- Ebooking：`Res.success(res, data, 'Ebooking')`

## 文件生成规则
- ❌ 不生成无意义文档（如 FIX_REPORT.md）
- ✅ 只维护 `.prompt.md`（模块级）
模块级提示词（`src/generated/[模块名]/.prompt.md`）
示例：

# 发票管理模块

## 业务背景
B2B 网站用户可以对已支付订单申请开发票，支持单笔/批量/合并开票。
ERP 管理员可以审核用户的冲红申请。

## 接口列表

### B2B 端
- GET /api/invoice/title/list - 发票抬头列表
- POST /api/invoice/apply - 申请开票

### ERP 端
- GET /api/invoice/api/audit/list - 审核列表
- POST /api/invoice/api/audit/approve - 审核操作

## 数据表
- invoice：发票主表
- invoice_title：发票抬头
- invoice_order：发票订单关联

## 特殊逻辑
- 审核列表的 `orderNum` 筛选使用 EXISTS 子查询
- 冲红申请需要上传原发票 PDF

## 注意事项
- 状态码：0-未开票, 1-开具中, 2-成功, 3-失败, 4-已冲红
---

3. 数据管理增强工具
批量智能生成器
功能：

读取表结构（字段名、类型、注释）
自动推断字段含义：
name, title → 中文姓名/标题
email → 邮箱格式
phone, mobile → 手机号
price, amount → 金额（小数）
status → 从枚举值随机选择
created_at → 日期时间
生成指定数量的测试数据
API：

POST /api/_admin/tables/:tableName/generate
Body: { count: 100, strategy: 'smart' }
数据模板库
预设模板：

用户模板：姓名、邮箱、手机、头像、注册时间
订单模板：订单号、用户ID、金额、状态、下单时间
商品模板：商品名、分类、价格、库存、图片
发票模板：发票号、金额、状态、开票时间
使用方式：

选择表
选择模板类型
映射字段（自动匹配 + 手动调整）
生成数据
可视化表单编辑器
功能：

自动根据字段类型生成表单：
varchar → 文本框
int → 数字框
enum → 下拉选择
datetime → 日期选择器
text → 文本域
支持新增、编辑、删除
数据验证（必填、格式）
---

4. 接口测试工具
功能：

从接口列表选择接口
自动填充 URL、Method
参数输入区（支持 Path、Query、Body）
一键发送请求
响应展示（JSON 格式化、状态码、耗时）
保存测试用例
---

5. 场景管理
预设场景：

理想环境：所有接口正常响应
网络慢：所有接口延迟 2-5 秒
网络快：所有接口延迟 0-100ms
服务不稳定：30% 接口返回 500 错误
自定义场景：

保存当前接口配置为场景
一键恢复
---

前端技术细节
使用 Tailwind CSS（CDN）
<link href="https://cdn.jsdelivr.net/npm/tailwindcss@3.4.0/dist/tailwind.min.css" rel="stylesheet">
组件化设计
示例：Table 组件

// public/admin/components/table.js
class DataTable {
  constructor(containerId, options) {
    this.container = document.getElementById(containerId);
    this.options = options;
  }
  
  render(data) {
    // 渲染表格
  }
  
  update(data) {
    // 更新数据
  }
}
路由管理
// 简单的客户端路由
const router = {
  '/': renderDashboard,
  '/modules': renderModules,
  '/data': renderData,
  '/interfaces': renderInterfaces,
  '/logs': renderLogs,
  '/scenarios': renderScenarios,
  '/test': renderTest,
};

function navigate(path) {
  const handler = router[path];
  if (handler) {
    handler();
    // 更新侧边栏激活状态
  }
}
---

开发步骤（分模块实现）
阶段 1：基础架构
初始化 TypeScript + Express 项目
配置数据库连接
实现核心类（BaseModel、Response、ErrorHandler）
实现工具函数（Logger、Faker、Helpers）
阶段 2：中间件系统
请求日志中间件
延迟模拟中间件
错误模拟中间件
接口控制中间件
阶段 3：系统模块
健康检查接口
管理 API（模块管理、数据管理、接口管理、日志管理、场景管理）
阶段 4：接口模板
创建标准模板目录
编写模板级 .prompt.md
实现动态路由加载
阶段 5：前端基础
HTML 结构（左侧导航 + 右侧面板）
Tailwind CSS 样式
路由系统
阶段 6：前端功能页面
概览仪表盘
模块管理
数据管理（包括智能生成器、模板库、表单编辑器）
接口管理
日志管理
场景管理
接口测试工具
阶段 7：AI 工作流优化
编写极简全局提示词
测试接口生成流程
验证模块删除时的清理机制
阶段 8：文档和部署
编写 README.md
配置 .env.example
数据库初始化脚本
---

数据库设计
系统表
无需系统表，所有配置存储在内存（接口配置、场景配置）或从文件系统读取（模块信息）。

业务表
由 AI 生成模块时自动创建，遵循命名规范：

表名：snake_case（如 hotel_order）
主键：id（自增）
时间字段：created_at, updated_at
---

关键文件说明
src/core/BaseModel.ts
数据模型基类，提供：

findAll(), findById(), findOne(), findPaginated()
create(), update(), delete()
count(), rawQuery()
src/core/Response.ts
响应封装，支持三种格式：

ERP 格式（大写字段）
B2B / Ebooking 格式（小写字段）
src/routes/index.ts
动态路由加载器：

自动扫描 src/generated/ 目录
加载每个模块的 routes.ts
注册到 Express
src/system/admin/
管理 API 实现：

模块管理：获取列表、详情、删除
数据管理：表列表、CRUD、批量生成
接口管理：列表、配置、场景应用
日志管理：查询、统计
.cursor/rules/ai-rules.mdc
全局 AI 提示词（极简版）：

只记录通用规则
不记录具体接口
强调模块级 .prompt.md 的重要性
---

预期效果
✅ AI 友好：复制模板 → 修改代码 → 创建 .prompt.md → 完成

✅ 完全解耦：删除模块目录 = 删除所有相关内容

✅ 现代 UI：Tailwind CSS 美观、响应式、可定制

✅ 强大工具：智能数据生成、模板库、可视化编辑

✅ 清晰职责：全局提示词只管规则，不管具体接口

---

启动项目后的使用流程
访问 http://localhost:8088/admin
侧边栏选择"模块管理"
告诉 AI："根据接口文档生成接口"
AI 生成模块到 `src/generated/[模块名]/`
AI 同时创建 .prompt.md 记录业务逻辑
刷新页面，新模块自动出现在列表
在"数据管理"中使用智能生成器造数据
在"接口测试"中测试接口
需要删除时，直接删除模块目录即可