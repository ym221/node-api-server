-- 数据库初始化脚本

-- 创建数据库（如果不存在）
CREATE DATABASE IF NOT EXISTS `api_test_server` 
  DEFAULT CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

USE `api_test_server`;

-- 该项目采用动态模块化设计
-- 数据表由各个模块的 schema.sql 文件定义
-- 模块位于 src/generated/[模块名]/ 目录下

-- 系统不需要固定的系统表
-- 所有配置存储在内存或文件系统中

-- 使用说明：
-- 1. 修改 .env 文件中的数据库配置
-- 2. 运行此脚本创建数据库：mysql -u root -p < scripts/db-init.sql
-- 3. AI 生成模块时会自动创建对应的数据表
-- 4. 或手动执行模块的 schema.sql：mysql -u root -p api_test_server < src/generated/[模块名]/schema.sql

SELECT 'Database initialized successfully!' as message;

