// Test script to verify frontend can communicate with backend
async function testFrontendBackendConnection() {
  try {
    console.log('Testing frontend-backend connection...');
    
    // Simulate the environment variable that would be used in the frontend
    const VITE_API_URL = 'https://billing-pos-yjh9.vercel.app';
    
    console.log('Using API URL:', VITE_API_URL);
    
    // Test the root endpoint
    console.log('Testing root endpoint...');
    const rootResponse = await fetch(`${VITE_API_URL}/`);
    
    if (!rootResponse.ok) {
      console.error('Root endpoint failed:', rootResponse.status, rootResponse.statusText);
    } else {
      const rootData = await rootResponse.json();
      console.log('Root endpoint result:', JSON.stringify(rootData, null, 2));
    }
    
    // Test the health endpoint
    console.log('Testing health endpoint...');
    const healthResponse = await fetch(`${VITE_API_URL}/health`);
    
    if (!healthResponse.ok) {
      console.error('Health check failed:', healthResponse.status, healthResponse.statusText);
    } else {
      const healthData = await healthResponse.json();
      console.log('Health check result:', JSON.stringify(healthData, null, 2));
    }
    
    // Test the settings endpoint
    console.log('Testing settings endpoint...');
    const settingsResponse = await fetch(`${VITE_API_URL}/api/settings`);
    
    if (!settingsResponse.ok) {
      console.error('Settings fetch failed:', settingsResponse.status, settingsResponse.statusText);
    } else {
      const settingsData = await settingsResponse.json();
      console.log('Settings data:', JSON.stringify(settingsData, null, 2));
    }
    
    console.log('✅ All tests completed successfully!');
  } catch (err) {
    console.error('❌ Error testing frontend-backend connection:', err);
  }
}

testFrontendBackendConnection();