// ============================================
// Table 表格组件
// ============================================

class Table {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      columns: [],
      data: [],
      actions: [],
      emptyText: '暂无数据',
      ...options,
    };
  }

  render() {
    const { columns, data, actions, emptyText } = this.options;

    if (!data || data.length === 0) {
      this.container.innerHTML = `
        <div class="empty-state">
          <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
          </svg>
          <p class="empty-title">${emptyText}</p>
        </div>
      `;
      return;
    }

    let html = '<div class="table-container"><table class="table"><thead><tr>';

    // 表头
    columns.forEach(col => {
      html += `<th>${col.label}</th>`;
    });

    if (actions && actions.length > 0) {
      html += '<th>操作</th>';
    }

    html += '</tr></thead><tbody>';

    // 表格数据
    data.forEach((row, index) => {
      html += '<tr>';

      columns.forEach(col => {
        let value = row[col.field];

        if (col.render) {
          value = col.render(value, row, index);
        }

        html += `<td>${value !== undefined && value !== null ? value : '-'}</td>`;
      });

      // 操作列
      if (actions && actions.length > 0) {
        html += '<td><div style="display: flex; gap: 0.5rem;">';
        actions.forEach(action => {
          const btnClass = action.type === 'danger' ? 'btn-danger' : 'btn-secondary';
          html += `<button class="btn btn-sm ${btnClass}" onclick="(${action.onClick.toString()})(${index}, ${JSON.stringify(row).replace(/"/g, '&quot;')})">${action.label}</button>`;
        });
        html += '</div></td>';
      }

      html += '</tr>';
    });

    html += '</tbody></table></div>';

    this.container.innerHTML = html;
  }

  update(data) {
    this.options.data = data;
    this.render();
  }
}

// 导出
window.Table = Table;

