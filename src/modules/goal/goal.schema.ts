/**
 * Goal Schema Validation
 * Sử dụng Zod để validate request body cho các goal operations
 */
import { z } from 'zod';

// Recurring config schema
const recurringConfigSchema = z.object({
  type: z.enum(['none', 'weekly', 'monthly', 'custom']),
  weekDays: z.array(z.number().min(0).max(6)).optional(),
  monthDays: z.array(z.number().min(1).max(31)).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  excludedDates: z.array(z.string()).optional(),
}).optional();

// Milestone schema
const milestoneSchema = z.object({
  title: z.string().min(1, 'Tên milestone không được rỗng').max(200),
  description: z.string().max(1000).optional(),
  targetValue: z.number().min(0).optional(),
  currentValue: z.number().min(0).optional().default(0),
  targetDate: z.string().optional(),
  isCompleted: z.boolean().optional().default(false),
  order: z.number().int().min(0).optional().default(0),
});

// Schema cho tạo goal mới
export const createGoalSchema = z.object({
  title: z.string().min(1, 'Tiêu đề mục tiêu không được rỗng').max(200, 'Tiêu đề không được quá 200 ký tự'),
  description: z.string().max(2000).optional(),
  periodType: z.enum(['daily', 'weekly', 'monthly', 'yearly'], {
    message: 'Chu kỳ mục tiêu phải là daily, weekly, monthly hoặc yearly'
  }),
  trackingType: z.enum(['checkbox', 'value', 'progress']).default('checkbox'),
  targetValue: z.number().min(0).optional(),
  currentValue: z.number().min(0).optional().default(0),
  unit: z.string().max(50).optional(),
  parentGoalId: z.string().uuid().optional(),
  autoCalculate: z.boolean().optional().default(false),
  status: z.enum(['pending', 'in_progress', 'completed', 'failed']).optional().default('pending'),
  priority: z.enum(['low', 'medium', 'high']).optional().default('medium'),
  category: z.enum(['personal', 'finance', 'health', 'education', 'career']).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  month: z.number().int().min(1).max(12).optional(),
  year: z.number().int().min(2000).max(2100).optional(),
  recurringConfig: recurringConfigSchema,
  milestones: z.array(milestoneSchema).optional(),
  // For yearly goals with monthly sub-goals
  createMonthlySubGoals: z.boolean().optional().default(false),
  monthlyTargetValue: z.number().min(0).optional(),
}).refine((data) => {
  // Nếu trackingType là value hoặc progress thì cần targetValue
  if ((data.trackingType === 'value' || data.trackingType === 'progress') && !data.targetValue) {
    return false;
  }
  return true;
}, {
  message: 'targetValue là bắt buộc khi trackingType là value hoặc progress',
  path: ['targetValue']
}).refine((data) => {
  // Monthly goals cần month và year
  if (data.periodType === 'monthly' && (!data.month || !data.year)) {
    return false;
  }
  return true;
}, {
  message: 'month và year là bắt buộc cho monthly goals',
  path: ['month']
}).refine((data) => {
  // Yearly goals cần year
  if (data.periodType === 'yearly' && !data.year) {
    return false;
  }
  return true;
}, {
  message: 'year là bắt buộc cho yearly goals',
  path: ['year']
});

// Schema cho cập nhật goal
export const updateGoalSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  trackingType: z.enum(['checkbox', 'value', 'progress']).optional(),
  targetValue: z.number().min(0).optional(),
  currentValue: z.number().min(0).optional(),
  unit: z.string().max(50).optional(),
  status: z.enum(['pending', 'in_progress', 'completed', 'failed']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  category: z.enum(['personal', 'finance', 'health', 'education', 'career']).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  month: z.number().int().min(1).max(12).optional(),
  year: z.number().int().min(2000).max(2100).optional(),
  recurringConfig: recurringConfigSchema,
}).refine(
  (data) => Object.keys(data).length > 0,
  'Phải cung cấp ít nhất một trường để cập nhật'
);

// Schema cho query parameters
export const getGoalsQuerySchema = z.object({
  periodType: z.enum(['daily', 'weekly', 'monthly', 'yearly']).optional(),
  status: z.enum(['pending', 'in_progress', 'completed', 'failed']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  category: z.enum(['personal', 'finance', 'health', 'education', 'career']).optional(),
  year: z.string().transform((val) => {
    const num = parseInt(val);
    return isNaN(num) ? undefined : num;
  }).optional(),
  month: z.string().transform((val) => {
    const num = parseInt(val);
    return isNaN(num) || num < 1 || num > 12 ? undefined : num;
  }).optional(),
  parentGoalId: z.string().uuid().optional(),
  limit: z.string().transform((val) => {
    const num = parseInt(val);
    return isNaN(num) ? 50 : Math.min(Math.max(num, 1), 100);
  }).optional().default(50),
  offset: z.string().transform((val) => {
    const num = parseInt(val);
    return isNaN(num) ? 0 : Math.max(num, 0);
  }).optional().default(0),
});

// Schema cho tạo milestone
export const createMilestoneSchema = z.object({
  goalId: z.string().uuid(),
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  targetValue: z.number().min(0).optional(),
  currentValue: z.number().min(0).optional().default(0),
  targetDate: z.string().optional(),
  order: z.number().int().min(0).optional().default(0),
});

// Schema cho cập nhật milestone
export const updateMilestoneSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  targetValue: z.number().min(0).optional(),
  currentValue: z.number().min(0).optional(),
  targetDate: z.string().optional(),
  isCompleted: z.boolean().optional(),
  order: z.number().int().min(0).optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  'Phải cung cấp ít nhất một trường để cập nhật'
);

// Type definitions cho TypeScript
export type CreateGoalData = z.infer<typeof createGoalSchema>;
export type UpdateGoalData = z.infer<typeof updateGoalSchema>;
export type GetGoalsQuery = z.infer<typeof getGoalsQuerySchema>;
export type CreateMilestoneData = z.infer<typeof createMilestoneSchema>;
export type UpdateMilestoneData = z.infer<typeof updateMilestoneSchema>;
