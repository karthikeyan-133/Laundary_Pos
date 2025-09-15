// Test script to create a return
async function testCreateReturn() {
  try {
    console.log('Testing POST /api/returns...');
    
    // First, let's get an order ID to use
    const getResponse = await fetch('https://billing-pos-yjh9.vercel.app/api/orders');
    const orders = await getResponse.json();
    
    if (!orders || orders.length === 0) {
      console.log('No orders found');
      return;
    }
    
    const orderId = orders[0].id;
    console.log('Using order ID:', orderId);
    
    // Get a product ID to use
    const getProductResponse = await fetch('https://billing-pos-yjh9.vercel.app/api/products');
    const products = await getProductResponse.json();
    
    if (!products || products.length === 0) {
      console.log('No products found');
      return;
    }
    
    const productId = products[0].id;
    console.log('Using product ID:', productId);
    
    // Test POST /api/returns
    const postData = {
      order_id: orderId,
      reason: 'Test return from script',
      refund_amount: 15.75,
      items: [
        {
          product_id: productId,
          quantity: 1,
          refund_amount: 15.75
        }
      ]
    };
    
    console.log('Sending POST data:', JSON.stringify(postData, null, 2));
    
    const postResponse = await fetch('https://billing-pos-yjh9.vercel.app/api/returns', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(postData)
    });
    
    console.log('POST response status:', postResponse.status);
    console.log('POST response headers:', [...postResponse.headers.entries()]);
    
    const postResult = await postResponse.text();
    console.log('POST response body:', postResult);
    
    if (postResponse.ok) {
      console.log('✅ Return created successfully!');
    } else {
      console.log('❌ Failed to create return');
    }
    
  } catch (error) {
    console.error('Error testing POST /api/returns:', error);
  }
}

testCreateReturn();