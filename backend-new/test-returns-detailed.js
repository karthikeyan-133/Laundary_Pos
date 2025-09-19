// Detailed test script to check returns functionality with different query patterns
const supabase = require('./supabaseClient');

async function testReturnsDetailed() {
  console.log('Testing returns functionality with detailed queries...');
  
  // Test 1: Simple returns query
  console.log('\n1. Testing simple returns query...');
  try {
    const { data, error } = await supabase
      .from('returns')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Simple returns query failed:', error.message);
    } else {
      console.log('✅ Simple returns query successful');
    }
  } catch (err) {
    console.error('❌ Unexpected error in simple returns query:', err.message);
  }
  
  // Test 2: Returns with return_items
  console.log('\n2. Testing returns with return_items...');
  try {
    const { data, error } = await supabase
      .from('returns')
      .select(`
        *,
        return_items(*)
      `)
      .limit(1);
    
    if (error) {
      console.error('❌ Returns with return_items query failed:', error.message);
    } else {
      console.log('✅ Returns with return_items query successful');
    }
  } catch (err) {
    console.error('❌ Unexpected error in returns with return_items query:', err.message);
  }
  
  // Test 3: Returns with return_items and products (the problematic query)
  console.log('\n3. Testing returns with return_items and products...');
  try {
    const { data, error } = await supabase
      .from('returns')
      .select(`
        *,
        return_items(
          *,
          products(name, barcode)
        )
      `)
      .limit(1);
    
    if (error) {
      console.error('❌ Returns with return_items and products query failed:', error.message);
      console.error('Error code:', error.code);
      console.error('Full error:', JSON.stringify(error, null, 2));
    } else {
      console.log('✅ Returns with return_items and products query successful');
    }
  } catch (err) {
    console.error('❌ Unexpected error in returns with return_items and products query:', err.message);
  }
  
  // Test 4: Returns with return_items, products, and orders
  console.log('\n4. Testing returns with return_items, products, and orders...');
  try {
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
      .limit(5) // Get more records to test with more data
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Full returns query failed:', error.message);
      console.error('Error code:', error.code);
      console.error('Full error:', JSON.stringify(error, null, 2));
    } else {
      console.log('✅ Full returns query successful');
      console.log('Records found:', data.length);
    }
  } catch (err) {
    console.error('❌ Unexpected error in full returns query:', err.message);
  }
  
  // Test 5: Simulate the exact query from the returns endpoint with date filtering
  console.log('\n5. Testing returns with date filtering (simulating frontend request)...');
  try {
    // Get today's date
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
    
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
    
    // Apply date filtering (simulate what the frontend might send)
    const fromDate = new Date(todayString);
    fromDate.setHours(0, 0, 0, 0);
    query = query.gte('created_at', fromDate.toISOString());
    
    const toDate = new Date(todayString);
    toDate.setHours(23, 59, 59, 999);
    query = query.lte('created_at', toDate.toISOString());
    
    const { data, error } = await query;
    
    if (error) {
      console.error('❌ Returns query with date filtering failed:', error.message);
      console.error('Error code:', error.code);
      console.error('Full error:', JSON.stringify(error, null, 2));
      
      // Check for specific schema issues
      if (error.message && (error.message.includes('sku') || error.message.includes('stock'))) {
        console.log('💡 Schema cache issue detected!');
        console.log('💡 This is likely because the Supabase schema cache is out of sync with the actual database schema.');
        console.log('💡 Solution: Restart your Supabase project or wait for the schema cache to refresh.');
      }
    } else {
      console.log('✅ Returns query with date filtering successful');
      console.log('Records found:', data.length);
    }
  } catch (err) {
    console.error('❌ Unexpected error in returns query with date filtering:', err.message);
  }
}

testReturnsDetailed();