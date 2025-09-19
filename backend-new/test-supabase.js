const supabase = require('./supabaseClient');

async function testSupabase() {
  console.log('Testing Supabase connection...');
  
  try {
    // Test fetching products
    console.log('Attempting to fetch products...');
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Error fetching products:', error);
      return;
    }
    
    console.log('Successfully fetched products:', data);
    
    // Test creating a product
    console.log('Attempting to create a test product...');
    const testProduct = {
      id: 'test-' + Date.now(),
      name: 'Test Product',
      ironRate: 10.00,
      washAndIronRate: 20.00,
      dryCleanRate: 30.00,
      category: 'Test',
      barcode: 'TEST' + Date.now(),
      description: 'Test product for debugging'
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('products')
      .insert([testProduct])
      .select()
      .single();
    
    if (insertError) {
      console.error('Error creating test product:', insertError);
      return;
    }
    
    console.log('Successfully created test product:', insertData);
    
    // Clean up - delete the test product
    const { error: deleteError } = await supabase
      .from('products')
      .delete()
      .eq('id', testProduct.id);
    
    if (deleteError) {
      console.error('Error deleting test product:', deleteError);
    } else {
      console.log('Successfully deleted test product');
    }
    
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

testSupabase();