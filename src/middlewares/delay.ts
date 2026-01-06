import { Request, Response, NextFunction } from 'express';
import { delay } from '../utils/helpers';

/**
 * 接口配置存储（内存）
 */
interface InterfaceConfig {
  path: string;
  delay?: number; // 延迟毫秒数
  randomDelay?: { min: number; max: number }; // 随机延迟范围
}

// 全局接口配置
const interfaceConfigs: Map<string, InterfaceConfig> = new Map();

/**
 * 设置接口延迟配置
 */
export function setInterfaceDelay(path: string, delayMs?: number, randomDelay?: { min: number; max: number }) {
  const config = interfaceConfigs.get(path) || { path };
  config.delay = delayMs;
  config.randomDelay = randomDelay;
  interfaceConfigs.set(path, config);
}

/**
 * 获取接口延迟配置
 */
export function getInterfaceDelay(path: string): InterfaceConfig | undefined {
  return interfaceConfigs.get(path);
}

/**
 * 清除所有延迟配置
 */
export function clearAllDelays() {
  for (const [path, config] of interfaceConfigs.entries()) {
    config.delay = undefined;
    config.randomDelay = undefined;
  }
}

/**
 * 延迟模拟中间件
 * 根据接口配置添加响应延迟
 */
export function delayMiddleware(req: Request, res: Response, next: NextFunction) {
  const config = interfaceConfigs.get(req.path);

  if (!config) {
    return next();
  }

  // 计算延迟时间
  let delayMs = 0;
  
  if (config.randomDelay) {
    const { min, max } = config.randomDelay;
    delayMs = Math.floor(Math.random() * (max - min + 1)) + min;
  } else if (config.delay) {
    delayMs = config.delay;
  }

  if (delayMs > 0) {
    delay(delayMs).then(() => next());
  } else {
    next();
  }
}

