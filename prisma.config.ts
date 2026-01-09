/**
 * Prisma Configuration File (Prisma v7)
 * File này cấu hình Prisma CLI và database connection
 * 
 * Lưu ý Prisma v7:
 * - Prisma CLI đọc DATABASE_URL từ prisma.config.ts (không còn từ schema.prisma)
 * - schema.prisma KHÔNG còn khai báo url trong datasource block
 */
import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

// Export default config cho Prisma CLI
export default defineConfig({
  // Đường dẫn đến Prisma schema file
  schema: 'prisma/schema.prisma',
  
  // Cấu hình migrations
  migrations: {
    // Thư mục chứa migration files
    path: 'prisma/migrations',
    // Script chạy seed data sau khi migrate (BẮT BUỘC với Prisma v7)
    // Sử dụng tsx để chạy TypeScript file trực tiếp
    seed: 'npx tsx prisma/seed.ts',
  },
  
  // Cấu hình datasource - đọc DATABASE_URL từ environment variable
  datasource: {
    url: env('DATABASE_URL'),
  },
});
