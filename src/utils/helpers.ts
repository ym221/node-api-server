/**
 * 通用辅助函数
 */

/**
 * 延迟函数（用于模拟网络延迟）
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 随机延迟
 */
export function randomDelay(min: number, max: number): Promise<void> {
  const ms = Math.floor(Math.random() * (max - min + 1)) + min;
  return delay(ms);
}

/**
 * 生成随机数
 */
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * 生成随机布尔值
 */
export function randomBool(probability: number = 0.5): boolean {
  return Math.random() < probability;
}

/**
 * 从数组中随机选择元素
 */
export function randomPick<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * 分页计算
 */
export function calculatePagination(page: number, pageSize: number) {
  const currentPage = Math.max(1, page);
  const limit = Math.max(1, Math.min(100, pageSize)); // 限制最大 100
  const offset = (currentPage - 1) * limit;
  return { currentPage, limit, offset };
}

/**
 * 构建分页响应数据
 */
export function buildPaginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  pageSize: number
) {
  const totalPages = Math.ceil(total / pageSize);
  return {
    list: data,
    pagination: {
      total,
      page,
      pageSize,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
}

/**
 * 驼峰转下划线
 */
export function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

/**
 * 下划线转驼峰
 */
export function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * 对象键名转换（驼峰 <-> 下划线）
 */
export function transformKeys<T = any>(
  obj: any,
  transformer: (key: string) => string
): T {
  if (Array.isArray(obj)) {
    return obj.map(item => transformKeys(item, transformer)) as any;
  }
  
  if (obj !== null && typeof obj === 'object' && !(obj instanceof Date)) {
    return Object.keys(obj).reduce((acc, key) => {
      const newKey = transformer(key);
      acc[newKey] = transformKeys(obj[key], transformer);
      return acc;
    }, {} as any);
  }
  
  return obj;
}

/**
 * 安全的 JSON 解析
 */
export function safeJsonParse<T = any>(str: string, defaultValue: T): T {
  try {
    return JSON.parse(str);
  } catch {
    return defaultValue;
  }
}

/**
 * 检查是否为空值
 */
export function isEmpty(value: any): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

/**
 * 格式化日期时间
 */
export function formatDateTime(date: Date | string | number, format: string = 'YYYY-MM-DD HH:mm:ss'): string {
  const d = new Date(date);
  
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  
  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
}

/**
 * 生成唯一ID
 */
export function generateId(prefix: string = ''): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `${prefix}${timestamp}${random}`.toUpperCase();
}

