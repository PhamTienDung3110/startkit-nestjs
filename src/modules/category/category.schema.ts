// Schema validation cho Category APIs
// Sử dụng Zod để validate request body cho các category operations
import { z } from 'zod';

// Enum từ Prisma schema để đảm bảo consistency
const CategoryType = {
  income: 'income',
  expense: 'expense'
} as const;

// Schema cho tạo category mới
export const createCategorySchema = z.object({
  name: z.string().min(1, 'Tên danh mục không được rỗng').max(100, 'Tên danh mục không được quá 100 ký tự'),
  type: z.enum(['income', 'expense'], {
    message: 'Loại danh mục phải là income hoặc expense'
  }),
  icon: z.string().max(50, 'Icon không được quá 50 ký tự').optional(),
  parentId: z.string().uuid('parentId phải là UUID hợp lệ').optional()
});

// Schema cho cập nhật category
export const updateCategorySchema = z.object({
  name: z.string().min(1, 'Tên danh mục không được rỗng').max(100, 'Tên danh mục không được quá 100 ký tự').optional(),
  icon: z.string().max(50, 'Icon không được quá 50 ký tự').optional()
}).refine(
  (data) => Object.keys(data).length > 0,
  'Phải cung cấp ít nhất một trường để cập nhật'
);

// Schema cho query parameters
export const getCategoriesQuerySchema = z.object({
  type: z.enum([CategoryType.income, CategoryType.expense]).optional(),
  includeChildren: z.string().transform((val) => val === 'true').optional().default(true),
  limit: z.string().transform((val) => {
    const num = parseInt(val);
    return isNaN(num) ? 50 : Math.min(Math.max(num, 1), 100);
  }).optional().default(50),
  offset: z.string().transform((val) => {
    const num = parseInt(val);
    return isNaN(num) ? 0 : Math.max(num, 0);
  }).optional().default(0)
});

// Schema cho tạo category từ template
export const createFromTemplateSchema = z.object({
  templateId: z.string().uuid('templateId phải là UUID hợp lệ'),
  customName: z.string().min(1).max(100).optional(),
  icon: z.string().max(50).optional()
});

// Type definitions cho TypeScript
export type CreateCategoryData = z.infer<typeof createCategorySchema>;
export type UpdateCategoryData = z.infer<typeof updateCategorySchema>;
export type GetCategoriesQuery = z.infer<typeof getCategoriesQuerySchema>;
export type CreateFromTemplateData = z.infer<typeof createFromTemplateSchema>;
