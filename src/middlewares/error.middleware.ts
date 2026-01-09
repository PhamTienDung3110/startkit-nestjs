/**
 * Global Error Handler Middleware
 * File này xử lý tất cả errors trong request pipeline
 * Phải được đặt cuối cùng trong app để bắt mọi errors
 */
import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from '../config/logger';

/**
 * Error handling middleware
 * Bắt tất cả errors được throw hoặc pass vào next(err)
 * Xử lý và trả về response phù hợp
 * 
 * @param err - Error object được throw hoặc pass vào next()
 * @param _req - Express Request object (không sử dụng)
 * @param res - Express Response object
 * @param _next - Express NextFunction (không sử dụng)
 */
export const errorMiddleware = (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  // Xử lý Zod validation errors - lỗi validate request body/params
  if (err instanceof ZodError) {
    return res.status(400).json({ 
      message: 'Validation error', 
      errors: err.issues // Chi tiết các lỗi validation (ZodError có property 'issues')
    });
  }

  // Xử lý các lỗi khác (unexpected errors)
  // Log lỗi để debug (không expose chi tiết cho client vì lý do bảo mật)
  logger.error({ err }, 'Unhandled error');
  return res.status(500).json({ message: 'Internal server error' });
};
