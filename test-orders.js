// Test script to check what orders exist in the database
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testOrdersAPI() {
  console.log('Testing orders API to see what orders exist');
  
  try {
    const response = await fetch('https://billing-pos-yjh9.vercel.app/api/orders', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    console.log('Orders API Response status:', response.status);
    
    const responseBody = await response.text();
    console.log('Orders API Response body:', responseBody);
    
    if (response.ok) {
      const orders = JSON.parse(responseBody);
      console.log('Number of orders:', orders.length);
      console.log('Order IDs:', orders.map(order => order.id));
    }
  } catch (error) {
    console.error('Orders API Fetch error:', error);
  }
}

// Run test
testOrdersAPI();