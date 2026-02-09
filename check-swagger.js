// Script kiểm tra swagger documentation
const BASE_URL = 'http://localhost:3000';

async function checkSwagger() {
  try {
    console.log('🔍 Checking Swagger Documentation...\n');

    // Get swagger JSON spec - try different endpoints
    let response;
    let swaggerUrl;

    // Try different possible JSON endpoints
    const endpoints = [
      `${BASE_URL}/api-docs.json`,
      `${BASE_URL}/swagger.json`,
      `${BASE_URL}/api-docs/?format=json`
    ];

    for (const url of endpoints) {
      try {
        console.log(`Trying ${url}...`);
        response = await fetch(url);
        if (response.ok && response.headers.get('content-type')?.includes('application/json')) {
          swaggerUrl = url;
          break;
        }
      } catch (e) {
        continue;
      }
    }

    // If no JSON endpoint found, try to extract from HTML
    if (!response || !response.ok) {
      console.log('Trying to extract JSON from HTML...');
      response = await fetch(`${BASE_URL}/api-docs`);
      swaggerUrl = `${BASE_URL}/api-docs (HTML)`;
    }
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    const text = await response.text();
    console.log('Response type:', response.headers.get('content-type'));
    console.log('First 200 chars:', text.substring(0, 200));

    if (response.headers.get('content-type')?.includes('application/json') || text.startsWith('{')) {
      try {
        const swaggerDoc = JSON.parse(text);

        console.log('📋 Swagger Info:');
        console.log(`   Title: ${swaggerDoc.info.title}`);
        console.log(`   Version: ${swaggerDoc.info.version}`);
        console.log(`   Description: ${swaggerDoc.info.description}`);

        console.log('\n🏷️  Available Tags:');
        if (swaggerDoc.tags) {
          swaggerDoc.tags.forEach(tag => {
            console.log(`   - ${tag.name}: ${tag.description || 'No description'}`);
          });
        }

        console.log('\n🔗 Available Paths:');
        const paths = Object.keys(swaggerDoc.paths);
        console.log(`   Total endpoints: ${paths.length}`);

        // Group by tags
        const endpointsByTag = {};

        paths.forEach(path => {
          const methods = Object.keys(swaggerDoc.paths[path]);
          methods.forEach(method => {
            const endpoint = swaggerDoc.paths[path][method];
            const tag = endpoint.tags ? endpoint.tags[0] : 'Untagged';

            if (!endpointsByTag[tag]) {
              endpointsByTag[tag] = [];
            }

            endpointsByTag[tag].push({
              method: method.toUpperCase(),
              path,
              summary: endpoint.summary || 'No summary',
              operationId: endpoint.operationId || 'No operationId'
            });
          });
        });

        Object.keys(endpointsByTag).forEach(tag => {
          console.log(`\n📂 ${tag}:`);
          endpointsByTag[tag].forEach(endpoint => {
            console.log(`   ${endpoint.method} ${endpoint.path}`);
            console.log(`     └─ ${endpoint.summary}`);
          });
        });

        console.log('\n📊 Schemas available:');
        const schemas = Object.keys(swaggerDoc.components.schemas);
        console.log(`   ${schemas.length} schemas: ${schemas.join(', ')}`);

        console.log('\n✅ Swagger check completed!');
      } catch (jsonError) {
        console.log('Response is not valid JSON. First 500 chars:');
        console.log(text.substring(0, 500));
      }
    } else {
      console.log('Response is not JSON. Content-Type:', response.headers.get('content-type'));
      console.log('First 500 chars:');
      console.log(text.substring(0, 500));
    }

  } catch (error) {
    console.error('❌ Error checking swagger:', error.message);
  }
}

checkSwagger();
