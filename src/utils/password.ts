// Import thư viện bcrypt để xử lý mã hóa mật khẩu
import bcrypt from 'bcrypt';

// Hàm hash mật khẩu: nhận mật khẩu gốc và trả về chuỗi hash với salt rounds = 10
export const hashPassword = (plain: string) => bcrypt.hash(plain, 10);

// Hàm so sánh mật khẩu: nhận mật khẩu gốc và chuỗi hash, trả về boolean xác nhận khớp
export const comparePassword = (plain: string, hash: string) => bcrypt.compare(plain, hash);
