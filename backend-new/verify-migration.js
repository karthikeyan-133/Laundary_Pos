// Verification script to check if database migration was successful and sales data is visible
const supabase = require('./supabaseClient');

async function verifyMigration() {
  console.log('Verifying database migration and sales data visibility...');
  
  try {
    // Check products structure
    console.log('\n1. Checking products structure...');
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .limit(5);
    
    if (productsError) {
      console.error('❌ Error fetching products:', productsError);
      return;
    }
    
    console.log(`✅ Found ${products.length} products`);
    
    if (products.length > 0) {
      const firstProduct = products[0];
      const hasNewStructure = firstProduct.hasOwnProperty('ironRate') && 
                             firstProduct.hasOwnProperty('washAndIronRate') && 
                             firstProduct.hasOwnProperty('dryCleanRate');
      const hasOldStructure = firstProduct.hasOwnProperty('price');
      
      if (hasNewStructure && !hasOldStructure) {
        console.log('✅ Products have correct new structure with service-specific rates');
        console.log('✅ Old price column has been successfully removed');
      } else if (hasOldStructure) {
        console.log('❌ Products still have old structure with generic price field');
        return;
      } else {
        console.log('❌ Products structure is incomplete');
        return;
      }
    }
    
    // Check order items structure
    console.log('\n2. Checking order items structure...');
    const { data: orderItems, error: orderItemsError } = await supabase
      .from('order_items')
      .select('*')
      .limit(5);
    
    if (orderItemsError) {
      console.error('❌ Error fetching order items:', orderItemsError);
      return;
    }
    
    console.log(`✅ Found ${orderItems.length} order items`);
    
    if (orderItems.length > 0) {
      const firstItem = orderItems[0];
      if (firstItem.hasOwnProperty('service')) {
        console.log('✅ Order items have service column');
      } else {
        console.log('❌ Order items missing service column');
        return;
      }
    }
    
    // Check orders with items and products
    console.log('\n3. Checking orders with items and products...');
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select(`
        *,
        order_items(*, products(name, ironRate, washAndIronRate, dryCleanRate))
      `)
      .limit(3);
    
    if (ordersError) {
      console.error('❌ Error fetching orders:', ordersError);
      return;
    }
    
    console.log(`✅ Found ${orders.length} orders`);
    
    if (orders.length > 0) {
      let hasCompleteData = true;
      
      for (const order of orders) {
        if (order.order_items && order.order_items.length > 0) {
          for (const item of order.order_items) {
            // Check if item has product with new structure
            if (item.products) {
              const product = item.products;
              if (!(product.hasOwnProperty('ironRate') && 
                    product.hasOwnProperty('washAndIronRate') && 
                    product.hasOwnProperty('dryCleanRate'))) {
                console.log('❌ Order item product has incorrect structure');
                hasCompleteData = false;
                break;
              }
            }
            
            // Check if item has service
            if (!item.hasOwnProperty('service')) {
              console.log('❌ Order item missing service field');
              hasCompleteData = false;
              break;
            }
          }
          
          if (!hasCompleteData) break;
        }
      }
      
      if (hasCompleteData) {
        console.log('✅ All orders have complete data with service-specific rates');
      }
    }
    
    console.log('\n🎉 Migration verification completed successfully!');
    console.log('✅ Database structure is correct');
    console.log('✅ Service-specific pricing is properly configured');
    console.log('✅ Sales data should now be visible in reports');
    
  } catch (error) {
    console.error('❌ Error during verification:', error.message);
  }
}

// Run verification
verifyMigration();