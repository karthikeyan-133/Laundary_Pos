// Test CORS requests
const http = require('http');

// Test function to make a CORS request
function testCORSRequest(endpoint, callback) {
  const options = {
    hostname: 'localhost',
    port: 3005,
    path: endpoint,
    method: 'GET',
    headers: {
      'Origin': 'https://pos-laundry-tau.vercel.app',
      'Content-Type': 'application/json'
    }
  };

  const req = http.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log(`Endpoint: ${endpoint}`);
      console.log(`Status Code: ${res.statusCode}`);
      console.log(`CORS Headers:`, {
        'access-control-allow-origin': res.headers['access-control-allow-origin'],
        'access-control-allow-methods': res.headers['access-control-allow-methods'],
        'access-control-allow-headers': res.headers['access-control-allow-headers']
      });
      console.log(`Response: ${data.substring(0, 100)}...\n`);
      
      if (callback) callback();
    });
  });
  
  req.on('error', (error) => {
    console.error(`Error testing ${endpoint}:`, error.message);
    if (callback) callback();
  });
  
  req.end();
}

// Test all endpoints
const endpoints = [
  '/api/test',
  '/api/settings',
  '/api/products',
  '/api/customers',
  '/api/orders',
  '/api/returns'
];

function testNext() {
  if (endpoints.length === 0) {
    console.log('All tests completed!');
    process.exit(0);
  }
  
  const endpoint = endpoints.shift();
  testCORSRequest(endpoint, testNext);
}

console.log('Testing CORS configuration...\n');
testNext();