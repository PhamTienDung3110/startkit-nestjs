// Test script để kiểm tra Swagger UI

const BASE_URL = 'http://localhost:3000';

async function testSwagger() {
  try {
    console.log('🚀 Testing Swagger UI...\n');

    // Test swagger JSON endpoint
    console.log('1. Testing /api-docs JSON...');
    const swaggerJsonRes = await fetch(`${BASE_URL}/api-docs`);
    console.log('Status:', swaggerJsonRes.status);

    if (swaggerJsonRes.status === 200) {
      console.log('✅ Swagger JSON endpoint working');

      // Test swagger UI HTML
      console.log('\n2. Testing /api-docs UI...');
      const swaggerUiRes = await fetch(`${BASE_URL}/api-docs`, {
        headers: {
          'Accept': 'text/html'
        }
      });
      console.log('Status:', swaggerUiRes.status);

      if (swaggerUiRes.status === 200) {
        console.log('✅ Swagger UI working');
        console.log('\n🎉 Swagger setup successful!');
        console.log('📖 Access documentation at: http://localhost:3000/api-docs');
        console.log('🔄 Alternative URL: http://localhost:3000/docs');
      } else {
        console.log('❌ Swagger UI not working');
      }
    } else {
      console.log('❌ Swagger JSON endpoint not working');
      const error = await swaggerJsonRes.text();
      console.log('Error:', error);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testSwagger();
