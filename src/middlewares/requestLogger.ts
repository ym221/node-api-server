import { Request, Response, NextFunction } from 'express';
import { logRequest } from '../utils/logger';

/**
 * 获取客户端 IP 地址
 */
function getClientIp(req: Request): string {
  // 尝试从各种头部获取真实 IP
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    const ips = (forwarded as string).split(',');
    return ips[0].trim();
  }
  
  const realIp = req.headers['x-real-ip'];
  if (realIp) {
    return realIp as string;
  }
  
  return req.ip || req.socket.remoteAddress || '-';
}

/**
 * 请求日志中间件
 * 记录所有请求的方法、URL、状态码、耗时、IP
 */
export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const startTime = Date.now();
  const ip = getClientIp(req);
  // 使用 originalUrl 获取完整路径
  const fullUrl = req.originalUrl || req.url;

  // 标记是否已记录日志
  let logged = false;

  // 记录原始的 res.json 方法
  const originalJson = res.json.bind(res);

  // 重写 res.json 方法以捕获响应
  res.json = function (body: any) {
    if (!logged) {
      const duration = Date.now() - startTime;
      logRequest(req.method, fullUrl, res.statusCode, duration, ip);
      logged = true;
    }
    return originalJson(body);
  };

  // 监听响应完成事件（处理非 JSON 响应）
  res.on('finish', () => {
    if (!logged) {
      const duration = Date.now() - startTime;
      logRequest(req.method, fullUrl, res.statusCode, duration, ip);
      logged = true;
    }
  });

  next();
}

