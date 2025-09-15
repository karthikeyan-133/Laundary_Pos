// Test script to check if returns work with a valid order ID
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// Use a real order ID from the database
const validOrderId = "1757847993434jgxbtqhko";

// Test data that should match what the frontend is sending
const testData = {
  order_id: validOrderId,
  items: [
    {
      product_id: "audit-test-product-1757758122681",
      quantity: 1,
      refund_amount: 35.99
    }
  ],
  reason: "Test return with valid order",
  refund_amount: 35.99
};

async function testValidReturn() {
  console.log('Testing returns API with VALID order ID:', validOrderId);
  console.log('Test data:', testData);
  
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

// Run test
testValidReturn();