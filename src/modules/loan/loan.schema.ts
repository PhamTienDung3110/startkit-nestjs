/**
 * Loan Schema Validation
 * Định nghĩa các schema validation cho loan endpoints
 */
import { z } from 'zod';

// Schema cho tạo loan mới
export const createLoanSchema = z.object({
  kind: z.enum(['you_owe', 'owed_to_you'], {
    message: 'Loại khoản nợ phải là you_owe hoặc owed_to_you'
  }),
  counterpartyName: z.string().min(1, 'Tên người/đơn vị không được để trống').max(255, 'Tên quá dài'),
  principal: z.number().positive('Số tiền gốc phải lớn hơn 0'),
  walletId: z.string().uuid('ID ví không hợp lệ'),
  startDate: z.string().datetime('Ngày bắt đầu không hợp lệ'),
  dueDate: z.string().datetime('Ngày hết hạn không hợp lệ').optional(),
  note: z.string().max(1000, 'Ghi chú quá dài').optional()
});

// Schema cho cập nhật loan
export const updateLoanSchema = z.object({
  counterpartyName: z.string().min(1, 'Tên người/đơn vị không được để trống').max(255, 'Tên quá dài').optional(),
  dueDate: z.string().datetime('Ngày hết hạn không hợp lệ').optional(),
  note: z.string().max(1000, 'Ghi chú quá dài').optional()
});

// Schema cho tạo loan payment
export const createLoanPaymentSchema = z.object({
  loanId: z.string().uuid('ID khoản nợ không hợp lệ'),
  walletId: z.string().uuid('ID ví không hợp lệ'),
  paymentDate: z.string().datetime('Ngày thanh toán không hợp lệ'),
  amount: z.number().positive('Số tiền thanh toán phải lớn hơn 0'),
  note: z.string().max(1000, 'Ghi chú quá dài').optional()
});

// Schema cho query params lấy danh sách loans
export const getLoansQuerySchema = z.object({
  kind: z.enum(['you_owe', 'owed_to_you']).optional(),
  status: z.enum(['open', 'closed']).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0)
});

// Schema cho query params lấy danh sách loan payments
export const getLoanPaymentsQuerySchema = z.object({
  loanId: z.string().uuid('ID khoản nợ không hợp lệ').optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0)
});

// Export types
export type CreateLoanData = z.infer<typeof createLoanSchema>;
export type UpdateLoanData = z.infer<typeof updateLoanSchema>;
export type CreateLoanPaymentData = z.infer<typeof createLoanPaymentSchema>;
export type GetLoansQuery = z.infer<typeof getLoansQuerySchema>;
export type GetLoanPaymentsQuery = z.infer<typeof getLoanPaymentsQuerySchema>;