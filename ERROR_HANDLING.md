# Error Handling System

## Tổng quan

Hệ thống xử lý lỗi tập trung được implement trong `src/utils/error-handler.ts` để đảm bảo consistency và maintainability across tất cả modules.

## Cấu trúc

### 1. Error Mapping Object
```typescript
export const ErrorMap: Record<string, ErrorResponse> = {
  ERROR_CODE: { status: number, message: string }
};
```

### 2. Generic Error Handler
```typescript
export function handleError(error: any, res: Response, context?: string): Response
```

### 3. Module-specific Error Handlers
```typescript
export function createModuleErrorHandler(moduleName: string)
```

## Error Codes

### Authentication Errors
- `EMAIL_EXISTS` (409) - Email đã tồn tại
- `INVALID_CREDENTIALS` (401) - Credentials không đúng
- `TOKEN_EXPIRED` (401) - Token đã hết hạn
- `TOKEN_INVALID` (401) - Token không hợp lệ
- `UNAUTHORIZED` (401) - Chưa đăng nhập

### User Errors
- `USER_NOT_FOUND` (404) - User không tồn tại

### Wallet Errors
- `WALLET_NAME_EXISTS` (409) - Tên ví đã tồn tại
- `WALLET_NOT_FOUND` (404) - Ví không tồn tại
- `WALLET_HAS_TRANSACTIONS` (409) - Không thể archive ví có giao dịch

### Category Errors
- `CATEGORY_NAME_EXISTS` (409) - Tên danh mục đã tồn tại
- `PARENT_CATEGORY_NOT_FOUND` (404) - Danh mục cha không tồn tại
- `INVALID_PARENT_TYPE` (400) - Loại danh mục cha không hợp lệ
- `CIRCULAR_REFERENCE` (400) - Tham chiếu vòng
- `CATEGORY_NOT_FOUND` (404) - Danh mục không tồn tại
- `CATEGORY_HAS_TRANSACTIONS` (409) - Không thể xóa danh mục có giao dịch
- `CATEGORY_HAS_CHILDREN` (409) - Không thể xóa danh mục có danh mục con
- `TEMPLATE_NOT_FOUND` (404) - Template không tồn tại

### Transaction Errors
- `TRANSACTION_WALLET_NOT_FOUND` (404) - Ví không tồn tại hoặc không thuộc user
- `TRANSACTION_CATEGORY_NOT_FOUND` (404) - Danh mục không tồn tại hoặc không thuộc user
- `INVALID_CATEGORY_TYPE_FOR_INCOME` (400) - Loại danh mục không hợp lệ cho thu nhập
- `INVALID_CATEGORY_TYPE_FOR_EXPENSE` (400) - Loại danh mục không hợp lệ cho chi tiêu
- `UNSUPPORTED_TRANSACTION_TYPE` (400) - Loại giao dịch không được hỗ trợ
- `SAME_WALLET_TRANSFER` (400) - Ví nguồn và đích giống nhau
- `INSUFFICIENT_BALANCE` (400) - Số dư không đủ

### Validation Errors
- `VALIDATION_ERROR` (400) - Lỗi validation
- `INVALID_INPUT` (400) - Input không hợp lệ

### Database Errors
- `DATABASE_ERROR` (500) - Lỗi database
- `CONNECTION_ERROR` (500) - Lỗi kết nối

## Cách sử dụng

### 1. Import error handler
```typescript
import { handleError } from '../../utils/error-handler';
```

### 2. Tạo module-specific handler (recommended)
```typescript
const handleModuleError = (error: any, res: Response) =>
  handleError(error, res, 'ModuleName');
```

### 3. Sử dụng trong catch block
```typescript
try {
  // Business logic
} catch (e: any) {
  return handleModuleError(e, res);
}
```

### 4. Hoặc sử dụng trực tiếp
```typescript
} catch (e: any) {
  return handleError(e, res, 'ModuleName');
}
```

## Special Handlers

### Validation Error Handler
```typescript
import { handleValidationError } from '../../utils/error-handler';

} catch (e: any) {
  return handleValidationError(e, res);
}
```

### Database Error Handler
```typescript
import { handleDatabaseError } from '../../utils/error-handler';

} catch (e: any) {
  return handleDatabaseError(e, res, 'operation_name');
}
```

### Async Route Wrapper
```typescript
import { asyncHandler } from '../../utils/error-handler';

export const someController = {
  someMethod: asyncHandler(async (req: Request, res: Response) => {
    // No need for try-catch, errors are handled automatically
  })
};
```

## Best Practices

### 1. Consistent Error Messages
- Sử dụng error codes thay vì hard-coded messages
- Error messages nên rõ ràng và user-friendly

### 2. Proper HTTP Status Codes
- 400: Client errors (validation, bad request)
- 401: Authentication errors
- 403: Authorization errors
- 404: Resource not found
- 409: Conflict (duplicate, constraint violations)
- 500: Server errors

### 3. Logging
- Unknown errors được log tự động với context
- Include stack trace cho debugging
- Sensitive data không được log

### 4. Error Response Format
```json
{
  "message": "Error description"
}
```

Hoặc cho validation errors:
```json
{
  "message": "Validation error",
  "errors": [
    {
      "field": "fieldName",
      "message": "Error message"
    }
  ]
}
```

## Migration Guide

### Từ individual error maps:
```typescript
// OLD
const ErrorMap = { ... };
function handleError(error, res) { ... }

// NEW
import { handleError } from '../../utils/error-handler';
const handleModuleError = (e, res) => handleError(e, res, 'Module');
```

### Update error codes:
```typescript
// OLD
throw new Error('WALLET_NOT_FOUND');

// NEW (nếu conflict với category)
throw new Error('TRANSACTION_WALLET_NOT_FOUND');
```

## Testing

Error handling có thể test bằng cách:
```typescript
// Test known error
const error = new Error('WALLET_NOT_FOUND');
const mockRes = { status: jest.fn().mockReturnThis(), json: jest.fn() };

handleError(error, mockRes);
expect(mockRes.status).toHaveBeenCalledWith(404);
expect(mockRes.json).toHaveBeenCalledWith({ message: 'Wallet not found' });
```

## Future Enhancements

1. **Internationalization** - Multi-language error messages
2. **Error Monitoring** - Integration với error tracking services
3. **Custom Error Classes** - Type-safe error objects
4. **Rate Limiting** - Error-based rate limiting
5. **Error Metrics** - Monitoring error rates và patterns
