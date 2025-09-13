// Use the built-in fetch if available (Node.js 18+), otherwise use http module
async function testPutEndpoint() {
  try {
    // Try to use fetch if available
    const fetchImpl = global.fetch || require('node-fetch');
    
    const response = await fetchImpl('http://localhost:3001/api/orders/test-order-id', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paymentStatus: 'paid',
        paymentMethod: 'cash'
      }),
    });

    console.log('Response status:', response.status);

    if (response.ok) {
      const data = await response.json();
      console.log('Success:', data);
    } else {
      const errorText = await response.text();
      console.log('Error:', errorText);
    }
  } catch (error) {
    console.error('Request failed:', error.message);
  }
}

testPutEndpoint();