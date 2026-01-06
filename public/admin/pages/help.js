// ============================================
// 使用说明页面
// ============================================

function renderHelp(container) {
  container.innerHTML = `
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">📖 项目使用说明</h3>
      </div>
      <div class="card-body" style="max-width: 900px; margin: 0 auto;">
        ${renderHelpContent()}
      </div>
    </div>
  `;
}

function renderHelpContent() {
  return `
    <div style="display: flex; flex-direction: column; gap: 2rem;">
      <!-- 项目简介 -->
      <section>
        <h2 style="font-size: 1.5rem; font-weight: 700; color: var(--gray-900); margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
          <span style="font-size: 1.75rem;">⚡</span>
          项目简介
        </h2>
        <div style="background: var(--gray-50); padding: 1.5rem; border-radius: var(--radius-lg); border-left: 4px solid var(--primary-600);">
          <p style="color: var(--gray-700); line-height: 1.8; margin-bottom: 1rem;">
            这是一个 <strong>AI 驱动的 Node.js API 测试服务器</strong>，专为 AI 辅助开发而设计。
          </p>
          <p style="color: var(--gray-700); line-height: 1.8; margin-bottom: 1rem;">
            <strong style="color: var(--primary-600);">🤖 核心理念：</strong>
          </p>
          <ul style="list-style: none; padding-left: 0; color: var(--gray-700); line-height: 1.8;">
            <li style="padding: 0.5rem 0; display: flex; align-items: start; gap: 0.5rem;">
              <span style="color: var(--success); flex-shrink: 0;">✓</span>
              <span><strong>AI 自动生成模块：</strong>您只需向 AI 提供接口文档或需求说明，AI 会自动在 <code>src/generated</code> 目录下生成完整的 API 模块</span>
            </li>
            <li style="padding: 0.5rem 0; display: flex; align-items: start; gap: 0.5rem;">
              <span style="color: var(--success); flex-shrink: 0;">✓</span>
              <span><strong>无需手动维护：</strong>模块代码由 AI 管理，您只需通过控制台进行测试、数据管理等操作</span>
            </li>
            <li style="padding: 0.5rem 0; display: flex; align-items: start; gap: 0.5rem;">
              <span style="color: var(--success); flex-shrink: 0;">✓</span>
              <span><strong>完整运行环境：</strong>本项目为 AI 生成的接口提供数据库、路由、中间件等完整的运行环境</span>
            </li>
            <li style="padding: 0.5rem 0; display: flex; align-items: start; gap: 0.5rem;">
              <span style="color: var(--success); flex-shrink: 0;">✓</span>
              <span><strong>便捷操作工具：</strong>提供可视化的数据管理、接口测试、场景模拟等工具</span>
            </li>
            <li style="padding: 0.5rem 0; display: flex; align-items: start; gap: 0.5rem;">
              <span style="color: var(--success); flex-shrink: 0;">✓</span>
              <span><strong>规则上下文管理：</strong>维护 AI 生成代码所需的规则、模板和上下文信息</span>
            </li>
          </ul>
        </div>
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 1.25rem; border-radius: var(--radius-lg); margin-top: 1rem; color: white;">
          <p style="margin: 0; font-size: 0.9375rem; line-height: 1.7;">
            <strong>💡 简单来说：</strong>您专注于需求和测试，AI 负责代码生成，本项目提供运行和管理环境。
          </p>
        </div>
      </section>

      <!-- 核心功能 -->
      <section>
        <h2 style="font-size: 1.5rem; font-weight: 700; color: var(--gray-900); margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
          <span style="font-size: 1.75rem;">🎯</span>
          核心功能
        </h2>
        <div class="grid grid-cols-2">
          ${renderFeatureCard('模块管理', 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10', '查看和删除 src/generated 目录下的 AI 生成模块')}
          ${renderFeatureCard('数据管理', 'M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4', '查看表结构、智能生成测试数据、管理数据库')}
          ${renderFeatureCard('接口管理', 'M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', '筛选接口、批量设置场景、快速测试、启用/禁用')}
          ${renderFeatureCard('接口测试', 'M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z', '独立的 HTTP 客户端，详细的接口测试工具')}
          ${renderFeatureCard('场景管理', 'M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4', '模拟网络环境（慢速、不稳定等）')}
        </div>
      </section>

      <!-- 快速开始 -->
      <section>
        <h2 style="font-size: 1.5rem; font-weight: 700; color: var(--gray-900); margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
          <span style="font-size: 1.75rem;">🚀</span>
          快速开始
        </h2>
        ${renderStep('1', '环境配置', `
          <p>复制 <code>env.template</code> 为 <code>.env</code>，配置数据库等信息：</p>
          <pre style="background: var(--gray-900); color: #10b981; padding: 1rem; border-radius: var(--radius-md); overflow-x: auto; margin-top: 0.5rem;"><code># 复制配置文件
cp env.template .env

# 编辑配置
# 修改数据库连接信息、端口等</code></pre>
        `)}
        ${renderStep('2', '安装依赖', `
          <pre style="background: var(--gray-900); color: #10b981; padding: 1rem; border-radius: var(--radius-md); overflow-x: auto;"><code>npm install</code></pre>
        `)}
        ${renderStep('3', '初始化数据库', `
          <pre style="background: var(--gray-900); color: #10b981; padding: 1rem; border-radius: var(--radius-md); overflow-x: auto;"><code>npm run db:init</code></pre>
        `)}
        ${renderStep('4', '启动服务器', `
          <pre style="background: var(--gray-900); color: #10b981; padding: 1rem; border-radius: var(--radius-md); overflow-x: auto;"><code># 开发模式（支持热重载）
npm run dev

# 生产模式
npm run build
npm start</code></pre>
        `)}
        ${renderStep('5', '访问管理控制台', `
          <p>浏览器打开: <a href="http://localhost:8090/admin" target="_blank" style="color: var(--primary-600); text-decoration: underline;">http://localhost:8090/admin</a></p>
        `)}
      </section>

      <!-- 模块开发 -->
      <section>
        <h2 style="font-size: 1.5rem; font-weight: 700; color: var(--gray-900); margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
          <span style="font-size: 1.75rem;">🤖</span>
          AI 生成模块指南
        </h2>
        
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 1.5rem; border-radius: var(--radius-lg); margin-bottom: 1.5rem; color: white;">
          <h3 style="font-weight: 600; margin-bottom: 0.75rem; display: flex; align-items: center; gap: 0.5rem;">
            <span style="font-size: 1.5rem;">🌟</span>
            AI 驱动的开发流程
          </h3>
          <p style="line-height: 1.8; margin-bottom: 0.75rem;">
            <strong>您不需要手动编写或维护模块代码！</strong>只需要：
          </p>
          <ol style="list-style: decimal; padding-left: 1.5rem; line-height: 1.8;">
            <li style="padding: 0.25rem 0;">准备接口文档或需求说明（可以是 Swagger、API 文档、文字描述等）</li>
            <li style="padding: 0.25rem 0;">将文档提供给 AI（如 Cursor、ChatGPT 等）</li>
            <li style="padding: 0.25rem 0;">AI 会自动在 <code style="background: rgba(255,255,255,0.2); padding: 0.125rem 0.375rem; border-radius: 0.25rem;">src/generated</code> 目录下生成完整的模块</li>
            <li style="padding: 0.25rem 0;">刷新"模块管理"页面即可看到新模块</li>
            <li style="padding: 0.25rem 0;">在控制台进行测试、数据管理等操作</li>
          </ol>
        </div>

        <div style="background: var(--warning-50); padding: 1.5rem; border-radius: var(--radius-lg); border-left: 4px solid var(--warning); margin-bottom: 1.5rem;">
          <h3 style="font-weight: 600; color: var(--gray-900); margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem;">
            <span>⚠️</span>
            重要说明
          </h3>
          <ul style="list-style: disc; padding-left: 1.5rem; color: var(--gray-700); line-height: 1.8;">
            <li>模块代码由 AI 生成和维护，<strong>不建议手动修改</strong></li>
            <li>如需修改模块，请向 AI 说明需求，让 AI 重新生成</li>
            <li>本项目的角色是<strong>运行环境</strong>和<strong>管理工具</strong>，不是传统的开发框架</li>
          </ul>
        </div>

        <h3 style="font-weight: 600; color: var(--gray-900); margin-bottom: 1rem; margin-top: 2rem;">📋 AI 生成模块的典型结构</h3>
        <p style="color: var(--gray-700); line-height: 1.8; margin-bottom: 1rem;">
          AI 会根据 <code>src/template</code> 模板自动生成以下文件：
        </p>

        ${renderStep('1', '.prompt.md', `
          <p><strong>模块的 AI 上下文文件</strong>，记录：</p>
          <ul style="list-style: disc; padding-left: 1.5rem; color: var(--gray-700); line-height: 1.8;">
            <li>业务背景和需求说明</li>
            <li>接口列表和详细说明</li>
            <li>数据表结构和关系</li>
            <li>特殊逻辑和注意事项</li>
          </ul>
          <p style="margin-top: 0.5rem; color: var(--primary-600);"><strong>作用：</strong>AI 在后续修改时会参考此文件，保持上下文一致性</p>
        `)}
        ${renderStep('2', 'module.config.ts', `
          <p>模块配置文件，包含：</p>
          <ul style="list-style: disc; padding-left: 1.5rem; color: var(--gray-700); line-height: 1.8;">
            <li>模块名称和描述</li>
            <li><strong>响应格式（responseFormat）：</strong>支持 <code>B2B</code>、<code>ERP</code>、<code>Ebooking</code> 三种格式</li>
            <li>关联的数据表列表</li>
            <li>接口列表（用于自动注册到接口管理）</li>
          </ul>
          <div style="margin-top: 1rem; padding: 1rem; background: var(--gray-50); border-radius: var(--radius-md); border-left: 3px solid var(--primary-600);">
            <p style="font-weight: 600; color: var(--gray-900); margin-bottom: 0.5rem;">📌 响应格式说明：</p>
            <ul style="list-style: disc; padding-left: 1.5rem; color: var(--gray-700); line-height: 1.8; font-size: 0.875rem;">
              <li><strong>B2B 格式：</strong><code>{ success: true, code: 0, message: "", data: {} }</code>（code 为 0 表示成功）</li>
              <li><strong>ERP 格式：</strong><code>{ Success: true, Code: 0, Message: "", Data: {} }</code>（Code 为 0 表示成功）</li>
              <li><strong>默认规则：</strong>若接口文档未明确指定格式，默认使用 B2B 格式</li>
            </ul>
          </div>
        `)}
        ${renderStep('3', 'schema.sql', `
          <p>数据库表结构 SQL 文件，AI 会根据需求自动设计表结构</p>
        `)}
        ${renderStep('4', 'types.ts', `
          <p>TypeScript 类型定义，包含实体、DTO、查询参数等类型</p>
        `)}
        ${renderStep('5', 'model.ts', `
          <p>数据模型类，继承自 <code>BaseModel</code>，实现数据库操作</p>
        `)}
        ${renderStep('6', 'controller.ts', `
          <p>控制器，实现业务逻辑和接口处理函数</p>
        `)}
        ${renderStep('7', 'routes.ts', `
          <p>路由配置，定义接口路径和方法</p>
        `)}

        <h3 style="font-weight: 600; color: var(--gray-900); margin-bottom: 1rem; margin-top: 2rem;">🔄 如何让 AI 修改模块</h3>
        <div style="background: white; padding: 1.5rem; border-radius: var(--radius-lg); border: 1px solid var(--gray-200);">
          <p style="color: var(--gray-700); line-height: 1.8; margin-bottom: 1rem;">
            向 AI 说明您的需求，例如：
          </p>
          <ul style="list-style: none; padding-left: 0; color: var(--gray-700); line-height: 1.8;">
            <li style="padding: 0.5rem; background: var(--gray-50); margin-bottom: 0.5rem; border-radius: var(--radius-md); border-left: 3px solid var(--primary-600);">
              💬 "给用户模块添加一个修改密码的接口"
            </li>
            <li style="padding: 0.5rem; background: var(--gray-50); margin-bottom: 0.5rem; border-radius: var(--radius-md); border-left: 3px solid var(--primary-600);">
              💬 "订单表需要增加一个状态字段"
            </li>
            <li style="padding: 0.5rem; background: var(--gray-50); margin-bottom: 0.5rem; border-radius: var(--radius-md); border-left: 3px solid var(--primary-600);">
              💬 "商品列表需要支持按分类筛选"
            </li>
          </ul>
          <p style="color: var(--gray-600); font-size: 0.875rem; margin-top: 1rem; padding: 0.75rem; background: var(--primary-50); border-radius: var(--radius-md);">
            <strong>提示：</strong>AI 会自动读取 <code>.prompt.md</code> 文件来了解模块的当前状态，然后进行精确修改。
          </p>
        </div>
      </section>
      </section>

      <!-- 数据管理 -->
      <section>
        <h2 style="font-size: 1.5rem; font-weight: 700; color: var(--gray-900); margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
          <span style="font-size: 1.75rem;">💾</span>
          数据管理
        </h2>
        
        <div style="display: flex; flex-direction: column; gap: 1rem;">
          ${renderInfoBox('查看数据', '点击表卡片中的"查看数据"按钮，可以查看表中的所有数据（分页显示）')}
          ${renderInfoBox('生成数据', '点击"生成数据"按钮，系统会根据字段类型智能生成测试数据。支持识别常见字段名（如 name、email、phone 等）并生成相应格式的数据')}
          ${renderInfoBox('清空数据', '点击"清空数据"按钮可以清空表中的所有数据（⚠️ 不可恢复）')}
        </div>
      </section>

      <!-- 接口管理 -->
      <section>
        <h2 style="font-size: 1.5rem; font-weight: 700; color: var(--gray-900); margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
          <span style="font-size: 1.75rem;">🔌</span>
          接口管理
        </h2>
        
        <p style="color: var(--gray-700); line-height: 1.8; margin-bottom: 1rem;">
          接口管理页面提供了强大的筛选、场景配置和快速测试功能。
        </p>

        <div style="display: flex; flex-direction: column; gap: 1.5rem;">
          <div style="background: white; padding: 1.5rem; border-radius: var(--radius-lg); border: 1px solid var(--gray-200);">
            <h3 style="font-weight: 600; color: var(--gray-900); margin-bottom: 1rem;">🔍 接口筛选</h3>
            <p style="color: var(--gray-700); line-height: 1.8; margin-bottom: 1rem;">
              使用筛选栏快速定位目标接口：
            </p>
            <ul style="list-style: none; padding-left: 0; color: var(--gray-700); line-height: 1.8;">
              <li style="padding: 0.5rem 0; display: flex; align-items: start; gap: 0.5rem;">
                <span style="color: var(--primary-600); flex-shrink: 0;">•</span>
                <span><strong>模块筛选：</strong>按模块过滤接口</span>
              </li>
              <li style="padding: 0.5rem 0; display: flex; align-items: start; gap: 0.5rem;">
                <span style="color: var(--primary-600); flex-shrink: 0;">•</span>
                <span><strong>接口名称：</strong>模糊搜索接口路径</span>
              </li>
              <li style="padding: 0.5rem 0; display: flex; align-items: start; gap: 0.5rem;">
                <span style="color: var(--primary-600); flex-shrink: 0;">•</span>
                <span><strong>URL 路径：</strong>精确查找特定 URL</span>
              </li>
              <li style="padding: 0.5rem 0; display: flex; align-items: start; gap: 0.5rem;">
                <span style="color: var(--primary-600); flex-shrink: 0;">•</span>
                <span><strong>请求方法：</strong>可多选（GET/POST/PUT/DELETE等）</span>
              </li>
              <li style="padding: 0.5rem 0; display: flex; align-items: start; gap: 0.5rem;">
                <span style="color: var(--primary-600); flex-shrink: 0;">•</span>
                <span><strong>启用状态：</strong>筛选已启用或已禁用的接口</span>
              </li>
            </ul>
          </div>

          <div style="background: white; padding: 1.5rem; border-radius: var(--radius-lg); border: 1px solid var(--gray-200);">
            <h3 style="font-weight: 600; color: var(--gray-900); margin-bottom: 1rem;">⚡ 批量操作</h3>
            <p style="color: var(--gray-700); line-height: 1.8; margin-bottom: 1rem;">
              勾选多个接口后，可以进行批量操作：
            </p>
            <ul style="list-style: none; padding-left: 0; color: var(--gray-700); line-height: 1.8;">
              <li style="padding: 0.5rem 0; display: flex; align-items: start; gap: 0.5rem;">
                <span style="color: var(--success); flex-shrink: 0;">✓</span>
                <span><strong>批量设置场景：</strong>为多个接口同时应用指定场景（如网络慢、不稳定等）</span>
              </li>
              <li style="padding: 0.5rem 0; display: flex; align-items: start; gap: 0.5rem;">
                <span style="color: var(--success); flex-shrink: 0;">✓</span>
                <span><strong>批量重置：</strong>一键重置所选接口的场景配置</span>
              </li>
            </ul>
          </div>

          <div style="background: white; padding: 1.5rem; border-radius: var(--radius-lg); border: 1px solid var(--gray-200);">
            <h3 style="font-weight: 600; color: var(--gray-900); margin-bottom: 1rem;">🧪 快速测试</h3>
            <p style="color: var(--gray-700); line-height: 1.8; margin-bottom: 1rem;">
              每个接口行都有"测试"按钮，点击后会弹出测试弹窗，自动填充接口信息。
            </p>
            <ul style="list-style: disc; padding-left: 1.5rem; color: var(--gray-700); line-height: 1.8;">
              <li><strong>支持路径参数编辑：</strong>对于包含 <code>:id</code> 等参数的路径，可以直接修改 URL（如 <code>/api/products/:id</code> 改为 <code>/api/products/123</code>）</li>
              <li><strong>实时查看结果：</strong>发送请求后，弹窗内会显示响应状态、耗时和完整响应数据</li>
              <li><strong>保持弹窗打开：</strong>测试完成后弹窗不会自动关闭，方便您修改参数后继续测试</li>
            </ul>
          </div>

          <div style="background: white; padding: 1.5rem; border-radius: var(--radius-lg); border: 1px solid var(--gray-200);">
            <h3 style="font-weight: 600; color: var(--gray-900); margin-bottom: 1rem;">🎭 场景设置</h3>
            <p style="color: var(--gray-700); line-height: 1.8; margin-bottom: 1rem;">
              点击每个接口的"场景"按钮，可以为单个接口设置场景（如模拟慢速网络、服务不稳定等），用于测试前端在不同网络环境下的表现。
            </p>
            <p style="color: var(--gray-600); font-size: 0.875rem; padding: 0.75rem; background: var(--gray-50); border-radius: var(--radius-md);">
              <strong>提示：</strong>每个接口只能设置一个场景，新设置的场景会覆盖之前的配置。
            </p>
          </div>
        </div>
      </section>

      <!-- 接口测试 -->
      <section>
        <h2 style="font-size: 1.5rem; font-weight: 700; color: var(--gray-900); margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
          <span style="font-size: 1.75rem;">🧪</span>
          接口测试页面
        </h2>
        
        <p style="color: var(--gray-700); line-height: 1.8; margin-bottom: 1rem;">
          除了接口管理页面的快速测试，还提供了独立的接口测试页面供您详细测试。
        </p>
        
        ${renderStep('1', '选择接口', `
          <p>在"选择接口"搜索框中输入关键词，从下拉列表中选择要测试的接口。</p>
          <p style="margin-top: 0.5rem;">选择后，<strong>请求方法</strong>和<strong>请求 URL</strong> 会自动填充。</p>
        `)}
        ${renderStep('2', '配置请求', `
          <ul style="list-style: disc; padding-left: 1.5rem; color: var(--gray-700); line-height: 1.8;">
            <li><strong>请求头</strong>：JSON 格式，例如 <code>{"Authorization": "Bearer token"}</code></li>
            <li><strong>请求体</strong>：JSON 格式，仅对 POST/PUT/PATCH 等方法有效</li>
          </ul>
        `)}
        ${renderStep('3', '发送并查看结果', `
          <p>点击"发送请求"按钮，右侧会显示响应结果，包括：</p>
          <ul style="list-style: disc; padding-left: 1.5rem; color: var(--gray-700); line-height: 1.8;">
            <li>HTTP 状态码</li>
            <li>响应时间</li>
            <li>响应头</li>
            <li>响应数据（自动格式化 JSON）</li>
          </ul>
        `)}
      </section>

      <!-- 场景管理 -->
      <section>
        <h2 style="font-size: 1.5rem; font-weight: 700; color: var(--gray-900); margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
          <span style="font-size: 1.75rem;">🎭</span>
          场景管理
        </h2>
        
        <p style="color: var(--gray-700); line-height: 1.8; margin-bottom: 1rem;">
          场景管理允许您模拟不同的网络环境和服务器状态，用于测试前端应用在各种情况下的表现。
        </p>

        <div style="display: flex; flex-direction: column; gap: 1rem;">
          ${renderScenarioCard('理想环境', '接口正常响应，无延迟，无错误')}
          ${renderScenarioCard('网络慢', '接口延迟 2-5 秒')}
          ${renderScenarioCard('网络快', '接口延迟 0-100 毫秒')}
          ${renderScenarioCard('服务不稳定', '30% 概率返回 500 错误')}
          ${renderScenarioCard('慢速且不稳定', '延迟 1-3 秒，20% 错误率')}
        </div>

        <div style="background: var(--info-50); padding: 1.5rem; border-radius: var(--radius-lg); border-left: 4px solid var(--primary-600); margin-top: 1.5rem;">
          <p style="color: var(--gray-700); line-height: 1.8; margin-bottom: 0.5rem;">
            <strong>💡 使用说明：</strong>
          </p>
          <ul style="list-style: disc; padding-left: 1.5rem; color: var(--gray-700); line-height: 1.8;">
            <li>场景需要在"接口管理"页面中为具体接口设置，才会生效</li>
            <li>场景只会影响已分配该场景的接口，不会影响其他接口</li>
            <li>可以批量为多个接口设置同一个场景</li>
            <li>测试完成后可以清除接口的场景设置，恢复正常行为</li>
          </ul>
        </div>
      </section>

      <!-- 常见问题 -->
      <section>
        <h2 style="font-size: 1.5rem; font-weight: 700; color: var(--gray-900); margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
          <span style="font-size: 1.75rem;">❓</span>
          常见问题
        </h2>
        
        ${renderFAQ('模块是如何生成的？', '模块由 AI（如 Cursor、ChatGPT 等）根据您提供的接口文档或需求自动生成。您只需向 AI 描述需求，AI 会在 src/generated 目录下创建完整的模块代码。')}
        ${renderFAQ('我可以手动修改生成的代码吗？', '技术上可以，但不建议。因为后续如果需要 AI 继续维护该模块，手动修改可能导致上下文不一致。建议通过向 AI 说明需求来修改代码。')}
        ${renderFAQ('如何删除模块？', '在"模块管理"页面点击模块的"删除"按钮。注意：这会删除 src/generated 目录下对应的整个模块目录，且不可恢复。')}
        ${renderFAQ('数据生成失败怎么办？', '检查数据库连接是否正常，表结构是否存在。可以查看后端控制台的错误日志。确保已运行 npm run db:init 初始化数据库。')}
        ${renderFAQ('接口测试返回 404？', '确认接口路径是否正确，模块是否已加载。刷新页面重新获取接口列表。检查 src/generated 目录下是否存在对应模块。')}
        ${renderFAQ('.prompt.md 文件的作用是什么？', '这是 AI 的上下文文件，记录了模块的需求、接口说明、特殊逻辑等。AI 在修改模块时会参考此文件，确保理解当前状态。强烈建议保持此文件的准确性。')}
        ${renderFAQ('如何查看服务器日志？', '开发模式下，所有日志会输出到终端。日志文件保存在 logs 目录下（combined.log 和 error.log）。')}
        ${renderFAQ('如何修改服务器端口？', '在 .env 文件中修改 PORT 配置，默认为 8090。修改后需要重启服务器。')}
        ${renderFAQ('为什么叫"AI 驱动"？', '因为整个开发流程由 AI 主导：AI 生成模块代码、AI 维护代码、AI 理解需求。本项目只是提供运行环境和管理工具，让您专注于需求定义和功能测试，而不是编写代码。')}
      </section>

      <!-- 项目结构 -->
      <section>
        <h2 style="font-size: 1.5rem; font-weight: 700; color: var(--gray-900); margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
          <span style="font-size: 1.75rem;">📁</span>
          项目结构
        </h2>
        
        <pre style="background: var(--gray-900); color: #10b981; padding: 1.5rem; border-radius: var(--radius-md); overflow-x: auto; line-height: 1.8; font-size: 0.875rem;"><code>node-api-server/
├── src/
│   ├── core/              # 核心类（Response、ErrorHandler、BaseModel）
│   ├── config/            # 配置文件（数据库、CORS、上传）
│   ├── middlewares/       # 中间件（日志、延迟、错误模拟）
│   ├── utils/             # 工具函数（logger、faker、helpers）
│   ├── system/            # 系统 API（健康检查、管理接口）
│   ├── template/          # 模块模板
│   ├── generated/         # 生成的 API 模块（自动加载）
│   ├── routes/            # 路由加载器
│   ├── app.ts             # Express 应用
│   └── server.ts          # 服务器入口
├── public/
│   └── admin/             # 管理控制台前端
│       ├── index.html
│       ├── app.js
│       ├── style.css
│       ├── components/    # UI 组件
│       └── pages/         # 页面组件
├── scripts/               # 脚本（数据库初始化等）
├── logs/                  # 日志文件
├── .env                   # 环境配置
└── package.json           # 项目依赖</code></pre>
      </section>

      <!-- 技术栈 -->
      <section>
        <h2 style="font-size: 1.5rem; font-weight: 700; color: var(--gray-900); margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
          <span style="font-size: 1.75rem;">🛠️</span>
          技术栈
        </h2>
        
        <div class="grid grid-cols-2">
          ${renderTechCard('后端', ['Node.js + TypeScript', 'Express.js', 'MySQL', 'Winston (日志)', 'Faker.js (数据生成)'])}
          ${renderTechCard('前端', ['原生 JavaScript', 'Tailwind CSS', 'Hash 路由', '无框架依赖'])}
        </div>
      </section>
    </div>
  `;
}

function renderFeatureCard(title, iconPath, description) {
  return `
    <div style="background: white; padding: 1.5rem; border-radius: var(--radius-lg); border: 1px solid var(--gray-200); transition: var(--transition);" onmouseover="this.style.boxShadow='var(--shadow-md)'" onmouseout="this.style.boxShadow=''">
      <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem;">
        <div style="width: 2.5rem; height: 2.5rem; background: var(--primary-100); border-radius: var(--radius-lg); display: flex; align-items: center; justify-content: center;">
          <svg style="width: 1.25rem; height: 1.25rem; color: var(--primary-600);" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${iconPath}"/>
          </svg>
        </div>
        <h3 style="font-weight: 600; color: var(--gray-900);">${title}</h3>
      </div>
      <p style="color: var(--gray-600); font-size: 0.875rem; line-height: 1.6;">${description}</p>
    </div>
  `;
}

function renderStep(number, title, content) {
  return `
    <div style="display: flex; gap: 1rem; margin-bottom: 1.5rem;">
      <div style="flex-shrink: 0; width: 2rem; height: 2rem; background: var(--primary-600); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700;">${number}</div>
      <div style="flex: 1;">
        <h3 style="font-weight: 600; color: var(--gray-900); margin-bottom: 0.5rem;">${title}</h3>
        <div style="color: var(--gray-700); line-height: 1.8;">${content}</div>
      </div>
    </div>
  `;
}

function renderInfoBox(title, content) {
  return `
    <div style="background: white; padding: 1.25rem; border-radius: var(--radius-md); border: 1px solid var(--gray-200);">
      <h4 style="font-weight: 600; color: var(--gray-900); margin-bottom: 0.5rem;">✓ ${title}</h4>
      <p style="color: var(--gray-600); font-size: 0.875rem; line-height: 1.6;">${content}</p>
    </div>
  `;
}

function renderScenarioCard(name, description) {
  return `
    <div style="background: white; padding: 1.25rem; border-radius: var(--radius-md); border: 1px solid var(--gray-200); display: flex; justify-content: space-between; align-items: center;">
      <div>
        <h4 style="font-weight: 600; color: var(--gray-900); margin-bottom: 0.25rem;">${name}</h4>
        <p style="color: var(--gray-600); font-size: 0.875rem;">${description}</p>
      </div>
    </div>
  `;
}

function renderFAQ(question, answer) {
  return `
    <div style="background: white; padding: 1.5rem; border-radius: var(--radius-md); border: 1px solid var(--gray-200); margin-bottom: 1rem;">
      <h4 style="font-weight: 600; color: var(--gray-900); margin-bottom: 0.75rem; display: flex; align-items: center; gap: 0.5rem;">
        <span style="color: var(--primary-600);">Q:</span> ${question}
      </h4>
      <p style="color: var(--gray-700); line-height: 1.8; padding-left: 1.5rem;">
        <strong style="color: var(--success);">A:</strong> ${answer}
      </p>
    </div>
  `;
}

function renderTechCard(title, items) {
  return `
    <div style="background: white; padding: 1.5rem; border-radius: var(--radius-lg); border: 1px solid var(--gray-200);">
      <h3 style="font-weight: 600; color: var(--gray-900); margin-bottom: 1rem;">${title}</h3>
      <ul style="display: flex; flex-direction: column; gap: 0.75rem;">
        ${items.map(item => `
          <li style="display: flex; align-items: center; gap: 0.5rem; color: var(--gray-700); font-size: 0.875rem;">
            <svg style="width: 1rem; height: 1rem; color: var(--success); flex-shrink: 0;" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
            ${item}
          </li>
        `).join('')}
      </ul>
    </div>
  `;
}

