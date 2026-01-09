/**
 * Database seed script - Tạo dữ liệu mẫu cho database
 * Script này chạy sau khi migrate database để tạo user admin mặc định
 */
import 'dotenv/config';
import { prisma } from '../src/db/prisma';
import { hashPassword } from '../src/utils/password';

/**
 * Hàm main: Tạo user admin mặc định nếu chưa tồn tại
 * Email: admin@test.com
 * Password: 123456
 * Role: ADMIN
 */
async function main() {
  const email = 'admin@test.com';
  console.log('DATABASE_URL:', process.env.DATABASE_URL);
  
  // Kiểm tra xem user admin đã tồn tại chưa
  const exists = await prisma.user.findUnique({ where: { email } });

  // Nếu chưa tồn tại, tạo user admin mới
  if (!exists) {
    await prisma.user.create({
      data: {
        email,
        password: await hashPassword('123456'),  // Hash password trước khi lưu
        role: 'ADMIN',
        name: 'Admin',
      },
    });
    console.log('Admin user created successfully');
  } else {
    console.log('Admin user already exists');
  }
}

// Chạy seed và đóng kết nối database
main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
