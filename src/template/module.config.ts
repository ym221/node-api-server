/**
 * 模块配置
 * 该文件定义模块的基本信息和接口列表
 */

export const moduleConfig = {
  // 模块名称
  name: 'example',
  
  // 模块描述
  description: '示例模块',
  
  // 响应格式（ERP / B2B / Ebooking）
  responseFormat: 'B2B' as const,
  
  // 数据表列表
  tables: [
    'example_table',
  ],
  
  // 数据表描述（可选，用于在数据管理页面展示）
  tableDescriptions: {
    'example_table': '示例数据表 - 描述该表的用途和存储的数据类型',
  },
  
  // 接口列表
  interfaces: [
    { method: 'GET', path: '/api/example/list', description: '获取列表' },
    { method: 'GET', path: '/api/example/:id', description: '获取详情' },
    { method: 'POST', path: '/api/example', description: '创建记录' },
    { method: 'PUT', path: '/api/example/:id', description: '更新记录' },
    { method: 'DELETE', path: '/api/example/:id', description: '删除记录' },
  ],
};

