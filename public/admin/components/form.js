// ============================================
// Form 表单组件
// ============================================

class Form {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      fields: [],
      onSubmit: null,
      submitText: '提交',
      ...options,
    };
  }

  render() {
    const { fields, submitText } = this.options;

    let html = '<form class="form" id="dynamic-form" onsubmit="event.preventDefault();">';

    fields.forEach(field => {
      const {
        name,
        label,
        type = 'text',
        required = false,
        placeholder = '',
        value = '',
        options = [],
      } = field;

      html += '<div class="form-group">';
      html += `<label class="form-label">${label}${required ? ' <span style="color: var(--danger);">*</span>' : ''}</label>`;

      if (type === 'textarea') {
        html += `<textarea name="${name}" class="form-textarea" ${required ? 'required' : ''} placeholder="${placeholder}">${value}</textarea>`;
      } else if (type === 'select') {
        html += `<select name="${name}" class="form-select" ${required ? 'required' : ''}>`;
        html += '<option value="">请选择</option>';
        options.forEach(opt => {
          const selected = opt.value === value ? 'selected' : '';
          html += `<option value="${opt.value}" ${selected}>${opt.label}</option>`;
        });
        html += '</select>';
      } else {
        html += `<input type="${type}" name="${name}" class="form-input" value="${value}" ${required ? 'required' : ''} placeholder="${placeholder}">`;
      }

      html += '</div>';
    });

    html += `<button type="submit" class="btn btn-primary">${submitText}</button>`;
    html += '</form>';

    this.container.innerHTML = html;

    // 绑定提交事件
    const form = document.getElementById('dynamic-form');
    if (form) {
      form.addEventListener('submit', () => this.handleSubmit());
    }
  }

  handleSubmit() {
    const form = document.getElementById('dynamic-form');
    if (!form) return;

    const formData = new FormData(form);
    const data = {};
    formData.forEach((value, key) => {
      data[key] = value;
    });

    if (this.options.onSubmit) {
      this.options.onSubmit(data);
    }
  }

  getData() {
    const form = document.getElementById('dynamic-form');
    if (!form) return {};

    const formData = new FormData(form);
    const data = {};
    formData.forEach((value, key) => {
      data[key] = value;
    });

    return data;
  }

  reset() {
    const form = document.getElementById('dynamic-form');
    if (form) {
      form.reset();
    }
  }
}

// 导出
window.Form = Form;

