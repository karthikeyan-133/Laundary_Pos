// Test script to verify API configuration
const getApiBaseUrl = () => {
  // Check for environment variable first
  if (process.env.VITE_API_URL) {
    // Remove trailing slash to prevent double slashes
    return process.env.VITE_API_URL.replace(/\/$/, '');
  }
  
  // For Vercel deployments, API is at the same domain
  if (typeof window !== 'undefined') {
    // In browser environment
    if (window.location.hostname.includes('vercel.app')) {
      // For Vercel deployments, we use the same domain for both frontend and backend
      // This avoids CORS issues when frontend and backend are deployed together
      return window.location.origin;
    } else {
      // For local development - use localhost:3001 (your backend port)
      return 'http://localhost:3001';
    }
  }
  // For server-side rendering, fallback to localhost
  return 'http://localhost:3001';
};

console.log('API Base URL:', getApiBaseUrl());

// Test with different scenarios
console.log('With VITE_API_URL set to empty:');
process.env.VITE_API_URL = '';
console.log('Result:', getApiBaseUrl());

console.log('With VITE_API_URL set to specific URL:');
process.env.VITE_API_URL = 'https://laundary-pos-zb3p.vercel.app';
console.log('Result:', getApiBaseUrl());

console.log('With no VITE_API_URL (undefined):');
delete process.env.VITE_API_URL;
console.log('Result:', getApiBaseUrl());