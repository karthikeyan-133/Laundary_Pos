const supabase = require('./supabaseClient');

async function testReturnsQuery() {
  console.log('Testing returns query...');
  
  try {
    // Test the exact query that was failing
    let query = supabase
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
      .order('created_at', { ascending: false });
    
    const { data, error } = await query.limit(5);
    
    if (error) {
      console.error('Error in returns query:', error);
      return;
    }
    
    console.log('Returns query successful:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

testReturnsQuery();