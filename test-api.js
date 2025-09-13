const http = require('http');

function testApi() {
  const url = 'http://localhost:3001/api/orders';
  
  http.get(url, (response) => {
    let data = '';
    
    response.on('data', (chunk) => {
      data += chunk;
    });
    
    response.on('end', () => {
      try {
        const jsonData = JSON.parse(data);
        console.log('API Response (first order):');
        console.log(JSON.stringify(jsonData[0], null, 2));
      } catch (error) {
        console.error('Error parsing JSON:', error);
        console.log('Raw data:', data);
      }
    });
  }).on('error', (error) => {
    console.error('Error fetching data:', error);
  });
}

testApi();