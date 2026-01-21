/**
 * Wallet Controller
 * File này xử lý HTTP requests/responses cho các wallet endpoints
 * Controller layer - chỉ xử lý HTTP, business logic nằm ở Service layer
 */
import { Request, Response } from 'express';
import { WalletService } from './wallet.service';
import { handleError } from '../../utils/error-handler';

// Create module-specific error handler
const handleWalletError = (error: any, res: Response) =>
  handleError(error, res, 'Wallet');

export const WalletController = {
  /**
   * @swagger
   * /wallets:
   *   post:
   *     tags:
   *       - Wallets
   *     summary: Tạo ví mới
   *     description: Tạo ví tiền mới cho user hiện tại
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - name
   *               - type
   *             properties:
   *               name:
   *                 type: string
   *                 minLength: 1
   *                 maxLength: 100
   *                 example: "Ví Tiền Mặt"
   *               type:
   *                 type: string
   *                 enum: [cash, bank, ewallet, credit]
   *                 example: "cash"
   *               openingBalance:
   *                 type: number
   *                 minimum: 0
   *                 multipleOf: 0.01
   *                 example: 1000.00
   *                 default: 0
   *     responses:
   *       201:
   *         description: Ví được tạo thành công
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "Wallet created successfully"
   *                 wallet:
   *                   $ref: '#/components/schemas/Wallet'
   *       409:
   *         description: Tên ví đã tồn tại
   *       401:
   *         description: Chưa đăng nhập
   */
  async createWallet(req: Request, res: Response) {
    try {
      const userId = req.user?.sub;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const wallet = await WalletService.createWallet(req.body, userId);
      return res.status(201).json({
        message: 'Wallet created successfully',
        wallet
      });
    } catch (e: any) {
      return handleWalletError(e, res);
    }
  },

  /**
   * @swagger
   * /wallets:
   *   get:
   *     tags:
   *       - Wallets
   *     summary: Lấy danh sách ví
   *     description: Lấy danh sách ví của user hiện tại với pagination và filters
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: type
   *         schema:
   *           type: string
   *           enum: [cash, bank, ewallet, credit]
   *         description: Lọc theo loại ví
   *       - in: query
   *         name: includeArchived
   *         schema:
   *           type: boolean
   *           default: false
   *         description: Có bao gồm ví đã archive không
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 100
   *           default: 50
   *         description: Số lượng ví trả về
   *       - in: query
   *         name: offset
   *         schema:
   *           type: integer
   *           minimum: 0
   *           default: 0
   *         description: Số ví bỏ qua (pagination)
   *     responses:
   *       200:
   *         description: Danh sách ví
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "Wallets retrieved successfully"
   *                 wallets:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/Wallet'
   *                 pagination:
   *                   type: object
   *                   properties:
   *                     total:
   *                       type: integer
   *                     limit:
   *                       type: integer
   *                     offset:
   *                       type: integer
   *                     hasMore:
   *                       type: boolean
   *       401:
   *         description: Chưa đăng nhập
   */
  async getWallets(req: Request, res: Response) {
    try {
      const userId = req.user?.sub;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const result = await WalletService.getWallets(userId, {
        type: req.query.type as 'cash' | 'bank' | 'ewallet' | 'credit' | undefined,
        includeArchived: req.query.includeArchived === 'true',
        limit: parseInt(req.query.limit as string) || 50,
        offset: parseInt(req.query.offset as string) || 0
      });
      return res.status(200).json({
        message: 'Wallets retrieved successfully',
        ...result
      });
    } catch (e: any) {
      console.error('Get wallets error:', e);
      return res.status(500).json({ message: 'Internal server error' });
    }
  },

  /**
   * Lấy ví theo ID
   * GET /api/wallets/:id
   *
   * @param req.params.id - Wallet ID
   * @param req.user.sub - User ID từ JWT token
   * @returns 200 OK với wallet info
   * @returns 404 Not Found nếu ví không tồn tại
   */
  async getWallet(req: Request, res: Response) {
    try {
      const userId = req.user?.sub;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const wallet = await WalletService.getWalletById(req.params.id, userId);
      if (!wallet) {
        return res.status(404).json({ message: 'Wallet not found' });
      }

      return res.status(200).json({
        message: 'Wallet retrieved successfully',
        wallet
      });
    } catch (e: any) {
      console.error('Get wallet error:', e);
      return res.status(500).json({ message: 'Internal server error' });
    }
  },

  /**
   * Cập nhật ví
   * PUT /api/wallets/:id
   *
   * @param req.params.id - Wallet ID
   * @param req.body - Update data đã được validate
   * @param req.user.sub - User ID từ JWT token
   * @returns 200 OK với wallet info đã cập nhật
   * @returns 404 Not Found nếu ví không tồn tại
   * @returns 409 Conflict nếu tên ví đã tồn tại
   */
  async updateWallet(req: Request, res: Response) {
    try {
      const userId = req.user?.sub;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const wallet = await WalletService.updateWallet(req.params.id, userId, req.body);
      return res.status(200).json({
        message: 'Wallet updated successfully',
        wallet
      });
    } catch (e: any) {
      return handleWalletError(e, res);
    }
  },

  /**
   * Xóa ví (archive)
   * DELETE /api/wallets/:id
   *
   * @param req.params.id - Wallet ID
   * @param req.user.sub - User ID từ JWT token
   * @returns 200 OK với wallet info đã archive
   * @returns 404 Not Found nếu ví không tồn tại
   * @returns 409 Conflict nếu ví còn giao dịch
   */
  async deleteWallet(req: Request, res: Response) {
    try {
      const userId = req.user?.sub;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const wallet = await WalletService.deleteWallet(req.params.id, userId);
      return res.status(200).json({
        message: 'Wallet archived successfully',
        wallet
      });
    } catch (e: any) {
      return handleWalletError(e, res);
    }
  },

  /**
   * Lấy thống kê ví
   * GET /api/wallets/stats/summary
   *
   * @param req.user.sub - User ID từ JWT token
   * @returns 200 OK với thống kê ví
   */
  async getWalletStats(req: Request, res: Response) {
    try {
      const userId = req.user?.sub;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const stats = await WalletService.getWalletStats(userId);
      return res.status(200).json({
        message: 'Wallet stats retrieved successfully',
        stats
      });
    } catch (e: any) {
      console.error('Get wallet stats error:', e);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
};
