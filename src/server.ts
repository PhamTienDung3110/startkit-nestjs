/**
 * Entry point của ứng dụng - Khởi động server Express
 * File này tạo app instance và lắng nghe trên port được cấu hình
 */
import { createApp } from './app';
import { env } from './config/env';
import { logger } from './config/logger';

// Tạo Express app instance
const app = createApp();

// Khởi động server và lắng nghe trên port được cấu hình
app.listen(env.PORT, () => {
  logger.info(`Server: http://localhost:${env.PORT}`);
  logger.info(`Health: http://localhost:${env.PORT}/health`);
});
