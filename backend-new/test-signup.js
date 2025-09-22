const axios = require('axios');

async function testSignup() {
  const baseURL = 'http://localhost:3005/api/auth';
  
  try {
    console.log('Testing signup endpoint...');
    
    // First, let's clear the admin credentials to test signup
    console.log('Note: Signup will only work if no admin exists yet.');
    console.log('If an admin already exists, you\'ll get an error.');
    
    const response = await axios.post(`${baseURL}/signup`, {
      username: 'newadmin',
      email: 'newadmin@example.com',
      password: 'newpassword123'
    });
    
    console.log('✅ Signup successful!');
    console.log('Message:', response.data.message);
    console.log('Token:', response.data.token);
    console.log('Admin:', response.data.admin);
    
  } catch (error) {
    if (error.response) {
      console.log('❌ Signup failed with status:', error.response.status);
      console.log('Error message:', error.response.data);
    } else {
      console.log('❌ Network error:', error.message);
    }
  }
}

testSignup();