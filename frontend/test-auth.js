// Test authentication endpoints
async function testAuthEndpoints() {
  try {
    console.log('Testing authentication endpoints...');
    
    // Test the auth verification endpoint through proxy
    const verifyResponse = await fetch('http://localhost:8081/api/auth/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    console.log('Auth verify response status:', verifyResponse.status);
    
    // Test signup endpoint through proxy (this will fail without proper data, but we can check if it connects)
    const signupResponse = await fetch('http://localhost:8081/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'test',
        email: 'test@example.com',
        password: 'test123'
      })
    });
    
    console.log('Signup response status:', signupResponse.status);
    
    console.log('✅ Authentication endpoint tests completed!');
  } catch (error) {
    console.error('❌ Authentication endpoint test failed:', error.message);
  }
}

testAuthEndpoints();