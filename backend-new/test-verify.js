const axios = require('axios');

async function testVerify() {
  try {
    console.log('Testing verify endpoint...');
    
    // First, signin to get a token
    const signinResponse = await axios.post('http://localhost:3001/api/auth/signin', {
      username: 'testadmin',
      password: 'testpassword123'
    });
    
    const token = signinResponse.data.token;
    console.log('Got token:', token.substring(0, 20) + '...');
    
    // Now test the verify endpoint
    const response = await axios.post('http://localhost:3001/api/auth/verify', {}, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Verify successful!');
    console.log('Response:', response.data);
  } catch (error) {
    if (error.response) {
      console.log('❌ Verify failed with status:', error.response.status);
      console.log('Error data:', error.response.data);
    } else {
      console.log('❌ Network error:', error.message);
    }
  }
}

testVerify();