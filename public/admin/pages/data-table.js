// ============================================
// 单独数据表页面 (用于新标签页打开)
// ============================================

let fullPageTableData = {
  tableName: '',
  columns: [],
  rows: [],
  total: 0,
  page: 1,
  pageSize: 10
};
let fullPageTableStructure = {};
let fullPageSelectedRows = new Set();

async function renderDataTablePage(container, tableName) {
  fullPageTableData.tableName = tableName;
  
  container.innerHTML = `
    <div class="page-header">
      <div style="display: flex; align-items: center; gap: 1rem;">
        <button class="btn btn-secondary" onclick="window.history.back()" style="display: flex; align-items: center; gap: 0.5rem;">
          <svg style="width: 1rem; height: 1rem;" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
          返回
        </button>
        <h1 class="page-title">数据表: ${tableName}</h1>
      </div>
    </div>
    <div id="full-page-table-content"></div>
  `;

  await loadFullPageTableData(1, '', '');
}

async function loadFullPageTableData(page = 1, searchField = '', searchValue = '') {
  const contentEl = document.getElementById('full-page-table-content');
  if (!contentEl) return;

  contentEl.innerHTML = `
    <div class="loading-screen">
      <div class="spinner"></div>
      <p class="loading-text">加载数据中...</p>
    </div>
  `;

  try {
    const { tableName } = fullPageTableData;

    // 获取表结构
    if (!fullPageTableStructure[tableName]) {
      const structureRes = await api.get(`/tables/${tableName}/structure`);
      fullPageTableStructure[tableName] = structureRes.data;
    }

    // 构建查询参数
    let queryParams = `page=${page}&pageSize=10`;
    if (searchField && searchValue) {
      queryParams += `&${searchField}=${encodeURIComponent(searchValue)}`;
    }

    // 获取数据
    const response = await api.get(`/tables/${tableName}/data?${queryParams}`);
    const data = response.data?.list || response.data || [];
    const pagination = response.data?.pagination || { total: data.length, page: 1, pageSize: 10 };

    fullPageTableData = {
      tableName,
      columns: data.length > 0 ? Object.keys(data[0]) : [],
      rows: data,
      total: pagination.total,
      page: pagination.page || page,
      pageSize: pagination.pageSize || 10,
      searchField,
      searchValue
    };

    fullPageSelectedRows.clear();
    renderFullPageTable();
  } catch (error) {
    contentEl.innerHTML = `
      <div class="empty-state">
        <p class="empty-title">加载失败</p>
        <p class="empty-text">${error.message}</p>
      </div>
    `;
  }
}

function renderFullPageTable() {
  const contentEl = document.getElementById('full-page-table-content');
  if (!contentEl) return;

  const { tableName, columns, rows, total, page, pageSize } = fullPageTableData;
  const totalPages = Math.ceil(total / pageSize);

  if (columns.length === 0) {
    contentEl.innerHTML = `
      <div class="empty-state">
        <p class="empty-title">表结构为空</p>
        <p class="empty-text">无法加载数据</p>
      </div>
    `;
    return;
  }

  // 操作栏
  const actionBarHTML = `
    <div class="card" style="margin-bottom: 1.5rem;">
      <div style="display: flex; gap: 0.75rem; align-items: center; flex-wrap: wrap; justify-content: space-between;">
        <div style="display: flex; gap: 0.5rem; align-items: center; flex: 1;">
          <select id="full-search-field" class="form-select" style="height: 36px; flex: 0 0 120px;">
            <option value="">选择字段</option>
            ${columns.map(col => `<option value="${col}" ${fullPageTableData.searchField === col ? 'selected' : ''}>${col}</option>`).join('')}
          </select>
          <input type="text" id="full-search-value" class="form-input" placeholder="输入查询值" value="${fullPageTableData.searchValue || ''}" style="height: 36px; width: 300px;">
          <button class="btn btn-sm btn-primary" onclick="performFullPageSearch()" style="height: 36px;">查询</button>
          <button class="btn btn-sm btn-secondary" onclick="resetFullPageSearch()" style="height: 36px;">重置</button>
          <button class="btn btn-sm btn-success" onclick="showFullPageAddForm()" style="height: 36px;">新增</button>
        </div>
        <div style="display: flex; gap: 0.5rem;">
          <button class="btn btn-sm btn-info" onclick="generateFullPageTableData()" style="height: 36px;">生成数据</button>
          <button class="btn btn-sm btn-danger" onclick="clearFullPageTableData()" style="height: 36px;">清空数据</button>
        </div>
      </div>
    </div>
  `;

  // 批量操作栏
  const batchActionsHTML = fullPageSelectedRows.size > 0 ? `
    <div class="card" style="background: var(--warning-50); border: 1px solid var(--warning-200); margin-bottom: 1.5rem;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span style="color: var(--warning-700); font-weight: 600;">已选择 ${fullPageSelectedRows.size} 条记录</span>
        <div style="display: flex; gap: 0.5rem;">
          <button class="btn btn-sm btn-danger" onclick="batchDeleteFullPageRows()">批量删除</button>
          <button class="btn btn-sm btn-secondary" onclick="clearFullPageSelection()">取消选择</button>
        </div>
      </div>
    </div>
  ` : '';

  // 表格
  let tableHTML = '';
  
  if (rows.length === 0) {
    tableHTML = `
      <div class="card">
        <div class="empty-state" style="padding: 3rem;">
          <p class="empty-title">暂无数据</p>
          <p class="empty-text">点击"新增"按钮添加数据，或点击"生成数据"生成测试数据</p>
        </div>
      </div>
    `;
  } else {
    tableHTML = '<div class="card"><div style="overflow-x: auto;"><table class="editable-table zebra-table"><thead><tr>';
    tableHTML += '<th style="width: 40px;"><input type="checkbox" id="full-select-all" onchange="toggleFullSelectAll(this.checked)"></th>';
    columns.forEach(col => {
      tableHTML += `<th class="fixed-cell">${col}</th>`;
    });
    tableHTML += '<th style="width: 100px;">操作</th>';
    tableHTML += '</tr></thead><tbody>';

    rows.forEach((row) => {
      const isSelected = fullPageSelectedRows.has(row.id);
      tableHTML += `<tr ${isSelected ? 'style="background: var(--warning-50);"' : ''}>`;
      tableHTML += `<td><input type="checkbox" ${isSelected ? 'checked' : ''} onchange="toggleFullSelectRow(${row.id}, this.checked)"></td>`;
      columns.forEach(col => {
        const value = row[col];
        const displayValue = value === null || value === undefined ? '-' : String(value);
        const truncatedValue = displayValue.length > 50 ? displayValue.substring(0, 50) + '...' : displayValue;
        tableHTML += `<td class="editable-cell fixed-cell" 
          data-row-id="${row.id}" 
          data-field="${col}" 
          data-value="${escapeHtml(displayValue)}"
          title="${escapeHtml(displayValue)}"
          onclick="editFullPageCell(this, ${row.id}, '${col}', '${escapeHtml(displayValue)}')">${escapeHtml(truncatedValue)}</td>`;
      });
      tableHTML += `<td><button class="btn btn-sm btn-danger" onclick="deleteFullPageSingleRow(${row.id})" style="font-size: 0.75rem; padding: 0.25rem 0.5rem;">删除</button></td>`;
      tableHTML += '</tr>';
    });

    tableHTML += '</tbody></table></div></div>';
  }

  // 分页
  const paginationHTML = total > 0 ? `
    <div class="card" style="margin-top: 1.5rem;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div style="font-size: 0.875rem; color: var(--gray-600);">
          共 ${total} 条记录，第 ${page} / ${totalPages} 页
        </div>
        <div style="display: flex; gap: 0.5rem;">
          <button class="btn btn-sm ${page === 1 ? 'btn-disabled' : 'btn-secondary'}" 
            onclick="changeFullPagePage(${page - 1})" 
            ${page === 1 ? 'disabled' : ''}>上一页</button>
          <button class="btn btn-sm ${page === totalPages ? 'btn-disabled' : 'btn-secondary'}" 
            onclick="changeFullPagePage(${page + 1})" 
            ${page === totalPages ? 'disabled' : ''}>下一页</button>
        </div>
      </div>
    </div>
  ` : '';

  contentEl.innerHTML = actionBarHTML + batchActionsHTML + tableHTML + paginationHTML;
}

// 全页表格的各种操作函数
function toggleFullSelectRow(rowId, checked) {
  if (checked) {
    fullPageSelectedRows.add(rowId);
  } else {
    fullPageSelectedRows.delete(rowId);
  }
  renderFullPageTable();
}

function toggleFullSelectAll(checked) {
  if (checked) {
    fullPageTableData.rows.forEach(row => fullPageSelectedRows.add(row.id));
  } else {
    fullPageSelectedRows.clear();
  }
  renderFullPageTable();
}

function clearFullPageSelection() {
  fullPageSelectedRows.clear();
  renderFullPageTable();
}

async function performFullPageSearch() {
  const searchField = document.getElementById('full-search-field').value;
  const searchValue = document.getElementById('full-search-value').value;
  
  if (!searchField) {
    window.toast.warning('请选择查询字段');
    return;
  }
  
  if (!searchValue) {
    window.toast.warning('请输入查询值');
    return;
  }
  
  await loadFullPageTableData(1, searchField, searchValue);
}

async function resetFullPageSearch() {
  await loadFullPageTableData(1, '', '');
}

async function changeFullPagePage(newPage) {
  if (newPage < 1 || newPage > Math.ceil(fullPageTableData.total / fullPageTableData.pageSize)) {
    return;
  }
  await loadFullPageTableData(newPage, fullPageTableData.searchField, fullPageTableData.searchValue);
}

function showFullPageAddForm() {
  const { tableName, columns } = fullPageTableData;
  const structure = fullPageTableStructure[tableName];
  
  const editableFields = columns.filter(col => 
    col !== 'id' && col !== 'created_at' && col !== 'updated_at'
  );

  let formHTML = '<div style="display: flex; flex-direction: column; gap: 0.75rem;">';
  
  editableFields.forEach(field => {
    const columnInfo = structure?.find(col => col.Field === field);
    const fieldType = columnInfo?.Type || '';
    const required = columnInfo?.Null === 'NO';
    
    formHTML += `<div class="form-group" style="margin: 0;">`;
    formHTML += `<label class="form-label">${field}${required ? ' *' : ''}</label>`;
    
    if (fieldType.includes('enum')) {
      const enumMatch = fieldType.match(/enum\((.*?)\)/);
      if (enumMatch) {
        const options = enumMatch[1].split(',').map(opt => opt.trim().replace(/'/g, ''));
        formHTML += `<select id="field-${field}" class="form-select">`;
        formHTML += `<option value="">请选择</option>`;
        options.forEach(opt => {
          formHTML += `<option value="${opt}">${opt}</option>`;
        });
        formHTML += `</select>`;
      }
    } else if (fieldType.includes('text')) {
      formHTML += `<textarea id="field-${field}" class="form-textarea"></textarea>`;
    } else {
      const inputType = fieldType.includes('int') || fieldType.includes('decimal') || fieldType.includes('float') ? 'number' : 'text';
      formHTML += `<input type="${inputType}" id="field-${field}" class="form-input">`;
    }
    
    formHTML += `</div>`;
  });
  
  formHTML += `</div>`;
  formHTML += `<div style="margin-top: 1rem;"><button class="btn btn-sm btn-secondary" onclick="autoFillFullPageForm()">一键填充</button></div>`;

  window.modal.open({
    title: `新增数据 - ${tableName}`,
    content: formHTML,
    confirmText: '提交',
    cancelText: '取消',
    showCancel: true,
    onConfirm: async () => {
      const data = {};
      editableFields.forEach(field => {
        const element = document.getElementById(`field-${field}`);
        if (element) {
          data[field] = element.value;
        }
      });
      
      try {
        await api.post(`/tables/${tableName}/data`, data);
        window.toast.success('新增成功');
        await loadFullPageTableData(fullPageTableData.page, fullPageTableData.searchField, fullPageTableData.searchValue);
        return true;
      } catch (error) {
        window.toast.error(`新增失败: ${error.message}`);
        return false;
      }
    }
  });
}

function autoFillFullPageForm() {
  const { tableName, columns } = fullPageTableData;
  const structure = fullPageTableStructure[tableName];
  
  columns.forEach(field => {
    if (field === 'id' || field === 'created_at' || field === 'updated_at') return;
    
    const element = document.getElementById(`field-${field}`);
    if (!element) return;
    
    const columnInfo = structure?.find(col => col.Field === field);
    const fieldType = columnInfo?.Type || '';
    
    if (element.tagName === 'SELECT') {
      const options = Array.from(element.options).filter(opt => opt.value);
      if (options.length > 0) {
        element.value = options[Math.floor(Math.random() * options.length)].value;
      }
    } else if (element.tagName === 'TEXTAREA') {
      element.value = '这是自动填充的测试内容';
    } else {
      const lowerField = field.toLowerCase();
      if (lowerField.includes('name')) {
        element.value = '测试' + Math.random().toString(36).substr(2, 5);
      } else if (lowerField.includes('price') || lowerField.includes('amount')) {
        element.value = (Math.random() * 10000).toFixed(2);
      } else if (lowerField.includes('stock') || lowerField.includes('quantity')) {
        element.value = Math.floor(Math.random() * 1000);
      } else if (lowerField.includes('_id')) {
        element.value = Math.floor(Math.random() * 10) + 1;
      } else if (fieldType.includes('int')) {
        element.value = Math.floor(Math.random() * 100);
      } else {
        element.value = '测试数据';
      }
    }
  });
  
  window.toast.success('已自动填充所有字段');
}

async function deleteFullPageSingleRow(rowId) {
  if (!confirm('确定要删除这条记录吗？')) return;
  
  try {
    await api.delete(`/tables/${fullPageTableData.tableName}/data/${rowId}`);
    window.toast.success('删除成功');
    await loadFullPageTableData(fullPageTableData.page, fullPageTableData.searchField, fullPageTableData.searchValue);
  } catch (error) {
    window.toast.error(`删除失败: ${error.message}`);
  }
}

async function batchDeleteFullPageRows() {
  if (fullPageSelectedRows.size === 0) {
    window.toast.warning('请先选择要删除的记录');
    return;
  }
  
  if (!confirm(`确定要删除选中的 ${fullPageSelectedRows.size} 条记录吗？`)) return;
  
  try {
    const deletePromises = Array.from(fullPageSelectedRows).map(id => 
      api.delete(`/tables/${fullPageTableData.tableName}/data/${id}`)
    );
    await Promise.all(deletePromises);
    window.toast.success(`成功删除 ${fullPageSelectedRows.size} 条记录`);
    fullPageSelectedRows.clear();
    await loadFullPageTableData(1, fullPageTableData.searchField, fullPageTableData.searchValue);
  } catch (error) {
    window.toast.error(`批量删除失败: ${error.message}`);
  }
}

function editFullPageCell(cell, rowId, field, currentValue) {
  if (['id', 'created_at', 'updated_at'].includes(field)) {
    window.toast.warning('该字段不可编辑');
    return;
  }

  if (cell.querySelector('input') || cell.querySelector('select')) {
    return;
  }

  const originalHTML = cell.innerHTML;
  const originalValue = cell.getAttribute('data-value');
  const structure = fullPageTableStructure[fullPageTableData.tableName];
  const columnInfo = structure?.find(col => col.Field === field);

  const fieldType = columnInfo?.Type || '';
  const cellHeight = cell.offsetHeight;
  const cellPadding = '0.625rem 0.75rem';

  let inputHTML = '';

  if (fieldType.includes('enum')) {
    const enumMatch = fieldType.match(/enum\((.*?)\)/);
    if (enumMatch) {
      const options = enumMatch[1].split(',').map(opt => opt.trim().replace(/'/g, ''));
      inputHTML = `<select class="form-select" style="width: 100%; height: ${cellHeight}px; padding: ${cellPadding}; font-size: 0.875rem; margin: 0; border: 2px solid var(--primary-500);" onchange="saveFullPageCellValue(this, ${rowId}, '${field}', this.value, '${escapeHtml(originalValue)}')" onblur="cancelFullPageEdit(this, '${escapeHtml(originalHTML)}')">`;
      options.forEach(opt => {
        inputHTML += `<option value="${opt}" ${originalValue === opt ? 'selected' : ''}>${opt}</option>`;
      });
      inputHTML += `</select>`;
      cell.innerHTML = inputHTML;
      cell.querySelector('select').focus();
    }
  } else if (fieldType.includes('tinyint(1)')) {
    inputHTML = `<select class="form-select" style="width: 100%; height: ${cellHeight}px; padding: ${cellPadding}; font-size: 0.875rem; margin: 0; border: 2px solid var(--primary-500);" onchange="saveFullPageCellValue(this, ${rowId}, '${field}', this.value, '${escapeHtml(originalValue)}')" onblur="cancelFullPageEdit(this, '${escapeHtml(originalHTML)}')">
      <option value="0" ${originalValue === '0' ? 'selected' : ''}>否</option>
      <option value="1" ${originalValue === '1' ? 'selected' : ''}>是</option>
    </select>`;
    cell.innerHTML = inputHTML;
    cell.querySelector('select').focus();
  } else {
    const inputType = fieldType.includes('int') || fieldType.includes('decimal') || fieldType.includes('float') ? 'number' : 'text';
    inputHTML = `<input type="${inputType}" class="form-input" style="width: 100%; height: ${cellHeight}px; padding: ${cellPadding}; font-size: 0.875rem; margin: 0; border: 2px solid var(--primary-500); box-sizing: border-box;" value="${escapeHtml(originalValue)}" onblur="saveFullPageCellValue(this, ${rowId}, '${field}', this.value, '${escapeHtml(originalValue)}')" onkeydown="if(event.key==='Escape') cancelFullPageEdit(this, '${escapeHtml(originalHTML)}'); if(event.key==='Enter') this.blur();">`;
    cell.innerHTML = inputHTML;
    const input = cell.querySelector('input');
    input.focus();
    input.select();
  }
}

async function saveFullPageCellValue(element, rowId, field, newValue, originalValue) {
  const cell = element.closest('td');
  
  if (String(newValue) === String(originalValue)) {
    const displayValue = originalValue || '-';
    const truncatedValue = displayValue.length > 50 ? displayValue.substring(0, 50) + '...' : displayValue;
    cell.innerHTML = escapeHtml(truncatedValue);
    return;
  }
  
  try {
    await api.put(`/tables/${fullPageTableData.tableName}/data/${rowId}`, { [field]: newValue });
    
    const displayValue = newValue || '-';
    const truncatedValue = displayValue.length > 50 ? displayValue.substring(0, 50) + '...' : displayValue;
    cell.innerHTML = escapeHtml(truncatedValue);
    cell.setAttribute('data-value', escapeHtml(displayValue));
    cell.setAttribute('title', escapeHtml(displayValue));
    
    window.toast.success('更新成功');
  } catch (error) {
    window.toast.error(`更新失败: ${error.message}`);
    const truncatedValue = originalValue.length > 50 ? originalValue.substring(0, 50) + '...' : originalValue;
    cell.innerHTML = escapeHtml(truncatedValue);
  }
}

function cancelFullPageEdit(element, originalHTML) {
  const cell = element.closest('td');
  cell.innerHTML = originalHTML;
}

async function generateFullPageTableData() {
  window.modal.open({
    title: `生成测试数据: ${fullPageTableData.tableName}`,
    content: `
      <div class="form-group">
        <label class="form-label">生成数量</label>
        <input type="number" id="generate-count" class="form-input" value="10" min="1" max="100" placeholder="输入要生成的数据条数">
      </div>
    `,
    confirmText: '生成',
    cancelText: '取消',
    showCancel: true,
    onConfirm: async () => {
      const count = parseInt(document.getElementById('generate-count').value);
      if (!count || count < 1) {
        window.toast.warning('请输入有效的数量');
        return false;
      }
      
      try {
        await api.post(`/tables/${fullPageTableData.tableName}/generate`, { count });
        window.toast.success(`成功生成 ${count} 条数据`);
        await loadFullPageTableData(fullPageTableData.page, fullPageTableData.searchField, fullPageTableData.searchValue);
        return true;
      } catch (error) {
        window.toast.error(`生成数据失败: ${error.message}`);
        return false;
      }
    }
  });
}

async function clearFullPageTableData() {
  window.modal.open({
    title: '⚠️ 确认清空数据',
    content: `
      <div style="padding: 1rem;">
        <p style="color: var(--gray-700); margin-bottom: 1rem;">确定要清空表 <strong style="color: var(--danger);">"${fullPageTableData.tableName}"</strong> 的所有数据吗？</p>
        <p style="color: var(--danger); font-weight: 600;">此操作不可恢复！</p>
      </div>
    `,
    confirmText: '确认清空',
    cancelText: '取消',
    showCancel: true,
    onConfirm: async () => {
      try {
        await api.post(`/tables/${fullPageTableData.tableName}/truncate`);
        window.toast.success('数据已清空');
        await loadFullPageTableData(1, '', '');
        return true;
      } catch (error) {
        window.toast.error(`清空数据失败: ${error.message}`);
        return false;
      }
    }
  });
}

