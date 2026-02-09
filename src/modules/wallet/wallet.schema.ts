// Schema validation cho Wallet APIs
// Sử dụng Zod để validate request body cho các wallet operations
import { z } from 'zod';

// Enum từ Prisma schema để đảm bảo consistency
const WalletType = {
  cash: 'cash',
  bank: 'bank',
  ewallet: 'ewallet',
  credit: 'credit'
} as const;

// Schema cho tạo wallet mới
export const createWalletSchema = z.object({
  name: z.string().min(1, 'Tên ví không được rỗng').max(100, 'Tên ví không được quá 100 ký tự'),
  type: z.enum(['cash', 'bank', 'ewallet', 'credit'], {
    message: 'Loại ví phải là cash, bank, ewallet hoặc credit'
  }),
  openingBalance: z.number().min(0, 'Số dư ban đầu không được âm').refine(
    (val) => Number(val.toFixed(2)) === val,
    'Số dư ban đầu chỉ được phép 2 số thập phân'
  ).optional().default(0)
});

// Schema cho cập nhật wallet
export const updateWalletSchema = z.object({
  name: z.string().min(1, 'Tên ví không được rỗng').max(100, 'Tên ví không được quá 100 ký tự').optional(),
  type: z.enum(['cash', 'bank', 'ewallet', 'credit'], {
    message: 'Loại ví phải là cash, bank, ewallet hoặc credit'
  }).optional(),
  isArchived: z.boolean().optional(),
  currentBalance: z.number()
    .min(0, 'Số dư không được âm')
    .refine((val) => Number(val.toFixed(2)) === val, 'Số dư chỉ được phép 2 số thập phân')
    .optional()
}).refine(
  (data) => Object.keys(data).length > 0,
  'Phải cung cấp ít nhất một trường để cập nhật'
);

// Schema cho query parameters
export const getWalletsQuerySchema = z.object({
  type: z.enum([WalletType.cash, WalletType.bank, WalletType.ewallet, WalletType.credit]).optional(),
  includeArchived: z.string().transform((val) => val === 'true').optional().default(false),
  limit: z.string().transform((val) => {
    const num = parseInt(val);
    return isNaN(num) ? 50 : Math.min(Math.max(num, 1), 100);
  }).optional().default(50),
  offset: z.string().transform((val) => {
    const num = parseInt(val);
    return isNaN(num) ? 0 : Math.max(num, 0);
  }).optional().default(0)
});

// Type definitions cho TypeScript
export type CreateWalletData = z.infer<typeof createWalletSchema>;
export type UpdateWalletData = z.infer<typeof updateWalletSchema>;
export type GetWalletsQuery = z.infer<typeof getWalletsQuerySchema>;
