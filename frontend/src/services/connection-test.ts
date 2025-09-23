// Simple test to verify frontend can connect to backend
export async function testBackendConnection() {
  try {
    console.log('Testing backend connection...');
    
    // Use the same logic as in api.ts to determine the base URL
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
    const healthUrl = baseUrl ? `${baseUrl}/health` : '/health';
    
    console.log('Testing URL:', healthUrl);
    
    const response = await fetch(healthUrl);
    const data = await response.json();
    
    console.log('Backend connection test result:', data);
    
    if (data.status === 'ok' && data.database.connected) {
      console.log('✅ Backend connection successful!');
      return true;
    } else {
      console.log('❌ Backend connection failed:', data);
      return false;
    }
  } catch (error) {
    console.error('❌ Backend connection test failed:', error);
    return false;
  }
}

// Run the test if this file is imported
testBackendConnection();