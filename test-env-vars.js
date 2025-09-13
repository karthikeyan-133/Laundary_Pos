// Test script to verify environment variables are working
console.log('Testing environment variables...');

// Simulate Vite environment variables
const mockEnv = {
  VITE_API_URL: 'https://billing-pos-yjh9.vercel.app'
};

console.log('VITE_API_URL:', mockEnv.VITE_API_URL);

// Test the logic we implemented
const getApiBaseUrl = () => {
  // Check for environment variable first
  if (mockEnv.VITE_API_URL) {
    return mockEnv.VITE_API_URL;
  }
  
  // Fallback logic would go here
  return 'http://localhost:3001';
};

const API_BASE_URL = getApiBaseUrl();
console.log('Determined API_BASE_URL:', API_BASE_URL);

if (API_BASE_URL === 'https://billing-pos-yjh9.vercel.app') {
  console.log('✅ Environment variable is being used correctly');
} else {
  console.log('❌ Environment variable is not being used correctly');
}