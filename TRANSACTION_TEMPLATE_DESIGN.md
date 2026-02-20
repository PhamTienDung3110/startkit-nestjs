# Transaction Template - Thiết Kế và Giải Thích

## 1. Database Schema

### Model: TransactionTemplate

```prisma
model TransactionTemplate {
  id String @id @default(uuid())
  userId String
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  name String  // Tên template để dễ nhận biết
  type TransactionType  // income | expense | transfer
  
  walletId String?  // Wallet chính (với transfer là fromWalletId)
  wallet Wallet? @relation(fields: [walletId], references: [id], onDelete: SetNull)
  
  categoryId String?  // Chỉ áp dụng cho income/expense
  category Category? @relation(fields: [categoryId], references: [id], onDelete: SetNull)
  
  amount Decimal?  // Optional: có thể để null nếu user muốn tự nhập
  note String?
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@index([userId, type])
  @@index([userId])
}
```

### Giải thích thiết kế Schema:

1. **Multi-tenant**: Template thuộc về user (`userId`), đảm bảo data isolation
2. **Optional fields**: `walletId`, `categoryId`, `amount` đều optional để linh hoạt:
   - User có thể tạo template không có amount (tự nhập mỗi lần)
   - Transfer không có categoryId
   - Có thể tạo template không có walletId (sẽ chọn khi tạo transaction)
3. **onDelete: SetNull**: Khi xóa wallet/category, template vẫn giữ nhưng set null để không mất template
4. **Indexes**: Tối ưu query theo user và type

## 2. API Endpoints (REST)

### 2.1. Tạo Template Độc Lập
```
POST /api/transaction-templates
Body: {
  name: string,
  type: 'income' | 'expense' | 'transfer',
  walletId?: string (UUID),
  categoryId?: string (UUID) - chỉ cho income/expense,
  amount?: number (optional),
  note?: string
}
```

### 2.2. Tạo Template Từ Transaction
```
POST /api/transaction-templates/from-transaction
Body: {
  transactionId: string (UUID),
  name: string
}
```

### 2.3. Lấy Danh Sách Templates
```
GET /api/transaction-templates?type=income&limit=50&offset=0
```

### 2.4. Lấy Template Theo ID
```
GET /api/transaction-templates/:id
```

### 2.5. Cập Nhật Template
```
PUT /api/transaction-templates/:id
Body: {
  name?: string,
  walletId?: string | null,
  categoryId?: string | null,
  amount?: number | null,
  note?: string | null
}
```

### 2.6. Xóa Template
```
DELETE /api/transaction-templates/:id
```

## 3. Service Logic

### 3.1. Validation Logic

- **Wallet Ownership**: Kiểm tra wallet thuộc về user và chưa bị archive
- **Category Ownership**: Kiểm tra category thuộc về user và type phù hợp với transaction type
- **Template Name**: Không được trùng tên trong cùng user
- **Type Validation**: 
  - Income/Expense: bắt buộc có categoryId
  - Transfer: không có categoryId

### 3.2. Business Logic

1. **createTemplate**: Tạo template độc lập, validate tất cả fields
2. **createTemplateFromTransaction**: 
   - Lấy transaction và kiểm tra ownership
   - Extract walletId từ entry đầu tiên (với transfer là fromWallet)
   - Copy các fields: type, categoryId, amount, note
3. **getTemplates**: Lấy danh sách với pagination, có thể filter theo type
4. **updateTemplate**: Cập nhật từng field, validate ownership
5. **deleteTemplate**: Hard delete (không có soft delete vì không ảnh hưởng transaction)
6. **getTemplateForAutofill**: Helper method để lấy data autofill (không bao gồm transactionDate)

## 4. Controller (NestJS Style)

Controller xử lý HTTP requests/responses:
- Extract userId từ JWT token
- Validate request body với Zod schemas
- Gọi service layer
- Handle errors và trả về response phù hợp

## 5. Tích Hợp Với Transaction Creation

### Cách sử dụng Template để Autofill:

1. **Frontend flow**:
   - User chọn template từ dropdown
   - Gọi `GET /api/transaction-templates/:id` để lấy template data
   - Autofill form: walletId, categoryId, amount, type, note
   - User có thể chỉnh sửa trước khi submit
   - Gọi `POST /api/transactions` với data đã autofill

2. **Không tự động tạo transaction**: 
   - Template chỉ cung cấp data để autofill
   - User phải xác nhận và submit transaction
   - Đảm bảo user có quyền kiểm soát

## 6. Lý Do Thiết Kế

### 6.1. Tại sao Template không tự động tạo Transaction?

- **User Control**: User cần kiểm tra và chỉnh sửa trước khi tạo transaction
- **Flexibility**: Amount có thể thay đổi mỗi lần (VD: lương tháng có thể khác nhau)
- **Date**: Transaction cần transactionDate mới (không thể dùng date cũ)
- **Validation**: Cần validate lại wallet balance, category ownership khi tạo transaction

### 6.2. Tại sao Template có Optional Fields?

- **Amount**: User có thể muốn tự nhập mỗi lần (VD: chi phí thay đổi)
- **WalletId**: Có thể tạo template chung, chọn wallet khi tạo transaction
- **CategoryId**: Transfer không có category

### 6.3. Tại sao dùng Hard Delete cho Template?

- Template không ảnh hưởng đến transaction thật
- Không cần giữ lịch sử template đã xóa
- Đơn giản hóa logic

### 6.4. Tại sao Template có name field?

- User có thể có nhiều template cùng type
- Name giúp phân biệt (VD: "Lương tháng", "Tiền điện", "Tiền nước")
- Unique constraint trên (userId, name) để tránh trùng

### 6.5. Clean Architecture

- **Controller**: Chỉ xử lý HTTP, không có business logic
- **Service**: Chứa toàn bộ business logic, có thể test độc lập
- **Schema**: Validation tách biệt, dễ maintain
- **Error Handling**: Centralized error mapping

## 7. Ví Dụ Sử Dụng

### Tạo template từ transaction:
```typescript
POST /api/transaction-templates/from-transaction
{
  "transactionId": "abc-123",
  "name": "Lương tháng"
}
```

### Sử dụng template để autofill:
```typescript
// 1. Lấy template
GET /api/transaction-templates/template-123
Response: {
  "template": {
    "id": "template-123",
    "name": "Lương tháng",
    "type": "income",
    "walletId": "wallet-456",
    "categoryId": "category-789",
    "amount": 10000000,
    "note": "Lương tháng 1"
  }
}

// 2. Autofill form và submit
POST /api/transactions
{
  "type": "income",
  "walletId": "wallet-456",  // từ template
  "categoryId": "category-789",  // từ template
  "amount": 10000000,  // từ template (có thể chỉnh sửa)
  "note": "Lương tháng 1",  // từ template
  "transactionDate": "2024-02-15T00:00:00Z"  // phải nhập mới
}
```

## 8. Migration

Sau khi thêm model vào schema, cần chạy:
```bash
npx prisma migrate dev --name add_transaction_template
npx prisma generate
```
