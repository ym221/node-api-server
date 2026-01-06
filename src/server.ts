import { createApp } from './app';
import { testConnection } from './config/database';
import { logger } from './utils/logger';

const PORT = process.env.PORT || 8088;

/**
 * 启动服务器
 */
async function startServer() {
  try {
    // 测试数据库连接
    const dbConnected = await testConnection();
    if (!dbConnected) {
      logger.warn('⚠️  数据库连接失败，但服务器将继续运行');
    }

    // 创建应用
    const app = createApp();

    // 启动服务器
    app.listen(PORT, () => {
      logger.info(`🚀 服务器已启动`);
      logger.info(`📍 地址: http://localhost:${PORT}`);
      logger.info(`🎨 管理控制台: http://localhost:${PORT}/admin`);
      logger.info(`🔧 环境: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    logger.error('❌ 服务器启动失败:', error);
    process.exit(1);
  }
}

// 启动服务器
startServer();

// 优雅关闭
process.on('SIGTERM', () => {
  logger.info('收到 SIGTERM 信号，正在关闭服务器...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('收到 SIGINT 信号，正在关闭服务器...');
  process.exit(0);
});

