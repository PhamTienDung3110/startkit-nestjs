// Schema validation cho Transaction Template APIs
// Sử dụng Zod để validate request body
import { z } from 'zod';

// Schema chung cho tất cả transaction template
const baseTemplateSchema = {
  name: z.string().min(1, 'Tên template không được để trống').max(100, 'Tên template không được quá 100 ký tự'),
  type: z.enum(['income', 'expense', 'transfer'], {
    errorMap: () => ({ message: 'type phải là income, expense hoặc transfer' })
  }),
  amount: z.number().positive('amount phải lớn hơn 0').refine(
    (val) => Number(val.toFixed(2)) === val,
    'amount chỉ được phép 2 số thập phân'
  ).optional(),
  note: z.string().max(1000, 'note không được quá 1000 ký tự').optional()
};

// Schema cho Income template
export const createIncomeTemplateSchema = z.object({
  ...baseTemplateSchema,
  type: z.literal('income'),
  walletId: z.string().uuid('walletId phải là UUID hợp lệ'),
  categoryId: z.string().uuid('categoryId phải là UUID hợp lệ')
});

// Schema cho Expense template
export const createExpenseTemplateSchema = z.object({
  ...baseTemplateSchema,
  type: z.literal('expense'),
  walletId: z.string().uuid('walletId phải là UUID hợp lệ'),
  categoryId: z.string().uuid('categoryId phải là UUID hợp lệ')
});

// Schema cho Transfer template
export const createTransferTemplateSchema = z.object({
  ...baseTemplateSchema,
  type: z.literal('transfer'),
  walletId: z.string().uuid('walletId phải là UUID hợp lệ').optional()
  // Transfer không có categoryId
});

// Schema chung cho việc tạo template (union của 3 loại)
export const createTemplateSchema = z.discriminatedUnion('type', [
  createIncomeTemplateSchema,
  createExpenseTemplateSchema,
  createTransferTemplateSchema
]);

// Schema để tạo template từ transaction hiện có
export const createTemplateFromTransactionSchema = z.object({
  transactionId: z.string().uuid('transactionId phải là UUID hợp lệ'),
  name: z.string().min(1, 'Tên template không được để trống').max(100, 'Tên template không được quá 100 ký tự')
});

// Schema để cập nhật template
export const updateTemplateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  walletId: z.string().uuid().optional().nullable(),
  categoryId: z.string().uuid().optional().nullable(),
  amount: z.number().positive().refine(
    (val) => Number(val.toFixed(2)) === val,
    'amount chỉ được phép 2 số thập phân'
  ).optional().nullable(),
  note: z.string().max(1000).optional().nullable()
});

// Schema cho query parameters khi lấy danh sách templates
export const getTemplatesQuerySchema = z.object({
  type: z.enum(['income', 'expense', 'transfer']).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().int().min(1).max(100)).optional(),
  offset: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().int().min(0)).optional()
});

// Type definitions cho TypeScript
export type CreateIncomeTemplateData = z.infer<typeof createIncomeTemplateSchema>;
export type CreateExpenseTemplateData = z.infer<typeof createExpenseTemplateSchema>;
export type CreateTransferTemplateData = z.infer<typeof createTransferTemplateSchema>;
export type CreateTemplateData = z.infer<typeof createTemplateSchema>;
export type CreateTemplateFromTransactionData = z.infer<typeof createTemplateFromTransactionSchema>;
export type UpdateTemplateData = z.infer<typeof updateTemplateSchema>;
export type GetTemplatesQuery = z.infer<typeof getTemplatesQuerySchema>;
