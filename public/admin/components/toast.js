// ============================================
// Toast 通知组件
// ============================================

class Toast {
  constructor() {
    this.container = document.getElementById('toast-container');
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'toast-container';
      document.body.appendChild(this.container);
    }
  }

  show(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    
    const styles = this.getStyles(type);
    toast.style.cssText = styles;
    
    toast.innerHTML = `
      <div style="display: flex; align-items: center; gap: 0.75rem;">
        ${this.getIcon(type)}
        <span style="flex: 1; font-weight: 600;">${message}</span>
        <button onclick="this.closest('.toast').remove()" style="background: none; border: none; color: currentColor; opacity: 0.7; cursor: pointer; padding: 0; display: flex; align-items: center;">
          <svg style="width: 1.25rem; height: 1.25rem;" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
    `;

    this.container.appendChild(toast);

    if (duration > 0) {
      setTimeout(() => {
        toast.classList.add('removing');
        setTimeout(() => toast.remove(), 300);
      }, duration);
    }

    return toast;
  }

  success(message, duration) {
    return this.show(message, 'success', duration);
  }

  error(message, duration) {
    return this.show(message, 'error', duration);
  }

  warning(message, duration) {
    return this.show(message, 'warning', duration);
  }

  info(message, duration) {
    return this.show(message, 'info', duration);
  }

  getStyles(type) {
    const styles = {
      success: 'background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white;',
      error: 'background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white;',
      warning: 'background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white;',
      info: 'background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white;',
    };
    return styles[type] || styles.info;
  }

  getIcon(type) {
    const icons = {
      success: `
        <svg style="width: 1.5rem; height: 1.5rem; flex-shrink: 0;" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
        </svg>
      `,
      error: `
        <svg style="width: 1.5rem; height: 1.5rem; flex-shrink: 0;" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
      `,
      warning: `
        <svg style="width: 1.5rem; height: 1.5rem; flex-shrink: 0;" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
        </svg>
      `,
      info: `
        <svg style="width: 1.5rem; height: 1.5rem; flex-shrink: 0;" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
      `,
    };
    return icons[type] || icons.info;
  }
}

// 全局实例
window.toast = new Toast();

