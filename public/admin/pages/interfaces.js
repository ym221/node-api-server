// ============================================
// 接口管理页面
// ============================================

let currentInterfaces = [];
let allModules = [];
let allScenarios = [];
let selectedInterfaces = new Set();
let filters = {
  module: '',
  name: '',
  url: '',
  method: '', // 改为单选
  status: 'all'
};

async function renderInterfaces(container) {
  container.innerHTML = `
    <div class="loading-screen">
      <div class="spinner"></div>
      <p class="loading-text">加载接口列表...</p>
    </div>
  `;

  try {
    // 并行加载接口、模块和场景
    const [interfacesRes, modulesRes, scenariosRes] = await Promise.all([
      api.get('/interfaces'),
      api.get('/modules'),
      api.get('/scenarios')
    ]);

    currentInterfaces = interfacesRes.data || [];
    allModules = modulesRes.data || [];
    allScenarios = scenariosRes.data || [];
    selectedInterfaces.clear();

    displayInterfacesPage(container);
  } catch (error) {
    container.innerHTML = `
      <div class="empty-state">
        <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="color: var(--danger);">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <p class="empty-title" style="color: var(--danger);">加载失败</p>
        <p class="empty-text">${error.message}</p>
      </div>
    `;
  }
}

function displayInterfacesPage(container) {
  const filteredInterfaces = applyFilters(currentInterfaces);

  container.innerHTML = `
    <!-- 筛选栏 -->
    <div style="background: white; border-radius: var(--radius-lg); padding: 0.625rem 1rem; box-shadow: var(--shadow-sm); border: 1px solid var(--gray-200); margin-bottom: 1rem;">
      ${renderFilterBar()}
    </div>

    <!-- 批量操作栏 -->
    ${selectedInterfaces.size > 0 ? renderBatchActions() : ''}

    <!-- 接口列表 -->
    <div style="background: white; border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); border: 1px solid var(--gray-200); overflow: hidden;">
      ${filteredInterfaces.length > 0 ? renderInterfacesTable(filteredInterfaces) : `
        <div class="empty-state">
          <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
          </svg>
          <p class="empty-title">没有找到接口</p>
          <p class="empty-text">尝试调整筛选条件或创建新模块</p>
        </div>
      `}
    </div>
  `;

  // 绑定筛选事件
  attachFilterEvents();
}

function renderFilterBar() {
  const methodOptions = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
  
  return `
    <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
      <select id="filter-module" class="form-select" style="width: 140px; height: 32px; padding: 0.375rem 0.75rem; font-size: 0.875rem;">
        <option value="">全部模块</option>
        ${allModules.map(m => `<option value="${m.name}">${m.name}</option>`).join('')}
      </select>

      <input type="text" id="filter-name" class="form-input" placeholder="搜索接口名称..." style="width: 180px; height: 32px; padding: 0.375rem 0.75rem; font-size: 0.875rem;">

      <input type="text" id="filter-url" class="form-input" placeholder="搜索 URL 路径..." style="width: 180px; height: 32px; padding: 0.375rem 0.75rem; font-size: 0.875rem;">

      <select id="filter-method" class="form-select" style="width: 110px; height: 32px; padding: 0.375rem 0.75rem; font-size: 0.875rem;">
        <option value="">全部方法</option>
        ${methodOptions.map(m => `<option value="${m}">${m}</option>`).join('')}
      </select>

      <select id="filter-status" class="form-select" style="width: 110px; height: 32px; padding: 0.375rem 0.75rem; font-size: 0.875rem;">
        <option value="all">全部状态</option>
        <option value="enabled">已启用</option>
        <option value="disabled">已禁用</option>
      </select>

      <button class="btn btn-sm" onclick="resetFilters()" style="height: 32px; padding: 0 0.875rem; font-size: 0.875rem; background: var(--gray-100); color: var(--gray-700); border: 1px solid var(--gray-300);">
        <svg style="width: 0.875rem; height: 0.875rem;" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
        重置
      </button>

      <button class="btn btn-sm" onclick="refreshInterfaces()" style="height: 32px; padding: 0 0.875rem; font-size: 0.875rem; background: var(--gray-100); color: var(--gray-700); border: 1px solid var(--gray-300);">
        <svg style="width: 0.875rem; height: 0.875rem;" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
        </svg>
        刷新
      </button>
    </div>
  `;
}

function renderBatchActions() {
  return `
    <div style="background: var(--primary-50); border: 1px solid var(--primary-200); border-radius: var(--radius-lg); padding: 0.875rem 1.25rem; margin-bottom: 1rem;">
      <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.75rem;">
        <div style="display: flex; align-items: center; gap: 1rem;">
          <span style="font-weight: 600; color: var(--primary-700); font-size: 0.9375rem;">已选择 ${selectedInterfaces.size} 个接口</span>
          <button class="btn btn-sm btn-secondary" onclick="clearSelection()">清除选择</button>
        </div>
        <div style="display: flex; gap: 0.5rem;">
          <button class="btn btn-sm btn-primary" onclick="showBatchSetScenario()">
            <svg style="width: 1rem; height: 1rem;" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/>
            </svg>
            批量设置场景
          </button>
          <button class="btn btn-sm btn-warning" onclick="batchResetScenarios()">
            <svg style="width: 1rem; height: 1rem;" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
            批量重置
          </button>
        </div>
      </div>
    </div>
  `;
}

function renderInterfacesTable(interfaces) {
  // 检查是否全选
  const allSelected = interfaces.length > 0 && interfaces.every(iface => 
    selectedInterfaces.has(JSON.stringify({ method: iface.method, path: iface.path }))
  );
  
  let html = '<div style="overflow-x: auto;"><table class="table"><thead><tr>';
  
  // 表头
  html += `<th style="width: 40px;"><input type="checkbox" id="select-all" ${allSelected ? 'checked' : ''} onchange="toggleSelectAll(this.checked)"></th>`;
  html += '<th>模块</th>';
  html += '<th>方法</th>';
  html += '<th>路径</th>';
  html += '<th>状态</th>';
  html += '<th>场景</th>';
  html += '<th style="width: 280px;">操作</th>';
  html += '</tr></thead><tbody>';
  
  interfaces.forEach((iface, index) => {
    const isSelected = selectedInterfaces.has(JSON.stringify({ method: iface.method, path: iface.path }));
    html += '<tr>';
    
    // 复选框
    html += `<td><input type="checkbox" ${isSelected ? 'checked' : ''} onchange="toggleSelect('${iface.method}', '${iface.path}', this.checked)"></td>`;
    
    // 模块
    html += `<td><span class="badge badge-info">${iface.module || '系统'}</span></td>`;
    
    // 方法
    const methodColors = {
      GET: 'badge-info',
      POST: 'badge-success',
      PUT: 'badge-warning',
      DELETE: 'badge-danger',
      PATCH: 'badge-info',
    };
    const methodClass = methodColors[iface.method] || 'badge-gray';
    html += `<td><span class="badge ${methodClass}">${iface.method}</span></td>`;
    
    // 路径
    const shortPath = iface.path.length > 40 ? iface.path.substring(0, 40) + '...' : iface.path;
    html += `<td><code style="font-family: monospace; font-size: 0.8125rem;">${shortPath}</code></td>`;
    
    // 状态
    const statusBadge = iface.enabled !== false 
      ? '<span class="badge badge-success">启用</span>' 
      : '<span class="badge badge-gray">禁用</span>';
    html += `<td>${statusBadge}</td>`;
    
    // 场景
    let scenarioDisplay = '默认';
    if (iface.scenarioId) {
      const scenario = allScenarios.find(s => s.id === iface.scenarioId);
      if (scenario) {
        if (scenario.enabled === false) {
          scenarioDisplay = `${scenario.name} <span style="color: var(--warning);">(已禁用)</span>`;
        } else {
          scenarioDisplay = scenario.name;
        }
      } else {
        scenarioDisplay = `${iface.scenarioName || '未知场景'} <span style="color: var(--danger);">(已删除)</span>`;
      }
    }
    html += `<td><span class="badge badge-gray">${scenarioDisplay}</span></td>`;
    
    // 操作
    html += `<td><div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">`;
    html += `<button class="btn btn-sm btn-primary" onclick="quickTest(${index})">测试</button>`;
    html += `<button class="btn btn-sm btn-secondary" onclick="setScenario(${index})">场景</button>`;
    html += `<button class="btn btn-sm btn-secondary" onclick="toggleInterface(${index})">${iface.enabled !== false ? '禁用' : '启用'}</button>`;
    html += `</div></td>`;
    
    html += '</tr>';
  });
  
  html += '</tbody></table></div>';
  
  return html;
}

function applyFilters(interfaces) {
  return interfaces.filter(iface => {
    // 模块筛选
    if (filters.module && iface.module !== filters.module) return false;
    
    // 名称筛选（搜索路径）
    if (filters.name && !iface.path.toLowerCase().includes(filters.name.toLowerCase())) return false;
    
    // URL 筛选
    if (filters.url && !iface.path.toLowerCase().includes(filters.url.toLowerCase())) return false;
    
    // 方法筛选（单选）
    if (filters.method && iface.method !== filters.method) return false;
    
    // 状态筛选
    if (filters.status === 'enabled' && iface.enabled === false) return false;
    if (filters.status === 'disabled' && iface.enabled !== false) return false;
    
    return true;
  });
}

function attachFilterEvents() {
  const moduleSelect = document.getElementById('filter-module');
  const nameInput = document.getElementById('filter-name');
  const urlInput = document.getElementById('filter-url');
  const methodSelect = document.getElementById('filter-method');
  const statusSelect = document.getElementById('filter-status');

  if (moduleSelect) {
    moduleSelect.value = filters.module;
    moduleSelect.addEventListener('change', () => {
      filters.module = moduleSelect.value;
      updateFilteredView();
    });
  }

  if (nameInput) {
    nameInput.value = filters.name;
    nameInput.addEventListener('input', () => {
      filters.name = nameInput.value;
      updateFilteredView();
    });
  }

  if (urlInput) {
    urlInput.value = filters.url;
    urlInput.addEventListener('input', () => {
      filters.url = urlInput.value;
      updateFilteredView();
    });
  }

  if (methodSelect) {
    methodSelect.value = filters.method;
    methodSelect.addEventListener('change', () => {
      filters.method = methodSelect.value;
      updateFilteredView();
    });
  }

  if (statusSelect) {
    statusSelect.value = filters.status;
    statusSelect.addEventListener('change', () => {
      filters.status = statusSelect.value;
      updateFilteredView();
    });
  }
}

function updateFilteredView() {
  const filteredInterfaces = applyFilters(currentInterfaces);
  const tbody = document.querySelector('.table tbody');
  
  if (tbody) {
    let html = '';
    filteredInterfaces.forEach((iface, index) => {
      const isSelected = selectedInterfaces.has(JSON.stringify({ method: iface.method, path: iface.path }));
      html += '<tr>';
      html += `<td><input type="checkbox" ${isSelected ? 'checked' : ''} onchange="toggleSelect('${iface.method}', '${iface.path}', this.checked)"></td>`;
      html += `<td><span class="badge badge-info">${iface.module || '系统'}</span></td>`;
      
      const methodColors = { GET: 'badge-info', POST: 'badge-success', PUT: 'badge-warning', DELETE: 'badge-danger', PATCH: 'badge-info' };
      const methodClass = methodColors[iface.method] || 'badge-gray';
      html += `<td><span class="badge ${methodClass}">${iface.method}</span></td>`;
      
      const shortPath = iface.path.length > 40 ? iface.path.substring(0, 40) + '...' : iface.path;
      html += `<td><code style="font-family: monospace; font-size: 0.8125rem;">${shortPath}</code></td>`;
      
      const statusBadge = iface.enabled !== false ? '<span class="badge badge-success">启用</span>' : '<span class="badge badge-gray">禁用</span>';
      html += `<td>${statusBadge}</td>`;
      
      const scenarioName = iface.scenarioName || '默认';
      html += `<td><span class="badge badge-gray">${scenarioName}</span></td>`;
      
      html += `<td><div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">`;
      html += `<button class="btn btn-sm btn-primary" onclick="quickTest(${index})">测试</button>`;
      html += `<button class="btn btn-sm btn-secondary" onclick="setScenario(${index})">场景</button>`;
      html += `<button class="btn btn-sm btn-secondary" onclick="toggleInterface(${index})">${iface.enabled !== false ? '禁用' : '启用'}</button>`;
      html += `</div></td>`;
      html += '</tr>';
    });
    tbody.innerHTML = html || '<tr><td colspan="7" style="text-align: center; padding: 2rem; color: var(--gray-500);">没有找到匹配的接口</td></tr>';
  }
}

function resetFilters() {
  filters = { module: '', name: '', url: '', method: '', status: 'all' };
  displayInterfacesPage(document.getElementById('content'));
}

function toggleSelectAll(checked) {
  const filteredInterfaces = applyFilters(currentInterfaces);
  if (checked) {
    filteredInterfaces.forEach(iface => {
      selectedInterfaces.add(JSON.stringify({ method: iface.method, path: iface.path }));
    });
  } else {
    selectedInterfaces.clear();
  }
  displayInterfacesPage(document.getElementById('content'));
}

function toggleSelect(method, path, checked) {
  const key = JSON.stringify({ method, path });
  if (checked) {
    selectedInterfaces.add(key);
  } else {
    selectedInterfaces.delete(key);
  }
  displayInterfacesPage(document.getElementById('content'));
}

function clearSelection() {
  selectedInterfaces.clear();
  displayInterfacesPage(document.getElementById('content'));
}

// 快速测试
function quickTest(index) {
  const filteredInterfaces = applyFilters(currentInterfaces);
  const iface = filteredInterfaces[index];
  if (!iface) return;

  const modalContent = `
    <div style="display: flex; flex-direction: column; gap: 1rem;">
      <div class="form-group" style="margin: 0;">
        <label class="form-label">请求方法</label>
        <input type="text" value="${iface.method}" readonly class="form-input" style="background: var(--gray-100); cursor: not-allowed;">
      </div>
      
      <div class="form-group" style="margin: 0;">
        <label class="form-label">请求 URL <small style="color: var(--gray-600);">(支持编辑路径参数，如 :id)</small></label>
        <input type="text" id="test-url" value="${iface.path}" class="form-input" placeholder="请输入完整URL，如 /api/products/123">
      </div>
      
      <div class="form-group" style="margin: 0;">
        <label class="form-label">请求头 (JSON)</label>
        <textarea id="test-headers" class="form-textarea" style="min-height: 80px;">{}</textarea>
      </div>
      
      <div class="form-group" style="margin: 0;">
        <label class="form-label">请求体 (JSON)</label>
        <textarea id="test-body" class="form-textarea" style="min-height: 100px;"></textarea>
      </div>
      
      <div id="test-result-container" style="display: none;">
        <hr style="border: none; border-top: 1px solid var(--gray-200); margin: 1rem 0;">
        <h4 style="margin-bottom: 0.5rem; font-size: 0.9375rem; font-weight: 600;">响应结果</h4>
        <div id="test-response"></div>
      </div>
    </div>
  `;

  window.modal.open({
    title: `测试接口: ${iface.method} ${iface.path}`,
    content: modalContent,
    confirmText: '发送请求',
    cancelText: '关闭',
    size: 'large',
    onConfirm: async () => {
      const urlInput = document.getElementById('test-url');
      const url = urlInput ? urlInput.value : iface.path;
      await sendQuickTest(iface.method, url);
      return false; // 不关闭弹窗
    }
  });
}

async function sendQuickTest(method, path) {
  const headersInput = document.getElementById('test-headers');
  const bodyInput = document.getElementById('test-body');
  const resultContainer = document.getElementById('test-result-container');
  const responseDiv = document.getElementById('test-response');

  try {
    // 解析请求头
    let headers = {};
    if (headersInput && headersInput.value.trim()) {
      try {
        headers = JSON.parse(headersInput.value);
      } catch (e) {
        window.toast.error('请求头 JSON 格式错误');
        return;
      }
    }

    // 解析请求体
    let body = null;
    if (bodyInput && bodyInput.value.trim() && method !== 'GET') {
      try {
        body = JSON.parse(bodyInput.value);
      } catch (e) {
        window.toast.error('请求体 JSON 格式错误');
        return;
      }
    }

    // 显示加载状态
    resultContainer.style.display = 'block';
    responseDiv.innerHTML = '<div style="padding: 1rem; text-align: center;"><div class="spinner" style="margin: 0 auto;"></div><p style="margin-top: 0.5rem; color: var(--gray-600);">请求中...</p></div>';

    // 发送请求
    const startTime = Date.now();
    const fetchOptions = {
      method,
      headers: { 'Content-Type': 'application/json', ...headers }
    };

    if (body && method !== 'GET') {
      fetchOptions.body = JSON.stringify(body);
    }

    const response = await fetch(path, fetchOptions);
    const duration = Date.now() - startTime;

    let responseData;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
    }

    // 显示结果
    const statusColor = response.ok ? 'var(--success)' : 'var(--danger)';
    let resultHTML = `
      <div style="display: flex; gap: 1rem; margin-bottom: 0.75rem; font-size: 0.875rem;">
        <span style="font-weight: 600; color: ${statusColor};">状态: ${response.status} ${response.statusText}</span>
        <span style="font-weight: 600;">耗时: ${duration}ms</span>
      </div>
      <div style="margin-bottom: 0.5rem;">
        <strong style="font-size: 0.875rem;">响应数据:</strong>
      </div>
      <pre style="background: var(--gray-900); color: #e2e8f0; padding: 0.75rem; border-radius: var(--radius-md); font-size: 0.8125rem; max-height: 300px; overflow-y: auto; margin: 0;"><code>${typeof responseData === 'string' ? responseData : JSON.stringify(responseData, null, 2)}</code></pre>
    `;
    
    responseDiv.innerHTML = resultHTML;
    window.toast.success('请求成功！');
  } catch (error) {
    responseDiv.innerHTML = `
      <div style="padding: 1rem; background: var(--danger-50); border: 1px solid var(--danger); border-radius: var(--radius-md);">
        <div style="font-weight: 600; color: var(--danger); margin-bottom: 0.5rem;">请求失败</div>
        <div style="font-size: 0.875rem; color: var(--gray-700);">${error.message}</div>
      </div>
    `;
    window.toast.error(`请求失败: ${error.message}`);
  }
}

// 设置场景
function setScenario(index) {
  const filteredInterfaces = applyFilters(currentInterfaces);
  const iface = filteredInterfaces[index];
  if (!iface) return;

  // 只显示已启用的场景
  const enabledScenarios = allScenarios.filter(s => s.enabled !== false);
  const scenarioOptions = enabledScenarios.map(s => 
    `<option value="${s.id}" ${iface.scenarioId === s.id ? 'selected' : ''}>${s.name} - ${s.description}</option>`
  ).join('');

  const content = `
    <div class="form-group">
      <label class="form-label">选择场景</label>
      <select id="scenario-select" class="form-select">
        <option value="">默认（无场景）</option>
        ${scenarioOptions}
      </select>
    </div>
    <p style="font-size: 0.875rem; color: var(--gray-600); margin-top: 0.5rem;">应用场景后，该接口将按照场景配置模拟网络环境</p>
  `;

  window.modal.open({
    title: `设置场景: ${iface.path}`,
    content,
    confirmText: '应用',
    cancelText: '取消',
    onConfirm: async () => {
      const scenarioSelect = document.getElementById('scenario-select');
      const scenarioId = scenarioSelect.value;
      
      try {
        if (scenarioId) {
          // 应用场景
          await api.post('/interfaces/batch-scenario', {
            interfaces: [{ method: iface.method, path: iface.path }],
            scenarioId
          });
          window.toast.success('场景设置成功');
        } else {
          // 重置场景
          await api.post('/interfaces/batch-reset', {
            interfaces: [{ method: iface.method, path: iface.path }]
          });
          window.toast.success('场景已重置');
        }
        renderInterfaces(document.getElementById('content'));
      } catch (error) {
        window.toast.error(`设置失败: ${error.message}`);
      }
    }
  });
}

// 批量设置场景
function showBatchSetScenario() {
  if (selectedInterfaces.size === 0) {
    window.toast.warning('请先选择接口');
    return;
  }

  // 只显示已启用的场景
  const enabledScenarios = allScenarios.filter(s => s.enabled !== false);
  const scenarioOptions = enabledScenarios.map(s => 
    `<option value="${s.id}">${s.name} - ${s.description}</option>`
  ).join('');

  const content = `
    <div class="form-group">
      <label class="form-label">选择场景</label>
      <select id="batch-scenario-select" class="form-select">
        <option value="">请选择...</option>
        ${scenarioOptions}
      </select>
    </div>
    <p style="font-size: 0.875rem; color: var(--gray-600); margin-top: 0.5rem;">将为 ${selectedInterfaces.size} 个接口应用所选场景</p>
  `;

  window.modal.open({
    title: '批量设置场景',
    content,
    confirmText: '应用',
    cancelText: '取消',
    onConfirm: async () => {
      const scenarioSelect = document.getElementById('batch-scenario-select');
      const scenarioId = scenarioSelect.value;
      
      if (!scenarioId) {
        window.toast.warning('请选择场景');
        return false;
      }

      try {
        const interfaces = Array.from(selectedInterfaces).map(key => JSON.parse(key));
        await api.post('/interfaces/batch-scenario', { interfaces, scenarioId });
        window.toast.success(`已为 ${interfaces.length} 个接口应用场景`);
        selectedInterfaces.clear();
        renderInterfaces(document.getElementById('content'));
      } catch (error) {
        window.toast.error(`批量设置失败: ${error.message}`);
      }
    }
  });
}

// 批量重置场景
async function batchResetScenarios() {
  if (selectedInterfaces.size === 0) {
    window.toast.warning('请先选择接口');
    return;
  }

  window.modal.confirm(
    `确定要重置 ${selectedInterfaces.size} 个接口的场景设置吗？`,
    async () => {
      try {
        const interfaces = Array.from(selectedInterfaces).map(key => JSON.parse(key));
        await api.post('/interfaces/batch-reset', { interfaces });
        window.toast.success(`已重置 ${interfaces.length} 个接口`);
        selectedInterfaces.clear();
        renderInterfaces(document.getElementById('content'));
      } catch (error) {
        window.toast.error(`批量重置失败: ${error.message}`);
      }
    }
  );
}

// 切换接口状态
async function toggleInterface(index) {
  const filteredInterfaces = applyFilters(currentInterfaces);
  const iface = filteredInterfaces[index];
  if (!iface) return;
  
  const newStatus = !iface.enabled;
  const action = newStatus ? '启用' : '禁用';
  
  try {
    await api.post('/interfaces', { 
      method: iface.method,
      path: iface.path,
      enabled: newStatus 
    });
    window.toast.success(`接口已${action}`);
    renderInterfaces(document.getElementById('content'));
  } catch (error) {
    window.toast.error(`操作失败: ${error.message}`);
  }
}

// 刷新接口列表
async function refreshInterfaces() {
  renderInterfaces(document.getElementById('content'));
}
