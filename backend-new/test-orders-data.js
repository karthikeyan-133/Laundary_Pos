// Test script to check what orders data is being returned from the API
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testOrdersData() {
  console.log('Testing orders data structure...');
  
  try {
    // Use port 3003 as configured in the backend
    const response = await fetch('http://localhost:3000/api/orders');
    const orders = await response.json();
    
    console.log('Orders API Response status:', response.status);
    console.log('Number of orders:', orders.length);
    
    if (orders.length > 0) {
      console.log('First order structure:', orders[0]);
      
      // Check if the order has the expected structure
      const firstOrder = orders[0];
      if (firstOrder.hasOwnProperty('items') && Array.isArray(firstOrder.items)) {
        console.log('✅ Order structure is correct');
        console.log('Number of items in first order:', firstOrder.items.length);
        
        if (firstOrder.items.length > 0) {
          console.log('First item structure:', firstOrder.items[0]);
          
          // Check if items have the expected structure
          const firstItem = firstOrder.items[0];
          if (firstItem.hasOwnProperty('product') && firstItem.hasOwnProperty('quantity') && firstItem.hasOwnProperty('subtotal')) {
            console.log('✅ Item structure is correct');
            
            // Check if product has the new service-specific rate fields
            const product = firstItem.product;
            if (product.hasOwnProperty('ironRate') && 
                product.hasOwnProperty('washAndIronRate') && 
                product.hasOwnProperty('dryCleanRate')) {
              console.log('✅ Product structure is correct (new format with service-specific rates)');
            } else if (product.hasOwnProperty('price')) {
              console.log('❌ Product structure is old (still has generic price field)');
            } else {
              console.log('⚠️ Product structure is unexpected');
            }
          } else {
            console.log('❌ Item structure is incorrect');
          }
        }
      } else {
        console.log('❌ Order structure is incorrect');
      }
    } else {
      console.log('No orders found in database');
    }
  } catch (error) {
    console.error('Error fetching orders data:', error.message);
    console.log('Make sure the backend server is running on port 3003');
  }
}

// Run test
testOrdersData();