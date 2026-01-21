// Test script chỉ test Category API

const BASE_URL = 'http://localhost:3000/api';

async function testCategoryAPI() {
  try {
    console.log('🚀 Testing Category API...\n');

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
    console.log('✅ Login successful\n');

    const authHeaders = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // Test create category
    console.log('2. Creating category...');
    const createCategoryRes = await fetch(`${BASE_URL}/categories`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        name: 'Test Category',
        type: 'expense',
        icon: '🧪'
      })
    });

    console.log('Status:', createCategoryRes.status);
    const responseText = await createCategoryRes.text();
    console.log('Response:', responseText);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testCategoryAPI();
