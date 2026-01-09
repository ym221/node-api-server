import { Request, Response } from 'express';
import { Res } from '../../core/Response';

/**
 * 重新加载模块路由
 * 用于在不重启服务器的情况下加载新增的模块
 */
export async function reloadRoutes(req: Request, res: Response) {
  try {
    const { reloadGeneratedRoutes } = require('../../app');
    reloadGeneratedRoutes();
    
    return Res.success(res, null, 'B2B', '路由重新加载成功');
  } catch (error) {
    console.error('重新加载路由失败:', error);
    return Res.serverError(res, '重新加载路由失败');
  }
}

