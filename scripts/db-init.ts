import { testConnection } from '../src/config/database';
import { logger } from '../src/utils/logger';
import { readFileSync } from 'fs';
import { join } from 'path';
import { pool } from '../src/config/database';

/**
 * 数据库初始化脚本
 * 读取 scripts/db-init.sql 并执行
 */
async function initDatabase() {
  try {
    logger.info('开始初始化数据库...');

    // 测试连接
    const connected = await testConnection();
    if (!connected) {
      logger.error('数据库连接失败，请检查配置');
      process.exit(1);
    }

    // 读取 SQL 文件
    const sqlPath = join(__dirname, 'db-init.sql');
    const sql = readFileSync(sqlPath, 'utf-8');

    // 分割并执行 SQL 语句
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (const statement of statements) {
      if (statement.toUpperCase().startsWith('SELECT')) {
        const [rows] = await pool.execute(statement);
        console.log(rows);
      } else {
        await pool.execute(statement);
      }
    }

    logger.info('✅ 数据库初始化完成');
    process.exit(0);
  } catch (error) {
    logger.error('❌ 数据库初始化失败:', error);
    process.exit(1);
  }
}

// 运行初始化
initDatabase();

