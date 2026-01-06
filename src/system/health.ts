import { Request, Response } from 'express';
import { Res } from '../core/Response';
import { pool } from '../config/database';

/**
 * 健康检查
 */
export async function healthCheck(req: Request, res: Response) {
  try {
    // 检查数据库连接
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();

    const data = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: 'connected',
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        unit: 'MB',
      },
    };

    return Res.success(res, data, 'B2B', '服务健康');
  } catch (error) {
    const data = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error',
    };

    return Res.error(res, '服务不健康', 'B2B', 503, data);
  }
}

