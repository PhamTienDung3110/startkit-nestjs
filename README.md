# LE Backend

Backend API server được xây dựng với Node.js, Express, TypeScript và Prisma. Hệ thống hỗ trợ authentication với JWT, quản lý users và roles.

## 📋 Mục lục

- [Yêu cầu hệ thống](#yêu-cầu-hệ-thống)
- [Cài đặt](#cài-đặt)
- [Cấu hình](#cấu-hình)
- [Chạy ứng dụng](#chạy-ứng-dụng)
- [Thư viện sử dụng](#thư-viện-sử-dụng)
- [Cấu trúc thư mục](#cấu-trúc-thư-mục)
- [API Endpoints](#api-endpoints)

## 🔧 Yêu cầu hệ thống

- Node.js >= 18.x
- npm hoặc yarn
- MariaDB/MySQL database
- Git

## 📦 Cài đặt

### 1. Clone repository

```bash
git clone <repository-url>
cd LE-backend
```

### 2. Cài đặt dependencies

```bash
npm install
```

### 3. Cấu hình môi trường

Tạo file `.env` trong thư mục gốc:

```env
# Server
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL=mysql://user:password@localhost:3306/database_name
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=your_database_name

# JWT
JWT_ACCESS_SECRET=your-super-secret-access-key-min-10-chars
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-10-chars
JWT_REFRESH_EXPIRES=7d

# CORS (optional)
CORS_ORIGIN=http://localhost:3001
```

### 4. Setup database

```bash
# Generate Prisma Client
npm run prisma:generate

# Chạy migrations và seed data
npm run prisma:migrate
```

Sau khi migrate, hệ thống sẽ tự động tạo user admin mặc định:
- **Email**: `admin@test.com`
- **Password**: `123456`
- **Role**: `ADMIN`

## 🚀 Chạy ứng dụng

### Development mode (với hot reload)

```bash
npm run dev
```

Server sẽ chạy tại `http://localhost:3000`

### Production mode

```bash
# Build TypeScript sang JavaScript
npm run build

# Chạy production server
npm start
```

### Các lệnh khác

```bash
# Mở Prisma Studio để xem/quản lý database
npm run prisma:studio

# Chạy seed data
npm run prisma:seed
```

## 📚 Thư viện sử dụng

### Dependencies (Production)

| Thư viện | Phiên bản | Mô tả |
|----------|-----------|-------|
| **express** | ^5.2.1 | Web framework cho Node.js, xử lý HTTP requests/responses |
| **@prisma/client** | ^7.2.0 | Prisma Client - ORM để tương tác với database |
| **@prisma/adapter-mariadb** | ^7.2.0 | Adapter cho Prisma để kết nối với MariaDB |
| **prisma** | ^7.2.0 | Prisma CLI - công cụ quản lý schema và migrations |
| **mysql2** | ^3.16.0 | MySQL/MariaDB driver cho Node.js |
| **bcrypt** | ^6.0.0 | Thư viện hash password, bảo mật mật khẩu người dùng |
| **jsonwebtoken** | ^9.0.3 | Tạo và verify JWT tokens cho authentication |
| **zod** | ^4.3.5 | Schema validation library, validate request body và env variables |
| **dotenv** | ^17.2.3 | Load environment variables từ file .env |
| **cors** | ^2.8.5 | Middleware xử lý Cross-Origin Resource Sharing |
| **helmet** | ^8.1.0 | Middleware bảo mật, thêm các HTTP security headers |
| **compression** | ^1.8.1 | Middleware nén HTTP responses để giảm bandwidth |
| **cookie-parser** | ^1.4.7 | Parse cookies từ HTTP requests |
| **pino** | ^10.1.0 | Fast JSON logger cho Node.js |
| **pino-http** | ^11.0.0 | HTTP logging middleware tích hợp với Pino |
| **pino-pretty** | ^13.1.3 | Formatter đẹp cho Pino logs trong development |

### DevDependencies (Development)

| Thư viện | Phiên bản | Mô tả |
|----------|-----------|-------|
| **typescript** | ^5.9.3 | TypeScript compiler và type system |
| **tsx** | ^4.21.0 | Chạy TypeScript files trực tiếp không cần compile |
| **@types/node** | ^25.0.3 | TypeScript definitions cho Node.js |
| **@types/express** | ^5.0.6 | TypeScript definitions cho Express |
| **@types/bcrypt** | ^6.0.0 | TypeScript definitions cho bcrypt |
| **@types/jsonwebtoken** | ^9.0.10 | TypeScript definitions cho jsonwebtoken |
| **jest** | ^30.2.0 | Testing framework |
| **ts-jest** | ^29.4.6 | Jest transformer cho TypeScript |
| **supertest** | ^7.2.2 | HTTP assertion library cho testing API |
| **eslint** | ^9.39.2 | Linter để kiểm tra code quality |
| **@typescript-eslint/parser** | ^8.52.0 | ESLint parser cho TypeScript |
| **@typescript-eslint/eslint-plugin** | ^8.52.0 | ESLint plugin cho TypeScript |
| **cross-env** | ^10.1.0 | Set environment variables cross-platform |

## 📁 Cấu trúc thư mục

```
LE-backend/
├── src/                          # Source code chính
│   ├── server.ts                 # Entry point - khởi động server
│   ├── app.ts                    # Cấu hình Express app và middleware
│   ├── routes.ts                 # Định nghĩa tất cả API routes
│   │
│   ├── config/                   # Cấu hình ứng dụng
│   │   ├── env.ts                # Validate và export environment variables
│   │   └── logger.ts             # Cấu hình Pino logger
│   │
│   ├── db/                       # Database configuration
│   │   └── prisma.ts             # Prisma Client instance và connection setup
│   │
│   ├── middlewares/              # Express middlewares
│   │   ├── auth.middleware.ts    # Authentication & authorization middleware
│   │   ├── error.middleware.ts   # Global error handler
│   │   └── validate.middleware.ts # Request body validation với Zod
│   │
│   ├── modules/                  # Business logic modules (theo domain)
│   │   ├── auth/                 # Authentication module
│   │   │   ├── auth.controller.ts # Auth endpoints handlers
│   │   │   ├── auth.service.ts   # Auth business logic
│   │   │   └── auth.schema.ts    # Zod schemas cho auth validation
│   │   └── users/                # Users module
│   │       ├── users.controller.ts # User endpoints handlers
│   │       └── users.service.ts  # User business logic
│   │
│   ├── utils/                    # Utility functions
│   │   ├── jwt.ts                # JWT token generation và verification
│   │   └── password.ts           # Password hashing và comparison
│   │
│   ├── types/                    # TypeScript type definitions
│   │   └── express.d.ts          # Extend Express Request type với user property
│   │
│   └── generated/                # Generated code (tự động tạo)
│       └── prisma/               # Prisma Client generated code
│
├── prisma/                       # Prisma configuration
│   ├── schema.prisma             # Database schema definition
│   ├── seed.ts                   # Database seed script
│   └── migrations/               # Database migration files
│
├── dist/                         # Compiled JavaScript (sau khi build)
├── node_modules/                 # Dependencies
├── .env                          # Environment variables (không commit)
├── .gitignore                    # Git ignore rules
├── tsconfig.json                 # TypeScript configuration
├── prisma.config.ts              # Prisma v7 configuration
├── package.json                  # Dependencies và scripts
└── README.md                     # File này
```

## 📝 Chi tiết từng file/folder

### `/src` - Source code chính

#### `server.ts`
- **Chức năng**: Entry point của ứng dụng
- **Nhiệm vụ**: Import và khởi động Express server, lắng nghe trên port được cấu hình
- **Logs**: Hiển thị server URL và health check endpoint

#### `app.ts`
- **Chức năng**: Cấu hình và khởi tạo Express application
- **Nhiệm vụ**: 
  - Setup các middleware: logging, security (helmet), compression, CORS, cookie parser
  - Đăng ký routes tại `/api`
  - Đăng ký error handling middleware
  - Tạo health check endpoint tại `/health`

#### `routes.ts`
- **Chức năng**: Định nghĩa tất cả API endpoints
- **Nhiệm vụ**: 
  - Tập trung tất cả routes và middleware liên quan
  - Auth routes: `/api/auth/register`, `/api/auth/login`, `/api/auth/refresh`, `/api/auth/logout`
  - User routes: `/api/users/me`, `/api/users`

### `/src/config` - Cấu hình

#### `env.ts`
- **Chức năng**: Validate và export environment variables
- **Nhiệm vụ**: 
  - Sử dụng Zod để validate tất cả env variables
  - Đảm bảo các biến bắt buộc được cung cấp
  - Cung cấp giá trị mặc định cho các biến optional
  - Type-safe access đến env variables

#### `logger.ts`
- **Chức năng**: Cấu hình Pino logger
- **Nhiệm vụ**: 
  - Setup logger với level phù hợp (debug cho dev, info cho production)
  - Enable pino-pretty cho development để logs dễ đọc hơn

### `/src/db` - Database

#### `prisma.ts`
- **Chức năng**: Khởi tạo Prisma Client instance
- **Nhiệm vụ**: 
  - Tạo MariaDB adapter với connection config
  - Export singleton PrismaClient instance
  - Xử lý graceful shutdown - đóng connection khi app tắt
  - Validate database environment variables

### `/src/middlewares` - Middlewares

#### `auth.middleware.ts`
- **Chức năng**: Authentication và authorization
- **Nhiệm vụ**: 
  - `requireAuth`: Verify JWT access token từ Authorization header
  - `requireRole`: Kiểm tra user có đủ quyền (role) để truy cập endpoint
  - Attach user info vào `req.user` sau khi verify thành công

#### `error.middleware.ts`
- **Chức năng**: Global error handler
- **Nhiệm vụ**: 
  - Bắt tất cả errors trong request pipeline
  - Xử lý Zod validation errors (400)
  - Log unexpected errors và trả về 500
  - Format error response nhất quán

#### `validate.middleware.ts`
- **Chức năng**: Request body validation
- **Nhiệm vụ**: 
  - Validate request body với Zod schema
  - Parse và sanitize data
  - Pass validated data vào `req.body`
  - Throw error nếu validation fail (sẽ được error middleware xử lý)

### `/src/modules` - Business logic modules

#### `/auth` - Authentication module

**`auth.controller.ts`**
- **Chức năng**: Xử lý HTTP requests/responses cho auth endpoints
- **Nhiệm vụ**: 
  - `register`: Tạo tài khoản mới
  - `login`: Đăng nhập, trả về access token và refresh token
  - `refresh`: Làm mới access token bằng refresh token
  - `logout`: Xóa refresh token, đăng xuất

**`auth.service.ts`**
- **Chức năng**: Business logic cho authentication
- **Nhiệm vụ**: 
  - Hash password khi đăng ký
  - Verify password khi đăng nhập
  - Tạo và quản lý JWT tokens
  - Quản lý refresh tokens trong database
  - Xử lý token rotation khi refresh

**`auth.schema.ts`**
- **Chức năng**: Zod schemas cho validation
- **Nhiệm vụ**: 
  - `registerSchema`: Validate register request
  - `loginSchema`: Validate login request
  - `refreshSchema`: Validate refresh token request

#### `/users` - Users module

**`users.controller.ts`**
- **Chức năng**: Xử lý HTTP requests/responses cho user endpoints
- **Nhiệm vụ**: 
  - `me`: Lấy thông tin user hiện tại
  - `list`: Lấy danh sách users (chỉ ADMIN)

**`users.service.ts`**
- **Chức năng**: Business logic cho users
- **Nhiệm vụ**: 
  - `getMe`: Query user info từ database
  - `listUsers`: Query danh sách users với pagination/sorting

### `/src/utils` - Utilities

#### `jwt.ts`
- **Chức năng**: JWT token operations
- **Nhiệm vụ**: 
  - `signAccessToken`: Tạo access token (short-lived)
  - `signRefreshToken`: Tạo refresh token (long-lived)
  - `verifyAccessToken`: Verify access token
  - `verifyRefreshToken`: Verify refresh token
  - Export `JwtPayload` type

#### `password.ts`
- **Chức năng**: Password hashing và verification
- **Nhiệm vụ**: 
  - `hashPassword`: Hash password với bcrypt (10 rounds)
  - `comparePassword`: So sánh plain password với hash

### `/src/types` - Type definitions

#### `express.d.ts`
- **Chức năng**: Extend Express types
- **Nhiệm vụ**: 
  - Thêm `user?: JwtPayload` vào `Express.Request` interface
  - Cho phép TypeScript biết về `req.user` sau khi authenticate

### `/prisma` - Prisma configuration

#### `schema.prisma`
- **Chức năng**: Database schema definition
- **Nhiệm vụ**: 
  - Định nghĩa database models: `User`, `RefreshToken`
  - Định nghĩa relationships giữa models
  - Cấu hình Prisma generator và datasource
  - Định nghĩa enums: `Role`

#### `seed.ts`
- **Chức năng**: Database seeding script
- **Nhiệm vụ**: 
  - Tạo dữ liệu mẫu cho database
  - Tạo admin user mặc định sau khi migrate
  - Chạy tự động sau `prisma migrate dev`

#### `migrations/`
- **Chức năng**: Database migration files
- **Nhiệm vụ**: 
  - Lưu trữ lịch sử thay đổi database schema
  - Mỗi migration là một version của schema
  - Prisma tự động generate SQL từ schema changes

### Root files

#### `tsconfig.json`
- **Chức năng**: TypeScript compiler configuration
- **Nhiệm vụ**: 
  - Cấu hình target, module system, output directory
  - Enable strict type checking
  - Define type roots và include paths

#### `prisma.config.ts`
- **Chức năng**: Prisma v7 configuration
- **Nhiệm vụ**: 
  - Cấu hình schema path, migrations path
  - Cấu hình seed script
  - Đọc DATABASE_URL từ environment (Prisma v7 requirement)

#### `package.json`
- **Chức năng**: Project metadata và dependencies
- **Nhiệm vụ**: 
  - Định nghĩa scripts: dev, build, start, prisma commands
  - Quản lý dependencies và devDependencies
  - Cấu hình Prisma seed command

## 🔌 API Endpoints

### Authentication

#### `POST /api/auth/register`
Đăng ký tài khoản mới

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "User Name" // optional
}
```

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "User Name",
  "role": "USER"
}
```

#### `POST /api/auth/login`
Đăng nhập

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:** `200 OK`
```json
{
  "accessToken": "jwt-token",
  "refreshToken": "jwt-refresh-token"
}
```

#### `POST /api/auth/refresh`
Làm mới access token

**Request Body:**
```json
{
  "refreshToken": "jwt-refresh-token"
}
```

**Response:** `200 OK`
```json
{
  "accessToken": "new-jwt-token",
  "refreshToken": "new-jwt-refresh-token"
}
```

#### `POST /api/auth/logout`
Đăng xuất

**Request Body:**
```json
{
  "refreshToken": "jwt-refresh-token"
}
```

**Response:** `204 No Content`

### Users

#### `GET /api/users/me`
Lấy thông tin user hiện tại

**Headers:**
```
Authorization: Bearer <access-token>
```

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "User Name",
  "role": "USER",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

#### `GET /api/users`
Lấy danh sách users (chỉ ADMIN)

**Headers:**
```
Authorization: Bearer <access-token>
```

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "email": "user@example.com",
    "name": "User Name",
    "role": "USER",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

### Health Check

#### `GET /health`
Kiểm tra server có hoạt động không

**Response:** `200 OK`
```json
{
  "ok": true
}
```

## 🔒 Security Features

- **Password Hashing**: Sử dụng bcrypt với 10 rounds
- **JWT Authentication**: Access token (15 phút) và Refresh token (7 ngày)
- **Token Rotation**: Refresh token được rotate mỗi lần refresh
- **Helmet**: Security headers tự động
- **CORS**: Cấu hình cross-origin requests
- **Input Validation**: Zod schemas validate tất cả inputs
- **Role-based Access Control**: Phân quyền theo roles (USER, ADMIN)

## 📝 Notes

- Prisma v7 yêu cầu cấu hình trong `prisma.config.ts` thay vì `schema.prisma`
- Generated Prisma Client code nằm trong `src/generated/prisma/`
- Tất cả passwords được hash trước khi lưu vào database
- Refresh tokens được hash (SHA256) trước khi lưu vào database
- Server tự động đóng database connection khi shutdown

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

ISC

