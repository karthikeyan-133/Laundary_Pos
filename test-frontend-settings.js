// Simple test to verify frontend can fetch settings
async function testFrontendSettings() {
  try {
    console.log('Testing frontend settings API call...');
    
    const response = await fetch('http://localhost:3001/api/settings');
    
    if (!response.ok) {
      console.error('Failed to fetch settings:', response.status, response.statusText);
      return;
    }
    
    const settings = await response.json();
    console.log('Settings from API:', JSON.stringify(settings, null, 2));
    
    console.log('Tax rate:', settings.tax_rate, 'Type:', typeof settings.tax_rate);
    console.log('Currency:', settings.currency);
    console.log('Business name:', settings.business_name);
  } catch (err) {
    console.error('Error:', err);
  }
}

testFrontendSettings();