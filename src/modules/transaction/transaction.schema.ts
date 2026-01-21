// Schema validation cho Transaction APIs
// Sử dụng Zod để validate request body cho các loại transaction khác nhau
import { z } from 'zod';

// Schema chung cho tất cả transaction
const baseTransactionSchema = {
  transactionDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'transactionDate phải là ngày hợp lệ'
  }).transform((val) => new Date(val)),
  amount: z.number().positive('amount phải lớn hơn 0').refine(
    (val) => Number(val.toFixed(2)) === val,
    'amount chỉ được phép 2 số thập phân'
  ),
  note: z.string().max(1000, 'note không được quá 1000 ký tự').optional()
};

// Schema cho Income transaction (thu tiền vào ví)
export const createIncomeSchema = z.object({
  ...baseTransactionSchema,
  type: z.literal('income'),
  walletId: z.string().uuid('walletId phải là UUID hợp lệ'),
  categoryId: z.string().uuid('categoryId phải là UUID hợp lệ')
});

// Schema cho Expense transaction (chi tiền ra khỏi ví)
export const createExpenseSchema = z.object({
  ...baseTransactionSchema,
  type: z.literal('expense'),
  walletId: z.string().uuid('walletId phải là UUID hợp lệ'),
  categoryId: z.string().uuid('categoryId phải là UUID hợp lệ')
});

// Schema cho Transfer transaction (chuyển tiền giữa 2 ví)
export const createTransferSchema = z.object({
  ...baseTransactionSchema,
  type: z.literal('transfer'),
  fromWalletId: z.string().uuid('fromWalletId phải là UUID hợp lệ'),
  toWalletId: z.string().uuid('toWalletId phải là UUID hợp lệ')
});

// Schema chung cho việc tạo transaction (union của 3 loại)
export const createTransactionSchema = z.discriminatedUnion('type', [
  createIncomeSchema,
  createExpenseSchema,
  createTransferSchema
]);

// Type definitions cho TypeScript (sẽ được inferred từ zod schemas)
export type CreateIncomeData = z.infer<typeof createIncomeSchema>;
export type CreateExpenseData = z.infer<typeof createExpenseSchema>;
export type CreateTransferData = z.infer<typeof createTransferSchema>;
export type CreateTransactionData = z.infer<typeof createTransactionSchema>;
