// Test the connection to the backend API
async function testConnection() {
  try {
    console.log('Testing connection to backend API...');
    
    // Test direct connection to backend
    const directResponse = await fetch('http://localhost:3001/api/test-server');
    const directData = await directResponse.json();
    console.log('Direct connection test:', directData);
    
    // Test proxied connection through frontend dev server
    const proxyResponse = await fetch('http://localhost:8080/api/test-server');
    const proxyData = await proxyResponse.json();
    console.log('Proxy connection test:', proxyData);
    
    console.log('✅ All connection tests passed!');
    console.log('You can now access the POS system at http://localhost:8080');
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
  }
}

testConnection();