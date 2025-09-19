// Test script to verify the returns API is working correctly
const fetch = require('node-fetch');

async function testReturnsAPI() {
  console.log('Testing Returns API directly...');
  
  try {
    // Test the returns endpoint directly
    const response = await fetch('http://localhost:3000/api/returns', {
      headers: {
        'Content-Type': 'application/json',
      },
      // Add cache-busting headers
      cache: 'no-cache',
      pragma: 'no-cache',
      'cache-control': 'no-cache'
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', [...response.headers.entries()]);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Returns API Success! Received', data.length, 'records');
      console.log('First record:', JSON.stringify(data[0], null, 2));
    } else {
      const errorText = await response.text();
      console.error('Returns API Error:', response.status, errorText);
    }
  } catch (error) {
    console.error('Network Error:', error.message);
  }
}

testReturnsAPI();