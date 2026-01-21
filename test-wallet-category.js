// Test script cho Wallet và Category APIs
const BASE_URL = 'http://localhost:3000/api';

async function testWalletCategoryAPIs() {
  try {
    console.log('🚀 Testing Wallet & Category APIs...\n');

    // 1. Đăng nhập với admin user
    console.log('1. Đăng nhập...');
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@test.com',
        password: '123456'
      })
    });

    if (!loginRes.ok) {
      const error = await loginRes.text();
      console.log('Login failed:', error);
      return;
    }

    const loginData = await loginRes.json();
    const token = loginData.accessToken;
    console.log('✅ Login successful, got token\n');

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // 2. Test tạo wallet mới
    console.log('2. Test tạo wallet mới...');
    const createWalletRes = await fetch(`${BASE_URL}/wallets`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: 'Ví ShopeePay',
        type: 'ewallet',
        openingBalance: 150.00
      })
    });

    if (!createWalletRes.ok) {
      const error = await createWalletRes.text();
      console.log('Create wallet failed:', error);
      return;
    }

    const createWalletData = await createWalletRes.json();
    const walletId = createWalletData.wallet.id;
    console.log('✅ Wallet created:', createWalletData);

    // 3. Test lấy danh sách wallets
    console.log('\n3. Test lấy danh sách wallets...');
    const getWalletsRes = await fetch(`${BASE_URL}/wallets`, { headers });

    if (!getWalletsRes.ok) {
      const error = await getWalletsRes.text();
      console.log('Get wallets failed:', error);
      return;
    }

    const getWalletsData = await getWalletsRes.json();
    console.log('✅ Wallets list:', JSON.stringify(getWalletsData, null, 2));

    // 4. Test cập nhật wallet
    console.log('\n4. Test cập nhật wallet...');
    const updateWalletRes = await fetch(`${BASE_URL}/wallets/${walletId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        name: 'Ví ShopeePay Updated',
        openingBalance: 200.00
      })
    });

    if (!updateWalletRes.ok) {
      const error = await updateWalletRes.text();
      console.log('Update wallet failed:', error);
      return;
    }

    const updateWalletData = await updateWalletRes.json();
    console.log('✅ Wallet updated:', updateWalletData);

    // 5. Test lấy wallet stats
    console.log('\n5. Test lấy wallet stats...');
    const walletStatsRes = await fetch(`${BASE_URL}/wallets/stats/summary`, { headers });

    if (!walletStatsRes.ok) {
      const error = await walletStatsRes.text();
      console.log('Get wallet stats failed:', error);
      return;
    }

    const walletStatsData = await walletStatsRes.json();
    console.log('✅ Wallet stats:', JSON.stringify(walletStatsData, null, 2));

    // 6. Test tạo category mới
    console.log('\n6. Test tạo category mới...');
    const createCategoryRes = await fetch(`${BASE_URL}/categories`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: 'Du lịch',
        type: 'expense',
        icon: '✈️'
      })
    });

    if (!createCategoryRes.ok) {
      const error = await createCategoryRes.text();
      console.log('Create category failed:', error);
      return;
    }

    const createCategoryData = await createCategoryRes.json();
    const categoryId = createCategoryData.category.id;
    console.log('✅ Category created:', createCategoryData);

    // 7. Test lấy danh sách categories
    console.log('\n7. Test lấy danh sách categories...');
    const getCategoriesRes = await fetch(`${BASE_URL}/categories`, { headers });

    if (!getCategoriesRes.ok) {
      const error = await getCategoriesRes.text();
      console.log('Get categories failed:', error);
      return;
    }

    const getCategoriesData = await getCategoriesRes.json();
    console.log('✅ Categories list:', JSON.stringify(getCategoriesData, null, 2));

    // 8. Test cập nhật category
    console.log('\n8. Test cập nhật category...');
    const updateCategoryRes = await fetch(`${BASE_URL}/categories/${categoryId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        name: 'Du lịch & Giải trí',
        icon: '🎭'
      })
    });

    if (!updateCategoryRes.ok) {
      const error = await updateCategoryRes.text();
      console.log('Update category failed:', error);
      return;
    }

    const updateCategoryData = await updateCategoryRes.json();
    console.log('✅ Category updated:', updateCategoryData);

    // 9. Test lấy category templates
    console.log('\n9. Test lấy category templates...');
    const templatesRes = await fetch(`${BASE_URL}/categories/templates`);

    if (!templatesRes.ok) {
      const error = await templatesRes.text();
      console.log('Get templates failed:', error);
      return;
    }

    const templatesData = await templatesRes.json();
    console.log('✅ Templates:', JSON.stringify(templatesData, null, 2));

    // 10. Test tạo category từ template
    console.log('\n10. Test tạo category từ template...');
    const templateId = templatesData.templates[0].id; // Lấy template đầu tiên
    const createFromTemplateRes = await fetch(`${BASE_URL}/categories/from-template`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        templateId: templateId,
        customName: 'Lương từ Freelance'
      })
    });

    if (!createFromTemplateRes.ok) {
      const error = await createFromTemplateRes.text();
      console.log('Create from template failed:', error);
      return;
    }

    const createFromTemplateData = await createFromTemplateRes.json();
    console.log('✅ Category from template created:', createFromTemplateData);

    // 11. Test xóa category
    console.log('\n11. Test xóa category...');
    const deleteCategoryRes = await fetch(`${BASE_URL}/categories/${categoryId}`, {
      method: 'DELETE',
      headers
    });

    if (!deleteCategoryRes.ok) {
      const error = await deleteCategoryRes.text();
      console.log('Delete category failed:', error);
      return;
    }

    const deleteCategoryData = await deleteCategoryRes.json();
    console.log('✅ Category deleted:', deleteCategoryData);

    // 12. Test xóa wallet
    console.log('\n12. Test xóa wallet...');
    const deleteWalletRes = await fetch(`${BASE_URL}/wallets/${walletId}`, {
      method: 'DELETE',
      headers
    });

    if (!deleteWalletRes.ok) {
      const error = await deleteWalletRes.text();
      console.log('Delete wallet failed:', error);
      return;
    }

    const deleteWalletData = await deleteWalletRes.json();
    console.log('✅ Wallet deleted:', deleteWalletData);

    console.log('\n🎉 Wallet & Category APIs test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Chạy test
testWalletCategoryAPIs();
