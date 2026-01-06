// ============================================
// 数据详情页面（独立页面，非弹窗）
// ============================================

let dataDetailState = {
  tableName: '',
  columns: [],
  rows: [],
  total: 0,
  page: 1,
  pageSize: 10,
  searchField: '',
  searchValue: ''
};
let dataDetailTableStructure = {}; // 存储表结构信息
let dataDetailSelectedRows = new Set(); // 选中的行ID

async function renderDataDetail(container) {
  // 从 URL 获取表名
  const hash = window.location.hash;
  const match = hash.match(/#\/data\/(.+)/);
  
  if (!match) {
    container.innerHTML = `
      <div class="empty-state">
        <p class="empty-title">参数错误</p>
        <p class="empty-text">未指定数据表名称</p>
        <button class="btn btn-primary" onclick="window.location.hash = '/data'">返回列表</button>
      </div>
    `;
    return;
  }

  const tableName = decodeURIComponent(match[1]);
  await loadDataDetailTableData(tableName, 1, '', '');
}

async function loadDataDetailTableData(tableName, page = 1, searchField = '', searchValue = '') {
  const container = document.getElementById('content');
  
  // 显示加载中
  container.innerHTML = `
    <div class="loading-screen">
      <div class="spinner"></div>
      <p class="loading-text">加载数据中...</p>
    </div>
  `;

  try {
    // 获取表结构
    if (!dataDetailTableStructure[tableName]) {
      const structureRes = await api.get(`/tables/${tableName}/structure`);
      dataDetailTableStructure[tableName] = structureRes.data;
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

    dataDetailState = {
      tableName,
      columns: data.length > 0 ? Object.keys(data[0]) : dataDetailTableStructure[tableName]?.map(col => col.Field) || [],
      rows: data,
      total: pagination.total,
      page: pagination.page || page,
      pageSize: pagination.pageSize || 10,
      searchField,
      searchValue
    };

    dataDetailSelectedRows.clear();

    // 渲染数据表格
    renderDataDetailTable(container);
  } catch (error) {
    container.innerHTML = `
      <div class="empty-state">
        <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <p class="empty-title">加载数据失败</p>
        <p class="empty-text">${error.message}</p>
        <button class="btn btn-primary" onclick="window.location.hash = '/data'">返回列表</button>
      </div>
    `;
  }
}

function renderDataDetailTable(container) {
  const { tableName, columns, rows, total, page, pageSize } = dataDetailState;
  const totalPages = Math.ceil(total / pageSize);

  if (columns.length === 0) {
    container.innerHTML = `
      <div class="card">
        <div class="empty-state" style="padding: 3rem;">
          <p class="empty-title">表中暂无数据</p>
          <p class="empty-text">可以点击"新增"或"生成数据"按钮来添加测试数据</p>
        </div>
      </div>
    `;
    return;
  }

  // 构建操作栏
  const actionBarHTML = `
    <div class="card" style="margin-bottom: 0.75rem; padding: 1rem;">
      <div style="display: flex; gap: 0.75rem; align-items: center; flex-wrap: wrap; justify-content: space-between;">
        <div style="display: flex; gap: 0.5rem; align-items: center;">
          <select id="search-field" class="form-select" style="height: 36px; width: 120px; padding: 0.5rem 0.75rem;">
            <option value="">选择字段</option>
            ${columns.map(col => `<option value="${col}" ${dataDetailState.searchField === col ? 'selected' : ''}>${col}</option>`).join('')}
          </select>
          <input type="text" id="search-value" class="form-input" placeholder="输入查询值" value="${dataDetailState.searchValue || ''}" style="height: 36px; width: 300px;">
          <button class="btn btn-sm btn-primary" onclick="performDataDetailSearch()" style="height: 36px;">查询</button>
          <button class="btn btn-sm btn-secondary" onclick="resetDataDetailSearch()" style="height: 36px;">重置</button>
        </div>
        <div style="display: flex; gap: 0.5rem;">
          <button class="btn btn-sm btn-success" onclick="showDataDetailAddForm()" style="height: 36px;">新增</button>
          ${dataDetailSelectedRows.size > 0 ? `<button class="btn btn-sm btn-danger" onclick="batchDeleteDataDetailRows()" style="height: 36px;">删除选中 (${dataDetailSelectedRows.size})</button>` : ''}
          <button class="btn btn-sm btn-secondary" onclick="generateDataDetailTableData('${tableName}')" style="height: 36px;">生成数据</button>
          <button class="btn btn-sm btn-secondary" onclick="clearDataDetailTableData('${tableName}')" style="height: 36px;">清空数据</button>
        </div>
      </div>
    </div>
  `;

  // 构建表格（带固定高度和滚动）
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
    // 检查是否全选
    const allSelected = rows.length > 0 && rows.every(row => dataDetailSelectedRows.has(row.id));
    
    tableHTML = `
      <div class="card">
        <div style="overflow-x: auto;">
          <table class="editable-table zebra-table">
            <thead>
              <tr>
                <th style="width: 40px;"><input type="checkbox" id="select-all" ${allSelected ? 'checked' : ''} onchange="toggleDataDetailSelectAll(this.checked)"></th>
                ${columns.map(col => `<th class="fixed-cell">${col}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
    `;

    rows.forEach((row) => {
      const isSelected = dataDetailSelectedRows.has(row.id);
      tableHTML += `<tr ${isSelected ? 'style="background: var(--warning-50);"' : ''}>`;
      tableHTML += `<td><input type="checkbox" ${isSelected ? 'checked' : ''} onchange="toggleDataDetailSelectRow(${row.id}, this.checked)"></td>`;
      columns.forEach(col => {
        const value = row[col];
        const displayValue = value === null || value === undefined ? '-' : String(value);
        const truncatedValue = displayValue.length > 50 ? displayValue.substring(0, 50) + '...' : displayValue;
        tableHTML += `<td class="editable-cell fixed-cell" 
          data-row-id="${row.id}" 
          data-field="${col}" 
          data-value="${escapeDataDetailHtml(displayValue)}"
          title="${escapeDataDetailHtml(displayValue)}"
          onclick="editDataDetailCell(this, '${tableName}', ${row.id}, '${col}', '${escapeDataDetailHtml(displayValue)}')">${escapeDataDetailHtml(truncatedValue)}</td>`;
      });
      tableHTML += '</tr>';
    });

    tableHTML += `
            </tbody>
          </table>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 1rem; border-top: 1px solid var(--gray-200);">
          <div style="font-size: 0.875rem; color: var(--gray-600);">
            共 ${total} 条记录，第 ${page} / ${totalPages} 页
          </div>
          <div style="display: flex; gap: 0.5rem;">
            <button class="btn btn-sm ${page === 1 ? 'btn-disabled' : 'btn-secondary'}" 
              onclick="changeDataDetailPage(${page - 1})" 
              ${page === 1 ? 'disabled' : ''}>上一页</button>
            <button class="btn btn-sm ${page === totalPages ? 'btn-disabled' : 'btn-secondary'}" 
              onclick="changeDataDetailPage(${page + 1})" 
              ${page === totalPages ? 'disabled' : ''}>下一页</button>
          </div>
        </div>
      </div>
    `;
  }

  container.innerHTML = actionBarHTML + tableHTML;
}

// 选择/取消选择行
function toggleDataDetailSelectRow(rowId, checked) {
  if (checked) {
    dataDetailSelectedRows.add(rowId);
  } else {
    dataDetailSelectedRows.delete(rowId);
  }
  renderDataDetailTable(document.getElementById('content'));
}

// 全选/取消全选
function toggleDataDetailSelectAll(checked) {
  if (checked) {
    dataDetailState.rows.forEach(row => dataDetailSelectedRows.add(row.id));
  } else {
    dataDetailSelectedRows.clear();
  }
  renderDataDetailTable(document.getElementById('content'));
}

// 新增数据表单
function showDataDetailAddForm() {
  const { tableName, columns } = dataDetailState;
  const structure = dataDetailTableStructure[tableName];
  
  // 过滤掉自动生成的字段
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

  window.modal.open({
    title: `新增数据 - ${tableName}`,
    content: formHTML,
    confirmText: '提交',
    cancelText: '取消',
    showCancel: true,
    customFooter: true,
    footerContent: `
      <button class="btn btn-secondary" onclick="autoFillDataDetailForm()">一键填充</button>
      <div style="flex: 1;"></div>
      <button onclick="window.modal.handleCancel()" class="btn btn-secondary">取消</button>
      <button onclick="window.modal.handleConfirm()" class="btn btn-primary">提交</button>
    `,
    onConfirm: async () => {
      const data = {};
      let hasError = false;
      
      editableFields.forEach(field => {
        const element = document.getElementById(`field-${field}`);
        if (element) {
          const columnInfo = structure?.find(col => col.Field === field);
          const required = columnInfo?.Null === 'NO';
          
          if (required && !element.value) {
            window.toast.error(`${field} 为必填项`);
            hasError = true;
            return;
          }
          
          data[field] = element.value;
        }
      });
      
      if (hasError) return false;
      
      try {
        await api.post(`/tables/${tableName}/data`, data);
        window.toast.success('新增成功');
        // 重新加载数据
        await loadDataDetailTableData(tableName, dataDetailState.page, dataDetailState.searchField, dataDetailState.searchValue);
        return true;
      } catch (error) {
        window.toast.error(`新增失败: ${error.message}`);
        return false;
      }
    }
  });
}

// 一键填充表单
function autoFillDataDetailForm() {
  const { tableName, columns } = dataDetailState;
  const structure = dataDetailTableStructure[tableName];
  
  columns.forEach(field => {
    if (field === 'id' || field === 'created_at' || field === 'updated_at') return;
    
    const element = document.getElementById(`field-${field}`);
    if (!element) return;
    
    const columnInfo = structure?.find(col => col.Field === field);
    const fieldType = columnInfo?.Type || '';
    
    // 根据字段类型和名称生成合适的值
    if (element.tagName === 'SELECT') {
      const options = Array.from(element.options).filter(opt => opt.value);
      if (options.length > 0) {
        element.value = options[Math.floor(Math.random() * options.length)].value;
      }
    } else if (element.tagName === 'TEXTAREA') {
      element.value = '这是自动填充的测试内容，可以在这里输入更多文字描述信息。';
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
      } else if (lowerField.includes('sort') || lowerField.includes('order')) {
        element.value = Math.floor(Math.random() * 100);
      } else if (fieldType.includes('int')) {
        element.value = Math.floor(Math.random() * 100);
      } else {
        element.value = '测试数据' + Math.random().toString(36).substr(2, 4);
      }
    }
  });
  
  window.toast.success('已自动填充所有字段');
}

// 批量删除
async function batchDeleteDataDetailRows() {
  if (dataDetailSelectedRows.size === 0) {
    window.toast.warning('请先选择要删除的记录');
    return;
  }
  
  if (!confirm(`确定要删除选中的 ${dataDetailSelectedRows.size} 条记录吗？此操作不可恢复！`)) return;
  
  try {
    const ids = Array.from(dataDetailSelectedRows);
    await api.post(`/tables/${dataDetailState.tableName}/batch-delete`, { ids });
    window.toast.success(`成功删除 ${dataDetailSelectedRows.size} 条记录`);
    dataDetailSelectedRows.clear();
    // 重新加载数据
    await loadDataDetailTableData(dataDetailState.tableName, 1, dataDetailState.searchField, dataDetailState.searchValue);
  } catch (error) {
    window.toast.error(`批量删除失败: ${error.message}`);
  }
}

// 编辑单元格
function editDataDetailCell(cell, tableName, rowId, field, currentValue) {
  // 如果是 id、created_at、updated_at 等字段，不允许编辑
  if (['id', 'created_at', 'updated_at'].includes(field)) {
    window.toast.warning('该字段不可编辑');
    return;
  }

  // 如果已经是编辑状态，不重复触发
  if (cell.querySelector('input') || cell.querySelector('select')) {
    return;
  }

  const originalHTML = cell.innerHTML;
  const originalValue = cell.getAttribute('data-value');
  const structure = dataDetailTableStructure[tableName];
  const columnInfo = structure?.find(col => col.Field === field);

  // 移除单元格的 onclick，避免重复触发
  cell.onclick = null;
  
  // 保存原始 padding 并移除
  const cellPadding = window.getComputedStyle(cell).padding;
  cell.style.padding = '0';

  // 判断字段类型
  let inputHTML = '';
  const fieldType = columnInfo?.Type || '';
  
  // 输入框样式：继承单元格的完整样式
  const inputStyle = `
    width: 100%; 
    height: 100%;
    padding: 0.625rem 0.75rem;
    margin: 0; 
    border: none; 
    font-size: 0.875rem; 
    line-height: inherit; 
    background: var(--primary-50); 
    outline: 2px solid var(--primary-500); 
    outline-offset: -2px; 
    box-sizing: border-box;
    font-family: inherit;
  `.replace(/\s+/g, ' ').trim();

  if (fieldType.includes('enum')) {
    // 枚举类型 - 使用下拉框
    const enumMatch = fieldType.match(/enum\((.*?)\)/);
    if (enumMatch) {
      const options = enumMatch[1].split(',').map(opt => opt.trim().replace(/'/g, ''));
      inputHTML = `<select class="form-select" style="${inputStyle}" onchange="saveDataDetailCellValue(this, '${tableName}', ${rowId}, '${field}', this.value, '${escapeDataDetailHtml(originalValue)}', '${cellPadding}')" onblur="cancelDataDetailEdit(this, '${escapeDataDetailHtml(originalHTML)}', '${cellPadding}')">`;
      options.forEach(opt => {
        inputHTML += `<option value="${opt}" ${originalValue === opt ? 'selected' : ''}>${opt}</option>`;
      });
      inputHTML += `</select>`;
      cell.innerHTML = inputHTML;
      cell.querySelector('select').focus();
    }
  } else if (fieldType.includes('tinyint(1)')) {
    // 布尔类型
    inputHTML = `<select class="form-select" style="${inputStyle}" onchange="saveDataDetailCellValue(this, '${tableName}', ${rowId}, '${field}', this.value, '${escapeDataDetailHtml(originalValue)}', '${cellPadding}')" onblur="cancelDataDetailEdit(this, '${escapeDataDetailHtml(originalHTML)}', '${cellPadding}')">
      <option value="0" ${originalValue === '0' ? 'selected' : ''}>否</option>
      <option value="1" ${originalValue === '1' ? 'selected' : ''}>是</option>
    </select>`;
    cell.innerHTML = inputHTML;
    cell.querySelector('select').focus();
  } else {
    // 其他类型 - 使用输入框
    const inputType = fieldType.includes('int') || fieldType.includes('decimal') || fieldType.includes('float') ? 'number' : 'text';
    inputHTML = `<input type="${inputType}" class="form-input" style="${inputStyle}" value="${escapeDataDetailHtml(originalValue)}" onblur="saveDataDetailCellValue(this, '${tableName}', ${rowId}, '${field}', this.value, '${escapeDataDetailHtml(originalValue)}', '${cellPadding}')" onkeydown="if(event.key==='Escape') cancelDataDetailEdit(this, '${escapeDataDetailHtml(originalHTML)}', '${cellPadding}'); if(event.key==='Enter') this.blur();">`;
    cell.innerHTML = inputHTML;
    const input = cell.querySelector('input');
    input.focus();
    input.select();
  }
}

// 保存单元格值
async function saveDataDetailCellValue(element, tableName, rowId, field, newValue, originalValue, cellPadding) {
  const cell = element.closest('td');
  
  // 恢复单元格 padding
  cell.style.padding = cellPadding || '0.625rem 0.75rem';
  
  // 如果值没有改变，直接恢复显示
  if (String(newValue) === String(originalValue)) {
    const displayValue = originalValue || '-';
    const truncatedValue = displayValue.length > 50 ? displayValue.substring(0, 50) + '...' : displayValue;
    cell.innerHTML = escapeDataDetailHtml(truncatedValue);
    // 恢复 onclick
    cell.onclick = () => editDataDetailCell(cell, tableName, rowId, field, originalValue);
    return;
  }
  
  try {
    // 调用 API 更新数据
    await api.put(`/tables/${tableName}/data/${rowId}`, { [field]: newValue });
    
    // 更新显示
    const displayValue = newValue || '-';
    const truncatedValue = displayValue.length > 50 ? displayValue.substring(0, 50) + '...' : displayValue;
    cell.innerHTML = escapeDataDetailHtml(truncatedValue);
    cell.setAttribute('data-value', escapeDataDetailHtml(displayValue));
    cell.setAttribute('title', escapeDataDetailHtml(displayValue));
    
    // 恢复 onclick
    cell.onclick = () => editDataDetailCell(cell, tableName, rowId, field, newValue);
    
    window.toast.success('更新成功');
  } catch (error) {
    window.toast.error(`更新失败: ${error.message}`);
    // 恢复原值
    const truncatedValue = originalValue.length > 50 ? originalValue.substring(0, 50) + '...' : originalValue;
    cell.innerHTML = escapeDataDetailHtml(truncatedValue);
    // 恢复 onclick
    cell.onclick = () => editDataDetailCell(cell, tableName, rowId, field, originalValue);
  }
}

// 取消编辑
function cancelDataDetailEdit(element, originalHTML, cellPadding) {
  const cell = element.closest('td');
  cell.innerHTML = originalHTML;
  // 恢复单元格 padding
  cell.style.padding = cellPadding || '0.625rem 0.75rem';
  // 恢复 onclick（从 cell 的 data 属性中读取）
  const tableName = dataDetailState.tableName;
  const rowId = parseInt(cell.getAttribute('data-row-id'));
  const field = cell.getAttribute('data-field');
  const value = cell.getAttribute('data-value');
  cell.onclick = () => editDataDetailCell(cell, tableName, rowId, field, value);
}

// 切换页码
function changeDataDetailPage(newPage) {
  if (newPage < 1 || newPage > Math.ceil(dataDetailState.total / dataDetailState.pageSize)) {
    return;
  }
  loadDataDetailTableData(dataDetailState.tableName, newPage, dataDetailState.searchField, dataDetailState.searchValue);
}

// 执行查询
function performDataDetailSearch() {
  const searchField = document.getElementById('search-field').value;
  const searchValue = document.getElementById('search-value').value;
  
  if (!searchField) {
    window.toast.warning('请选择查询字段');
    return;
  }
  
  if (!searchValue) {
    window.toast.warning('请输入查询值');
    return;
  }
  
  loadDataDetailTableData(dataDetailState.tableName, 1, searchField, searchValue);
}

// 重置查询
function resetDataDetailSearch() {
  loadDataDetailTableData(dataDetailState.tableName, 1, '', '');
}

// 生成测试数据
async function generateDataDetailTableData(tableName) {
  window.modal.open({
    title: `生成测试数据: ${tableName}`,
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
        await api.post(`/tables/${tableName}/generate`, { count });
        window.toast.success(`成功生成 ${count} 条数据`);
        // 重新加载数据
        await loadDataDetailTableData(tableName, dataDetailState.page, dataDetailState.searchField, dataDetailState.searchValue);
        return true;
      } catch (error) {
        window.toast.error(`生成数据失败: ${error.message}`);
        return false;
      }
    }
  });
}

// 清空表数据
async function clearDataDetailTableData(tableName) {
  window.modal.open({
    title: '⚠️ 确认清空数据',
    content: `
      <div style="padding: 1rem;">
        <p style="color: var(--gray-700); margin-bottom: 1rem;">确定要清空表 <strong style="color: var(--danger);">"${tableName}"</strong> 的所有数据吗？</p>
        <p style="color: var(--danger); font-weight: 600;">此操作不可恢复！</p>
      </div>
    `,
    confirmText: '确认清空',
    cancelText: '取消',
    showCancel: true,
    onConfirm: async () => {
      try {
        await api.post(`/tables/${tableName}/truncate`);
        window.toast.success('数据已清空');
        // 重新加载数据
        await loadDataDetailTableData(tableName, 1, '', '');
        return true;
      } catch (error) {
        window.toast.error(`清空数据失败: ${error.message}`);
        return false;
      }
    }
  });
}

// HTML 转义函数
function escapeDataDetailHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return String(text).replace(/[&<>"']/g, m => map[m]);
}
