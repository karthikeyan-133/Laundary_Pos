// Test script to simulate the exact data structure sent by the frontend
async function testFrontendReturn() {
  try {
    console.log('Testing frontend return data structure...');
    
    // Get an order to use for testing
    const getOrdersResponse = await fetch('https://billing-pos-yjh9.vercel.app/api/orders');
    const orders = await getOrdersResponse.json();
    
    if (!orders || orders.length === 0) {
      console.log('No orders found');
      return;
    }
    
    const order = orders[0];
    console.log('Using order:', order.id);
    
    // Get a product to use for testing
    const getProductsResponse = await fetch('https://billing-pos-yjh9.vercel.app/api/products');
    const products = await getProductsResponse.json();
    
    if (!products || products.length === 0) {
      console.log('No products found');
      return;
    }
    
    const product = products[0];
    console.log('Using product:', product.id);
    
    // Simulate the exact data structure that the frontend sends
    const returnData = {
      order_id: order.id,
      items: [
        {
          product_id: product.id,
          quantity: 1,
          refund_amount: product.price
        }
      ],
      reason: 'Test return from frontend simulation',
      refund_amount: product.price
    };
    
    console.log('Sending return data:', JSON.stringify(returnData, null, 2));
    
    // Send the request
    const response = await fetch('https://billing-pos-yjh9.vercel.app/api/returns', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(returnData)
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', [...response.headers.entries()]);
    
    const responseBody = await response.text();
    console.log('Response body:', responseBody);
    
    if (response.ok) {
      console.log('✅ Return created successfully!');
      const result = JSON.parse(responseBody);
      console.log('Return result:', result);
    } else {
      console.log('❌ Failed to create return');
    }
    
  } catch (error) {
    console.error('Error testing frontend return:', error);
  }
}

testFrontendReturn();