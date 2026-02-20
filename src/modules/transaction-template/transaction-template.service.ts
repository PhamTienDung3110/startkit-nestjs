/**
 * Transaction Template Service
 * File này chứa business logic cho việc quản lý transaction templates
 * Service layer - xử lý logic nghiệp vụ, không liên quan đến HTTP
 *
 * Logic nghiệp vụ:
 * - User có thể tạo template từ transaction hiện có hoặc tạo độc lập
 * - Template lưu các thông tin: walletId, categoryId, amount, type, note
 * - Khi tạo transaction mới, có thể chọn template để autofill (nhưng không tự động tạo transaction)
 * - Template thuộc về user (multi-tenant)
 */
import { prisma } from '../../db/prisma';
import {
  CreateTemplateData,
  CreateTemplateFromTransactionData,
  UpdateTemplateData,
  GetTemplatesQuery
} from './transaction-template.schema';

/**
 * Validate wallet ownership
 * Đảm bảo wallet thuộc về user hiện tại
 */
async function validateWalletOwnership(walletId: string | null | undefined, userId: string) {
  if (!walletId) return null;

  const wallet = await prisma.wallet.findFirst({
    where: { id: walletId, userId, isArchived: false }
  });
  if (!wallet) {
    throw new Error('TEMPLATE_WALLET_NOT_FOUND');
  }
  return wallet;
}

/**
 * Validate category ownership (chỉ cho income/expense)
 * Đảm bảo category thuộc về user và có type phù hợp
 */
async function validateCategoryOwnership(
  categoryId: string | null | undefined,
  userId: string,
  transactionType: string
) {
  if (!categoryId) return null;

  if (transactionType === 'transfer') {
    // Transfer không có category
    return null;
  }

  const category = await prisma.category.findFirst({
    where: { id: categoryId, userId }
  });

  if (!category) {
    throw new Error('TEMPLATE_CATEGORY_NOT_FOUND');
  }

  // Kiểm tra type category phù hợp với transaction type
  const expectedCategoryType = transactionType === 'income' ? 'income' : 'expense';
  if (category.type !== expectedCategoryType) {
    throw new Error('TEMPLATE_CATEGORY_TYPE_MISMATCH');
  }

  return category;
}

export const TransactionTemplateService = {
  /**
   * Tạo template mới (độc lập, không từ transaction)
   *
   * @param data - Dữ liệu template đã validate
   * @param userId - ID của user tạo template
   * @returns TransactionTemplate object đã tạo
   * @throws Error nếu validation fail hoặc có lỗi database
   */
  async createTemplate(data: CreateTemplateData, userId: string) {
    const { name, type, amount, note } = data;
    const walletId = 'walletId' in data ? data.walletId : undefined;
    const categoryId = 'categoryId' in data ? data.categoryId : undefined;

    // Validate wallet ownership
    await validateWalletOwnership(walletId || null, userId);

    // Validate category ownership
    await validateCategoryOwnership(categoryId || null, userId, type);

    // Kiểm tra tên template đã tồn tại cho user này chưa
    const existingTemplate = await prisma.transactionTemplate.findFirst({
      where: {
        userId,
        name
      }
    });

    if (existingTemplate) {
      throw new Error('TEMPLATE_NAME_EXISTS');
    }

    // Tạo template
    const template = await prisma.transactionTemplate.create({
      data: {
        userId,
        name,
        type,
        walletId: walletId || null,
        categoryId: categoryId || null,
        amount: amount ? amount : null,
        note: note || null
      },
      include: {
        wallet: true,
        category: true
      }
    });

    return template;
  },

  /**
   * Tạo template từ transaction hiện có
   *
   * @param data - Dữ liệu tạo template từ transaction
   * @param userId - ID của user tạo template
   * @returns TransactionTemplate object đã tạo
   * @throws Error nếu transaction không tồn tại hoặc không thuộc user
   */
  async createTemplateFromTransaction(
    data: CreateTemplateFromTransactionData,
    userId: string
  ) {
    const { transactionId, name } = data;

    // Lấy transaction và kiểm tra ownership
    const transaction = await prisma.transaction.findFirst({
      where: {
        id: transactionId,
        userId,
        deletedAt: null // Chỉ lấy transaction chưa bị xóa
      },
      include: {
        entries: {
          take: 1, // Chỉ cần entry đầu tiên để lấy walletId
          orderBy: { createdAt: 'asc' }
        },
        category: true
      }
    });

    if (!transaction) {
      throw new Error('TRANSACTION_NOT_FOUND');
    }

    // Lấy walletId từ entry đầu tiên
    // Với income/expense: entry đầu tiên là wallet chính
    // Với transfer: entry đầu tiên là fromWallet
    const walletId = transaction.entries[0]?.walletId || null;

    // Kiểm tra tên template đã tồn tại cho user này chưa
    const existingTemplate = await prisma.transactionTemplate.findFirst({
      where: {
        userId,
        name
      }
    });

    if (existingTemplate) {
      throw new Error('TEMPLATE_NAME_EXISTS');
    }

    // Tạo template từ transaction
    const template = await prisma.transactionTemplate.create({
      data: {
        userId,
        name,
        type: transaction.type,
        walletId,
        categoryId: transaction.categoryId,
        amount: transaction.amount.toNumber(),
        note: transaction.note
      },
      include: {
        wallet: true,
        category: true
      }
    });

    return template;
  },

  /**
   * Lấy danh sách templates của user
   *
   * @param userId - ID của user
   * @param filters - Các filter tùy chọn
   * @returns Danh sách templates với pagination
   */
  async getTemplates(userId: string, filters: Partial<GetTemplatesQuery> = {}) {
    const { type, limit = 50, offset = 0 } = filters;

    // Build where clause
    const where: any = {
      userId
    };

    if (type) {
      where.type = type;
    }

    // Lấy danh sách templates
    const templates = await prisma.transactionTemplate.findMany({
      where,
      include: {
        wallet: true,
        category: true
      },
      orderBy: [
        { type: 'asc' },      // Income trước, expense sau, transfer cuối
        { createdAt: 'desc' }  // Mới nhất trước
      ],
      take: limit,
      skip: offset
    });

    // Đếm total
    const total = await prisma.transactionTemplate.count({ where });

    return {
      templates,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    };
  },

  /**
   * Lấy template theo ID
   *
   * @param templateId - ID của template
   * @param userId - ID của user (để verify ownership)
   * @returns TransactionTemplate object hoặc null nếu không tìm thấy
   */
  async getTemplateById(templateId: string, userId: string) {
    return await prisma.transactionTemplate.findFirst({
      where: {
        id: templateId,
        userId
      },
      include: {
        wallet: true,
        category: true
      }
    });
  },

  /**
   * Cập nhật template
   *
   * @param templateId - ID của template cần cập nhật
   * @param userId - ID của user sở hữu template
   * @param data - Dữ liệu cập nhật
   * @returns TransactionTemplate object đã cập nhật
   * @throws Error nếu template không tồn tại
   */
  async updateTemplate(templateId: string, userId: string, data: UpdateTemplateData) {
    // Kiểm tra template tồn tại và thuộc user
    const existingTemplate = await prisma.transactionTemplate.findFirst({
      where: { id: templateId, userId }
    });

    if (!existingTemplate) {
      throw new Error('TEMPLATE_NOT_FOUND');
    }

    // Validate wallet ownership nếu có cập nhật walletId
    if (data.walletId !== undefined) {
      await validateWalletOwnership(data.walletId, userId);
    }

    // Validate category ownership nếu có cập nhật categoryId
    if (data.categoryId !== undefined) {
      await validateCategoryOwnership(data.categoryId, userId, existingTemplate.type);
    }

    // Kiểm tra tên template mới không trùng (nếu có cập nhật tên)
    if (data.name && data.name !== existingTemplate.name) {
      const nameExists = await prisma.transactionTemplate.findFirst({
        where: {
          userId,
          name: data.name,
          id: { not: templateId } // Loại trừ template hiện tại
        }
      });

      if (nameExists) {
        throw new Error('TEMPLATE_NAME_EXISTS');
      }
    }

    // Cập nhật template
    const updatedTemplate = await prisma.transactionTemplate.update({
      where: { id: templateId },
      data: {
        name: data.name,
        walletId: data.walletId === undefined ? undefined : (data.walletId || null),
        categoryId: data.categoryId === undefined ? undefined : (data.categoryId || null),
        amount: data.amount === undefined ? undefined : (data.amount || null),
        note: data.note === undefined ? undefined : (data.note || null)
      },
      include: {
        wallet: true,
        category: true
      }
    });

    return updatedTemplate;
  },

  /**
   * Xóa template
   *
   * @param templateId - ID của template cần xóa
   * @param userId - ID của user sở hữu template
   * @returns TransactionTemplate object đã xóa
   * @throws Error nếu template không tồn tại
   */
  async deleteTemplate(templateId: string, userId: string) {
    // Kiểm tra template tồn tại và thuộc user
    const template = await prisma.transactionTemplate.findFirst({
      where: { id: templateId, userId }
    });

    if (!template) {
      throw new Error('TEMPLATE_NOT_FOUND');
    }

    // Xóa template (hard delete)
    await prisma.transactionTemplate.delete({
      where: { id: templateId }
    });

    return { id: templateId, deleted: true } as any;
  },

  /**
   * Lấy template để autofill khi tạo transaction
   * Hàm này được gọi từ TransactionService khi user chọn template
   *
   * @param templateId - ID của template
   * @param userId - ID của user
   * @returns Template data để autofill hoặc null nếu không tìm thấy
   */
  async getTemplateForAutofill(templateId: string, userId: string) {
    const template = await prisma.transactionTemplate.findFirst({
      where: {
        id: templateId,
        userId
      }
    });

    if (!template) {
      return null;
    }

    // Trả về data để autofill (không bao gồm transactionDate vì phải nhập mới)
    return {
      type: template.type,
      walletId: template.walletId || undefined,
      categoryId: template.categoryId || undefined,
      amount: template.amount ? template.amount.toNumber() : undefined,
      note: template.note || undefined
    };
  }
};
