const { supabase } = require('./supabaseClient');
const bcrypt = require('bcryptjs');
const axios = require('axios');

async function testSignin() {
  try {
    console.log('Testing signin endpoint...');
    
    const response = await axios.post('http://localhost:3001/api/auth/signin', {
      username: 'testadmin',
      password: 'testpassword123'
    });
    
    console.log('✅ Signin successful!');
    console.log('Response:', response.data);
  } catch (error) {
    if (error.response) {
      console.log('❌ Signin failed with status:', error.response.status);
      console.log('Error data:', error.response.data);
    } else {
      console.log('❌ Network error:', error.message);
    }
  }
}

testSignin();