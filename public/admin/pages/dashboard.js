// ============================================
// 概览仪表盘页面
// ============================================

async function renderDashboard(container) {
  // 显示加载状态
  container.innerHTML = `
    <div class="loading-screen">
      <div class="spinner"></div>
      <p class="loading-text">加载统计数据中...</p>
    </div>
  `;

  try {
    // 获取统计数据
    const [modulesRes, tablesRes, interfacesRes] = await Promise.all([
      api.get('/modules'),
      api.get('/tables'),
      api.get('/interfaces'),
    ]);

    const modules = modulesRes.data || [];
    const tables = tablesRes.data || [];
    const interfaces = interfacesRes.data || [];

    // 计算接口统计
    const enabledInterfaces = interfaces.filter(i => i.enabled !== false).length;
    const totalInterfaces = interfaces.length;

    // 渲染页面
    container.innerHTML = `
      <!-- 统计卡片 -->
      <div class="grid grid-cols-4 mb-8">
        <div class="stat-card">
          <div class="flex items-center justify-between">
            <div>
              <div class="stat-value" style="color: var(--primary-600);">${modules.length}</div>
              <div class="stat-label">接口模块</div>
            </div>
            <svg style="width: 3rem; height: 3rem; color: var(--primary-500); opacity: 0.2;" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
            </svg>
          </div>
        </div>

        <div class="stat-card">
          <div class="flex items-center justify-between">
            <div>
              <div class="stat-value" style="color: var(--success);">${tables.length}</div>
              <div class="stat-label">数据表</div>
            </div>
            <svg style="width: 3rem; height: 3rem; color: var(--success); opacity: 0.2;" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"/>
            </svg>
          </div>
        </div>

        <div class="stat-card">
          <div class="flex items-center justify-between">
            <div>
              <div class="stat-value" style="color: #8b5cf6;">${totalInterfaces}</div>
              <div class="stat-label">接口总数</div>
            </div>
            <svg style="width: 3rem; height: 3rem; color: #8b5cf6; opacity: 0.2;" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
          </div>
        </div>

        <div class="stat-card">
          <div class="flex items-center justify-between">
            <div>
              <div class="stat-value" style="color: var(--success);">${enabledInterfaces}</div>
              <div class="stat-label">已启用接口</div>
            </div>
            <svg style="width: 3rem; height: 3rem; color: var(--success); opacity: 0.2;" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
        </div>
      </div>

      <!-- 快速操作 -->
      <div class="card mb-8">
        <div class="card-header">
          <h3 class="card-title">快速操作</h3>
        </div>
        <div class="card-body">
          <div class="grid grid-cols-4">
            ${renderQuickAction('模块管理', '/modules', 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10', 'var(--primary-600)', 'var(--primary-100)')}
            ${renderQuickAction('数据管理', '/data', 'M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4', 'var(--success)', '#d1fae5')}
            ${renderQuickAction('接口管理', '/interfaces', 'M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', '#10b981', '#d1fae5')}
            ${renderQuickAction('接口测试', '/test', 'M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z', '#8b5cf6', '#ede9fe')}
          </div>
        </div>
      </div>

      <!-- 模块列表 -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">已安装模块</h3>
          <a href="#/modules" class="btn btn-sm btn-primary">查看全部</a>
        </div>
        <div class="card-body">
          ${modules.length > 0 ? renderModuleList(modules.slice(0, 6)) : renderEmptyModules()}
        </div>
      </div>
    `;
  } catch (error) {
    console.error('加载仪表盘失败:', error);
    container.innerHTML = `
      <div class="empty-state">
        <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="color: var(--danger);">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <p class="empty-title" style="color: var(--danger);">加载失败</p>
        <p class="empty-text">${error.message}</p>
        <button onclick="renderDashboard(document.getElementById('content'))" class="btn btn-primary" style="margin-top: 1rem;">重试</button>
      </div>
    `;
  }
}

function renderQuickAction(title, link, pathD, color, bgColor) {
  return `
    <a href="#${link}" style="text-decoration: none;">
      <div style="display: flex; flex-direction: column; align-items: center; padding: 2rem 1rem; background: ${bgColor}; border: 1px solid ${color}20; border-radius: var(--radius-xl); transition: var(--transition); cursor: pointer;" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='var(--shadow-md)'" onmouseout="this.style.transform=''; this.style.boxShadow=''">
        <div style="width: 3.5rem; height: 3.5rem; background: ${color}20; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 1rem;">
          <svg style="width: 1.75rem; height: 1.75rem; color: ${color};" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${pathD}"/>
          </svg>
        </div>
        <span style="font-size: 0.875rem; font-weight: 600; color: var(--gray-800);">${title}</span>
      </div>
    </a>
  `;
}

function renderModuleList(modules) {
  return `
    <div class="grid grid-cols-3">
      ${modules.map(module => `
        <div class="card" style="margin: 0;">
          <div class="card-body">
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center gap-2">
                <div style="width: 2.5rem; height: 2.5rem; background: var(--primary-100); border-radius: var(--radius-lg); display: flex; align-items: center; justify-content: center;">
                  <svg style="width: 1.25rem; height: 1.25rem; color: var(--primary-600);" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
                  </svg>
                </div>
                <span style="font-weight: 600; color: var(--gray-900);">${module.name}</span>
              </div>
              ${module.hasPrompt ? '<span class="badge badge-success">已配置</span>' : '<span class="badge badge-warning">待配置</span>'}
            </div>
            <div style="padding-top: 0.75rem; border-top: 1px solid var(--gray-200); display: flex; flex-direction: column; gap: 0.5rem; font-size: 0.875rem; color: var(--gray-600);">
              <div class="flex items-center justify-between">
                <span>文件数</span>
                <span style="font-weight: 600; color: var(--gray-900);">${module.files?.length || 0}</span>
              </div>
              <div class="flex items-center justify-between">
                <span>大小</span>
                <span style="font-weight: 600; color: var(--gray-900);">${Math.round((module.size || 0) / 1024)} KB</span>
              </div>
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function renderEmptyModules() {
  return `
    <div class="empty-state">
      <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
      </svg>
      <p class="empty-title">还没有模块</p>
      <p class="empty-text">请在 src/generated 目录中创建模块</p>
    </div>
  `;
}

