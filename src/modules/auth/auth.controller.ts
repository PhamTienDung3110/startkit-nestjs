/**
 * Authentication Controller
 * File này xử lý HTTP requests/responses cho các authentication endpoints
 * Controller layer - chỉ xử lý HTTP, business logic nằm ở Service layer
 */
import { Request, Response } from 'express';
import { AuthService } from './auth.service';

export const AuthController = {
  /**
   * Đăng ký tài khoản mới
   * POST /api/auth/register
   * 
   * @param req.body.email - Email của user (đã được validate bởi middleware)
   * @param req.body.password - Password của user (đã được validate)
   * @param req.body.name - Tên của user (optional)
   * @returns 201 Created với user info (không có password)
   * @returns 409 Conflict nếu email đã tồn tại
   */
  async register(req: Request, res: Response) {
    try {
      // Gọi service để xử lý business logic
      const user = await AuthService.register(req.body.email, req.body.password, req.body.name);
      // Trả về user info (không có password) với status 201
      return res.status(201).json(user);
    } catch (e: any) {
      // Xử lý lỗi email đã tồn tại
      if (e.message === 'EMAIL_EXISTS') return res.status(409).json({ message: 'Email already exists' });
      // Các lỗi khác
      return res.status(500).json({ message: 'Internal error' });
    }
  },

  /**
   * Đăng nhập
   * POST /api/auth/login
   * 
   * @param req.body.email - Email của user
   * @param req.body.password - Password của user
   * @returns 200 OK với accessToken và refreshToken
   * @returns 401 Unauthorized nếu credentials không đúng
   */
  async login(req: Request, res: Response) {
    try {
      // Gọi service với metadata từ request (IP, User-Agent để tracking)
      const tokens = await AuthService.login(req.body.email, req.body.password, {
        ip: req.ip, // IP address của client
        userAgent: req.headers['user-agent'], // User agent string
      });
      // Trả về tokens
      return res.json(tokens);
    } catch (e: any) {
      // Xử lý lỗi credentials không đúng
      if (e.message === 'INVALID_CREDENTIALS') return res.status(401).json({ message: 'Invalid credentials' });
      return res.status(500).json({ message: 'Internal error' });
    }
  },

  /**
   * Làm mới access token bằng refresh token
   * POST /api/auth/refresh
   * 
   * @param req.body.refreshToken - Refresh token hiện tại
   * @returns 200 OK với accessToken và refreshToken mới
   * @returns 401 Unauthorized nếu refresh token không hợp lệ/đã hết hạn/đã bị revoke
   */
  async refresh(req: Request, res: Response) {
    try {
      // Gọi service để refresh tokens (token rotation)
      const tokens = await AuthService.refresh(req.body.refreshToken);
      return res.json(tokens);
    } catch (e: any) {
      // Xử lý các lỗi refresh token
      if (e.message === 'REFRESH_REVOKED') return res.status(401).json({ message: 'Refresh token revoked' });
      if (e.message === 'REFRESH_EXPIRED') return res.status(401).json({ message: 'Refresh token expired' });
      return res.status(500).json({ message: 'Internal error' });
    }
  },

  /**
   * Đăng xuất
   * POST /api/auth/logout
   * 
   * @param req.body.refreshToken - Refresh token cần revoke
   * @returns 204 No Content khi logout thành công
   */
  async logout(req: Request, res: Response) {
    // Xóa refresh token khỏi database (revoke token)
    await AuthService.logout(req.body.refreshToken);
    // Trả về 204 No Content (thành công, không có response body)
    return res.status(204).send();
  },
};
