// ============================================
// Modal 模态框组件
// ============================================

class Modal {
  constructor() {
    this.root = document.getElementById('modal-root');
    if (!this.root) {
      this.root = document.createElement('div');
      this.root.id = 'modal-root';
      document.body.appendChild(this.root);
    }
  }

  open(options = {}) {
    const {
      title = '提示',
      content = '',
      confirmText = '确定',
      cancelText = '取消',
      onConfirm = null,
      onCancel = null,
      showCancel = true,
      size = 'normal', // 支持 'normal' 或 'large'
      customFooter = false,
      footerContent = '',
    } = options;

    const containerClass = size === 'large' ? 'modal-container modal-large' : 'modal-container';

    // 构建底部按钮（如果 confirmText 为 null，则不显示底部）
    let footerHTML = '';
    if (confirmText !== null) {
      if (customFooter && footerContent) {
        // 使用自定义 footer
        footerHTML = `
          <div class="modal-footer" style="display: flex; gap: 0.5rem; align-items: center;">
            ${footerContent}
          </div>
        `;
      } else {
        // 使用默认 footer
        footerHTML = `
          <div class="modal-footer">
            ${showCancel ? `<button onclick="window.modal.handleCancel()" class="btn btn-secondary">${cancelText}</button>` : ''}
            <button onclick="window.modal.handleConfirm()" class="btn btn-primary">${confirmText}</button>
          </div>
        `;
      }
    }

    // 创建模态框
    this.root.innerHTML = `
      <div class="modal-backdrop" onclick="window.modal.close()"></div>
      <div class="${containerClass}" onclick="event.stopPropagation()">
        <div class="modal-content">
          <div class="modal-header">
            <h3 class="modal-title">${title}</h3>
            <button onclick="window.modal.close()" class="icon-btn">
              <svg style="width: 1.25rem; height: 1.25rem;" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
          <div class="modal-body">
            ${content}
          </div>
          ${footerHTML}
        </div>
      </div>
    `;

    this.root.classList.add('active');
    this.onConfirm = onConfirm;
    this.onCancel = onCancel;

    // 阻止背景滚动
    document.body.style.overflow = 'hidden';
  }

  close() {
    this.root.classList.remove('active');
    this.root.innerHTML = '';
    document.body.style.overflow = '';
  }

  updateContent(newContent) {
    const modalBody = this.root.querySelector('.modal-body');
    if (modalBody) {
      modalBody.innerHTML = newContent;
    }
  }

  async handleConfirm() {
    if (this.onConfirm) {
      const result = await this.onConfirm(); // 支持异步
      // 如果返回 false，不关闭弹窗
      if (result === false) {
        return;
      }
    }
    this.close();
  }

  handleCancel() {
    if (this.onCancel) {
      this.onCancel();
    }
    this.close();
  }

  confirm(message, onConfirm) {
    return this.open({
      title: '确认',
      content: `<p>${message}</p>`,
      confirmText: '确定',
      cancelText: '取消',
      showCancel: true,
      onConfirm,
    });
  }

  alert(message) {
    return this.open({
      title: '提示',
      content: `<p>${message}</p>`,
      confirmText: '确定',
      showCancel: false,
    });
  }

  form(options = {}) {
    const {
      title = '表单',
      fields = [],
      onSubmit = null,
      onOpen = null, // 新增 onOpen 回调
    } = options;

    let formHTML = '<form id="modal-form" onsubmit="event.preventDefault(); return false;">';
    
    fields.forEach(field => {
      const {
        name,
        label,
        type = 'text',
        required = false,
        placeholder = '',
        options = [],
        value = '',
      } = field;

      formHTML += '<div class="form-group">';
      formHTML += `<label class="form-label">${label}${required ? ' <span style="color: var(--danger);">*</span>' : ''}</label>`;

      if (type === 'textarea') {
        formHTML += `<textarea name="${name}" class="form-textarea" ${required ? 'required' : ''} placeholder="${placeholder}">${value}</textarea>`;
      } else if (type === 'select') {
        formHTML += `<select name="${name}" class="form-select" ${required ? 'required' : ''}>`;
        if (!required) {
          formHTML += '<option value="">请选择</option>';
        }
        options.forEach(opt => {
          const selected = value === opt.value ? 'selected' : '';
          formHTML += `<option value="${opt.value}" ${selected}>${opt.label}</option>`;
        });
        formHTML += '</select>';
      } else if (type === 'number') {
        formHTML += `<input type="${type}" name="${name}" class="form-input" ${required ? 'required' : ''} placeholder="${placeholder}" value="${value}" min="0" step="1">`;
      } else {
        formHTML += `<input type="${type}" name="${name}" class="form-input" ${required ? 'required' : ''} placeholder="${placeholder}" value="${value}">`;
      }

      formHTML += '</div>';
    });

    formHTML += '</form>';

    this.onFormSubmit = onSubmit;

    this.open({
      title,
      content: formHTML,
      confirmText: '提交',
      cancelText: '取消',
      showCancel: true,
      onConfirm: async () => {
        return await this.handleFormSubmit();
      },
    });

    // 在弹窗打开后执行 onOpen 回调
    if (onOpen) {
      setTimeout(() => {
        onOpen();
      }, 0);
    }
  }

  async handleFormSubmit() {
    const form = document.getElementById('modal-form');
    if (!form) return true;

    // 检查表单验证
    if (!form.checkValidity()) {
      form.reportValidity();
      return false;
    }

    // 收集表单数据
    const formData = new FormData(form);
    const data = {};
    formData.forEach((value, key) => {
      data[key] = value;
    });

    // 调用提交处理函数
    if (this.onFormSubmit) {
      try {
        const result = await this.onFormSubmit(data);
        // 如果返回 false，不关闭弹窗
        if (result === false) {
          return false;
        }
      } catch (error) {
        console.error('表单提交失败:', error);
        return false;
      }
    }

    return true;
  }
}

// 全局实例
window.modal = new Modal();

