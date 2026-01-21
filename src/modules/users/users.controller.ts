/**
 * Users Controller
 * File này xử lý HTTP requests/responses cho các user endpoints
 * Controller layer - chỉ xử lý HTTP, business logic nằm ở Service layer
 */
import { Request, Response } from 'express';
import { UsersService } from './users.service';

export const UsersController = {
  /**
   * @swagger
   * /users/me:
   *   get:
   *     tags:
   *       - Users
   *     summary: Lấy thông tin user hiện tại
   *     description: Lấy thông tin của user đang đăng nhập
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Thông tin user
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 id:
   *                   type: string
   *                   format: uuid
   *                 email:
   *                   type: string
   *                   format: email
   *                 name:
   *                   type: string
   *                 role:
   *                   type: string
   *                   enum: [USER, ADMIN]
   *                 createdAt:
   *                   type: string
   *                   format: date-time
   *                 updatedAt:
   *                   type: string
   *                   format: date-time
   *       401:
   *         description: Chưa đăng nhập
   */
  async me(req: Request, res: Response) {
    // req.user được set bởi requireAuth middleware
    // req.user!.sub là user ID từ JWT payload
    const me = await UsersService.getMe(req.user!.sub);
    return res.json(me);
  },

  /**
   * @swagger
   * /users:
   *   get:
   *     tags:
   *       - Users
   *     summary: Lấy danh sách tất cả users
   *     description: Lấy danh sách tất cả users trong hệ thống (chỉ dành cho ADMIN)
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Danh sách users
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 type: object
   *                 properties:
   *                   id:
   *                     type: string
   *                     format: uuid
   *                   email:
   *                     type: string
   *                     format: email
   *                   name:
   *                     type: string
   *                   role:
   *                     type: string
   *                     enum: [USER, ADMIN]
   *                   createdAt:
   *                     type: string
   *                     format: date-time
   *                   updatedAt:
   *                     type: string
   *                     format: date-time
   *       401:
   *         description: Chưa đăng nhập
   *       403:
   *         description: Không có quyền (không phải ADMIN)
   */
  async list(_req: Request, res: Response) {
    // Gọi service để lấy danh sách users
    const users = await UsersService.listUsers();
    return res.json(users);
  },
};
