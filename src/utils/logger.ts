import winston from 'winston';
import path from 'path';
import fs from 'fs';

// 确保日志目录存在
const logDir = process.env.LOG_DIR || './logs';
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// 日志格式
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    let log = `[${timestamp}] ${level.toUpperCase()}: ${message}`;
    if (stack) {
      log += `\n${stack}`;
    }
    return log;
  })
);

// 创建日志器
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  transports: [
    // 控制台输出（带颜色）
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        logFormat
      ),
    }),
    // 错误日志文件
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // 所有日志文件
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

// 请求日志专用（用于中间件）
export const logRequest = (method: string, url: string, statusCode: number, duration: number, ip?: string) => {
  const ipPart = ip ? ` - ${ip}` : '';
  const message = `${method} ${url} ${statusCode} ${duration}ms${ipPart}`;
  if (statusCode >= 500) {
    logger.error(message);
  } else if (statusCode >= 400) {
    logger.warn(message);
  } else {
    logger.info(message);
  }
};

