// Script kiểm tra swagger JSON spec
const BASE_URL = 'http://localhost:3000';

async function checkSwaggerJSON() {
  try {
    console.log('🔍 Checking Swagger JSON Spec...\n');

    // Get swagger JSON spec
    const response = await fetch(`${BASE_URL}/api-docs.json`);
    console.log('Response status:', response.status);
    console.log('Content-Type:', response.headers.get('content-type'));

    if (!response.ok) {
      console.log('❌ Failed to fetch swagger JSON');
      return;
    }

    const swaggerDoc = await response.json();

    console.log('📋 Swagger Info:');
    console.log(`   Title: ${swaggerDoc.info?.title || 'N/A'}`);
    console.log(`   Version: ${swaggerDoc.info?.version || 'N/A'}`);
    console.log(`   Description: ${swaggerDoc.info?.description || 'N/A'}`);
    console.log(`   OpenAPI Version: ${swaggerDoc.openapi || 'N/A'}`);

    console.log('\n🏷️  Available Tags:');
    if (swaggerDoc.tags && swaggerDoc.tags.length > 0) {
      swaggerDoc.tags.forEach((tag, index) => {
        console.log(`   ${index + 1}. ${tag.name}: ${tag.description || 'No description'}`);
      });
    } else {
      console.log('   No tags found');
    }

    console.log('\n🔗 Available Paths:');
    const paths = swaggerDoc.paths ? Object.keys(swaggerDoc.paths) : [];
    console.log(`   Total endpoints: ${paths.length}`);

    if (paths.length > 0) {
      // Group by tags
      const endpointsByTag = {};

      paths.forEach(path => {
        const methods = Object.keys(swaggerDoc.paths[path]);
        methods.forEach(method => {
          const endpoint = swaggerDoc.paths[path][method];
          const tag = endpoint.tags && endpoint.tags.length > 0 ? endpoint.tags[0] : 'Untagged';

          if (!endpointsByTag[tag]) {
            endpointsByTag[tag] = [];
          }

          endpointsByTag[tag].push({
            method: method.toUpperCase(),
            path,
            summary: endpoint.summary || 'No summary',
            description: endpoint.description || 'No description'
          });
        });
      });

      Object.keys(endpointsByTag).forEach(tag => {
        console.log(`\n📂 ${tag} (${endpointsByTag[tag].length} endpoints):`);
        endpointsByTag[tag].forEach(endpoint => {
          console.log(`   ${endpoint.method.padEnd(6)} ${endpoint.path}`);
          if (endpoint.summary !== 'No summary') {
            console.log(`           └─ ${endpoint.summary}`);
          }
        });
      });
    }

    console.log('\n📊 Components:');
    if (swaggerDoc.components) {
      const schemas = swaggerDoc.components.schemas ? Object.keys(swaggerDoc.components.schemas) : [];
      console.log(`   Schemas: ${schemas.length} (${schemas.slice(0, 5).join(', ')}${schemas.length > 5 ? '...' : ''})`);

      const securitySchemes = swaggerDoc.components.securitySchemes ? Object.keys(swaggerDoc.components.securitySchemes) : [];
      console.log(`   Security Schemes: ${securitySchemes.join(', ')}`);
    }

    console.log('\n🛡️  Security:');
    if (swaggerDoc.security && swaggerDoc.security.length > 0) {
      swaggerDoc.security.forEach((security, index) => {
        console.log(`   ${index + 1}. ${Object.keys(security).join(', ')}`);
      });
    }

    console.log('\n✅ Swagger JSON check completed!');

    if (paths.length === 0) {
      console.log('\n⚠️  WARNING: No endpoints found! Check swagger annotations in controllers.');
    }

  } catch (error) {
    console.error('❌ Error checking swagger:', error.message);
  }
}

checkSwaggerJSON();
