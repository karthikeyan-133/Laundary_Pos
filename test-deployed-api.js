// Test script to check if the deployed API is working
async function testDeployedAPI() {
  try {
    console.log('Testing deployed API...');
    
    // Test the health endpoint
    const healthResponse = await fetch('https://billing-pos-zeta.vercel.app/api/health');
    
    if (!healthResponse.ok) {
      console.error('Health check failed:', healthResponse.status, healthResponse.statusText);
      return;
    }
    
    const healthData = await healthResponse.json();
    console.log('Health check result:', JSON.stringify(healthData, null, 2));
    
    // Test the settings endpoint
    const settingsResponse = await fetch('https://billing-pos-zeta.vercel.app/api/settings');
    
    if (!settingsResponse.ok) {
      console.error('Settings fetch failed:', settingsResponse.status, settingsResponse.statusText);
      return;
    }
    
    const settingsData = await settingsResponse.json();
    console.log('Settings data:', JSON.stringify(settingsData, null, 2));
    
    console.log('Tax rate:', settingsData.tax_rate, 'Type:', typeof settingsData.tax_rate);
  } catch (err) {
    console.error('Error testing deployed API:', err);
  }
}

testDeployedAPI();