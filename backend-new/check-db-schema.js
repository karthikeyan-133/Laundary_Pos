const supabase = require('./supabaseClient');

async function checkDatabaseSchema() {
  console.log('Checking database schema...');
  
  try {
    // Check the structure of the products table
    console.log('\n=== Products Table Structure ===');
    const { data: productsData, error: productsError } = await supabase
      .from('products')
      .select('*')
      .limit(1);
    
    if (productsError) {
      console.error('Error fetching products:', productsError);
    } else {
      console.log('Sample product structure:', JSON.stringify(productsData[0], null, 2));
    }
    
    // Check the structure of the returns table
    console.log('\n=== Returns Table Structure ===');
    const { data: returnsData, error: returnsError } = await supabase
      .from('returns')
      .select('*')
      .limit(1);
    
    if (returnsError) {
      console.error('Error fetching returns:', returnsError);
    } else {
      console.log('Sample return structure:', JSON.stringify(returnsData[0], null, 2));
    }
    
    // Check the structure of the return_items table
    console.log('\n=== Return Items Table Structure ===');
    const { data: returnItemsData, error: returnItemsError } = await supabase
      .from('return_items')
      .select('*')
      .limit(1);
    
    if (returnItemsError) {
      console.error('Error fetching return items:', returnItemsError);
    } else {
      console.log('Sample return item structure:', JSON.stringify(returnItemsData[0], null, 2));
    }
    
    // Test the specific query that was failing
    console.log('\n=== Testing Specific Query ===');
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
    
    const { data, error } = await query.limit(1);
    
    if (error) {
      console.error('Error in specific query:', error);
    } else {
      console.log('Specific query successful');
    }
    
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

checkDatabaseSchema();