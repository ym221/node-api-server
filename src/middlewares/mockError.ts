import { Request, Response, NextFunction } from 'express';
import { Res } from '../core/Response';
import { randomBool } from '../utils/helpers';

/**
 * 错误配置
 */
interface ErrorConfig {
  path: string;
  errorType?: 'fixed' | 'random'; // 固定错误或随机错误
  errorRate?: number; // 错误概率（0-1）
  statusCode?: number; // 错误状态码
  message?: string; // 错误消息
}

// 全局错误配置
const errorConfigs: Map<string, ErrorConfig> = new Map();

/**
 * 设置接口错误配置
 */
export function setInterfaceError(
  path: string,
  errorType: 'fixed' | 'random' = 'fixed',
  errorRate: number = 1,
  statusCode: number = 500,
  message: string = '服务器内部错误'
) {
  errorConfigs.set(path, {
    path,
    errorType,
    errorRate,
    statusCode,
    message,
  });
}

/**
 * 获取接口错误配置
 */
export function getInterfaceError(path: string): ErrorConfig | undefined {
  return errorConfigs.get(path);
}

/**
 * 清除接口错误配置
 */
export function clearInterfaceError(path: string) {
  errorConfigs.delete(path);
}

/**
 * 清除所有错误配置
 */
export function clearAllErrors() {
  errorConfigs.clear();
}

/**
 * 错误模拟中间件
 * 根据配置模拟接口错误
 */
export function mockErrorMiddleware(req: Request, res: Response, next: NextFunction) {
  const config = errorConfigs.get(req.path);

  if (!config) {
    return next();
  }

  // 判断是否触发错误
  let shouldError = false;

  if (config.errorType === 'fixed') {
    shouldError = true;
  } else if (config.errorType === 'random') {
    shouldError = randomBool(config.errorRate || 0.5);
  }

  if (shouldError) {
    return Res.error(
      res,
      config.message || '服务器内部错误',
      'B2B',
      config.statusCode || 500
    );
  }

  next();
}

