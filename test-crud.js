// Test script cho CRUD operations của Wallet và Category APIs
// Node.js 18+ có fetch built-in

const BASE_URL = 'http://localhost:3000/api';

async function testCRUDOperations() {
  try {
    console.log('🚀 Testing CRUD Operations for Wallet & Category APIs...\n');

    // 1. Đăng nhập
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

    const authHeaders = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // ==================== WALLET CRUD ====================
    console.log('2. Testing Wallet CRUD...');

    const timestamp = Date.now();

    // Create wallet
    console.log('   - Creating wallet...');
    const createWalletRes = await fetch(`${BASE_URL}/wallets`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        name: `Test Wallet ${timestamp}`,
        type: 'bank',
        openingBalance: 500.00
      })
    });

    if (!createWalletRes.ok) {
      const error = await createWalletRes.text();
      console.log('Create wallet failed:', error);
      return;
    }

    const createWalletData = await createWalletRes.json();
    const walletId = createWalletData.wallet.id;
    console.log('   ✅ Wallet created:', createWalletData.wallet.name);

    // Get wallets
    console.log('   - Getting wallets...');
    const getWalletsRes = await fetch(`${BASE_URL}/wallets`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!getWalletsRes.ok) {
      const error = await getWalletsRes.text();
      console.log('Get wallets failed:', error);
      return;
    }

    const getWalletsData = await getWalletsRes.json();
    console.log(`   ✅ Retrieved ${getWalletsData.wallets.length} wallets`);

    // Get wallet by ID
    console.log('   - Getting wallet by ID...');
    const getWalletRes = await fetch(`${BASE_URL}/wallets/${walletId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!getWalletRes.ok) {
      const error = await getWalletRes.text();
      console.log('Get wallet by ID failed:', error);
      return;
    }

    const getWalletData = await getWalletRes.json();
    console.log('   ✅ Retrieved wallet:', getWalletData.wallet.name);

    // Update wallet
    console.log('   - Updating wallet...');
    const updateWalletRes = await fetch(`${BASE_URL}/wallets/${walletId}`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({
        name: 'Updated Test Wallet ' + Date.now() // Add timestamp to avoid conflicts
      })
    });

    if (!updateWalletRes.ok) {
      const error = await updateWalletRes.text();
      console.log('Update wallet failed:', error);
      return;
    }

    const updateWalletData = await updateWalletRes.json();
    console.log('   ✅ Wallet updated to:', updateWalletData.wallet.name);

    // Get wallet stats
    console.log('   - Getting wallet stats...');
    const walletStatsRes = await fetch(`${BASE_URL}/wallets/stats/summary`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!walletStatsRes.ok) {
      const error = await walletStatsRes.text();
      console.log('Get wallet stats failed:', error);
      return;
    }

    const walletStatsData = await walletStatsRes.json();
    console.log('   ✅ Wallet stats retrieved:', JSON.stringify(walletStatsData.stats, null, 2));

    // ==================== CATEGORY CRUD ====================
    console.log('\n3. Testing Category CRUD...');

    // Create category
    console.log('   - Creating category...');
    const createCategoryRes = await fetch(`${BASE_URL}/categories`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        name: `Test Category ${timestamp}`,
        type: 'expense',
        icon: '🧪'
      })
    });

    if (!createCategoryRes.ok) {
      const error = await createCategoryRes.text();
      console.log('Create category failed:', error);
      return;
    }

    const createCategoryData = await createCategoryRes.json();
    const categoryId = createCategoryData.category.id;
    console.log('   ✅ Category created:', createCategoryData.category.name);

    // Get categories
    console.log('   - Getting categories...');
    const getCategoriesRes = await fetch(`${BASE_URL}/categories`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!getCategoriesRes.ok) {
      const error = await getCategoriesRes.text();
      console.log('Get categories failed:', error);
      return;
    }

    const getCategoriesData = await getCategoriesRes.json();
    console.log(`   ✅ Retrieved ${getCategoriesData.categories.length} categories`);

    // Get category by ID
    console.log('   - Getting category by ID...');
    const getCategoryRes = await fetch(`${BASE_URL}/categories/${categoryId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!getCategoryRes.ok) {
      const error = await getCategoryRes.text();
      console.log('Get category by ID failed:', error);
      return;
    }

    const getCategoryData = await getCategoryRes.json();
    console.log('   ✅ Retrieved category:', getCategoryData.category.name);

    // Update category
    console.log('   - Updating category...');
    const updateCategoryRes = await fetch(`${BASE_URL}/categories/${categoryId}`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({
        name: 'Updated Test Category'
      })
    });

    if (!updateCategoryRes.ok) {
      const error = await updateCategoryRes.text();
      console.log('Update category failed:', error);
      return;
    }

    const updateCategoryData = await updateCategoryRes.json();
    console.log('   ✅ Category updated to:', updateCategoryData.category.name);

    // Get category templates
    console.log('   - Getting category templates...');
    const templatesRes = await fetch(`${BASE_URL}/categories/templates`);

    if (!templatesRes.ok) {
      const error = await templatesRes.text();
      console.log('Get templates failed:', error);
      return;
    }

    const templatesData = await templatesRes.json();
    console.log(`   ✅ Retrieved ${templatesData.templates.length} category templates`);

    // ==================== CLEANUP ====================
    console.log('\n4. Cleaning up test data...');

    // Delete category
    console.log('   - Deleting category...');
    const deleteCategoryRes = await fetch(`${BASE_URL}/categories/${categoryId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!deleteCategoryRes.ok) {
      const error = await deleteCategoryRes.text();
      console.log('Delete category failed:', error);
      return;
    }

    console.log('   ✅ Category deleted');

    // Delete wallet (archive)
    console.log('   - Archiving wallet...');
    const deleteWalletRes = await fetch(`${BASE_URL}/wallets/${walletId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!deleteWalletRes.ok) {
      const error = await deleteWalletRes.text();
      console.log('Delete wallet failed:', error);
      return;
    }

    console.log('   ✅ Wallet archived');

    console.log('\n🎉 CRUD Operations Test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Chạy test
testCRUDOperations();
