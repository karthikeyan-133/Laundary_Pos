// Test script to check what product data is being returned from the API
async function testProductData() {
  console.log('Testing product data flow...');
  
  try {
    // Test the backend API directly
    console.log('Testing backend API...');
    const backendResponse = await fetch('http://localhost:3000/api/products');
    console.log('Backend response status:', backendResponse.status);
    
    if (backendResponse.ok) {
      const backendData = await backendResponse.json();
      console.log('Backend products data:', JSON.stringify(backendData, null, 2));
      
      if (backendData.length > 0) {
        console.log('First product from backend:', backendData[0]);
        console.log('First product keys:', Object.keys(backendData[0]));
      }
    } else {
      console.error('Backend API error:', await backendResponse.text());
    }
    
    // Test the frontend API client
    console.log('\nTesting frontend API client...');
    const { productsApi } = await import('./frontend/src/services/api.ts');
    
    try {
      const frontendData = await productsApi.getAll();
      console.log('Frontend products data:', frontendData);
      
      if (frontendData.length > 0) {
        console.log('First product from frontend client:', frontendData[0]);
        console.log('First product keys:', Object.keys(frontendData[0]));
      }
    } catch (frontendError) {
      console.error('Frontend API client error:', frontendError);
    }
  } catch (error) {
    console.error('Error testing product data:', error);
  }
}

// Run test
testProductData();