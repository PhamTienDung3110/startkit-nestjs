/**
 * Users Service
 * File này chứa business logic cho user operations
 * Service layer - xử lý logic nghiệp vụ, không liên quan đến HTTP
 */
import { prisma } from '../../db/prisma';

export const UsersService = {
  /**
   * Lấy thông tin user theo ID
   * 
   * @param userId - ID của user cần lấy thông tin
   * @returns User object (không có password và các sensitive fields)
   * @returns null nếu user không tồn tại
   */
  getMe(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      // Chỉ select các field cần thiết, không bao gồm password
      select: { 
        id: true, 
        email: true, 
        name: true, 
        role: true, 
        createdAt: true 
      },
    });
  },

  /**
   * Lấy danh sách tất cả users
   * Sắp xếp theo thời gian tạo (mới nhất trước)
   * 
   * @returns Array of user objects (không có password)
   */
  listUsers() {
    return prisma.user.findMany({
      // Chỉ select các field cần thiết, không bao gồm password
      select: { 
        id: true, 
        email: true, 
        name: true, 
        role: true, 
        createdAt: true 
      },
      // Sắp xếp theo thời gian tạo, mới nhất trước
      orderBy: { createdAt: 'desc' },
    });
  },
};
