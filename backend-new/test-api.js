// Test script to verify API connectivity and data structure
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testApi() {
  console.log('Testing API connectivity and data structure...');
  
  try {
    // Test health endpoint
    console.log('\n1. Testing health endpoint...');
    const healthResponse = await fetch('http://localhost:3000/health');
    const healthData = await healthResponse.json();
    console.log('Health status:', healthData.status);
    console.log('Health message:', healthData.message);
    
    // Test products endpoint
    console.log('\n2. Testing products endpoint...');
    const productsResponse = await fetch('http://localhost:3000/api/products');
    const productsData = await productsResponse.json();
    console.log('Products count:', productsData.length);
    
    if (productsData.length > 0) {
      const firstProduct = productsData[0];
      console.log('First product:', {
        id: firstProduct.id,
        name: firstProduct.name,
        ironRate: firstProduct.ironRate,
        washAndIronRate: firstProduct.washAndIronRate,
        dryCleanRate: firstProduct.dryCleanRate,
        category: firstProduct.category,
        barcode: firstProduct.barcode
      });
      
      // Check if product structure is correct
      if (firstProduct.hasOwnProperty('ironRate') && 
          firstProduct.hasOwnProperty('washAndIronRate') && 
          firstProduct.hasOwnProperty('dryCleanRate')) {
        console.log('✅ Product structure is correct (new format with service-specific rates)');
      } else if (firstProduct.hasOwnProperty('price')) {
        console.log('❌ Product structure is old (still has generic price field)');
        console.log('You need to run the database migration script to update the schema');
      } else {
        console.log('⚠️ Product structure is neither old nor new - unexpected format');
      }
    }
    
    // Test customers endpoint
    console.log('\n3. Testing customers endpoint...');
    const customersResponse = await fetch('http://localhost:3000/api/customers');
    const customersData = await customersResponse.json();
    console.log('Customers count:', customersData.length);
    
    console.log('\n✅ All API tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Error testing API:', error.message);
    console.log('\nTroubleshooting tips:');
    console.log('1. Make sure the backend server is running on port 3000');
    console.log('2. Check that your Supabase credentials are configured correctly');
    console.log('3. Verify that all database tables are created');
  }
}

// Run test
testApi();