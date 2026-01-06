// ============================================
// 接口测试页面
// ============================================

let allInterfaces = [];

async function renderTest(container) {
  container.innerHTML = `
    <div class="loading-screen">
      <div class="spinner"></div>
      <p class="loading-text">加载接口列表...</p>
    </div>
  `;

  try {
    // 加载所有接口
    const response = await api.get('/interfaces');
    allInterfaces = response.data || [];
    
    displayTestPage(container);
  } catch (error) {
    container.innerHTML = `
      <div class="empty-state">
        <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="color: var(--danger);">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <p class="empty-title" style="color: var(--danger);">加载接口列表失败</p>
        <p class="empty-text">${error.message}</p>
      </div>
    `;
  }
}

function displayTestPage(container) {
  container.innerHTML = `
    <div class="grid gap-6" style="grid-template-columns: 1fr 1fr;">
      <!-- 请求配置 -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">接口测试</h3>
        </div>
        <div class="card-body">
          <form id="test-form" onsubmit="event.preventDefault(); handleTestSubmit();">
            <div class="form-group">
              <label class="form-label">选择接口</label>
              <div style="position: relative;">
                <input 
                  type="text" 
                  id="interface-search" 
                  class="form-input" 
                  placeholder="搜索接口 URL..."
                  autocomplete="off"
                  oninput="handleInterfaceSearch(this.value)"
                  onfocus="showInterfaceDropdown()"
                />
                <div id="interface-dropdown" style="display: none; position: absolute; top: 100%; left: 0; right: 0; max-height: 300px; overflow-y: auto; background: white; border: 1px solid var(--gray-300); border-radius: var(--radius-md); margin-top: 0.25rem; box-shadow: var(--shadow-lg); z-index: 1000;">
                  <!-- 下拉列表动态生成 -->
                </div>
              </div>
            </div>
            
            <div class="form-group">
              <label class="form-label">请求方法</label>
              <input type="text" id="method-input" class="form-input" readonly style="background: var(--gray-100); cursor: not-allowed;">
            </div>
            
            <div class="form-group">
              <label class="form-label">请求 URL</label>
              <input type="text" id="url-input" name="url" class="form-input" required placeholder="请求 URL 会自动填充">
            </div>
            
            <div id="path-params-notice"></div>
            
            <div class="form-group">
              <label class="form-label">请求头 (JSON)</label>
              <textarea name="headers" class="form-textarea" placeholder='{"Content-Type": "application/json"}' style="min-height: 80px;">{}</textarea>
            </div>
            
            <div class="form-group">
              <label class="form-label">请求体 (JSON)</label>
              <textarea name="body" class="form-textarea" placeholder='{"key": "value"}'></textarea>
            </div>
            
            <div class="flex gap-2">
              <button type="submit" class="btn btn-primary" style="flex: 1;">
                <svg style="width: 1rem; height: 1rem;" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                发送请求
              </button>
              <button type="button" class="btn btn-secondary" onclick="clearTestForm()">
                <svg style="width: 1rem; height: 1rem;" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
                清空
              </button>
            </div>
          </form>
        </div>
      </div>
      
      <!-- 响应结果 -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">响应结果</h3>
        </div>
        <div class="card-body">
          <div id="test-result">
            <div class="empty-state" style="padding: 2rem;">
              <svg class="empty-icon" style="width: 3rem; height: 3rem; margin-bottom: 1rem;" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              <p class="empty-text">发送请求后，响应结果将显示在这里</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // 初始化下拉列表
  renderInterfaceDropdown(allInterfaces);
  
  // 点击外部关闭下拉框
  document.addEventListener('click', function(e) {
    const dropdown = document.getElementById('interface-dropdown');
    const searchInput = document.getElementById('interface-search');
    if (dropdown && searchInput && !dropdown.contains(e.target) && e.target !== searchInput) {
      dropdown.style.display = 'none';
    }
  });
}

function renderInterfaceDropdown(interfaces) {
  const dropdown = document.getElementById('interface-dropdown');
  if (!dropdown) return;
  
  if (interfaces.length === 0) {
    dropdown.innerHTML = '<div style="padding: 1rem; text-align: center; color: var(--gray-500);">没有找到接口</div>';
    return;
  }
  
  let html = '';
  interfaces.forEach(iface => {
    const methodColors = {
      GET: 'badge-info',
      POST: 'badge-success',
      PUT: 'badge-warning',
      DELETE: 'badge-danger',
      PATCH: 'badge-info',
    };
    const badgeClass = methodColors[iface.method] || 'badge-gray';
    
    html += `
      <div onclick="selectInterface('${iface.method}', '${iface.path}')" style="padding: 0.75rem 1rem; cursor: pointer; border-bottom: 1px solid var(--gray-200); display: flex; align-items: center; gap: 0.75rem; transition: background 0.15s;" onmouseover="this.style.background='var(--gray-50)'" onmouseout="this.style.background='white'">
        <span class="badge ${badgeClass}" style="flex-shrink: 0;">${iface.method}</span>
        <span style="font-family: monospace; font-size: 0.875rem; color: var(--gray-700);">${iface.path}</span>
      </div>
    `;
  });
  
  dropdown.innerHTML = html;
}

function showInterfaceDropdown() {
  const dropdown = document.getElementById('interface-dropdown');
  if (dropdown) {
    dropdown.style.display = 'block';
  }
}

function handleInterfaceSearch(keyword) {
  const dropdown = document.getElementById('interface-dropdown');
  if (!dropdown) return;
  
  dropdown.style.display = 'block';
  
  if (!keyword.trim()) {
    renderInterfaceDropdown(allInterfaces);
    return;
  }
  
  const filtered = allInterfaces.filter(iface => 
    iface.path.toLowerCase().includes(keyword.toLowerCase()) ||
    iface.method.toLowerCase().includes(keyword.toLowerCase())
  );
  
  renderInterfaceDropdown(filtered);
}

function selectInterface(method, path) {
  const searchInput = document.getElementById('interface-search');
  const methodInput = document.getElementById('method-input');
  const urlInput = document.getElementById('url-input');
  const dropdown = document.getElementById('interface-dropdown');
  const noticeContainer = document.getElementById('path-params-notice');
  
  if (searchInput) searchInput.value = `${method} ${path}`;
  if (methodInput) methodInput.value = method;
  if (urlInput) urlInput.value = path;
  if (dropdown) dropdown.style.display = 'none';
  
  // 检查 URL 是否包含路径参数
  const paramMatches = path.match(/:[a-zA-Z_][a-zA-Z0-9_]*/g);
  if (paramMatches && noticeContainer) {
    const params = paramMatches.join('、');
    noticeContainer.innerHTML = `
      <div style="padding: 0.75rem 1rem; background: var(--warning-50); border-left: 3px solid var(--warning); border-radius: var(--radius-md); margin-bottom: 1rem;">
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <svg style="width: 1.25rem; height: 1.25rem; color: var(--warning-700); flex-shrink: 0;" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
          </svg>
          <div style="flex: 1;">
            <div style="color: var(--warning-700); font-weight: 600; font-size: 0.875rem; margin-bottom: 0.25rem;">检测到路径参数</div>
            <div style="color: var(--warning-600); font-size: 0.8125rem;">此接口包含路径参数 ${params}，请在上方 URL 输入框中手动替换为实际值</div>
          </div>
        </div>
      </div>
    `;
  } else if (noticeContainer) {
    noticeContainer.innerHTML = '';
  }
}

async function handleTestSubmit() {
  const methodInput = document.getElementById('method-input');
  const urlInput = document.getElementById('url-input');
  const headersTextarea = document.querySelector('[name="headers"]');
  const bodyTextarea = document.querySelector('[name="body"]');
  
  if (!methodInput.value || !urlInput.value) {
    window.toast.error('请先选择一个接口');
    return;
  }
  
  const testData = {
    method: methodInput.value,
    url: urlInput.value,
    headers: headersTextarea.value,
    body: bodyTextarea.value,
  };

  // 验证 JSON 格式
  let headers = {};
  if (testData.headers.trim()) {
    try {
      headers = JSON.parse(testData.headers);
    } catch (e) {
      window.toast.error('请求头 JSON 格式错误');
      return;
    }
  }

  let body = null;
  if (testData.body.trim() && testData.method !== 'GET') {
    try {
      body = JSON.parse(testData.body);
    } catch (e) {
      window.toast.error('请求体 JSON 格式错误');
      return;
    }
  }

  const resultContainer = document.getElementById('test-result');
  resultContainer.innerHTML = '<div class="loading-screen" style="padding: 2rem;"><div class="spinner"></div><p class="loading-text">请求中...</p></div>';

  try {
    const startTime = Date.now();
    
    const fetchOptions = {
      method: testData.method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    if (body && testData.method !== 'GET') {
      fetchOptions.body = JSON.stringify(body);
    }

    const response = await fetch(testData.url, fetchOptions);
    const endTime = Date.now();
    const duration = endTime - startTime;

    let responseData;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
    }

    // 显示结果
    const responseDataStr = typeof responseData === 'string' ? responseData : JSON.stringify(responseData, null, 2);
    
    resultContainer.innerHTML = `
      <div style="margin-bottom: 1rem; padding: 1rem; background: ${response.ok ? 'var(--primary-50)' : '#fee2e2'}; border-radius: var(--radius-lg); border: 1px solid ${response.ok ? 'var(--primary-200)' : '#fca5a5'};">
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.5rem;">
          <div style="display: flex; align-items: center; gap: 1rem;">
            <span style="font-weight: 700; color: ${response.ok ? 'var(--primary-700)' : 'var(--danger)'};">状态: ${response.status} ${response.statusText}</span>
            <span style="font-size: 0.875rem; color: var(--gray-700);">耗时: ${duration}ms</span>
          </div>
          <button class="btn btn-sm btn-secondary" onclick="copyResponseData()">
            <svg style="width: 1rem; height: 1rem;" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
            </svg>
            复制响应
          </button>
        </div>
      </div>
      
      <div style="margin-bottom: 1rem;">
        <strong style="color: var(--gray-700); font-size: 0.875rem;">响应头:</strong>
        <div style="margin-top: 0.5rem; background: var(--gray-50); padding: 0.75rem; border-radius: var(--radius-md); font-size: 0.8125rem; font-family: monospace;">
          ${Array.from(response.headers.entries()).map(([key, value]) => `<div>${key}: ${value}</div>`).join('')}
        </div>
      </div>
      
      <div>
        <strong style="color: var(--gray-700); font-size: 0.875rem;">响应数据:</strong>
        <div id="response-data" style="margin-top: 0.5rem; background: var(--gray-900); color: #f1f5f9; padding: 1.25rem; border-radius: var(--radius-lg); overflow-x: auto; font-family: monospace; font-size: 0.875rem; max-height: 400px;">
          <pre style="margin: 0;">${responseDataStr}</pre>
        </div>
      </div>
    `;

    window.toast.success(`请求成功 (${duration}ms)`);
  } catch (error) {
    resultContainer.innerHTML = `
      <div class="empty-state">
        <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="color: var(--danger);">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <p class="empty-title" style="color: var(--danger);">请求失败</p>
        <p class="empty-text">${error.message}</p>
      </div>
    `;
    window.toast.error(`请求失败: ${error.message}`);
  }
}

function clearTestForm() {
  const searchInput = document.getElementById('interface-search');
  const methodInput = document.getElementById('method-input');
  const urlInput = document.getElementById('url-input');
  const headersTextarea = document.querySelector('[name="headers"]');
  const bodyTextarea = document.querySelector('[name="body"]');
  const noticeContainer = document.getElementById('path-params-notice');
  
  if (searchInput) searchInput.value = '';
  if (methodInput) methodInput.value = '';
  if (urlInput) urlInput.value = '';
  if (headersTextarea) headersTextarea.value = '{}';
  if (bodyTextarea) bodyTextarea.value = '';
  if (noticeContainer) noticeContainer.innerHTML = '';
  
  window.toast.info('表单已清空');
}

function copyResponseData() {
  const responseDataEl = document.getElementById('response-data');
  if (!responseDataEl) {
    window.toast.error('没有可复制的响应数据');
    return;
  }
  
  const pre = responseDataEl.querySelector('pre');
  if (!pre) {
    window.toast.error('没有可复制的响应数据');
    return;
  }
  
  const text = pre.textContent;
  
  navigator.clipboard.writeText(text).then(() => {
    window.toast.success('响应数据已复制到剪贴板');
  }).catch(() => {
    window.toast.error('复制失败');
  });
}

