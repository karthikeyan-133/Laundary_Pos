const supabase = require('./supabaseClient');

async function testReturns() {
  console.log('Testing returns functionality...');
  
  try {
    // Test the exact query that's failing in the returns endpoint
    console.log('Testing returns query...');
    
    const { data, error } = await supabase
      .from('returns')
      .select(`
        *,
        return_items(
          *,
          products(name, barcode, ironRate, washAndIronRate, dryCleanRate)
        ),
        orders(
          id,
          customers(name)
        )
      `)
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (error) {
      console.error('❌ Returns query failed:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      
      // Check if it's a schema cache issue
      if (error.message && error.message.includes('sku')) {
        console.log('💡 This is a schema cache issue. The database schema has been updated but the cache still expects the "sku" column.');
        console.log('💡 Solution: Restart your Supabase project or wait for the schema cache to refresh.');
      }
      
      return;
    }
    
    console.log('✅ Returns query successful');
    console.log('Data:', JSON.stringify(data, null, 2));
    
  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

testReturns();
