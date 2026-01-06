import { Application, Router } from 'express';
import fs from 'fs';
import path from 'path';
import { logger } from '../utils/logger';

// 判断是开发模式还是生产模式
const isDevelopment = process.env.NODE_ENV !== 'production' && __dirname.includes('src');

// 开发模式：src/generated，生产模式：dist/generated
const GENERATED_DIR = isDevelopment 
  ? path.join(__dirname, '../generated')
  : path.join(__dirname, '../generated');

/**
 * 动态加载所有生成的模块路由
 */
export function loadGeneratedRoutes(app: Application) {
  const router = Router();

  // 确保 generated 目录存在
  if (!fs.existsSync(GENERATED_DIR)) {
    logger.warn('Generated 目录不存在，将创建空目录');
    fs.mkdirSync(GENERATED_DIR, { recursive: true });
    return router;
  }

  // 扫描 generated 目录
  const modules = fs.readdirSync(GENERATED_DIR);
  let loadedCount = 0;

  for (const moduleName of modules) {
    const modulePath = path.join(GENERATED_DIR, moduleName);
    const stat = fs.statSync(modulePath);

    if (!stat.isDirectory()) {
      continue;
    }

    // 根据环境选择文件扩展名
    const routesFile = isDevelopment 
      ? path.join(modulePath, 'routes.ts')
      : path.join(modulePath, 'routes.js');
    
    if (fs.existsSync(routesFile)) {
      try {
        // 清除缓存（开发模式下支持热重载）
        if (isDevelopment) {
          delete require.cache[require.resolve(routesFile)];
        }
        
        // 动态导入模块路由
        const moduleRoutes = require(routesFile).default;
        
        if (moduleRoutes) {
          router.use(moduleRoutes);
          loadedCount++;
          logger.info(`✅ 加载模块路由: ${moduleName}`);
        }
      } catch (error) {
        logger.error(`❌ 加载模块路由失败: ${moduleName}`, error);
      }
    } else {
      const fileType = isDevelopment ? 'routes.ts' : 'routes.js';
      logger.warn(`⚠️  模块 ${moduleName} 缺少 ${fileType} 文件`);
    }
  }

  logger.info(`📦 共加载 ${loadedCount} 个模块路由`);

  return router;
}

/**
 * 扫描并返回所有模块信息（包括未编译的）
 */
export function scanModules() {
  if (!fs.existsSync(GENERATED_DIR)) {
    return [];
  }

  const modules: any[] = [];
  const items = fs.readdirSync(GENERATED_DIR);

  for (const item of items) {
    const modulePath = path.join(GENERATED_DIR, item);
    const stat = fs.statSync(modulePath);

    if (stat.isDirectory()) {
      // 读取模块配置
      const configFileTs = path.join(modulePath, 'module.config.ts');
      const configFileJs = path.join(modulePath, 'module.config.js');
      let config = null;

      // 优先尝试加载 TS 文件（开发模式）或 JS 文件（生产模式）
      const configFile = isDevelopment && fs.existsSync(configFileTs) ? configFileTs : configFileJs;
      
      if (fs.existsSync(configFile)) {
        try {
          // 清除缓存
          if (isDevelopment) {
            delete require.cache[require.resolve(configFile)];
          }
          config = require(configFile).moduleConfig;
        } catch (error) {
          logger.error(`读取模块配置失败: ${item}`, error);
        }
      }

      const routesFileTs = path.join(modulePath, 'routes.ts');
      const routesFileJs = path.join(modulePath, 'routes.js');
      const isCompiled = fs.existsSync(routesFileJs) || fs.existsSync(routesFileTs);

      modules.push({
        name: item,
        path: modulePath,
        config,
        hasPrompt: fs.existsSync(path.join(modulePath, '.prompt.md')),
        hasSchema: fs.existsSync(path.join(modulePath, 'schema.sql')),
        isCompiled,
      });
    }
  }

  return modules;
}

