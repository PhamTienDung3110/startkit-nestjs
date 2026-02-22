/**
 * Goal Service
 * File này chứa business logic cho việc quản lý mục tiêu
 * Service layer - xử lý logic nghiệp vụ, không liên quan đến HTTP
 */
import { prisma } from '../../db/prisma';
import { CreateGoalData, UpdateGoalData, GetGoalsQuery, CreateMilestoneData, UpdateMilestoneData } from './goal.schema';

export const GoalService = {
  /**
   * Tạo goal mới cho user
   *
   * @param data - Dữ liệu goal mới
   * @param userId - ID của user tạo goal
   * @returns Goal object đã tạo
   * @throws Error('GOAL_NOT_FOUND') nếu parentGoalId không tồn tại
   */
  async createGoal(data: CreateGoalData, userId: string) {
    const {
      title,
      description,
      periodType,
      trackingType = 'checkbox',
      targetValue,
      currentValue = 0,
      unit,
      parentGoalId,
      autoCalculate = false,
      status = 'pending',
      priority = 'medium',
      category,
      startDate,
      endDate,
      month,
      year,
      recurringConfig,
      milestones,
      createMonthlySubGoals = false,
      monthlyTargetValue,
    } = data;

    // Kiểm tra parent goal nếu có
    if (parentGoalId) {
      const parentGoal = await prisma.goal.findFirst({
        where: {
          id: parentGoalId,
          userId,
        },
      });

      if (!parentGoal) {
        throw new Error('GOAL_NOT_FOUND');
      }

      // Parent goal phải là yearly và goal hiện tại phải là monthly
      if (parentGoal.periodType !== 'yearly' || periodType !== 'monthly') {
        throw new Error('INVALID_PARENT_GOAL_TYPE');
      }
    }

    // Tạo goal chính
    const goal = await prisma.goal.create({
      data: {
        userId,
        title,
        description,
        periodType,
        trackingType,
        targetValue: targetValue || null,
        currentValue: currentValue || 0,
        unit,
        parentGoalId,
        autoCalculate,
        status,
        priority,
        category: category || null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        month,
        year,
        recurringConfig: recurringConfig || undefined,
      },
      include: {
        milestones: true,
        subGoals: true,
        parentGoal: true,
      },
    });

    // Tạo milestones nếu có
    if (milestones && milestones.length > 0) {
      await prisma.milestone.createMany({
        data: milestones.map((m, index) => ({
          goalId: goal.id,
          title: m.title,
          description: m.description,
          targetValue: m.targetValue || null,
          currentValue: m.currentValue || 0,
          targetDate: m.targetDate ? new Date(m.targetDate) : null,
          isCompleted: m.isCompleted || false,
          order: m.order !== undefined ? m.order : index,
        })),
      });
    }

    // Tạo monthly sub-goals nếu là yearly goal và có yêu cầu
    if (periodType === 'yearly' && createMonthlySubGoals && monthlyTargetValue && year) {
      const monthlyGoals = [];
      for (let m = 1; m <= 12; m++) {
        monthlyGoals.push({
          userId,
          title: `${title} - Tháng ${m}`,
          periodType: 'monthly' as const,
          trackingType,
          targetValue: monthlyTargetValue,
          currentValue: 0,
          unit,
          parentGoalId: goal.id,
          autoCalculate: true,
          status: 'pending' as const,
          priority,
          category: category || null,
          month: m,
          year,
        });
      }
      await prisma.goal.createMany({
        data: monthlyGoals,
      });
    }

    // Lấy lại goal với đầy đủ relations
    return await prisma.goal.findUnique({
      where: { id: goal.id },
      include: {
        milestones: {
          orderBy: { order: 'asc' },
        },
        subGoals: {
          orderBy: { month: 'asc' },
        },
        parentGoal: true,
      },
    });
  },

  /**
   * Lấy danh sách goals của user
   *
   * @param userId - ID của user
   * @param filters - Các filter tùy chọn
   * @returns Danh sách goals với pagination
   */
  async getGoals(userId: string, filters: Partial<GetGoalsQuery> = {}) {
    const {
      periodType,
      status,
      priority,
      category,
      year,
      month,
      parentGoalId,
      limit = 50,
      offset = 0,
    } = filters;

    // Build where clause
    const where: any = { userId };

    if (periodType) {
      where.periodType = periodType;
    }

    if (status) {
      where.status = status;
    }

    if (priority) {
      where.priority = priority;
    }

    if (category) {
      where.category = category;
    }

    if (year) {
      where.year = year;
    }

    if (month) {
      where.month = month;
    }

    if (parentGoalId) {
      where.parentGoalId = parentGoalId;
    } else if (parentGoalId === null) {
      // Explicitly filter for goals without parent
      where.parentGoalId = null;
    }

    // Lấy danh sách goals
    const goals = await prisma.goal.findMany({
      where,
      include: {
        milestones: {
          orderBy: { order: 'asc' },
        },
        subGoals: {
          orderBy: { month: 'asc' },
        },
        parentGoal: true,
      },
      orderBy: [
        { status: 'asc' }, // pending -> in_progress -> completed
        { priority: 'desc' }, // high -> medium -> low
        { createdAt: 'desc' },
      ],
      take: limit,
      skip: offset,
    });

    // Đếm total
    const total = await prisma.goal.count({ where });

    return {
      goals,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    };
  },

  /**
   * Lấy goal theo ID
   *
   * @param goalId - ID của goal
   * @param userId - ID của user (để verify ownership)
   * @returns Goal object hoặc null nếu không tìm thấy
   */
  async getGoalById(goalId: string, userId: string) {
    return await prisma.goal.findFirst({
      where: {
        id: goalId,
        userId,
      },
      include: {
        milestones: {
          orderBy: { order: 'asc' },
        },
        subGoals: {
          orderBy: { month: 'asc' },
        },
        parentGoal: {
          include: {
            milestones: {
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    });
  },

  /**
   * Cập nhật goal
   *
   * @param goalId - ID của goal cần cập nhật
   * @param userId - ID của user sở hữu goal
   * @param data - Dữ liệu cập nhật
   * @returns Goal object đã cập nhật
   * @throws Error('GOAL_NOT_FOUND') nếu goal không tồn tại
   */
  async updateGoal(goalId: string, userId: string, data: UpdateGoalData) {
    // Kiểm tra goal tồn tại và thuộc user
    const existingGoal = await prisma.goal.findFirst({
      where: { id: goalId, userId },
    });

    if (!existingGoal) {
      throw new Error('GOAL_NOT_FOUND');
    }

    // Prepare update data
    const updateData: any = {};

    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.trackingType !== undefined) updateData.trackingType = data.trackingType;
    if (data.targetValue !== undefined) updateData.targetValue = data.targetValue || null;
    if (data.currentValue !== undefined) updateData.currentValue = data.currentValue || 0;
    if (data.unit !== undefined) updateData.unit = data.unit;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.startDate !== undefined) updateData.startDate = data.startDate ? new Date(data.startDate) : null;
    if (data.endDate !== undefined) updateData.endDate = data.endDate ? new Date(data.endDate) : null;
    if (data.month !== undefined) updateData.month = data.month;
    if (data.year !== undefined) updateData.year = data.year;
    if (data.recurringConfig !== undefined) updateData.recurringConfig = data.recurringConfig;

    // Auto update status based on currentValue
    if (data.currentValue !== undefined && data.targetValue !== undefined && existingGoal.trackingType !== 'checkbox') {
      if (data.currentValue >= data.targetValue) {
        updateData.status = 'completed';
      } else if (data.currentValue > 0) {
        updateData.status = 'in_progress';
      }
    }

    // Cập nhật goal
    const updatedGoal = await prisma.goal.update({
      where: { id: goalId },
      data: updateData,
      include: {
        milestones: {
          orderBy: { order: 'asc' },
        },
        subGoals: {
          orderBy: { month: 'asc' },
        },
        parentGoal: true,
      },
    });

    // Nếu autoCalculate, cập nhật từ sub-goals
    if (updatedGoal.autoCalculate && updatedGoal.subGoals.length > 0) {
      await this.recalculateGoalFromSubGoals(goalId);
    }

    return updatedGoal;
  },

  /**
   * Xóa goal (hard delete)
   *
   * @param goalId - ID của goal cần xóa
   * @param userId - ID của user sở hữu goal
   * @returns Goal object đã xóa
   * @throws Error('GOAL_NOT_FOUND') nếu goal không tồn tại
   * @throws Error('GOAL_HAS_SUB_GOALS') nếu goal có sub-goals
   */
  async deleteGoal(goalId: string, userId: string) {
    // Kiểm tra goal tồn tại và thuộc user
    const goal = await prisma.goal.findFirst({
      where: { id: goalId, userId },
      include: {
        subGoals: {
          select: { id: true },
          take: 1,
        },
      },
    });

    if (!goal) {
      throw new Error('GOAL_NOT_FOUND');
    }

    // Kiểm tra goal có sub-goals không
    if (goal.subGoals.length > 0) {
      throw new Error('GOAL_HAS_SUB_GOALS');
    }

    // Xóa milestones trước (cascade sẽ tự xóa)
    await prisma.milestone.deleteMany({
      where: { goalId },
    });

    // Xóa goal
    await prisma.goal.delete({
      where: { id: goalId },
    });

    return goal;
  },

  /**
   * Tính lại goal từ sub-goals (cho autoCalculate)
   *
   * @param goalId - ID của goal cần tính lại
   */
  async recalculateGoalFromSubGoals(goalId: string) {
    const goal = await prisma.goal.findUnique({
      where: { id: goalId },
      include: {
        subGoals: true,
        milestones: true,
      },
    });

    if (!goal || !goal.autoCalculate || goal.subGoals.length === 0) {
      return;
    }

    // Tính tổng currentValue từ sub-goals
    const totalCurrentValue = goal.subGoals.reduce((sum: number, sub: any) => {
      return sum + Number(sub.currentValue || 0);
    }, 0);

    // Tính progress từ milestones nếu có
    let progress = 0;
    if (goal.milestones && goal.milestones.length > 0) {
      const completedCount = goal.milestones.filter((m: any) => m.isCompleted).length;
      progress = Math.round((completedCount / goal.milestones.length) * 100);
    } else if (goal.trackingType === 'value' && goal.targetValue) {
      progress = Math.min(100, Math.round((totalCurrentValue / Number(goal.targetValue)) * 100));
    }

    // Cập nhật currentValue và status
    const updateData: any = {
      currentValue: totalCurrentValue,
    };

    if (progress >= 100) {
      updateData.status = 'completed';
    } else if (totalCurrentValue > 0) {
      updateData.status = 'in_progress';
    }

    await prisma.goal.update({
      where: { id: goalId },
      data: updateData,
    });
  },

  /**
   * Tạo milestone cho goal
   *
   * @param data - Dữ liệu milestone
   * @param userId - ID của user (để verify goal ownership)
   * @returns Milestone object đã tạo
   * @throws Error('GOAL_NOT_FOUND') nếu goal không tồn tại
   */
  async createMilestone(data: CreateMilestoneData, userId: string) {
    const { goalId, title, description, targetValue, currentValue = 0, targetDate, order = 0 } = data;

    // Kiểm tra goal tồn tại và thuộc user
    const goal = await prisma.goal.findFirst({
      where: { id: goalId, userId },
    });

    if (!goal) {
      throw new Error('GOAL_NOT_FOUND');
    }

    // Tạo milestone
    const milestone = await prisma.milestone.create({
      data: {
        goalId,
        title,
        description,
        targetValue: targetValue || null,
        currentValue: currentValue || 0,
        targetDate: targetDate ? new Date(targetDate) : null,
        isCompleted: false,
        order,
      },
    });

    return milestone;
  },

  /**
   * Cập nhật milestone
   *
   * @param milestoneId - ID của milestone
   * @param userId - ID của user (để verify goal ownership)
   * @param data - Dữ liệu cập nhật
   * @returns Milestone object đã cập nhật
   * @throws Error('MILESTONE_NOT_FOUND') nếu milestone không tồn tại
   */
  async updateMilestone(milestoneId: string, userId: string, data: UpdateMilestoneData) {
    // Kiểm tra milestone tồn tại và goal thuộc user
    const milestone = await prisma.milestone.findFirst({
      where: {
        id: milestoneId,
        goal: {
          userId,
        },
      },
      include: {
        goal: true,
      },
    });

    if (!milestone) {
      throw new Error('MILESTONE_NOT_FOUND');
    }

    // Prepare update data
    const updateData: any = {};

    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.targetValue !== undefined) updateData.targetValue = data.targetValue || null;
    if (data.currentValue !== undefined) updateData.currentValue = data.currentValue || 0;
    if (data.targetDate !== undefined) updateData.targetDate = data.targetDate ? new Date(data.targetDate) : null;
    if (data.isCompleted !== undefined) updateData.isCompleted = data.isCompleted;
    if (data.order !== undefined) updateData.order = data.order;

    // Cập nhật milestone
    const updatedMilestone = await prisma.milestone.update({
      where: { id: milestoneId },
      data: updateData,
    });

    // Nếu tất cả milestones đã hoàn thành, cập nhật goal status
    if (data.isCompleted !== undefined) {
      const allMilestones = await prisma.milestone.findMany({
        where: { goalId: milestone.goalId },
      });

      const allCompleted = allMilestones.every((m: any) => m.isCompleted);
      if (allCompleted && allMilestones.length > 0) {
        await prisma.goal.update({
          where: { id: milestone.goalId },
          data: { status: 'completed' },
        });
      }
    }

    return updatedMilestone;
  },

  /**
   * Xóa milestone
   *
   * @param milestoneId - ID của milestone
   * @param userId - ID của user (để verify goal ownership)
   * @returns Milestone object đã xóa
   * @throws Error('MILESTONE_NOT_FOUND') nếu milestone không tồn tại
   */
  async deleteMilestone(milestoneId: string, userId: string) {
    // Kiểm tra milestone tồn tại và goal thuộc user
    const milestone = await prisma.milestone.findFirst({
      where: {
        id: milestoneId,
        goal: {
          userId,
        },
      },
    });

    if (!milestone) {
      throw new Error('MILESTONE_NOT_FOUND');
    }

    // Xóa milestone
    await prisma.milestone.delete({
      where: { id: milestoneId },
    });

    return milestone;
  },

  /**
   * Lấy thống kê goals của user
   *
   * @param userId - ID của user
   * @returns Thống kê tổng quan
   */
  async getGoalStats(userId: string) {
    // Đếm goals theo period type
    const goalsByPeriod = await prisma.goal.groupBy({
      by: ['periodType'],
      where: {
        userId,
      },
      _count: {
        id: true,
      },
    });

    // Đếm goals theo status
    const goalsByStatus = await prisma.goal.groupBy({
      by: ['status'],
      where: {
        userId,
      },
      _count: {
        id: true,
      },
    });

    // Tính completion rate
    const totalGoals = await prisma.goal.count({ where: { userId } });
    const completedGoals = await prisma.goal.count({
      where: {
        userId,
        status: 'completed',
      },
    });

    const completionRate = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

    return {
      byPeriod: goalsByPeriod.reduce((acc: Record<string, number>, stat: any) => {
        acc[stat.periodType] = stat._count.id;
        return acc;
      }, {} as Record<string, number>),
      byStatus: goalsByStatus.reduce((acc: Record<string, number>, stat: any) => {
        acc[stat.status] = stat._count.id;
        return acc;
      }, {} as Record<string, number>),
      totalGoals,
      completedGoals,
      completionRate,
    };
  },
};
