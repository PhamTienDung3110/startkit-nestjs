/**
 * Category Service
 * File này chứa business logic cho việc quản lý danh mục
 * Service layer - xử lý logic nghiệp vụ, không liên quan đến HTTP
 */
import { prisma } from '../../db/prisma';
import { CreateCategoryData, UpdateCategoryData, GetCategoriesQuery, CreateFromTemplateData } from './category.schema';

export const CategoryService = {
  /**
   * Tạo danh mục mới cho user
   *
   * @param data - Dữ liệu danh mục mới
   * @param userId - ID của user tạo danh mục
   * @returns Category object đã tạo
   * @throws Error('CATEGORY_NAME_EXISTS') nếu tên danh mục đã tồn tại cho user này
   * @throws Error('PARENT_CATEGORY_NOT_FOUND') nếu parent không tồn tại
   * @throws Error('INVALID_PARENT_TYPE') nếu parent có type khác
   * @throws Error('CIRCULAR_REFERENCE') nếu tạo circular reference
   */
  async createCategory(data: CreateCategoryData, userId: string) {
    const { name, type, icon, parentId } = data;

    // Kiểm tra tên danh mục đã tồn tại cho user này chưa
    const existingCategory = await prisma.category.findFirst({
      where: {
        userId,
        type,
        name
      }
    });

    if (existingCategory) {
      throw new Error('CATEGORY_NAME_EXISTS');
    }

    // Validate parent category nếu có
    if (parentId) {
      const parent = await prisma.category.findFirst({
        where: {
          id: parentId,
          userId
        }
      });

      if (!parent) {
        throw new Error('PARENT_CATEGORY_NOT_FOUND');
      }

      if (parent.type !== type) {
        throw new Error('INVALID_PARENT_TYPE');
      }

      // Kiểm tra circular reference (parent không được là con của category hiện tại)
      // Vì đây là category mới nên không cần check circular
    }

    // Tạo danh mục mới
    const category = await prisma.category.create({
      data: {
        userId,
        name,
        type,
        icon,
        parentId
      }
    });

    return category;
  },

  /**
   * Lấy danh sách danh mục của user
   *
   * @param userId - ID của user
   * @param filters - Các filter tùy chọn
   * @returns Danh sách danh mục với pagination
   */
  async getCategories(userId: string, filters: Partial<GetCategoriesQuery> = {}) {
    const { type, includeChildren = true, limit = 50, offset = 0 } = filters;

    // Build where clause
    const where: any = {
      userId
    };

    if (type) {
      where.type = type;
    }

    // Lấy danh sách danh mục
    const categories = await prisma.category.findMany({
      where,
      include: {
        children: includeChildren ? {
          orderBy: { sortOrder: 'asc' }
        } : false,
        parent: true,
        _count: {
          select: { transactions: true }
        }
      },
      orderBy: [
        { type: 'asc' },      // Income trước, expense sau
        { sortOrder: 'asc' }, // Theo thứ tự sắp xếp
        { createdAt: 'asc' }  // Cuối cùng theo thời gian tạo
      ],
      take: limit,
      skip: offset
    });

    // Đếm total
    const total = await prisma.category.count({ where });

    return {
      categories,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    };
  },

  /**
   * Lấy danh mục theo ID
   *
   * @param categoryId - ID của danh mục
   * @param userId - ID của user (để verify ownership)
   * @returns Category object hoặc null nếu không tìm thấy
   */
  async getCategoryById(categoryId: string, userId: string) {
    return await prisma.category.findFirst({
      where: {
        id: categoryId,
        userId
      },
      include: {
        children: {
          orderBy: { sortOrder: 'asc' }
        },
        parent: true,
        _count: {
          select: { transactions: true }
        }
      }
    });
  },

  /**
   * Cập nhật danh mục
   *
   * @param categoryId - ID của danh mục cần cập nhật
   * @param userId - ID của user sở hữu danh mục
   * @param data - Dữ liệu cập nhật
   * @returns Category object đã cập nhật
   * @throws Error('CATEGORY_NOT_FOUND') nếu danh mục không tồn tại
   * @throws Error('CATEGORY_NAME_EXISTS') nếu tên mới đã tồn tại
   */
  async updateCategory(categoryId: string, userId: string, data: UpdateCategoryData) {
    // Kiểm tra danh mục tồn tại và thuộc user
    const existingCategory = await prisma.category.findFirst({
      where: { id: categoryId, userId }
    });

    if (!existingCategory) {
      throw new Error('CATEGORY_NOT_FOUND');
    }

    // Nếu cập nhật tên, kiểm tra tên mới không trùng trong cùng type
    if (data.name && data.name !== existingCategory.name) {
      const nameExists = await prisma.category.findFirst({
        where: {
          userId,
          type: existingCategory.type,
          name: data.name,
          id: { not: categoryId } // Loại trừ danh mục hiện tại
        }
      });

      if (nameExists) {
        throw new Error('CATEGORY_NAME_EXISTS');
      }
    }

    // Cập nhật danh mục
    const updatedCategory = await prisma.category.update({
      where: { id: categoryId },
      data,
      include: {
        children: {
          orderBy: { sortOrder: 'asc' }
        },
        parent: true
      }
    });

    return updatedCategory;
  },

  /**
   * Xóa danh mục (soft delete)
   *
   * @param categoryId - ID của danh mục cần xóa
   * @param userId - ID của user sở hữu danh mục
   * @returns Category object đã xóa
   * @throws Error('CATEGORY_NOT_FOUND') nếu danh mục không tồn tại
   * @throws Error('CATEGORY_HAS_TRANSACTIONS') nếu danh mục còn giao dịch
   * @throws Error('CATEGORY_HAS_CHILDREN') nếu danh mục còn danh mục con
   */
  async deleteCategory(categoryId: string, userId: string) {
    // Kiểm tra danh mục tồn tại và thuộc user
    const category = await prisma.category.findFirst({
      where: { id: categoryId, userId },
      include: {
        children: {
          select: { id: true },
          take: 1
        },
        transactions: {
          select: { id: true },
          take: 1
        }
      }
    });

    if (!category) {
      throw new Error('CATEGORY_NOT_FOUND');
    }

    // Kiểm tra danh mục có giao dịch nào không
    if (category.transactions.length > 0) {
      throw new Error('CATEGORY_HAS_TRANSACTIONS');
    }

    // Kiểm tra danh mục có danh mục con nào không
    if (category.children.length > 0) {
      throw new Error('CATEGORY_HAS_CHILDREN');
    }

    // Hard delete danh mục (vì không có soft delete)
    await prisma.category.delete({
      where: { id: categoryId }
    });

    return { id: categoryId, deleted: true } as any;
  },

  /**
   * Tạo danh mục từ template
   *
   * @param data - Dữ liệu tạo từ template
   * @param userId - ID của user
   * @returns Category object đã tạo
   * @throws Error('CATEGORY_TEMPLATE_NOT_FOUND') nếu template không tồn tại
   * @throws Error('CATEGORY_NAME_EXISTS') nếu tên đã tồn tại
   */
  async createFromTemplate(data: CreateFromTemplateData, userId: string) {
    const { templateId, customName, icon } = data;

    // Kiểm tra template tồn tại
    const template = await prisma.categoryTemplate.findUnique({
      where: { id: templateId }
    });

    if (!template) {
      throw new Error('CATEGORY_TEMPLATE_NOT_FOUND');
    }

    const categoryName = customName || template.name;

    // Kiểm tra tên đã tồn tại cho user chưa
    const existingCategory = await prisma.category.findFirst({
      where: {
        userId,
        type: template.type,
        name: categoryName
      }
    });

    if (existingCategory) {
      throw new Error('CATEGORY_NAME_EXISTS');
    }

    // Tạo category từ template
    const category = await prisma.category.create({
      data: {
        userId,
        name: categoryName,
        type: template.type,
        icon: icon || template.icon,
        isSystem: true
      }
    });

    return category;
  },

  /**
   * Lấy danh sách category templates
   *
   * @param type - Loại template (optional)
   * @returns Danh sách templates
   */
  async getTemplates(type?: 'income' | 'expense') {
    const where: any = {};
    if (type) {
      where.type = type;
    }

    return await prisma.categoryTemplate.findMany({
      where,
      orderBy: [
        { type: 'asc' },
        { sortOrder: 'asc' }
      ]
    });
  },

  /**
   * Seed categories từ templates cho user mới
   * Hàm này được gọi khi user đăng ký
   *
   * @param userId - ID của user mới
   * @returns Số lượng categories đã tạo
   */
  async seedCategoriesFromTemplates(userId: string) {
    // Lấy tất cả templates
    const templates = await prisma.categoryTemplate.findMany();

    // Tạo categories từ templates
    const categories = templates.map(template => ({
      userId,
      name: template.name,
      type: template.type,
      icon: template.icon,
      sortOrder: template.sortOrder,
      isSystem: true
    }));

    await prisma.category.createMany({
      data: categories
    });

    return categories.length;
  }
};
