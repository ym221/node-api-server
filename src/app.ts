import express, { Application, Router } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { corsConfig } from './config/cors';
import { requestLogger } from './middlewares/requestLogger';
import { interfaceControlMiddleware } from './middlewares/interfaceControl';
import { errorHandler, notFoundHandler } from './core/ErrorHandler';
import { logger } from './utils/logger';

// 加载环境变量
dotenv.config();

// 存储当前的动态路由
let currentGeneratedRouter: Router | null = null;

/**
 * 重新加载生成的模块路由
 */
export function reloadGeneratedRoutes(): Router {
  const { loadGeneratedRoutes } = require('./routes/index');
  currentGeneratedRouter = loadGeneratedRoutes(null);
  logger.info('🔄 路由已重新加载');
  return currentGeneratedRouter;
}

/**
 * 创建 Express 应用
 */
export function createApp(): Application {
  const app = express();

  // 基础中间件
  app.use(cors(corsConfig));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // 请求日志中间件
  app.use(requestLogger);

  // 接口控制中间件（延迟、错误、禁用等）
  app.use(interfaceControlMiddleware);

  // 静态文件服务（前端管理控制台）
  app.use('/admin', express.static(path.join(__dirname, '../public/admin')));
  app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

  // 根路径重定向到管理控制台
  app.get('/', (req, res) => {
    res.redirect('/admin');
  });

  // 系统管理 API
  const adminRoutes = require('./system/admin/routes').default;
  app.use('/api/_admin', adminRoutes);

  // 动态加载生成的模块路由（使用代理路由）
  currentGeneratedRouter = reloadGeneratedRoutes();
  app.use('/api', (req, res, next) => {
    if (currentGeneratedRouter) {
      currentGeneratedRouter(req, res, next);
    } else {
      next();
    }
  });

  // 404 处理
  app.use(notFoundHandler);

  // 全局错误处理
  app.use(errorHandler);

  logger.info('✅ Express 应用创建成功');

  return app;
}

