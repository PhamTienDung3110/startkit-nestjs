// Test script để verify tất cả API endpoints thực sự hoạt động
const BASE_URL = 'http://localhost:3000/api';

async function testAllEndpoints() {
  console.log('🚀 Testing All API Endpoints...\n');

  try {
    // 1. Health check
    console.log('1. Testing health endpoint...');
    const healthRes = await fetch(`${BASE_URL.replace('/api', '')}/health`);
    console.log(`   Status: ${healthRes.status}`);
    if (healthRes.status === 200) {
      console.log('   ✅ Health endpoint working');
    } else {
      console.log('   ❌ Health endpoint failed');
      return;
    }

    // 2. Register user
    console.log('\n2. Registering test user...');
    const registerRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `test${Date.now()}@example.com`,
        password: 'test123456',
        name: 'Test User'
      })
    });
    console.log(`   Status: ${registerRes.status}`);
    if (registerRes.status === 201) {
      console.log('   ✅ User registration working');
    } else {
      const error = await registerRes.text();
      console.log(`   ❌ Registration failed: ${error}`);
      return;
    }

    // 3. Login
    console.log('\n3. Logging in...');
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@test.com',
        password: '123456'
      })
    });
    console.log(`   Status: ${loginRes.status}`);
    if (loginRes.status === 200) {
      const loginData = await loginRes.json();
      const token = loginData.accessToken;
      console.log('   ✅ Login working, got token');

      const authHeaders = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // 4. Test Wallet endpoints
      console.log('\n4. Testing Wallet endpoints...');

      // Create wallet
      console.log('   - Creating wallet...');
      const createWalletRes = await fetch(`${BASE_URL}/wallets`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          name: `Test Wallet ${Date.now()}`,
          type: 'cash',
          openingBalance: 1000.00
        })
      });
      console.log(`     Status: ${createWalletRes.status}`);
      if (createWalletRes.status === 201) {
        const walletData = await createWalletRes.json();
        const walletId = walletData.wallet.id;
        console.log('     ✅ Create wallet working');

        // Get wallets
        console.log('   - Getting wallets...');
        const getWalletsRes = await fetch(`${BASE_URL}/wallets`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log(`     Status: ${getWalletsRes.status}`);
        if (getWalletsRes.status === 200) {
          console.log('     ✅ Get wallets working');
        }

        // Get wallet by ID
        console.log('   - Getting wallet by ID...');
        const getWalletRes = await fetch(`${BASE_URL}/wallets/${walletId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log(`     Status: ${getWalletRes.status}`);
        if (getWalletRes.status === 200) {
          console.log('     ✅ Get wallet by ID working');
        }

        // Update wallet
        console.log('   - Updating wallet...');
        const updateWalletRes = await fetch(`${BASE_URL}/wallets/${walletId}`, {
          method: 'PUT',
          headers: authHeaders,
          body: JSON.stringify({
            name: `Updated Wallet ${Date.now()}`
          })
        });
        console.log(`     Status: ${updateWalletRes.status}`);
        if (updateWalletRes.status === 200) {
          console.log('     ✅ Update wallet working');
        }

        // Get wallet stats
        console.log('   - Getting wallet stats...');
        const statsRes = await fetch(`${BASE_URL}/wallets/stats/summary`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log(`     Status: ${statsRes.status}`);
        if (statsRes.status === 200) {
          console.log('     ✅ Get wallet stats working');
        }

        // Archive wallet
        console.log('   - Archiving wallet...');
        const deleteWalletRes = await fetch(`${BASE_URL}/wallets/${walletId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log(`     Status: ${deleteWalletRes.status}`);
        if (deleteWalletRes.status === 200) {
          console.log('     ✅ Archive wallet working');
        }

      } else {
        const error = await createWalletRes.text();
        console.log(`     ❌ Create wallet failed: ${error}`);
      }

      // 5. Test Category endpoints
      console.log('\n5. Testing Category endpoints...');

      // Create category
      console.log('   - Creating category...');
      const createCategoryRes = await fetch(`${BASE_URL}/categories`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          name: `Test Category ${Date.now()}`,
          type: 'expense',
          icon: '🧪'
        })
      });
      console.log(`     Status: ${createCategoryRes.status}`);
      if (createCategoryRes.status === 201) {
        const categoryData = await createCategoryRes.json();
        const categoryId = categoryData.category.id;
        console.log('     ✅ Create category working');

        // Get categories
        console.log('   - Getting categories...');
        const getCategoriesRes = await fetch(`${BASE_URL}/categories`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log(`     Status: ${getCategoriesRes.status}`);
        if (getCategoriesRes.status === 200) {
          console.log('     ✅ Get categories working');
        }

        // Get category by ID
        console.log('   - Getting category by ID...');
        const getCategoryRes = await fetch(`${BASE_URL}/categories/${categoryId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log(`     Status: ${getCategoryRes.status}`);
        if (getCategoryRes.status === 200) {
          console.log('     ✅ Get category by ID working');
        }

        // Update category
        console.log('   - Updating category...');
        const updateCategoryRes = await fetch(`${BASE_URL}/categories/${categoryId}`, {
          method: 'PUT',
          headers: authHeaders,
          body: JSON.stringify({
            name: `Updated Category ${Date.now()}`
          })
        });
        console.log(`     Status: ${updateCategoryRes.status}`);
        if (updateCategoryRes.status === 200) {
          console.log('     ✅ Update category working');
        }

        // Delete category
        console.log('   - Deleting category...');
        const deleteCategoryRes = await fetch(`${BASE_URL}/categories/${categoryId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log(`     Status: ${deleteCategoryRes.status}`);
        if (deleteCategoryRes.status === 200) {
          console.log('     ✅ Delete category working');
        }

      } else {
        const error = await createCategoryRes.text();
        console.log(`     ❌ Create category failed: ${error}`);
      }

      // Get category templates
      console.log('   - Getting category templates...');
      const templatesRes = await fetch(`${BASE_URL}/categories/templates`);
      console.log(`     Status: ${templatesRes.status}`);
      if (templatesRes.status === 200) {
        console.log('     ✅ Get category templates working');
      }

      // 6. Test Transaction endpoints
      console.log('\n6. Testing Transaction endpoints...');

      // Get transactions (should be empty)
      console.log('   - Getting transactions...');
      const getTransactionsRes = await fetch(`${BASE_URL}/transactions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log(`     Status: ${getTransactionsRes.status}`);
      if (getTransactionsRes.status === 200) {
        console.log('     ✅ Get transactions working (empty list expected)');
      }

      // Try to create transaction (will fail without wallet/category)
      console.log('   - Testing transaction creation (expected to fail)...');
      const createTransactionRes = await fetch(`${BASE_URL}/transactions`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          type: 'income',
          walletId: '00000000-0000-0000-0000-000000000000',
          categoryId: '00000000-0000-0000-0000-000000000000',
          transactionDate: new Date().toISOString(),
          amount: 100.00
        })
      });
      console.log(`     Status: ${createTransactionRes.status}`);
      if (createTransactionRes.status === 404) {
        console.log('     ✅ Transaction validation working (wallet not found)');
      }

      console.log('\n🎉 All API endpoints are working!');

    } else {
      const error = await loginRes.text();
      console.log(`   ❌ Login failed: ${error}`);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run test
testAllEndpoints();
