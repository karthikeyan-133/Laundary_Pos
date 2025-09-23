const axios = require('axios');

// Test the authentication endpoints
async function testAuthEndpoints() {
  const baseURL = 'http://localhost:3006/api/auth';
  
  try {
    // Test signup
    console.log('Testing signup...');
    const signupResponse = await axios.post(`${baseURL}/signup`, {
      username: 'testuser',
      email: 'test@example.com',
      password: 'testpassword'
    });
    
    console.log('Signup response:', signupResponse.data);
    
    // Test signin
    console.log('\nTesting signin...');
    const signinResponse = await axios.post(`${baseURL}/signin`, {
      username: 'testuser',
      password: 'testpassword'
    });
    
    console.log('Signin response:', signinResponse.data);
    
    // Test signin with wrong password
    console.log('\nTesting signin with wrong password...');
    try {
      await axios.post(`${baseURL}/signin`, {
        username: 'testuser',
        password: 'wrongpassword'
      });
    } catch (error) {
      console.log('Signin with wrong password failed as expected:', error.response.data);
    }
    
    console.log('\nAll tests completed successfully!');
  } catch (error) {
    console.error('Test failed:', error.response ? error.response.data : error.message);
  }
}

testAuthEndpoints();