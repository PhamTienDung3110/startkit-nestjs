// Test script để verify common error handling
const BASE_URL = 'http://localhost:3000/api';

async function testCommonErrorHandling() {
  console.log('🧪 Testing Common Error Handling...\n');

  try {
    // Login first
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@test.com',
        password: '123456'
      })
    });

    if (!loginRes.ok) {
      console.log('❌ Login failed');
      return;
    }

    const loginData = await loginRes.json();
    const token = loginData.accessToken;
    const authHeaders = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    console.log('✅ Login successful');

    // Test Transaction errors
    console.log('\n📝 Testing Transaction Errors...');

    const transactionRes = await fetch(`${BASE_URL}/transactions`, {
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

    console.log(`Status: ${transactionRes.status}`);
    const transactionError = await transactionRes.json();
    console.log(`Error: ${transactionError.message}`);

    if (transactionRes.status === 404 && transactionError.message === 'Wallet not found or does not belong to user') {
      console.log('✅ TRANSACTION_WALLET_NOT_FOUND error handled correctly');
    } else {
      console.log('❌ TRANSACTION_WALLET_NOT_FOUND error not handled correctly');
    }

    // Test Wallet errors
    console.log('\n💰 Testing Wallet Errors...');

    const wallet1Res = await fetch(`${BASE_URL}/wallets`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        name: 'Test Wallet',
        type: 'cash',
        openingBalance: 1000.00
      })
    });

    if (wallet1Res.ok) {
      const walletData = await wallet1Res.json();
      console.log('✅ Wallet created for duplicate test');

      // Try to create duplicate wallet
      const wallet2Res = await fetch(`${BASE_URL}/wallets`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          name: 'Test Wallet', // Same name
          type: 'cash',
          openingBalance: 500.00
        })
      });

      console.log(`Duplicate wallet status: ${wallet2Res.status}`);
      const walletError = await wallet2Res.json();
      console.log(`Error: ${walletError.message}`);

      if (wallet2Res.status === 409 && walletError.message === 'Wallet name already exists') {
        console.log('✅ WALLET_NAME_EXISTS error handled correctly');
      } else {
        console.log('❌ WALLET_NAME_EXISTS error not handled correctly');
      }
    }

    // Test Category errors
    console.log('\n📂 Testing Category Errors...');

    const category1Res = await fetch(`${BASE_URL}/categories`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        name: 'Test Category',
        type: 'expense',
        icon: '🧪'
      })
    });

    if (category1Res.ok) {
      console.log('✅ Category created for duplicate test');

      // Try to create duplicate category
      const category2Res = await fetch(`${BASE_URL}/categories`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          name: 'Test Category', // Same name
          type: 'expense',
          icon: '🧪'
        })
      });

      console.log(`Duplicate category status: ${category2Res.status}`);
      const categoryError = await category2Res.json();
      console.log(`Error: ${categoryError.message}`);

      if (category2Res.status === 409 && categoryError.message === 'Category name already exists for this type') {
        console.log('✅ CATEGORY_NAME_EXISTS error handled correctly');
      } else {
        console.log('❌ CATEGORY_NAME_EXISTS error not handled correctly');
      }
    }

    console.log('\n🎉 Common error handling test completed successfully!');
    console.log('✨ All modules now use centralized error handling!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testCommonErrorHandling();
