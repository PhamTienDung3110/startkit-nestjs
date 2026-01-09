/**
 * Định nghĩa tất cả API routes của ứng dụng
 * File này tập trung tất cả các endpoint và middleware liên quan
 */
import { Router } from 'express';
import { validateBody } from './middlewares/validate.middleware';
import { requireAuth, requireRole } from './middlewares/auth.middleware';

import { AuthController } from './modules/auth/auth.controller';
import { registerSchema, loginSchema, refreshSchema } from './modules/auth/auth.schema';
import { UsersController } from './modules/users/users.controller';

// Tạo router instance để định nghĩa các routes
export const routes = Router();

// ========== Authentication Routes ==========
// Đăng ký tài khoản mới - validate body với registerSchema
routes.post('/auth/register', validateBody(registerSchema), AuthController.register);
// Đăng nhập - validate body với loginSchema
routes.post('/auth/login', validateBody(loginSchema), AuthController.login);
// Làm mới access token bằng refresh token - validate body với refreshSchema
routes.post('/auth/refresh', validateBody(refreshSchema), AuthController.refresh);
// Đăng xuất - xóa refresh token
routes.post('/auth/logout', validateBody(refreshSchema), AuthController.logout);

// ========== User Routes ==========
// Lấy thông tin user hiện tại - yêu cầu authentication
routes.get('/users/me', requireAuth, UsersController.me);
// Lấy danh sách users - yêu cầu authentication và role ADMIN
routes.get('/users', requireAuth, requireRole(['ADMIN']), UsersController.list);
