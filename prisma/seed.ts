/**
 * Database seed script - Tạo dữ liệu mẫu cho database
 * Script này chạy sau khi migrate database để tạo:
 * - User admin mặc định
 * - Category templates (dữ liệu hệ thống)
 * - Wallet và category mẫu cho admin user
 */
import 'dotenv/config';
import { prisma } from '../src/db/prisma';
import { hashPassword } from '../src/utils/password';

/**
 * Tạo category templates (dữ liệu hệ thống)
 */
async function seedCategoryTemplates() {
  console.log('🌱 Seeding category templates...');

  const templates = [
    // Income categories
    { type: 'income' as const, name: 'Lương', icon: '💼', sortOrder: 1 },
    { type: 'income' as const, name: 'Thưởng', icon: '🎁', sortOrder: 2 },
    { type: 'income' as const, name: 'Lãi suất', icon: '📈', sortOrder: 3 },
    { type: 'income' as const, name: 'Bán hàng', icon: '🛒', sortOrder: 4 },
    { type: 'income' as const, name: 'Tiền cho thuê', icon: '🏠', sortOrder: 5 },
    { type: 'income' as const, name: 'Khác', icon: '💰', sortOrder: 99 },

    // Expense categories
    { type: 'expense' as const, name: 'Ăn uống', icon: '🍽️', sortOrder: 1 },
    { type: 'expense' as const, name: 'Di chuyển', icon: '🚗', sortOrder: 2 },
    { type: 'expense' as const, name: 'Mua sắm', icon: '🛍️', sortOrder: 3 },
    { type: 'expense' as const, name: 'Giải trí', icon: '🎬', sortOrder: 4 },
    { type: 'expense' as const, name: 'Sức khỏe', icon: '🏥', sortOrder: 5 },
    { type: 'expense' as const, name: 'Giáo dục', icon: '📚', sortOrder: 6 },
    { type: 'expense' as const, name: 'Điện nước', icon: '⚡', sortOrder: 7 },
    { type: 'expense' as const, name: 'Internet', icon: '🌐', sortOrder: 8 },
    { type: 'expense' as const, name: 'Điện thoại', icon: '📱', sortOrder: 9 },
    { type: 'expense' as const, name: 'Nhà ở', icon: '🏠', sortOrder: 10 },
    { type: 'expense' as const, name: 'Khác', icon: '💸', sortOrder: 99 },
  ];

  for (const template of templates) {
    await prisma.categoryTemplate.upsert({
      where: {
        type_name: {
          type: template.type as 'income' | 'expense',
          name: template.name
        }
      },
      update: {},
      create: template
    });
  }

  console.log('✅ Category templates seeded');
}

/**
 * Tạo user admin và dữ liệu mẫu
 */
async function seedAdminUser() {
  const email = 'admin@test.com';
  console.log('👤 Seeding admin user...');

  // Tạo hoặc cập nhật user admin
  const adminUser = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      password: await hashPassword('123456'),
      role: 'ADMIN',
      name: 'Admin',
    },
  });

  console.log('✅ Admin user ready');

  // Tạo wallet mẫu cho admin
  console.log('💰 Seeding admin wallets...');
  const wallets = [
    { name: 'Ví Tiền Mặt', type: 'cash' as const, openingBalance: 1000.00 },
    { name: 'Ví Ngân Hàng BIDV', type: 'bank' as const, openingBalance: 5000.00 },
    { name: 'Ví MoMo', type: 'ewallet' as const, openingBalance: 200.00 },
    { name: 'Thẻ Tín Dụng', type: 'credit' as const, openingBalance: 0.00 },
  ];

  for (const walletData of wallets) {
    await prisma.wallet.upsert({
      where: {
        userId_name: {
          userId: adminUser.id,
          name: walletData.name
        }
      },
      update: {},
      create: {
        ...walletData,
        userId: adminUser.id,
        currentBalance: walletData.openingBalance
      }
    });
  }

  console.log('✅ Admin wallets seeded');

  // Tạo categories từ templates cho admin
  console.log('📂 Seeding admin categories...');
  const templates = await prisma.categoryTemplate.findMany();

  for (const template of templates) {
    await prisma.category.upsert({
      where: {
        userId_type_name: {
          userId: adminUser.id,
          type: template.type,
          name: template.name
        }
      },
      update: {},
      create: {
        userId: adminUser.id,
        name: template.name,
        type: template.type,
        icon: template.icon,
        sortOrder: template.sortOrder,
        isSystem: true
      }
    });
  }

  console.log('✅ Admin categories seeded');

  return adminUser;
}

/**
 * Hàm main
 */
async function main() {
  console.log('🚀 Starting database seed...');
  console.log('DATABASE_URL:', process.env.DATABASE_URL);

  try {
    // 1. Seed category templates (dữ liệu hệ thống)
    await seedCategoryTemplates();

    // 2. Seed admin user với wallet và category mẫu
    await seedAdminUser();

    console.log('🎉 Database seeded successfully!');
  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
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
