/**
 * Wallet Service
 * File này chứa business logic cho việc quản lý ví tiền
 * Service layer - xử lý logic nghiệp vụ, không liên quan đến HTTP
 */
import { prisma } from '../../db/prisma';
import { CreateWalletData, UpdateWalletData, GetWalletsQuery } from './wallet.schema';

export const WalletService = {
  /**
   * Tạo ví mới cho user
   *
   * @param data - Dữ liệu ví mới
   * @param userId - ID của user tạo ví
   * @returns Wallet object đã tạo
   * @throws Error('WALLET_NAME_EXISTS') nếu tên ví đã tồn tại cho user này
   */
  async createWallet(data: CreateWalletData, userId: string) {
    const { name, type, openingBalance = 0 } = data;

    // Kiểm tra tên ví đã tồn tại cho user này chưa
    const existingWallet = await prisma.wallet.findFirst({
      where: {
        userId,
        name,
        isArchived: false
      }
    });

    if (existingWallet) {
      throw new Error('WALLET_NAME_EXISTS');
    }

    // Tạo ví mới
    const wallet = await prisma.wallet.create({
      data: {
        userId,
        name,
        type,
        openingBalance,
        currentBalance: openingBalance // Số dư hiện tại ban đầu = số dư mở đầu
      }
    });

    return wallet;
  },

  /**
   * Lấy danh sách ví của user
   *
   * @param userId - ID của user
   * @param filters - Các filter tùy chọn
   * @returns Danh sách ví với pagination
   */
  async getWallets(userId: string, filters: Partial<GetWalletsQuery> = {}) {
    const { type, includeArchived = false, limit = 50, offset = 0 } = filters;

    // Build where clause
    const where: any = { userId };

    if (!includeArchived) {
      where.isArchived = false;
    }

    if (type) {
      where.type = type;
    }

    // Lấy danh sách ví
    const wallets = await prisma.wallet.findMany({
      where,
      orderBy: [
        { isArchived: 'asc' }, // Ví active trước
        { createdAt: 'desc' }  // Sau đó theo thời gian tạo
      ],
      take: limit,
      skip: offset
    });

    // Đếm total
    const total = await prisma.wallet.count({ where });

    return {
      wallets,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    };
  },

  /**
   * Lấy ví theo ID
   *
   * @param walletId - ID của ví
   * @param userId - ID của user (để verify ownership)
   * @returns Wallet object hoặc null nếu không tìm thấy
   */
  async getWalletById(walletId: string, userId: string) {
    return await prisma.wallet.findFirst({
      where: {
        id: walletId,
        userId
      }
    });
  },

  /**
   * Cập nhật ví
   *
   * @param walletId - ID của ví cần cập nhật
   * @param userId - ID của user sở hữu ví
   * @param data - Dữ liệu cập nhật
   * @returns Wallet object đã cập nhật
   * @throws Error('WALLET_NOT_FOUND') nếu ví không tồn tại
   * @throws Error('WALLET_NAME_EXISTS') nếu tên mới đã tồn tại
   */
  async updateWallet(walletId: string, userId: string, data: UpdateWalletData) {
    // Kiểm tra ví tồn tại và thuộc user
    const existingWallet = await prisma.wallet.findFirst({
      where: { id: walletId, userId }
    });

    if (!existingWallet) {
      throw new Error('WALLET_NOT_FOUND');
    }

    // Nếu cập nhật tên, kiểm tra tên mới không trùng
    if (data.name && data.name !== existingWallet.name) {
      const nameExists = await prisma.wallet.findFirst({
        where: {
          userId,
          name: data.name,
          isArchived: false,
          id: { not: walletId } // Loại trừ ví hiện tại
        }
      });

      if (nameExists) {
        throw new Error('WALLET_NAME_EXISTS');
      }
    }

    // Cập nhật ví
    const updatedWallet = await prisma.wallet.update({
      where: { id: walletId },
      data
    });

    return updatedWallet;
  },

  /**
   * Xóa ví (soft delete bằng cách archive)
   *
   * @param walletId - ID của ví cần xóa
   * @param userId - ID của user sở hữu ví
   * @returns Wallet object đã archive
   * @throws Error('WALLET_NOT_FOUND') nếu ví không tồn tại
   * @throws Error('WALLET_HAS_TRANSACTIONS') nếu ví còn giao dịch
   */
  async deleteWallet(walletId: string, userId: string) {
    // Kiểm tra ví tồn tại và thuộc user
    const wallet = await prisma.wallet.findFirst({
      where: { id: walletId, userId },
      include: {
        entries: {
          select: { id: true },
          take: 1 // Chỉ cần kiểm tra có entry nào không
        }
      }
    });

    if (!wallet) {
      throw new Error('WALLET_NOT_FOUND');
    }

    // Kiểm tra ví có giao dịch nào không
    if (wallet.entries.length > 0) {
      throw new Error('WALLET_HAS_TRANSACTIONS');
    }

    // Archive ví thay vì xóa cứng
    const archivedWallet = await prisma.wallet.update({
      where: { id: walletId },
      data: { isArchived: true }
    });

    return archivedWallet;
  },

  /**
   * Lấy thống kê tổng quan về ví của user
   *
   * @param userId - ID của user
   * @returns Thống kê tổng quan
   */
  async getWalletStats(userId: string) {
    // Đếm số ví theo loại
    const walletStats = await prisma.wallet.groupBy({
      by: ['type'],
      where: {
        userId,
        isArchived: false
      },
      _count: {
        id: true
      }
    });

    // Tính tổng số dư
    const totalBalance = await prisma.wallet.aggregate({
      where: {
        userId,
        isArchived: false
      },
      _sum: {
        currentBalance: true
      }
    });

    return {
      byType: walletStats.reduce((acc, stat) => {
        acc[stat.type] = stat._count.id;
        return acc;
      }, {} as Record<string, number>),
      totalBalance: totalBalance._sum.currentBalance || 0,
      totalWallets: walletStats.reduce((sum, stat) => sum + stat._count.id, 0)
    };
  }
};
