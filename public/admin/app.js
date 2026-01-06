// ============================================
// API 测试服务器 - 主应用程序
// ============================================

// API 客户端
class APIClient {
  constructor(baseURL = '') {
    this.baseURL = baseURL;
  }

  async request(url, options = {}) {
    const config = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(this.baseURL + url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || '请求失败');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  get(url, params) {
    if (params) {
      const query = new URLSearchParams(params).toString();
      url += (url.includes('?') ? '&' : '?') + query;
    }
    return this.request(url);
  }

  post(url, data) {
    return this.request(url, { method: 'POST', body: data });
  }

  put(url, data) {
    return this.request(url, { method: 'PUT', body: data });
  }

  delete(url) {
    return this.request(url, { method: 'DELETE' });
  }
}

// 路由管理器
class Router {
  constructor() {
    this.routes = [];
    this.currentRoute = null;

    window.addEventListener('hashchange', () => this.handleRoute());
    window.addEventListener('load', () => this.handleRoute());
  }

  register(path, handler) {
    // 将路径转换为正则表达式
    const paramNames = [];
    const regexPath = path
      .replace(/:[^/]+/g, (match) => {
        paramNames.push(match.slice(1));
        return '([^/]+)';
      })
      .replace(/\//g, '\\/');
    
    this.routes.push({
      path,
      regex: new RegExp(`^${regexPath}$`),
      paramNames,
      handler
    });
  }

  handleRoute() {
    const hash = window.location.hash.slice(1) || '/';
    
    // 尝试匹配路由
    for (const route of this.routes) {
      const match = hash.match(route.regex);
      if (match) {
        this.currentRoute = hash;
        
        // 提取参数
        const params = {};
        route.paramNames.forEach((name, index) => {
          params[name] = decodeURIComponent(match[index + 1]);
        });
        
        route.handler(params);
        return;
      }
    }
    
    // 没有匹配的路由，跳转到首页
    console.warn(`Route not found: ${hash}`);
    window.location.hash = '/';
  }

  navigate(path) {
    window.location.hash = path;
  }
}

// 应用主类
class App {
  constructor() {
    this.api = new APIClient('/api/_admin');
    this.router = new Router();
    
    // 全局暴露
    window.api = this.api;
    window.router = this.router;
    
    this.init();
  }

  init() {
    this.registerRoutes();
    this.attachEvents();
  }

  registerRoutes() {
    // 注册页面路由（更具体的路由应该在前面）
    this.router.register('/data/:tableName', () => this.renderPage('data-detail', '数据详情'));
    this.router.register('/', () => this.renderPage('dashboard', '概览'));
    this.router.register('/modules', () => this.renderPage('modules', '模块管理'));
    this.router.register('/data', () => this.renderPage('data', '数据管理'));
    this.router.register('/interfaces', () => this.renderPage('interfaces', '接口管理'));
    this.router.register('/scenarios', () => this.renderPage('scenarios', '场景管理'));
    this.router.register('/test', () => this.renderPage('test', '接口测试'));
    this.router.register('/help', () => this.renderPage('help', '使用说明'));
  }

  attachEvents() {
    // 导航点击事件
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        
        // 更新导航激活状态
        document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
        item.classList.add('active');

        // 导航到目标页面
        const href = item.getAttribute('href');
        this.router.navigate(href.slice(1));
      });
    });

    // 刷新按钮
    document.getElementById('refresh-btn').addEventListener('click', () => {
      this.router.handleRoute();
      window.toast.success('已刷新');
    });
  }

  renderPage(pageName, title) {
    // 更新标题（支持面包屑）
    const pageTitleElement = document.getElementById('page-title');
    
    // 如果是数据详情页，显示面包屑
    if (pageName === 'data-detail') {
      const hash = window.location.hash;
      const match = hash.match(/#\/data\/(.+)/);
      if (match) {
        const tableName = decodeURIComponent(match[1]);
        pageTitleElement.innerHTML = `
          <a href="#/data" style="color: var(--gray-600); text-decoration: none; transition: color 0.2s;" onmouseover="this.style.color='var(--primary-500)'" onmouseout="this.style.color='var(--gray-600)'">数据管理</a>
          <span style="color: var(--gray-400); margin: 0 0.5rem;">/</span>
          <span>${tableName}</span>
        `;
      } else {
        pageTitleElement.textContent = title;
      }
    } else {
      pageTitleElement.textContent = title;
    }

    // 更新导航激活状态（只对主导航项生效）
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.remove('active');
      // 数据详情页面也激活数据管理导航
      if (pageName === 'data-detail') {
        if (item.dataset.page === 'data') {
          item.classList.add('active');
        }
      } else {
        if (item.dataset.page === pageName) {
          item.classList.add('active');
        }
      }
    });

    // 渲染页面内容
    const content = document.getElementById('content');
    
    // 处理带参数的页面名称（如 data-detail）
    const renderFunctionName = `render${this.capitalize(pageName.replace(/-([a-z])/g, (g) => g[1].toUpperCase()))}`;
    const renderFunction = window[renderFunctionName];
    
    if (renderFunction) {
      renderFunction(content);
    } else {
      content.innerHTML = `
        <div class="empty-state">
          <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
          </svg>
          <p class="empty-title">页面开发中</p>
          <p class="empty-text">该页面正在开发中，敬请期待...</p>
        </div>
      `;
    }
  }

  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

// 启动应用
document.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
});

