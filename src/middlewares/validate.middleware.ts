/**
 * Request Body Validation Middleware
 * File này cung cấp middleware để validate request body với Zod schema
 */
import { ZodSchema } from 'zod';
import { Request, Response, NextFunction } from 'express';

/**
 * Middleware factory để validate request body
 * Sử dụng Zod schema để validate và parse request body
 * Nếu validation thành công, replace req.body với validated data
 * Nếu validation fail, pass error vào next() để error middleware xử lý
 * 
 * @param schema - Zod schema để validate request body
 * @returns Express middleware function
 * 
 * @example
 * router.post('/users', validateBody(createUserSchema), controller.create);
 */
export const validateBody =
  (schema: ZodSchema) => (req: Request, _res: Response, next: NextFunction) => {
    try {
      // Parse và validate req.body với schema
      // Nếu hợp lệ, schema.parse() trả về validated data (đã được sanitize)
      // Nếu không hợp lệ, sẽ throw ZodError
      req.body = schema.parse(req.body);
      next(); // Validation thành công, tiếp tục request
    } catch (err) {
      // Pass error vào next() để error middleware xử lý
      // Error middleware sẽ trả về 400 với validation errors
      next(err);
    }
  };
