const https = require('https');

// Test CORS headers for the backend API
const options = {
  hostname: 'pos-laundry-backend.vercel.app',
  port: 443,
  path: '/health',
  method: 'GET',
  headers: {
    'Origin': 'https://pos-laundry-tau.vercel.app',
    'Access-Control-Request-Method': 'GET'
  }
};

console.log('Testing CORS headers for backend API...');

const req = https.request(options, (res) => {
  console.log('Status Code:', res.statusCode);
  console.log('Headers:');
  for (const header in res.headers) {
    console.log(`  ${header}: ${res.headers[header]}`);
  }
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response Body:', data);
  });
});

req.on('error', (e) => {
  console.error('Problem with request:', e.message);
});

req.end();