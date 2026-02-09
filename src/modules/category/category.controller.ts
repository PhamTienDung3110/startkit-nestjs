/**
 * Category Controller
 * File này xử lý HTTP requests/responses cho các category endpoints
 * Controller layer - chỉ xử lý HTTP, business logic nằm ở Service layer
 */
import { Request, Response } from 'express';
import { CategoryService } from './category.service';
import { handleError } from '../../utils/error-handler';

// Create module-specific error handler
const handleCategoryError = (error: any, res: Response) =>
  handleError(error, res, 'Category');

export const CategoryController = {
  /**
   * Tạo danh mục mới
   * POST /api/categories
   *
   * @param req.body - Category data đã được validate bởi middleware
   * @param req.user.sub - User ID từ JWT token
   * @returns 201 Created với category info
   * @returns 409 Conflict nếu tên danh mục đã tồn tại
   * @returns 404 Not Found nếu parent category không tồn tại
   */
  async createCategory(req: Request, res: Response) {
    try {
      const userId = req.user?.sub;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const category = await CategoryService.createCategory(req.body, userId);
      return res.status(201).json({
        message: 'Category created successfully',
        category
      });
    } catch (e: any) {
      return handleCategoryError(e, res);
    }
  },

  /**
   * Lấy danh sách danh mục của user
   * GET /api/categories
   *
   * Query parameters (tất cả optional):
   * - type: 'income' | 'expense'
   * - includeChildren: 'true' | 'false' (default: true)
   * - limit: number (default: 50, max: 100)
   * - offset: number (default: 0)
   *
   * @param req.query - Query parameters đã được validate
   * @param req.user.sub - User ID từ JWT token
   * @returns 200 OK với danh sách categories và pagination info
   */
  async getCategories(req: Request, res: Response) {
    try {
      const userId = req.user?.sub;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const result = await CategoryService.getCategories(userId, {
        type: req.query.type as 'income' | 'expense' | undefined,
        includeChildren: req.query.includeChildren !== 'false',
        limit: parseInt(req.query.limit as string) || 50,
        offset: parseInt(req.query.offset as string) || 0
      });
      return res.status(200).json({
        message: 'Categories retrieved successfully',
        ...result
      });
    } catch (e: any) {
      console.error('Get categories error:', e);
      return res.status(500).json({ message: 'Internal server error' });
    }
  },

  /**
   * Lấy danh mục theo ID
   * GET /api/categories/:id
   *
   * @param req.params.id - Category ID
   * @param req.user.sub - User ID từ JWT token
   * @returns 200 OK với category info
   * @returns 404 Not Found nếu danh mục không tồn tại
   */
  async getCategory(req: Request, res: Response) {
    try {
      const userId = req.user?.sub;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const category = await CategoryService.getCategoryById(req.params.id, userId);
      if (!category) {
        return res.status(404).json({ message: 'Category not found' });
      }

      return res.status(200).json({
        message: 'Category retrieved successfully',
        category
      });
    } catch (e: any) {
      console.error('Get category error:', e);
      return res.status(500).json({ message: 'Internal server error' });
    }
  },

  /**
   * Cập nhật danh mục
   * PUT /api/categories/:id
   *
   * @param req.params.id - Category ID
   * @param req.body - Update data đã được validate
   * @param req.user.sub - User ID từ JWT token
   * @returns 200 OK với category info đã cập nhật
   * @returns 404 Not Found nếu danh mục không tồn tại
   * @returns 409 Conflict nếu tên danh mục đã tồn tại
   */
  async updateCategory(req: Request, res: Response) {
    try {
      const userId = req.user?.sub;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const category = await CategoryService.updateCategory(req.params.id, userId, req.body);
      return res.status(200).json({
        message: 'Category updated successfully',
        category
      });
    } catch (e: any) {
      return handleCategoryError(e, res);
    }
  },

  /**
   * Xóa danh mục (soft delete)
   * DELETE /api/categories/:id
   *
   * @param req.params.id - Category ID
   * @param req.user.sub - User ID từ JWT token
   * @returns 200 OK với category info đã xóa
   * @returns 404 Not Found nếu danh mục không tồn tại
   * @returns 409 Conflict nếu danh mục còn giao dịch hoặc danh mục con
   */
  async deleteCategory(req: Request, res: Response) {
    try {
      const userId = req.user?.sub;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const category = await CategoryService.deleteCategory(req.params.id, userId);
      return res.status(200).json({
        message: 'Category deleted successfully',
        category
      });
    } catch (e: any) {
      return handleCategoryError(e, res);
    }
  },

  /**
   * Tạo danh mục từ template
   * POST /api/categories/from-template
   *
   * @param req.body - Template data đã được validate
   * @param req.user.sub - User ID từ JWT token
   * @returns 201 Created với category info
   * @returns 404 Not Found nếu template không tồn tại
   * @returns 409 Conflict nếu tên danh mục đã tồn tại
   */
  async createFromTemplate(req: Request, res: Response) {
    try {
      const userId = req.user?.sub;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const category = await CategoryService.createFromTemplate(req.body, userId);
      return res.status(201).json({
        message: 'Category created from template successfully',
        category
      });
    } catch (e: any) {
      return handleCategoryError(e, res);
    }
  },

  /**
   * Lấy danh sách category templates
   * GET /api/categories/templates
   *
   * Query parameters (optional):
   * - type: 'income' | 'expense'
   *
   * @param req.query.type - Optional type filter
   * @returns 200 OK với danh sách templates
   */
  async getTemplates(req: Request, res: Response) {
    try {
      const type = req.query.type as 'income' | 'expense' | undefined;
      const templates = await CategoryService.getTemplates(type);
      return res.status(200).json({
        message: 'Templates retrieved successfully',
        templates
      });
    } catch (e: any) {
      console.error('Get templates error:', e);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
};
