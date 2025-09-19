// Test script to check the current database structure
const supabase = require('./supabaseClient');

async function testDatabaseStructure() {
  console.log('Testing current database structure...');
  
  try {
    // Test products table structure
    console.log('\n1. Testing products table structure...');
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .limit(3);
    
    if (productsError) {
      console.error('Error fetching products:', productsError);
      return;
    }
    
    console.log('Number of products found:', products.length);
    if (products.length > 0) {
      const firstProduct = products[0];
      console.log('First product structure:', {
        id: firstProduct.id,
        name: firstProduct.name,
        hasPrice: firstProduct.hasOwnProperty('price'),
        hasIronRate: firstProduct.hasOwnProperty('ironRate'),
        hasWashAndIronRate: firstProduct.hasOwnProperty('washAndIronRate'),
        hasDryCleanRate: firstProduct.hasOwnProperty('dryCleanRate'),
        ironRate: firstProduct.ironRate,
        washAndIronRate: firstProduct.washAndIronRate,
        dryCleanRate: firstProduct.dryCleanRate
      });
      
      // Check if product has the new service-specific rate fields
      if (firstProduct.hasOwnProperty('ironRate') && 
          firstProduct.hasOwnProperty('washAndIronRate') && 
          firstProduct.hasOwnProperty('dryCleanRate')) {
        console.log('✅ Products table has correct structure (new format with service-specific rates)');
        
        // Check if old price column has been removed
        if (!firstProduct.hasOwnProperty('price')) {
          console.log('✅ Old price column has been successfully removed');
        } else {
          console.log('❌ Old price column still exists - needs to be removed');
        }
      } else if (firstProduct.hasOwnProperty('price')) {
        console.log('❌ Products table has old structure (still has generic price field)');
      } else {
        console.log('⚠️ Products table structure is unexpected');
      }
    }
    
    // Test order_items table structure
    console.log('\n2. Testing order_items table structure...');
    const { data: orderItems, error: orderItemsError } = await supabase
      .from('order_items')
      .select('*')
      .limit(3);
    
    if (orderItemsError) {
      console.error('Error fetching order items:', orderItemsError);
      return;
    }
    
    console.log('Number of order items found:', orderItems.length);
    if (orderItems.length > 0) {
      const firstItem = orderItems[0];
      console.log('First order item structure:', {
        id: firstItem.id,
        order_id: firstItem.order_id,
        product_id: firstItem.product_id,
        hasService: firstItem.hasOwnProperty('service'),
        service: firstItem.service
      });
      
      // Check if order item has the service field
      if (firstItem.hasOwnProperty('service')) {
        console.log('✅ Order items table has correct structure (has service field)');
      } else {
        console.log('❌ Order items table missing service field');
      }
    }
    
    // Test orders table structure
    console.log('\n3. Testing orders table structure...');
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .limit(3);
    
    if (ordersError) {
      console.error('Error fetching orders:', ordersError);
      return;
    }
    
    console.log('Number of orders found:', orders.length);
    if (orders.length > 0) {
      const firstOrder = orders[0];
      console.log('First order structure:', {
        id: firstOrder.id,
        customer_id: firstOrder.customer_id,
        subtotal: firstOrder.subtotal,
        total: firstOrder.total,
        hasCreatedAt: firstOrder.hasOwnProperty('created_at'),
        hasUpdatedAt: firstOrder.hasOwnProperty('updated_at')
      });
    }
    
    console.log('\n✅ Database structure test completed!');
    
  } catch (error) {
    console.error('Error testing database structure:', error.message);
  }
}

// Run test
testDatabaseStructure();