// ============================================
// 数据管理页面
// ============================================

let currentTables = [];
let dataTableFilters = {
  module: '',
};

async function renderData(container) {
  container.innerHTML = `
    <div class="loading-screen">
      <div class="spinner"></div>
      <p class="loading-text">加载数据表...</p>
    </div>
  `;

  try {
    const response = await api.get('/tables');
    currentTables = response.data || [];
    displayDataPage(container);
  } catch (error) {
    container.innerHTML = `
      <div class="empty-state">
        <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <p class="empty-title">加载失败</p>
        <p class="empty-text">${error.message}</p>
      </div>
    `;
  }
}

function displayDataPage(container) {
  if (currentTables.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
        </svg>
        <p class="empty-title">暂无数据表</p>
        <p class="empty-text">请先创建模块生成数据表</p>
      </div>
    `;
    return;
  }

  // 应用筛选
  const filteredTables = applyTableFilters(currentTables);
  
  // 获取所有模块列表
  const modules = [...new Set(currentTables.map(t => t.module))].sort();

  container.innerHTML = `
    <!-- 筛选栏 -->
    <div style="background: white; border-radius: var(--radius-lg); padding: 0.625rem 1rem; box-shadow: var(--shadow-sm); border: 1px solid var(--gray-200); margin-bottom: 1rem;">
      <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
        <select id="filter-module" class="form-select" style="width: 160px; height: 32px; padding: 0.375rem 0.75rem; font-size: 0.875rem;">
          <option value="">全部模块</option>
          ${modules.map(m => `<option value="${m}" ${dataTableFilters.module === m ? 'selected' : ''}>${m}</option>`).join('')}
        </select>
        
        <button class="btn btn-sm" onclick="resetTableFilters()" style="height: 32px; padding: 0 0.875rem; font-size: 0.875rem; background: var(--gray-100); color: var(--gray-700); border: 1px solid var(--gray-300);">
          <svg style="width: 0.875rem; height: 0.875rem;" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
          重置
        </button>

        <button class="btn btn-sm" onclick="refreshDataPage()" style="height: 32px; padding: 0 0.875rem; font-size: 0.875rem; background: var(--gray-100); color: var(--gray-700); border: 1px solid var(--gray-300);">
          <svg style="width: 0.875rem; height: 0.875rem;" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
          </svg>
          刷新
        </button>
      </div>
    </div>

    <!-- 数据表格 -->
    <div style="background: white; border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); border: 1px solid var(--gray-200); overflow: hidden;">
      ${renderDataTable(filteredTables)}
    </div>
  `;

  // 绑定筛选事件
  attachTableFilterEvents();
}

function renderDataTable(tables) {
  if (tables.length === 0) {
    return `
      <div class="empty-state">
        <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
        </svg>
        <p class="empty-title">无匹配结果</p>
        <p class="empty-text">请调整筛选条件</p>
      </div>
    `;
  }

  return `
    <div style="overflow-x: auto;">
      <table class="table">
        <thead>
          <tr>
            <th>数据表名称</th>
            <th>所属模块</th>
            <th>描述</th>
            <th style="text-align: center;">记录数</th>
            <th style="width: 140px; text-align: right;">操作</th>
          </tr>
        </thead>
        <tbody>
          ${tables.map(table => `
            <tr>
              <td>
                <span style="font-weight: 600; color: var(--gray-900);">${table.name}</span>
              </td>
              <td>
                <span class="badge badge-info">${table.module || '-'}</span>
              </td>
              <td>
                <span style="color: var(--gray-600); font-size: 0.875rem;">${table.description || '-'}</span>
              </td>
              <td style="text-align: center;">
                <span class="badge badge-secondary">${table.rows || 0}</span>
              </td>
              <td style="text-align: right;">
                <button class="btn btn-sm btn-primary" onclick="window.location.hash = '/data/${encodeURIComponent(table.name)}'">查看数据</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function applyTableFilters(tables) {
  return tables.filter(table => {
    // 模块筛选
    if (dataTableFilters.module && table.module !== dataTableFilters.module) return false;
    return true;
  });
}

function attachTableFilterEvents() {
  const moduleSelect = document.getElementById('filter-module');
  
  if (moduleSelect) {
    moduleSelect.addEventListener('change', () => {
      dataTableFilters.module = moduleSelect.value;
      updateTableView();
    });
  }
}

function updateTableView() {
  const container = document.getElementById('content');
  displayDataPage(container);
}

function resetTableFilters() {
  dataTableFilters.module = '';
  updateTableView();
}

async function refreshDataPage() {
  const container = document.getElementById('content');
  await renderData(container);
}
