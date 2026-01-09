/**
 * Authentication Validation Schemas
 * File này định nghĩa Zod schemas để validate request body cho các auth endpoints
 * Schemas này được sử dụng với validateBody middleware
 */
import { z } from 'zod';

/**
 * Schema validate request body cho đăng ký
 * - email: Phải là email hợp lệ
 * - password: Tối thiểu 6 ký tự
 * - name: Optional, nếu có thì tối thiểu 1 ký tự
 */
export const registerSchema = z.object({
  email: z.string().email(), // Validate email format
  password: z.string().min(6), // Password tối thiểu 6 ký tự
  name: z.string().min(1).optional(), // Tên optional, nếu có thì không được rỗng
});

/**
 * Schema validate request body cho đăng nhập
 * - email: Phải là email hợp lệ
 * - password: Tối thiểu 6 ký tự
 */
export const loginSchema = z.object({
  email: z.string().email(), // Validate email format
  password: z.string().min(6), // Password tối thiểu 6 ký tự
});

/**
 * Schema validate request body cho refresh token
 * - refreshToken: Phải là string, tối thiểu 10 ký tự
 */
export const refreshSchema = z.object({
  refreshToken: z.string().min(10), // Refresh token tối thiểu 10 ký tự
});
