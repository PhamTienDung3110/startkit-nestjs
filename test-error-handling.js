// Test script để verify error handling vẫn hoạt động
const BASE_URL = 'http://localhost:3000/api';

async function testErrorHandling() {
  console.log('🧪 Testing Error Handling...\n');

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

    // Test transaction creation with invalid wallet
    console.log('\n📝 Testing transaction with invalid wallet...');
    const invalidWalletRes = await fetch(`${BASE_URL}/transactions`, {
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

    console.log(`Status: ${invalidWalletRes.status}`);
    const errorData = await invalidWalletRes.json();
    console.log(`Error: ${errorData.message}`);

    if (invalidWalletRes.status === 404 && errorData.message === 'Wallet not found or does not belong to user') {
      console.log('✅ WALLET_NOT_FOUND error handled correctly');
    } else {
      console.log('❌ WALLET_NOT_FOUND error not handled correctly');
    }

    // Test transfer with same wallet
    console.log('\n📝 Testing transfer with same wallet...');
    const sameWalletRes = await fetch(`${BASE_URL}/transactions`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        type: 'transfer',
        fromWalletId: '00000000-0000-0000-0000-000000000000',
        toWalletId: '00000000-0000-0000-0000-000000000000',
        transactionDate: new Date().toISOString(),
        amount: 50.00
      })
    });

    console.log(`Status: ${sameWalletRes.status}`);
    const sameWalletError = await sameWalletRes.json();
    console.log(`Error: ${sameWalletError.message}`);

    if (sameWalletRes.status === 400 && sameWalletError.message === 'Ví nguồn và ví đích phải khác nhau') {
      console.log('✅ SAME_WALLET_TRANSFER error handled correctly');
    } else {
      console.log('❌ SAME_WALLET_TRANSFER error not handled correctly');
    }

    console.log('\n🎉 Error handling test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testErrorHandling();
