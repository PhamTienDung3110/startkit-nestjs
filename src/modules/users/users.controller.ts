/**
 * Users Controller
 * File này xử lý HTTP requests/responses cho các user endpoints
 * Controller layer - chỉ xử lý HTTP, business logic nằm ở Service layer
 */
import { Request, Response } from 'express';
import { UsersService } from './users.service';

export const UsersController = {
  /**
   * Lấy thông tin user hiện tại
   * GET /api/users/me
   * Yêu cầu: Authentication (requireAuth middleware)
   * 
   * @param req.user - User info từ JWT token (được set bởi requireAuth middleware)
   * @returns 200 OK với thông tin user (không có password)
   */
  async me(req: Request, res: Response) {
    // req.user được set bởi requireAuth middleware
    // req.user!.sub là user ID từ JWT payload
    const me = await UsersService.getMe(req.user!.sub);
    return res.json(me);
  },

  /**
   * Lấy danh sách tất cả users
   * GET /api/users
   * Yêu cầu: Authentication + Role ADMIN (requireAuth + requireRole middleware)
   * 
   * @returns 200 OK với danh sách users (không có password)
   */
  async list(_req: Request, res: Response) {
    // Gọi service để lấy danh sách users
    const users = await UsersService.listUsers();
    return res.json(users);
  },
};
