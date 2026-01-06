import { Request, Response, NextFunction } from 'express';
import { Res } from '../core/Response';

/**
 * 接口控制配置
 */
export interface InterfaceControlConfig {
  path: string;
  method: string;
  disabled?: boolean; // 是否禁用
  delay?: number; // 延迟（毫秒）
  randomDelay?: { min: number; max: number }; // 随机延迟
  errorType?: 'fixed' | 'random'; // 错误类型
  errorRate?: number; // 错误概率
  statusCode?: number; // 错误状态码
  message?: string; // 错误消息
  favorite?: boolean; // 是否收藏
  scenarioId?: string; // 场景ID
  scenarioName?: string; // 场景名称
}

// 全局接口控制配置
const interfaceControls: Map<string, InterfaceControlConfig> = new Map();

/**
 * 生成接口唯一键
 */
function getInterfaceKey(method: string, path: string): string {
  return `${method.toUpperCase()}:${path}`;
}

/**
 * 设置接口控制配置
 */
export function setInterfaceControl(method: string, path: string, config: Partial<InterfaceControlConfig>) {
  const key = getInterfaceKey(method, path);
  const existingConfig = interfaceControls.get(key) || { path, method };
  interfaceControls.set(key, { ...existingConfig, ...config });
}

/**
 * 获取接口控制配置
 */
export function getInterfaceControl(method: string, path: string): InterfaceControlConfig | undefined {
  const key = getInterfaceKey(method, path);
  return interfaceControls.get(key);
}

/**
 * 获取所有接口控制配置
 */
export function getAllInterfaceControls(): InterfaceControlConfig[] {
  return Array.from(interfaceControls.values());
}

/**
 * 清除接口控制配置
 */
export function clearInterfaceControl(method: string, path: string) {
  const key = getInterfaceKey(method, path);
  interfaceControls.delete(key);
}

/**
 * 重置所有接口控制配置
 */
export function resetAllInterfaceControls() {
  interfaceControls.clear();
}

/**
 * 接口控制中间件
 * 统一处理接口的禁用、延迟、错误等控制
 */
export function interfaceControlMiddleware(req: Request, res: Response, next: NextFunction) {
  const config = getInterfaceControl(req.method, req.path);

  if (!config) {
    return next();
  }

  // 检查是否禁用
  if (config.disabled) {
    return Res.error(res, '接口已禁用', 'B2B', 503);
  }

  // 处理延迟
  const getDelay = (): number => {
    if (config.randomDelay) {
      const { min, max } = config.randomDelay;
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    return config.delay || 0;
  };

  const delayMs = getDelay();

  // 处理错误
  const shouldError = (): boolean => {
    if (config.errorType === 'fixed') {
      return true;
    }
    if (config.errorType === 'random' && config.errorRate) {
      return Math.random() < config.errorRate;
    }
    return false;
  };

  if (shouldError()) {
    const errorResponse = () => {
      return Res.error(
        res,
        config.message || '服务器内部错误',
        'B2B',
        config.statusCode || 500
      );
    };

    if (delayMs > 0) {
      setTimeout(errorResponse, delayMs);
    } else {
      return errorResponse();
    }
  } else if (delayMs > 0) {
    setTimeout(() => next(), delayMs);
  } else {
    next();
  }
}

