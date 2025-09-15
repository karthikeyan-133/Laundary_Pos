// Test script to debug the returns API issue
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// Test data that should match what the frontend is sending
const testData = {
  order_id: "test-order-id",
  items: [
    {
      product_id: "test-product-id",
      quantity: 1,
      refund_amount: 10.00
    }
  ],
  reason: "Test return",
  refund_amount: 10.00
};

async function testReturnsAPI() {
  console.log('Testing returns API with data:', testData);
  
  try {
    const response = await fetch('https://billing-pos-yjh9.vercel.app/api/returns', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', [...response.headers.entries()]);
    
    const responseBody = await response.text();
    console.log('Response body:', responseBody);
    
    if (response.ok) {
      console.log('Success! Return created.');
    } else {
      console.log('Error! Status:', response.status);
    }
  } catch (error) {
    console.error('Fetch error:', error);
  }
}

// Also test a simple GET request to see if the API is accessible
async function testReturnsAPIGet() {
  console.log('Testing GET request to returns API');
  
  try {
    const response = await fetch('https://billing-pos-yjh9.vercel.app/api/returns', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    console.log('GET Response status:', response.status);
    
    const responseBody = await response.text();
    console.log('GET Response body:', responseBody);
  } catch (error) {
    console.error('GET Fetch error:', error);
  }
}

// Run tests
testReturnsAPIGet().then(() => testReturnsAPI());