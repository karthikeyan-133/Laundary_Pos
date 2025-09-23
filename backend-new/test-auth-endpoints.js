const axios = require('axios');

async function testAuthEndpoints() {
  const baseURL = 'http://localhost:3001/api/auth';
  
  try {
    console.log('Testing signin with new admin credentials...');
    
    const response = await axios.post(`${baseURL}/signin`, {
      username: 'newadmin',
      password: 'newpassword123'
    });
    
    console.log('✅ Signin successful!');
    console.log('Token:', response.data.token);
    console.log('Admin:', response.data.admin);
    
  } catch (error) {
    if (error.response) {
      console.log('❌ Signin failed with status:', error.response.status);
      console.log('Error message:', error.response.data);
    } else {
      console.log('❌ Network error:', error.message);
    }
  }
}

testAuthEndpoints();