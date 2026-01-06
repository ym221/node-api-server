// ============================================
// 场景管理页面
// ============================================

let currentScenarios = [];
let scenarioFilters = {
  name: '',
};

async function renderScenarios(container) {
  container.innerHTML = `
    <div class="loading-screen">
      <div class="spinner"></div>
      <p class="loading-text">加载场景列表...</p>
    </div>
  `;

  try {
    const response = await api.get('/scenarios');
    currentScenarios = response.data || [];
    displayScenariosPage(container);
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

function displayScenariosPage(container) {
  // 应用筛选
  const filteredScenarios = applyScenarioFilters(currentScenarios);

  container.innerHTML = `
    <!-- 筛选栏 -->
    <div style="background: white; border-radius: var(--radius-lg); padding: 0.625rem 1rem; box-shadow: var(--shadow-sm); border: 1px solid var(--gray-200); margin-bottom: 1rem;">
      <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; justify-content: space-between;">
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <input type="text" id="filter-name" class="form-input" placeholder="搜索场景名称..." value="${scenarioFilters.name}" style="width: 200px; height: 32px; padding: 0.375rem 0.75rem; font-size: 0.875rem;">
          
          <button class="btn btn-sm" onclick="resetScenarioFilters()" style="height: 32px; padding: 0 0.875rem; font-size: 0.875rem; background: var(--gray-100); color: var(--gray-700); border: 1px solid var(--gray-300);">
            <svg style="width: 0.875rem; height: 0.875rem;" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
            重置
          </button>

          <button class="btn btn-sm" onclick="refreshScenarios()" style="height: 32px; padding: 0 0.875rem; font-size: 0.875rem; background: var(--gray-100); color: var(--gray-700); border: 1px solid var(--gray-300);">
            <svg style="width: 0.875rem; height: 0.875rem;" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
            刷新
          </button>
        </div>

        <button class="btn btn-primary" onclick="showCreateScenarioDialog()">
          <svg style="width: 1rem; height: 1rem;" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
          </svg>
          新建场景
        </button>
      </div>
    </div>

    <!-- 场景列表 -->
    <div style="background: white; border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); border: 1px solid var(--gray-200); overflow: hidden;">
      ${filteredScenarios.length > 0 ? renderScenariosTable(filteredScenarios) : `
        <div class="empty-state">
          <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/>
          </svg>
          <p class="empty-title">无匹配结果</p>
          <p class="empty-text">尝试调整筛选条件</p>
        </div>
      `}
    </div>
  `;

  // 绑定筛选事件
  attachScenarioFilterEvents();
}

function renderScenariosTable(scenarios) {
  return `
    <div style="overflow-x: auto;">
      <table class="table" style="width: 100%;">
        <thead>
          <tr>
            <th style="width: 140px; max-width: 140px;">场景名称</th>
            <th style="width: 180px; max-width: 180px;">描述</th>
            <th style="width: 200px; max-width: 200px;">配置</th>
            <th style="width: 100px; min-width: 100px; text-align: center;">状态</th>
            <th style="width: 100px; min-width: 100px; text-align: center;">类型</th>
            <th style="width: 280px; min-width: 280px; text-align: right;">操作</th>
          </tr>
        </thead>
        <tbody>
          ${scenarios.map(scenario => {
            // 检查是否为预设场景（前5个）
            const isPreset = ['ideal', 'slow', 'fast', 'unstable', 'slow_unstable'].includes(scenario.id);
            
            // 检查 config 是否有有效内容
            const configItems = [];
            if (scenario.config?.delay) configItems.push(`延迟: ${scenario.config.delay}ms`);
            if (scenario.config?.randomDelay) configItems.push(`随机延迟: ${scenario.config.randomDelay.min}-${scenario.config.randomDelay.max}ms`);
            if (scenario.config?.errorRate) configItems.push(`错误率: ${(scenario.config.errorRate * 100).toFixed(0)}%`);
            if (scenario.config?.timeout) configItems.push(`超时: ${scenario.config.timeout}ms`);
            const configText = configItems.length > 0 ? configItems.join('、') : '-';
            
            return `
              <tr>
                <td style="max-width: 140px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${scenario.name}">
                  <span style="font-weight: 600; color: var(--gray-900);">${scenario.name}</span>
                </td>
                <td style="max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${scenario.description || '-'}">
                  <span style="color: var(--gray-600); font-size: 0.875rem;">${scenario.description || '-'}</span>
                </td>
                <td style="max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${configText}">
                  <span style="color: var(--gray-600); font-size: 0.8125rem;">${configText}</span>
                </td>
                <td style="text-align: center;">
                  <span class="badge ${scenario.enabled !== false ? 'badge-success' : 'badge-secondary'}">${scenario.enabled !== false ? '已启用' : '已禁用'}</span>
                </td>
                <td style="text-align: center;">
                  <span class="badge ${isPreset ? 'badge-info' : 'badge-gray'}">${isPreset ? '预设' : '自定义'}</span>
                </td>
                <td style="text-align: right;">
                  <div style="display: flex; gap: 0.5rem; justify-content: flex-end; flex-wrap: nowrap;">
                    <button class="btn btn-sm ${scenario.enabled !== false ? 'btn-secondary' : 'btn-success'}" style="white-space: nowrap; flex-shrink: 0;" onclick="toggleScenario('${scenario.id}')">${scenario.enabled !== false ? '禁用' : '启用'}</button>
                    ${isPreset 
                      ? `<button class="btn btn-sm btn-primary" style="white-space: nowrap; flex-shrink: 0;" onclick="viewPresetScenario('${scenario.id}')">查看</button>`
                      : `<button class="btn btn-sm btn-primary" style="white-space: nowrap; flex-shrink: 0;" onclick="editScenario('${scenario.id}')">编辑</button>
                         <button class="btn btn-sm btn-danger" style="white-space: nowrap; flex-shrink: 0;" onclick="deleteScenario('${scenario.id}')">删除</button>`
                    }
                  </div>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function applyScenarioFilters(scenarios) {
  return scenarios.filter(scenario => {
    // 名称筛选
    if (scenarioFilters.name && !scenario.name.toLowerCase().includes(scenarioFilters.name.toLowerCase())) {
      return false;
    }
    return true;
  });
}

function attachScenarioFilterEvents() {
  const nameInput = document.getElementById('filter-name');
  
  if (nameInput) {
    nameInput.addEventListener('input', () => {
      scenarioFilters.name = nameInput.value;
      updateScenarioView();
    });
  }
}

function updateScenarioView() {
  const container = document.getElementById('content');
  displayScenariosPage(container);
}

function resetScenarioFilters() {
  scenarioFilters.name = '';
  updateScenarioView();
}

async function refreshScenarios() {
  const container = document.getElementById('content');
  await renderScenarios(container);
}

function showCreateScenarioDialog() {
  window.modal.form({
    title: '新建测试场景',
    fields: [
      { name: 'name', label: '场景名称', type: 'text', required: true, placeholder: '例如: 网络延迟场景' },
      { name: 'description', label: '场景描述', type: 'textarea', placeholder: '简要描述这个场景' },
      { 
        name: 'delayType', 
        label: '延迟类型', 
        type: 'select', 
        options: [
          { value: '', label: '无延迟' },
          { value: 'fixed', label: '固定延迟' },
          { value: 'random', label: '随机延迟' },
        ]
      },
      { name: 'delay', label: '固定延迟(ms)', type: 'number', placeholder: '例如: 1000' },
      { name: 'delayMin', label: '最小延迟(ms)', type: 'number', placeholder: '例如: 100' },
      { name: 'delayMax', label: '最大延迟(ms)', type: 'number', placeholder: '例如: 3000' },
      { name: 'errorRate', label: '错误率(%)', type: 'number', placeholder: '0-100，例如: 30 表示30%错误率' },
      { name: 'timeout', label: '超时时间(ms)', type: 'number', placeholder: '例如: 5000' },
    ],
    onOpen: () => {
      // 延迟类型切换逻辑
      const delayTypeSelect = document.querySelector('select[name="delayType"]');
      const delayField = document.querySelector('input[name="delay"]')?.closest('.form-group');
      const delayMinField = document.querySelector('input[name="delayMin"]')?.closest('.form-group');
      const delayMaxField = document.querySelector('input[name="delayMax"]')?.closest('.form-group');
      
      function updateDelayFields() {
        const delayType = delayTypeSelect?.value;
        if (delayField) delayField.style.display = delayType === 'fixed' ? 'block' : 'none';
        if (delayMinField) delayMinField.style.display = delayType === 'random' ? 'block' : 'none';
        if (delayMaxField) delayMaxField.style.display = delayType === 'random' ? 'block' : 'none';
      }
      
      if (delayTypeSelect) {
        delayTypeSelect.addEventListener('change', updateDelayFields);
        updateDelayFields(); // 初始化显示状态
      }
    },
    onSubmit: async (data) => {
      try {
        // 表单校验
        if (!data.name || !data.name.trim()) {
          window.toast.error('请输入场景名称');
          return false;
        }

        const scenarioData = {
          name: data.name.trim(),
          description: data.description ? data.description.trim() : '',
          config: {},
        };
        
        // 处理延迟配置
        if (data.delayType === 'fixed') {
          if (!data.delay) {
            window.toast.error('请输入固定延迟时间');
            return false;
          }
          const delay = parseInt(data.delay);
          if (isNaN(delay) || delay < 0) {
            window.toast.error('延迟时间必须是非负整数');
            return false;
          }
          if (delay > 60000) {
            window.toast.error('延迟时间不能超过60秒（60000ms）');
            return false;
          }
          scenarioData.config.delay = delay;
        } else if (data.delayType === 'random') {
          if (!data.delayMin || !data.delayMax) {
            window.toast.error('请输入最小和最大延迟时间');
            return false;
          }
          const min = parseInt(data.delayMin);
          const max = parseInt(data.delayMax);
          if (isNaN(min) || isNaN(max) || min < 0 || max < 0) {
            window.toast.error('延迟时间必须是非负整数');
            return false;
          }
          if (min >= max) {
            window.toast.error('最大延迟必须大于最小延迟');
            return false;
          }
          if (max > 60000) {
            window.toast.error('延迟时间不能超过60秒（60000ms）');
            return false;
          }
          scenarioData.config.randomDelay = { min, max };
        }

        // 转换和验证错误率
        if (data.errorRate) {
          const rate = parseInt(data.errorRate);
          if (isNaN(rate) || rate < 0 || rate > 100) {
            window.toast.error('错误率必须在 0-100 之间');
            return false;
          }
          scenarioData.config.errorRate = rate / 100;
          scenarioData.config.errorType = 'random';
        }

        // 转换和验证超时时间
        if (data.timeout) {
          const timeout = parseInt(data.timeout);
          if (isNaN(timeout) || timeout < 0) {
            window.toast.error('超时时间必须是非负整数');
            return false;
          }
          if (timeout > 300000) {
            window.toast.error('超时时间不能超过5分钟（300000ms）');
            return false;
          }
          scenarioData.config.timeout = timeout;
        }

        // 检查是否至少设置了一个配置项
        if (!scenarioData.config.delay && !scenarioData.config.randomDelay && !scenarioData.config.errorRate && !scenarioData.config.timeout) {
          window.toast.error('请至少设置一个配置项');
          return false;
        }

        await api.post('/scenarios', scenarioData);
        window.toast.success('场景创建成功');
        renderScenarios(document.getElementById('content'));
        return true;
      } catch (error) {
        window.toast.error(`创建失败: ${error.message}`);
        return false;
      }
    },
  });
}

async function toggleScenario(scenarioId) {
  const scenario = currentScenarios.find(s => s.id === scenarioId);
  if (!scenario) return;

  const newStatus = scenario.enabled === false ? true : false;
  const action = newStatus ? '启用' : '禁用';

  try {
    await api.put(`/scenarios/${scenarioId}`, { enabled: newStatus });
    window.toast.success(`场景已${action}`);
    renderScenarios(document.getElementById('content'));
  } catch (error) {
    window.toast.error(`操作失败: ${error.message}`);
  }
}

async function editScenario(scenarioId) {
  const scenario = currentScenarios.find(s => s.id === scenarioId);
  if (!scenario) return;

  // 检查是否为预设场景
  const isPreset = ['ideal', 'slow', 'fast', 'unstable', 'slow_unstable'].includes(scenarioId);
  
  if (isPreset) {
    window.toast.warning('预设场景仅可修改启用状态，不可修改其他属性');
    return;
  }

  // 转换错误率：后端存储的是小数（0-1），前端显示为百分比（0-100）
  const errorRatePercent = scenario.config?.errorRate ? Math.round(scenario.config.errorRate * 100) : '';
  
  // 判断延迟类型
  let delayType = '';
  if (scenario.config?.delay) {
    delayType = 'fixed';
  } else if (scenario.config?.randomDelay) {
    delayType = 'random';
  }

  window.modal.form({
    title: `编辑场景: ${scenario.name}`,
    fields: [
      { name: 'name', label: '场景名称', type: 'text', required: true, value: scenario.name, placeholder: '例如: 网络延迟场景' },
      { name: 'description', label: '场景描述', type: 'textarea', value: scenario.description || '', placeholder: '简要描述这个场景' },
      { 
        name: 'delayType', 
        label: '延迟类型', 
        type: 'select',
        value: delayType,
        options: [
          { value: '', label: '无延迟' },
          { value: 'fixed', label: '固定延迟' },
          { value: 'random', label: '随机延迟' },
        ]
      },
      { name: 'delay', label: '固定延迟(ms)', type: 'number', value: scenario.config?.delay || '', placeholder: '例如: 1000' },
      { name: 'delayMin', label: '最小延迟(ms)', type: 'number', value: scenario.config?.randomDelay?.min || '', placeholder: '例如: 100' },
      { name: 'delayMax', label: '最大延迟(ms)', type: 'number', value: scenario.config?.randomDelay?.max || '', placeholder: '例如: 3000' },
      { name: 'errorRate', label: '错误率(%)', type: 'number', value: errorRatePercent, placeholder: '0-100' },
      { name: 'timeout', label: '超时时间(ms)', type: 'number', value: scenario.config?.timeout || '', placeholder: '例如: 5000' },
    ],
    onOpen: () => {
      // 延迟类型切换逻辑
      const delayTypeSelect = document.querySelector('select[name="delayType"]');
      const delayField = document.querySelector('input[name="delay"]')?.closest('.form-group');
      const delayMinField = document.querySelector('input[name="delayMin"]')?.closest('.form-group');
      const delayMaxField = document.querySelector('input[name="delayMax"]')?.closest('.form-group');
      
      function updateDelayFields() {
        const delayType = delayTypeSelect?.value;
        if (delayField) delayField.style.display = delayType === 'fixed' ? 'block' : 'none';
        if (delayMinField) delayMinField.style.display = delayType === 'random' ? 'block' : 'none';
        if (delayMaxField) delayMaxField.style.display = delayType === 'random' ? 'block' : 'none';
      }
      
      if (delayTypeSelect) {
        delayTypeSelect.addEventListener('change', updateDelayFields);
        updateDelayFields(); // 初始化显示状态
      }
    },
    onSubmit: async (data) => {
      try {
        // 表单校验
        if (!data.name || !data.name.trim()) {
          window.toast.error('请输入场景名称');
          return false;
        }

        const scenarioData = {
          name: data.name.trim(),
          description: data.description ? data.description.trim() : '',
          config: {},
        };
        
        // 处理延迟配置
        if (data.delayType === 'fixed') {
          if (!data.delay) {
            window.toast.error('请输入固定延迟时间');
            return false;
          }
          const delay = parseInt(data.delay);
          if (isNaN(delay) || delay < 0) {
            window.toast.error('延迟时间必须是非负整数');
            return false;
          }
          if (delay > 60000) {
            window.toast.error('延迟时间不能超过60秒（60000ms）');
            return false;
          }
          scenarioData.config.delay = delay;
        } else if (data.delayType === 'random') {
          if (!data.delayMin || !data.delayMax) {
            window.toast.error('请输入最小和最大延迟时间');
            return false;
          }
          const min = parseInt(data.delayMin);
          const max = parseInt(data.delayMax);
          if (isNaN(min) || isNaN(max) || min < 0 || max < 0) {
            window.toast.error('延迟时间必须是非负整数');
            return false;
          }
          if (min >= max) {
            window.toast.error('最大延迟必须大于最小延迟');
            return false;
          }
          if (max > 60000) {
            window.toast.error('延迟时间不能超过60秒（60000ms）');
            return false;
          }
          scenarioData.config.randomDelay = { min, max };
        }

        // 转换和验证错误率
        if (data.errorRate) {
          const rate = parseInt(data.errorRate);
          if (isNaN(rate) || rate < 0 || rate > 100) {
            window.toast.error('错误率必须在 0-100 之间');
            return false;
          }
          scenarioData.config.errorRate = rate / 100;
          scenarioData.config.errorType = 'random';
        }

        // 转换和验证超时时间
        if (data.timeout) {
          const timeout = parseInt(data.timeout);
          if (isNaN(timeout) || timeout < 0) {
            window.toast.error('超时时间必须是非负整数');
            return false;
          }
          if (timeout > 300000) {
            window.toast.error('超时时间不能超过5分钟（300000ms）');
            return false;
          }
          scenarioData.config.timeout = timeout;
        }

        // 检查是否至少设置了一个配置项
        if (!scenarioData.config.delay && !scenarioData.config.randomDelay && !scenarioData.config.errorRate && !scenarioData.config.timeout) {
          window.toast.error('请至少设置一个配置项');
          return false;
        }

        await api.put(`/scenarios/${scenarioId}`, scenarioData);
        window.toast.success('场景更新成功');
        renderScenarios(document.getElementById('content'));
        return true;
      } catch (error) {
        window.toast.error(`更新失败: ${error.message}`);
        return false;
      }
    },
  });
}

async function deleteScenario(scenarioId) {
  // 检查是否为预设场景
  const isPreset = ['ideal', 'slow', 'fast', 'unstable', 'slow_unstable'].includes(scenarioId);
  
  if (isPreset) {
    window.toast.error('预设场景不可删除');
    return;
  }

  const scenario = currentScenarios.find(s => s.id === scenarioId);
  if (!scenario) return;

  window.modal.confirm(
    `确定要删除场景 "${scenario.name}" 吗？此操作不可恢复！`,
    async () => {
      try {
        await api.delete(`/scenarios/${scenarioId}`);
        window.toast.success('场景删除成功');
        renderScenarios(document.getElementById('content'));
      } catch (error) {
        window.toast.error(`删除失败: ${error.message}`);
      }
    }
  );
}

// 查看预设场景
function viewPresetScenario(scenarioId) {
  const scenario = currentScenarios.find(s => s.id === scenarioId);
  if (!scenario) return;

  // 构建配置信息展示
  const configItems = [];
  if (scenario.config?.delay) configItems.push(`<li>固定延迟: ${scenario.config.delay}ms</li>`);
  if (scenario.config?.randomDelay) configItems.push(`<li>随机延迟: ${scenario.config.randomDelay.min}-${scenario.config.randomDelay.max}ms</li>`);
  if (scenario.config?.errorRate) configItems.push(`<li>错误率: ${(scenario.config.errorRate * 100).toFixed(0)}%</li>`);
  if (scenario.config?.timeout) configItems.push(`<li>超时时间: ${scenario.config.timeout}ms</li>`);
  
  const content = `
    <div style="padding: 1rem;">
      <div style="margin-bottom: 1rem;">
        <label style="font-weight: 600; color: var(--gray-700); display: block; margin-bottom: 0.5rem;">场景名称</label>
        <p style="color: var(--gray-900); margin: 0;">${scenario.name}</p>
      </div>
      
      <div style="margin-bottom: 1rem;">
        <label style="font-weight: 600; color: var(--gray-700); display: block; margin-bottom: 0.5rem;">描述</label>
        <p style="color: var(--gray-600); margin: 0;">${scenario.description || '无'}</p>
      </div>
      
      <div style="margin-bottom: 1rem;">
        <label style="font-weight: 600; color: var(--gray-700); display: block; margin-bottom: 0.5rem;">状态</label>
        <span class="badge ${scenario.enabled !== false ? 'badge-success' : 'badge-secondary'}">${scenario.enabled !== false ? '已启用' : '已禁用'}</span>
      </div>
      
      ${configItems.length > 0 ? `
        <div>
          <label style="font-weight: 600; color: var(--gray-700); display: block; margin-bottom: 0.5rem;">配置详情</label>
          <ul style="margin: 0; padding-left: 1.5rem; color: var(--gray-700);">
            ${configItems.join('')}
          </ul>
        </div>
      ` : ''}
      
      <div style="margin-top: 1.5rem; padding: 1rem; background: var(--warning-50); border-left: 3px solid var(--warning); border-radius: var(--radius-sm);">
        <p style="margin: 0; color: var(--warning-700); font-size: 0.875rem;">
          <strong>注意：</strong> 预设场景不可修改配置，只能修改启用状态。如需自定义配置，请创建新的场景。
        </p>
      </div>
    </div>
  `;

  window.modal.open({
    title: `查看预设场景: ${scenario.name}`,
    content,
    confirmText: '关闭',
    showCancel: false,
  });
}

