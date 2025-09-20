// Simple test script to verify CORS connection
async function testCORSConnection() {
  const urls = [
    'https://pos-laundry-backend.vercel.app/api/test',
    'https://pos-laundry-backend.vercel.app/api/test-cors',
    'https://pos-laundry-backend.vercel.app/api/cors-check',
    'https://pos-laundry-backend.vercel.app/health'
  ];

  console.log('Testing CORS connections...\n');

  for (const url of urls) {
    try {
      console.log(`Testing: ${url}`);
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      console.log(`Status: ${response.status} ${response.statusText}`);
      
      // Check CORS headers
      const corsHeader = response.headers.get('access-control-allow-origin');
      console.log(`CORS Header: ${corsHeader || 'NOT FOUND'}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`Response: ${JSON.stringify(data, null, 2)}\n`);
      } else {
        console.log(`Error Response: ${await response.text()}\n`);
      }
    } catch (error) {
      console.log(`Error: ${error.message}\n`);
    }
  }
}

// Run the test
testCORSConnection();