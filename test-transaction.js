// Test script đơn giản cho Transaction API
// Chỉ test authentication và transaction API với lỗi expected (chưa có wallet/category)
const BASE_URL = 'http://localhost:3000/api';

async function testTransactionAPI() {
  try {
    console.log('🚀 Testing Transaction API...\n');

    // 1. Đăng nhập với admin user từ seed
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

    if (!loginRes.ok) {
      const error = await loginRes.text();
      console.log('Login failed:', error);
      return;
    }

    const loginData = await loginRes.json();
    const token = loginData.accessToken;
    console.log('✅ Login successful, got token\n');

    // 3. Test tạo transaction với wallet/category không tồn tại (expected error)
    console.log('3. Test tạo transaction với wallet/category không tồn tại...');
    const transactionRes = await fetch(`${BASE_URL}/transactions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type: 'income',
        walletId: '00000000-0000-0000-0000-000000000000', // UUID không tồn tại
        categoryId: '00000000-0000-0000-0000-000000000000', // UUID không tồn tại
        transactionDate: new Date().toISOString(),
        amount: 500.00,
        note: 'Test transaction'
      })
    });

    const transactionData = await transactionRes.json();

    if (transactionRes.status === 404 && transactionData.message === 'Wallet not found or does not belong to user') {
      console.log('✅ Transaction validation working correctly - wallet not found');
    } else {
      console.log('❌ Unexpected response:', transactionData);
      return;
    }

    // 4. Test GET transactions (empty list expected)
    console.log('\n4. Test lấy danh sách transactions...');
    const transactionsRes = await fetch(`${BASE_URL}/transactions`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!transactionsRes.ok) {
      const error = await transactionsRes.text();
      console.log('Get transactions failed:', error);
      return;
    }

    const transactionsData = await transactionsRes.json();
    console.log('✅ Transactions list (empty expected):', JSON.stringify(transactionsData, null, 2));

    // 5. Test validation - transfer với cùng wallet
    console.log('\n5. Test validation transfer với cùng wallet...');
    const invalidTransferRes = await fetch(`${BASE_URL}/transactions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type: 'transfer',
        fromWalletId: '00000000-0000-0000-0000-000000000000',
        toWalletId: '00000000-0000-0000-0000-000000000000', // Same as fromWalletId
        transactionDate: new Date().toISOString(),
        amount: 200.00,
        note: 'Invalid transfer'
      })
    });

    const invalidTransferData = await invalidTransferRes.json();

    if (invalidTransferRes.status === 400 && invalidTransferData.message.includes('Ví nguồn và ví đích phải khác nhau')) {
      console.log('✅ Transfer validation working correctly - same wallet rejected');
    } else {
      console.log('❌ Unexpected response for invalid transfer:', invalidTransferData);
      return;
    }

    console.log('\n🎉 Transaction API basic validation test completed successfully!');
    console.log('📝 Note: To test full transaction creation, wallet and category APIs need to be implemented first.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Chạy test
testTransactionAPI();
