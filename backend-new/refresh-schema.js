const supabase = require('./supabaseClient');

async function refreshSchemaCache() {
  console.log('Refreshing Supabase schema cache...');
  
  try {
    // Test a simple query to ensure connection
    const { data, error } = await supabase
      .from('products')
      .select('id, name, ironRate, washAndIronRate, dryCleanRate')
      .limit(1);
    
    if (error) {
      console.error('Error testing connection:', error);
      return;
    }
    
    console.log('Connection test successful. Schema appears to be correct.');
    console.log('Sample product:', JSON.stringify(data[0], null, 2));
    
    // Test the returns query specifically
    console.log('\nTesting returns query...');
    const returnsQuery = supabase
      .from('returns')
      .select(`
        id,
        order_id,
        reason,
        refund_amount,
        created_at,
        return_items(
          id,
          product_id,
          quantity,
          refund_amount,
          products(name, barcode, ironRate, washAndIronRate, dryCleanRate)
        )
      `)
      .limit(1);
    
    const { data: returnsData, error: returnsError } = await returnsQuery;
    
    if (returnsError) {
      console.error('Error in returns query:', returnsError);
    } else {
      console.log('Returns query successful. No sku column errors detected.');
      console.log('Sample return:', JSON.stringify(returnsData[0], null, 2));
    }
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

refreshSchemaCache();