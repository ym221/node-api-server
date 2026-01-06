import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { Res } from './Response';

/**
 * 自定义错误类
 */
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code: string = 'INTERNAL_ERROR'
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 全局错误处理中间件
 */
export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // 记录错误日志
  logger.error(`Error: ${err.message}`, {
    method: req.method,
    url: req.url,
    stack: err.stack,
  });

  // 判断错误类型
  if (err instanceof AppError) {
    return Res.error(res, err.message, 'B2B', err.statusCode);
  }

  // MySQL 错误
  if ('code' in err) {
    const mysqlError = err as any;
    if (mysqlError.code === 'ER_DUP_ENTRY') {
      return Res.error(res, '数据已存在', 'B2B', 400);
    }
    if (mysqlError.code === 'ER_NO_REFERENCED_ROW_2') {
      return Res.error(res, '关联数据不存在', 'B2B', 400);
    }
  }

  // 其他未知错误
  const message = process.env.NODE_ENV === 'production' 
    ? '服务器内部错误' 
    : err.message;
  
  return Res.serverError(res, message);
}

/**
 * 404 错误处理
 */
export function notFoundHandler(req: Request, res: Response) {
  return Res.notFound(res, `接口不存在: ${req.method} ${req.url}`);
}

/**
 * 异步路由包装器（捕获异步错误）
 */
export function asyncHandler(fn: Function) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

