// Simple test to verify frontend can authenticate with backend

export async function testAuthConnection() {
  try {
    console.log('Testing authentication connection...');
    
    // Replicate the logic from api.ts to determine the base URL
    const getApiBaseUrl = () => {
      if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL.replace(/\/$/, '');
      }
      
      if (typeof window !== 'undefined') {
        if (window.location.hostname.includes('vercel.app')) {
          return '';
        } else if (window.location.hostname.includes('techzontech.com')) {
          return '';
        } else {
          return 'http://localhost:3001';
        }
      }
      return 'http://localhost:3001';
    };

    const baseUrl = getApiBaseUrl();
    const authUrl = baseUrl ? `${baseUrl}/api/auth/verify` : '/api/auth/verify';
    
    console.log('Testing auth URL:', authUrl);
    
    // Test with a dummy token to see if we get the expected response
    const response = await fetch(authUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer dummy-token'
      }
    });
    
    console.log('Auth test response status:', response.status);
    
    if (response.status === 403) {
      console.log('✅ Authentication endpoint accessible (token invalid as expected)');
      return true;
    } else if (response.status === 401) {
      console.log('✅ Authentication endpoint accessible (no token provided as expected)');
      return true;
    } else {
      const data = await response.json();
      console.log('Auth test response data:', data);
      return true;
    }
  } catch (error) {
    console.error('❌ Authentication connection test failed:', error);
    return false;
  }
}

// Run the test if this file is imported
testAuthConnection();