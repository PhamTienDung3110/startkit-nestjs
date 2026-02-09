# LE Backend API Documentation

## 📖 Swagger Documentation

API documentation được cung cấp qua Swagger UI với đầy đủ thông tin về endpoints, schemas, và examples.

### 🔗 URLs
- **Swagger UI**: http://localhost:3000/api-docs
- **Alternative URL**: http://localhost:3000/docs
- **JSON Spec**: http://localhost:3000/api-docs (JSON format)

## 🚀 Getting Started

### 1. Start the Server
```bash
npm run dev
```

### 2. Access Documentation
Mở browser và truy cập: http://localhost:3000/api-docs

### 3. Authentication
1. Đăng ký tài khoản mới qua `/auth/register`
2. Đăng nhập qua `/auth/login` để nhận JWT token
3. Click "Authorize" button trên Swagger UI
4. Nhập token với format: `Bearer <your-jwt-token>`

## 📋 API Overview

### Authentication (`/auth`)
- `POST /auth/register` - Đăng ký tài khoản mới
- `POST /auth/login` - Đăng nhập và nhận JWT tokens
- `POST /auth/refresh` - Làm mới access token
- `POST /auth/logout` - Đăng xuất (revoke refresh token)

### Users (`/users`)
- `GET /users/me` - Lấy thông tin user hiện tại
- `GET /users` - Lấy danh sách tất cả users (ADMIN only)

### Wallets (`/wallets`)
- `POST /wallets` - Tạo ví mới
- `GET /wallets` - Lấy danh sách ví với filters
- `GET /wallets/{id}` - Lấy ví theo ID
- `PUT /wallets/{id}` - Cập nhật ví
- `DELETE /wallets/{id}` - Archive ví
- `GET /wallets/stats/summary` - Thống kê ví

### Categories (`/categories`)
- `POST /categories` - Tạo danh mục mới
- `GET /categories` - Lấy danh sách danh mục
- `GET /categories/{id}` - Lấy danh mục theo ID
- `PUT /categories/{id}` - Cập nhật danh mục
- `DELETE /categories/{id}` - Xóa danh mục
- `GET /categories/templates` - Lấy danh sách templates hệ thống
- `POST /categories/from-template` - Tạo danh mục từ template

### Transactions (`/transactions`)
- `POST /transactions` - Tạo giao dịch mới (income/expense/transfer)
- `GET /transactions` - Lấy danh sách giao dịch với filters

## 💡 Usage Examples

### 1. Đăng ký và đăng nhập
```javascript
// Register
POST /api/auth/register
{
  "email": "user@example.com",
  "password": "password123",
  "name": "Nguyễn Văn A"
}

// Login
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}
```

### 2. Tạo ví và danh mục
```javascript
// Tạo ví
POST /api/wallets
Authorization: Bearer <token>
{
  "name": "Ví Tiền Mặt",
  "type": "cash",
  "openingBalance": 1000.00
}

// Tạo danh mục
POST /api/categories
Authorization: Bearer <token>
{
  "name": "Ăn uống",
  "type": "expense",
  "icon": "🍽️"
}
```

### 3. Tạo giao dịch
```javascript
// Thu tiền
POST /api/transactions
Authorization: Bearer <token>
{
  "type": "income",
  "walletId": "uuid-here",
  "categoryId": "uuid-here",
  "transactionDate": "2024-01-21T10:00:00.000Z",
  "amount": 500.00,
  "note": "Lương tháng 1"
}

// Chi tiền
POST /api/transactions
Authorization: Bearer <token>
{
  "type": "expense",
  "walletId": "uuid-here",
  "categoryId": "uuid-here",
  "transactionDate": "2024-01-21T12:00:00.000Z",
  "amount": 50.00,
  "note": "Ăn trưa"
}

// Chuyển tiền
POST /api/transactions
Authorization: Bearer <token>
{
  "type": "transfer",
  "fromWalletId": "uuid-from",
  "toWalletId": "uuid-to",
  "transactionDate": "2024-01-21T14:00:00.000Z",
  "amount": 200.00,
  "note": "Chuyển tiền sang ví khác"
}
```

## 🔐 Authentication

API sử dụng JWT (JSON Web Tokens) cho authentication:

- **Access Token**: Hết hạn sau 15 phút, dùng cho API calls
- **Refresh Token**: Hết hạn sau 7 ngày, dùng để refresh access token
- **Bearer Token**: Gửi trong Authorization header: `Authorization: Bearer <token>`

## 📊 Response Formats

### Success Response
```json
{
  "message": "Operation successful",
  "data": { ... },
  "pagination": { ... } // for list endpoints
}
```

### Error Response
```json
{
  "message": "Error description"
}
```

### Validation Error
```json
{
  "message": "Validation error",
  "errors": [
    {
      "code": "invalid_type",
      "message": "Invalid input",
      "path": ["fieldName"]
    }
  ]
}
```

## 🏗️ Architecture

- **Framework**: Express.js with TypeScript
- **Database**: MySQL với Prisma ORM
- **Validation**: Zod schemas
- **Authentication**: JWT với access/refresh tokens
- **Documentation**: Swagger/OpenAPI 3.0
- **Security**: Helmet, CORS, input validation

## 🧪 Testing

### Seed Data
Project có sẵn seed data cho testing:
- Admin user: `admin@test.com` / `123456`
- Sample wallets và categories

### Run Seeds
```bash
npx prisma db seed
```

## 📝 Notes

- Tất cả API endpoints đều yêu cầu authentication trừ `/auth/*` và `/health`
- Balances được cập nhật tự động khi tạo transactions
- Wallets có thể bị archive thay vì xóa cứng
- Transactions không thể xóa nhưng có soft delete
- Category templates được tạo sẵn trong database

---

**Happy coding! 🎉**
