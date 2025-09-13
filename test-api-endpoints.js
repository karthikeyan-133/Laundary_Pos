// Test script to check if API endpoints are working
async function testAPIEndpoints() {
  try {
    console.log('Testing API endpoints...');
    
    // Test the root endpoint
    console.log('Testing root endpoint...');
    const rootResponse = await fetch('https://billing-pos-zeta.vercel.app/api');
    
    if (!rootResponse.ok) {
      console.error('Root endpoint failed:', rootResponse.status, rootResponse.statusText);
    } else {
      const rootData = await rootResponse.json();
      console.log('Root endpoint result:', JSON.stringify(rootData, null, 2));
    }
    
    // Test the health endpoint
    console.log('Testing health endpoint...');
    const healthResponse = await fetch('https://billing-pos-zeta.vercel.app/api/health');
    
    if (!healthResponse.ok) {
      console.error('Health check failed:', healthResponse.status, healthResponse.statusText);
      // Try without /api prefix
      console.log('Trying health endpoint without /api prefix...');
      const healthResponse2 = await fetch('https://billing-pos-zeta.vercel.app/health');
      if (!healthResponse2.ok) {
        console.error('Health check without /api prefix also failed:', healthResponse2.status, healthResponse2.statusText);
      } else {
        const healthData2 = await healthResponse2.json();
        console.log('Health check without /api prefix result:', JSON.stringify(healthData2, null, 2));
      }
    } else {
      const healthData = await healthResponse.json();
      console.log('Health check result:', JSON.stringify(healthData, null, 2));
    }
    
    // Test the settings endpoint
    console.log('Testing settings endpoint...');
    const settingsResponse = await fetch('https://billing-pos-zeta.vercel.app/api/settings');
    
    if (!settingsResponse.ok) {
      console.error('Settings fetch failed:', settingsResponse.status, settingsResponse.statusText);
      // Try without /api prefix
      console.log('Trying settings endpoint without /api prefix...');
      const settingsResponse2 = await fetch('https://billing-pos-zeta.vercel.app/settings');
      if (!settingsResponse2.ok) {
        console.error('Settings fetch without /api prefix also failed:', settingsResponse2.status, settingsResponse2.statusText);
      } else {
        const settingsData2 = await settingsResponse2.json();
        console.log('Settings fetch without /api prefix result:', JSON.stringify(settingsData2, null, 2));
      }
    } else {
      const settingsData = await settingsResponse.json();
      console.log('Settings data:', JSON.stringify(settingsData, null, 2));
    }
  } catch (err) {
    console.error('Error testing API endpoints:', err);
  }
}

testAPIEndpoints();