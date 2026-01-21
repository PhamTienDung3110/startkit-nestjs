/**
 * Cấu hình và khởi tạo Express application
 * File này thiết lập các middleware cần thiết và routing cho ứng dụng
 */
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import pinoHttp from 'pino-http';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

import { env } from './config/env';
import { logger } from './config/logger';
import { routes } from './routes';
import { errorMiddleware } from './middlewares/error.middleware';

/**
 * Swagger configuration - API documentation
 */
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'LE Backend API',
      version: '1.0.0',
      description: 'Personal Finance Management API - Quản lý tài chính cá nhân',
      contact: {
        name: 'LE Backend Team',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000/api',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              example: '123e4567-e89b-12d3-a456-426614174000'
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'user@example.com'
            },
            name: {
              type: 'string',
              example: 'Nguyễn Văn A'
            },
            role: {
              type: 'string',
              enum: ['USER', 'ADMIN'],
              example: 'USER'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Wallet: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid'
            },
            userId: {
              type: 'string',
              format: 'uuid'
            },
            name: {
              type: 'string',
              example: 'Ví Tiền Mặt'
            },
            type: {
              type: 'string',
              enum: ['cash', 'bank', 'ewallet', 'credit'],
              example: 'cash'
            },
            openingBalance: {
              type: 'number',
              format: 'decimal',
              example: 1000.00
            },
            currentBalance: {
              type: 'number',
              format: 'decimal',
              example: 1500.00
            },
            isArchived: {
              type: 'boolean',
              default: false
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Category: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid'
            },
            userId: {
              type: 'string',
              format: 'uuid'
            },
            name: {
              type: 'string',
              example: 'Ăn uống'
            },
            type: {
              type: 'string',
              enum: ['income', 'expense'],
              example: 'expense'
            },
            parentId: {
              type: 'string',
              format: 'uuid',
              nullable: true
            },
            icon: {
              type: 'string',
              example: '🍽️'
            },
            sortOrder: {
              type: 'integer',
              default: 0
            },
            isSystem: {
              type: 'boolean',
              default: false
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Transaction: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid'
            },
            userId: {
              type: 'string',
              format: 'uuid'
            },
            type: {
              type: 'string',
              enum: ['income', 'expense', 'transfer'],
              example: 'expense'
            },
            transactionDate: {
              type: 'string',
              format: 'date-time'
            },
            categoryId: {
              type: 'string',
              format: 'uuid',
              nullable: true
            },
            amount: {
              type: 'number',
              format: 'decimal',
              example: 100.00
            },
            note: {
              type: 'string',
              nullable: true,
              example: 'Ăn trưa tại quán'
            },
            deletedAt: {
              type: 'string',
              format: 'date-time',
              nullable: true
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            },
            entries: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/TransactionEntry'
              }
            },
            category: {
              $ref: '#/components/schemas/Category'
            }
          }
        },
        TransactionEntry: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid'
            },
            transactionId: {
              type: 'string',
              format: 'uuid'
            },
            walletId: {
              type: 'string',
              format: 'uuid'
            },
            direction: {
              type: 'string',
              enum: ['in', 'out'],
              example: 'out'
            },
            amount: {
              type: 'number',
              format: 'decimal',
              example: 100.00
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            wallet: {
              $ref: '#/components/schemas/Wallet'
            }
          }
        },
        IncomeTransaction: {
          type: 'object',
          required: ['type', 'walletId', 'categoryId', 'transactionDate', 'amount'],
          properties: {
            type: {
              type: 'string',
              enum: ['income']
            },
            walletId: {
              type: 'string',
              format: 'uuid',
              example: '123e4567-e89b-12d3-a456-426614174000'
            },
            categoryId: {
              type: 'string',
              format: 'uuid',
              example: '123e4567-e89b-12d3-a456-426614174001'
            },
            transactionDate: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-21T10:00:00.000Z'
            },
            amount: {
              type: 'number',
              format: 'decimal',
              minimum: 0.01,
              example: 500.00
            },
            note: {
              type: 'string',
              maxLength: 1000,
              example: 'Thu nhập từ lương tháng 1'
            }
          }
        },
        ExpenseTransaction: {
          type: 'object',
          required: ['type', 'walletId', 'categoryId', 'transactionDate', 'amount'],
          properties: {
            type: {
              type: 'string',
              enum: ['expense']
            },
            walletId: {
              type: 'string',
              format: 'uuid',
              example: '123e4567-e89b-12d3-a456-426614174000'
            },
            categoryId: {
              type: 'string',
              format: 'uuid',
              example: '123e4567-e89b-12d3-a456-426614174002'
            },
            transactionDate: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-21T10:00:00.000Z'
            },
            amount: {
              type: 'number',
              format: 'decimal',
              minimum: 0.01,
              example: 100.00
            },
            note: {
              type: 'string',
              maxLength: 1000,
              example: 'Ăn trưa tại nhà hàng'
            }
          }
        },
        TransferTransaction: {
          type: 'object',
          required: ['type', 'fromWalletId', 'toWalletId', 'transactionDate', 'amount'],
          properties: {
            type: {
              type: 'string',
              enum: ['transfer']
            },
            fromWalletId: {
              type: 'string',
              format: 'uuid',
              example: '123e4567-e89b-12d3-a456-426614174000'
            },
            toWalletId: {
              type: 'string',
              format: 'uuid',
              example: '123e4567-e89b-12d3-a456-426614174003'
            },
            transactionDate: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-21T10:00:00.000Z'
            },
            amount: {
              type: 'number',
              format: 'decimal',
              minimum: 0.01,
              example: 200.00
            },
            note: {
              type: 'string',
              maxLength: 1000,
              example: 'Chuyển tiền từ ví tiền mặt sang ví ngân hàng'
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [
    './src/routes.ts',
    './src/modules/**/*.controller.ts'
  ],
};

const swaggerSpecs = swaggerJSDoc(swaggerOptions);

/**
 * Tạo và cấu hình Express app với các middleware
 * @returns Express application instance đã được cấu hình đầy đủ
 */
export function createApp() {
  const app = express();

  // Middleware logging HTTP requests với Pino
  app.use(pinoHttp({ logger }));
  // Middleware bảo mật - thêm các HTTP headers an toàn
  app.use(helmet());
  // Middleware nén response để giảm kích thước
  app.use(compression());
  // Middleware parse cookies từ request
  app.use(cookieParser());
  // Middleware parse JSON body với giới hạn 1MB
  app.use(express.json({ limit: '1mb' }));

  // Cấu hình CORS - cho phép cross-origin requests
  app.use(
    cors({
      origin: env.CORS_ORIGIN ? [env.CORS_ORIGIN] : true,
      credentials: true, // Cho phép gửi cookies qua CORS
    }),
  );

  // Swagger JSON spec endpoint
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpecs);
  });

  // Swagger UI - API documentation
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

  // Health check endpoint - kiểm tra server có hoạt động không
  app.get('/health', (_req, res) => res.json({ ok: true }));

  // API documentation redirect
  app.get('/docs', (_req, res) => res.redirect('/api-docs'));

  // Tất cả API routes được mount tại /api
  app.use('/api', routes);

  // Error handling middleware - xử lý lỗi cuối cùng
  app.use(errorMiddleware);
  return app;
}
