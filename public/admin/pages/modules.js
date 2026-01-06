// ============================================
// 模块管理页面
// ============================================

let currentModules = [];

async function renderModules(container) {
  container.innerHTML = `
    <div class="loading-screen">
      <div class="spinner"></div>
      <p class="loading-text">加载模块列表...</p>
    </div>
  `;

  try {
    await loadModules();
    displayModules(container);
  } catch (error) {
    container.innerHTML = `
      <div class="empty-state">
        <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="color: var(--danger);">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <p class="empty-title" style="color: var(--danger);">加载失败</p>
        <p class="empty-text">${error.message}</p>
        <button onclick="renderModules(document.getElementById('content'))" class="btn btn-primary" style="margin-top: 1rem;">重试</button>
      </div>
    `;
  }
}

async function loadModules() {
  const response = await api.get('/modules');
  currentModules = response.data || [];
}

function displayModules(container) {
  container.innerHTML = `
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">模块列表</h3>
        <p style="font-size: 0.875rem; color: var(--gray-600); margin: 0;">从 src/generated 目录自动加载的模块</p>
      </div>
      <div class="card-body">
        ${currentModules.length > 0 ? renderModulesTable(currentModules) : `
          <div class="empty-state">
            <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
            </svg>
            <p class="empty-title">还没有模块</p>
            <p class="empty-text">请在 src/generated 目录中创建模块</p>
          </div>
        `}
      </div>
    </div>
  `;
}

function renderModulesTable(modules) {
  // 直接生成 HTML，不使用 Table 组件
  let html = '<div class="table-container"><table class="table"><thead><tr>';
  
  // 表头
  html += '<th>模块名称</th>';
  html += '<th>文件数</th>';
  html += '<th>大小</th>';
  html += '<th>状态</th>';
  html += '<th>创建时间</th>';
  html += '<th>操作</th>';
  html += '</tr></thead><tbody>';
  
  modules.forEach((module, index) => {
    html += '<tr>';
    
    // 模块名称
    html += `<td>${module.name}</td>`;
    
    // 文件数
    html += `<td>${module.files?.length || 0}</td>`;
    
    // 大小
    html += `<td>${Math.round((module.size || 0) / 1024)} KB</td>`;
    
    // 状态
    const statusBadge = module.hasPrompt 
      ? '<span class="badge badge-success">已配置</span>' 
      : '<span class="badge badge-warning">待配置</span>';
    html += `<td>${statusBadge}</td>`;
    
    // 创建时间
    const timeStr = module.createdAt ? new Date(module.createdAt).toLocaleString() : '-';
    html += `<td>${timeStr}</td>`;
    
    // 操作
    html += `<td><div style="display: flex; gap: 0.5rem;">`;
    html += `<button class="btn btn-sm btn-secondary" onclick="viewModule(${index})">查看</button>`;
    html += `<button class="btn btn-sm btn-danger" onclick="deleteModule(${index})">删除</button>`;
    html += `</div></td>`;
    
    html += '</tr>';
  });
  
  html += '</tbody></table></div>';
  
  return html;
}

async function deleteModule(index) {
  const module = currentModules[index];
  if (!module) return;
  
  const content = `
    <div style="display: flex; flex-direction: column; gap: 1rem;">
      <div style="padding: 1rem; background: var(--danger-50); border-left: 4px solid var(--danger); border-radius: var(--radius-md);">
        <div style="display: flex; align-items: start; gap: 0.75rem;">
          <svg style="width: 1.5rem; height: 1.5rem; color: var(--danger); flex-shrink: 0;" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
          </svg>
          <div>
            <div style="font-weight: 600; color: var(--danger); margin-bottom: 0.25rem;">危险操作警告</div>
            <div style="font-size: 0.875rem; color: var(--gray-700);">此操作将永久删除该模块的所有文件和关联数据，且不可恢复！</div>
          </div>
        </div>
      </div>
      
      <div>
        <div style="font-weight: 600; margin-bottom: 0.5rem;">即将删除的内容：</div>
        <ul style="list-style: none; padding: 0; margin: 0; font-size: 0.875rem; color: var(--gray-700);">
          <li style="padding: 0.5rem; background: var(--gray-50); border-radius: var(--radius-sm); margin-bottom: 0.5rem;">
            📁 目录：<code style="font-family: monospace; color: var(--primary-600);">src/generated/${module.name}</code>
          </li>
          <li style="padding: 0.5rem; background: var(--gray-50); border-radius: var(--radius-sm); margin-bottom: 0.5rem;">
            📄 文件数：<strong>${module.files?.length || 0}</strong> 个
          </li>
          <li style="padding: 0.5rem; background: var(--gray-50); border-radius: var(--radius-sm);">
            🗄️ 数据表：该模块创建的所有数据表及其数据
          </li>
        </ul>
      </div>
      
      <div style="padding: 1rem; background: var(--gray-100); border-radius: var(--radius-md); font-size: 0.875rem; color: var(--gray-700);">
        <strong>注意：</strong>仅删除该模块自己创建的数据表，不会影响其他模块或公共数据表。
      </div>
      
      <div style="font-size: 0.875rem; color: var(--gray-600);">
        确定要删除模块 <strong style="color: var(--danger);">"${module.name}"</strong> 吗？
      </div>
    </div>
  `;
  
  window.modal.open({
    title: '⚠️ 确认删除模块',
    content,
    confirmText: '确认删除',
    cancelText: '取消',
    showCancel: true,
    size: 'large',
    onConfirm: async () => {
      try {
        const result = await api.delete(`/modules/${module.name}`);
        const deletedCount = result.data?.tableCount || 0;
        window.toast.success(`模块删除成功${deletedCount > 0 ? `，已删除 ${deletedCount} 个数据表` : ''}`);
        renderModules(document.getElementById('content'));
      } catch (error) {
        window.toast.error(`删除失败: ${error.message}`);
      }
    }
  });
}

async function viewModule(index) {
  const module = currentModules[index];
  if (!module) return;

  try {
    const response = await api.get(`/modules/${module.name}`);
    const detail = response.data;

    let filesHtml = '<div style="display: flex; flex-direction: column; gap: 0.5rem;">';
    if (detail.files && detail.files.length > 0) {
      detail.files.forEach(file => {
        const sizeKB = Math.round(file.size / 1024);
        const modifiedDate = new Date(file.modified).toLocaleString();
        filesHtml += `
          <div style="padding: 0.75rem; background: var(--gray-50); border-radius: var(--radius-md); display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-weight: 500; font-family: monospace; font-size: 0.875rem;">${file.name}</div>
              <div style="font-size: 0.75rem; color: var(--gray-600); margin-top: 0.25rem;">修改时间: ${modifiedDate}</div>
            </div>
            <div style="font-size: 0.875rem; color: var(--gray-600);">${sizeKB} KB</div>
          </div>
        `;
      });
    } else {
      filesHtml += '<p style="color: var(--gray-500);">暂无文件</p>';
    }
    filesHtml += '</div>';

    const content = `
      <div style="display: flex; flex-direction: column; gap: 1.5rem;">
        <div>
          <h4 style="font-size: 0.9375rem; font-weight: 600; margin-bottom: 0.75rem; color: var(--gray-900);">模块信息</h4>
          <div style="background: var(--gray-50); padding: 1rem; border-radius: var(--radius-md);">
            <div style="display: grid; grid-template-columns: auto 1fr; gap: 0.75rem; font-size: 0.875rem;">
              <div style="color: var(--gray-600);">模块名称:</div>
              <div style="font-weight: 500;">${module.name}</div>
              
              <div style="color: var(--gray-600);">文件数量:</div>
              <div>${module.files?.length || 0} 个</div>
              
              <div style="color: var(--gray-600);">模块大小:</div>
              <div>${Math.round((module.size || 0) / 1024)} KB</div>
              
              <div style="color: var(--gray-600);">创建时间:</div>
              <div>${module.createdAt ? new Date(module.createdAt).toLocaleString() : '-'}</div>
              
              <div style="color: var(--gray-600);">配置状态:</div>
              <div>${module.hasPrompt ? '<span class="badge badge-success">已配置</span>' : '<span class="badge badge-warning">待配置</span>'}</div>
            </div>
          </div>
        </div>

        <div>
          <h4 style="font-size: 0.9375rem; font-weight: 600; margin-bottom: 0.75rem; color: var(--gray-900);">文件列表</h4>
          ${filesHtml}
        </div>

        ${detail.prompt ? `
          <div>
            <h4 style="font-size: 0.9375rem; font-weight: 600; margin-bottom: 0.75rem; color: var(--gray-900);">模块提示词 (.prompt.md)</h4>
            <div style="background: var(--gray-900); color: #e5e7eb; padding: 1rem; border-radius: var(--radius-md); overflow-x: auto; max-height: 400px; font-family: monospace; font-size: 0.8125rem; line-height: 1.6;">
              <pre style="margin: 0; white-space: pre-wrap;">${detail.prompt}</pre>
            </div>
          </div>
        ` : ''}
      </div>
    `;

    window.modal.open({
      title: `模块详情: ${module.name}`,
      content,
      confirmText: '关闭',
      showCancel: false,
      size: 'large',
    });
  } catch (error) {
    window.toast.error(`获取模块详情失败: ${error.message}`);
  }
}


