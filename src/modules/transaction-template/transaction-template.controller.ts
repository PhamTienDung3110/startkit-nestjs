/**
 * Transaction Template Controller
 * File này xử lý HTTP requests/responses cho các transaction template endpoints
 * Controller layer - chỉ xử lý HTTP, business logic nằm ở Service layer
 */
import { Request, Response } from 'express';
import { TransactionTemplateService } from './transaction-template.service';
import { handleError } from '../../utils/error-handler';

// Create module-specific error handler
const handleTemplateError = (error: any, res: Response) =>
  handleError(error, res, 'TransactionTemplate');

export const TransactionTemplateController = {
  /**
   * @swagger
   * /transaction-templates:
   *   post:
   *     tags:
   *       - Transaction Templates
   *     summary: Tạo transaction template mới
   *     description: Tạo template độc lập (không từ transaction) để autofill khi tạo transaction
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             oneOf:
   *               - $ref: '#/components/schemas/IncomeTemplate'
   *               - $ref: '#/components/schemas/ExpenseTemplate'
   *               - $ref: '#/components/schemas/TransferTemplate'
   *             discriminator:
   *               propertyName: type
   *     responses:
   *       201:
   *         description: Template được tạo thành công
   *       400:
   *         description: Dữ liệu không hợp lệ
   *       404:
   *         description: Ví hoặc danh mục không tồn tại
   *       409:
   *         description: Tên template đã tồn tại
   *       401:
   *         description: Chưa đăng nhập
   */
  async createTemplate(req: Request, res: Response) {
    try {
      const userId = req.user?.sub;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const template = await TransactionTemplateService.createTemplate(req.body, userId);

      return res.status(201).json({
        message: 'Transaction template created successfully',
        template
      });
    } catch (e: any) {
      return handleTemplateError(e, res);
    }
  },

  /**
   * @swagger
   * /transaction-templates/from-transaction:
   *   post:
   *     tags:
   *       - Transaction Templates
   *     summary: Tạo template từ transaction hiện có
   *     description: Lưu một giao dịch thành template để tái sử dụng
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - transactionId
   *               - name
   *             properties:
   *               transactionId:
   *                 type: string
   *                 format: uuid
   *               name:
   *                 type: string
   *                 minLength: 1
   *                 maxLength: 100
   *     responses:
   *       201:
   *         description: Template được tạo thành công
   *       404:
   *         description: Transaction không tồn tại
   *       409:
   *         description: Tên template đã tồn tại
   *       401:
   *         description: Chưa đăng nhập
   */
  async createTemplateFromTransaction(req: Request, res: Response) {
    try {
      const userId = req.user?.sub;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const template = await TransactionTemplateService.createTemplateFromTransaction(
        req.body,
        userId
      );

      return res.status(201).json({
        message: 'Transaction template created from transaction successfully',
        template
      });
    } catch (e: any) {
      return handleTemplateError(e, res);
    }
  },

  /**
   * @swagger
   * /transaction-templates:
   *   get:
   *     tags:
   *       - Transaction Templates
   *     summary: Lấy danh sách transaction templates
   *     description: Lấy danh sách templates của user, có thể filter theo type
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: type
   *         schema:
   *           type: string
   *           enum: [income, expense, transfer]
   *         description: Lọc theo loại giao dịch
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 100
   *           default: 50
   *         description: Số lượng templates trả về
   *       - in: query
   *         name: offset
   *         schema:
   *           type: integer
   *           minimum: 0
   *           default: 0
   *         description: Số lượng templates bỏ qua
   *     responses:
   *       200:
   *         description: Danh sách templates
   *       401:
   *         description: Chưa đăng nhập
   */
  async getTemplates(req: Request, res: Response) {
    try {
      const userId = req.user?.sub;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const result = await TransactionTemplateService.getTemplates(userId, {
        type: req.query.type as 'income' | 'expense' | 'transfer' | undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        offset: req.query.offset ? parseInt(req.query.offset as string) : undefined
      });

      return res.status(200).json({
        message: 'Transaction templates retrieved successfully',
        ...result
      });
    } catch (e: any) {
      return handleTemplateError(e, res);
    }
  },

  /**
   * @swagger
   * /transaction-templates/{id}:
   *   get:
   *     tags:
   *       - Transaction Templates
   *     summary: Lấy template theo ID
   *     description: Lấy thông tin chi tiết của một template
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: ID của template
   *     responses:
   *       200:
   *         description: Thông tin template
   *       404:
   *         description: Template không tồn tại
   *       401:
   *         description: Chưa đăng nhập
   */
  async getTemplate(req: Request, res: Response) {
    try {
      const userId = req.user?.sub;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const template = await TransactionTemplateService.getTemplateById(
        req.params.id,
        userId
      );

      if (!template) {
        return res.status(404).json({ message: 'Transaction template not found' });
      }

      return res.status(200).json({
        message: 'Transaction template retrieved successfully',
        template
      });
    } catch (e: any) {
      return handleTemplateError(e, res);
    }
  },

  /**
   * @swagger
   * /transaction-templates/{id}:
   *   put:
   *     tags:
   *       - Transaction Templates
   *     summary: Cập nhật template
   *     description: Cập nhật thông tin của template
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: ID của template
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *                 minLength: 1
   *                 maxLength: 100
   *               walletId:
   *                 type: string
   *                 format: uuid
   *                 nullable: true
   *               categoryId:
   *                 type: string
   *                 format: uuid
   *                 nullable: true
   *               amount:
   *                 type: number
   *                 minimum: 0
   *                 nullable: true
   *               note:
   *                 type: string
   *                 maxLength: 1000
   *                 nullable: true
   *     responses:
   *       200:
   *         description: Template đã được cập nhật
   *       404:
   *         description: Template không tồn tại
   *       409:
   *         description: Tên template đã tồn tại
   *       401:
   *         description: Chưa đăng nhập
   */
  async updateTemplate(req: Request, res: Response) {
    try {
      const userId = req.user?.sub;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const template = await TransactionTemplateService.updateTemplate(
        req.params.id,
        userId,
        req.body
      );

      return res.status(200).json({
        message: 'Transaction template updated successfully',
        template
      });
    } catch (e: any) {
      return handleTemplateError(e, res);
    }
  },

  /**
   * @swagger
   * /transaction-templates/{id}:
   *   delete:
   *     tags:
   *       - Transaction Templates
   *     summary: Xóa template
   *     description: Xóa template (hard delete)
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: ID của template
   *     responses:
   *       200:
   *         description: Template đã được xóa
   *       404:
   *         description: Template không tồn tại
   *       401:
   *         description: Chưa đăng nhập
   */
  async deleteTemplate(req: Request, res: Response) {
    try {
      const userId = req.user?.sub;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const template = await TransactionTemplateService.deleteTemplate(
        req.params.id,
        userId
      );

      return res.status(200).json({
        message: 'Transaction template deleted successfully',
        template
      });
    } catch (e: any) {
      return handleTemplateError(e, res);
    }
  }
};
