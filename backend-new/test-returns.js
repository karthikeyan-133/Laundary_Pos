const { supabase } = require('./supabaseDb');

async function testReturns() {
  console.log('Testing returns functionality...');
  
  try {
    // First, let's get an order to test with
    console.log('Fetching orders...');
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('id')
      .limit(1);
    
    if (ordersError) {
      console.log('Error fetching orders:', ordersError.message);
      return;
    }
    
    if (!orders || orders.length === 0) {
      console.log('No orders found to test with');
      return;
    }
    
    const orderId = orders[0].id;
    console.log('Using order ID:', orderId);
    
    // Test creating a return
    console.log('Creating test return...');
    const returnData = {
      id: 'test-return-' + Date.now(),
      order_id: orderId,
      reason: 'Test return',
      refund_amount: 10.00,
      created_at: new Date().toISOString()
    };
    
    const { data: returnResult, error: returnError } = await supabase
      .from('returns')
      .insert([returnData])
      .select()
      .single();
    
    if (returnError) {
      console.log('Error creating return:', returnError.message);
      return;
    }
    
    console.log('Return created successfully:', returnResult);
    
    // Test creating return items
    console.log('Creating test return items...');
    
    // First, get a product to test with
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id')
      .limit(1);
    
    if (productsError) {
      console.log('Error fetching products:', productsError.message);
      return;
    }
    
    if (!products || products.length === 0) {
      console.log('No products found to test with');
      return;
    }
    
    const productId = products[0].id;
    console.log('Using product ID:', productId);
    
    const returnItemData = {
      id: 'test-return-item-' + Date.now(),
      return_id: returnResult.id,
      product_id: productId,
      quantity: 1,
      refund_amount: 10.00
    };
    
    const { data: returnItemResult, error: returnItemError } = await supabase
      .from('return_items')
      .insert([returnItemData])
      .select()
      .single();
    
    if (returnItemError) {
      console.log('Error creating return item:', returnItemError.message);
      return;
    }
    
    console.log('Return item created successfully:', returnItemResult);
    
    // Test fetching returns with related data
    console.log('Fetching returns with related data...');
    const { data: returnsWithItems, error: fetchError } = await supabase
      .from('returns')
      .select(`
        *,
        return_items(
          *,
          products(name, sku)
        ),
        orders(
          id,
          customers(name)
        )
      `)
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (fetchError) {
      console.log('Error fetching returns with related data:', fetchError.message);
      return;
    }
    
    console.log('Returns with related data:', returnsWithItems);
    
    console.log('✅ All tests passed!');
    
  } catch (err) {
    console.error('Error testing returns:', err);
  }
}

// Run the function
testReturns();