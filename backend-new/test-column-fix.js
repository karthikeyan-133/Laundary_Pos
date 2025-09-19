const supabase = require('./supabaseClient');

async function testColumnFix() {
  try {
    console.log('Testing column names in products table...');
    
    // Get column information
    const { data: columns, error: columnError } = await supabase
      .from('products')
      .select('*')
      .limit(1);
    
    if (columnError) {
      console.error('Error fetching columns:', columnError);
      return;
    }
    
    if (columns && columns.length > 0) {
      console.log('Sample product data:', columns[0]);
      
      // Check if the correct column names exist
      const product = columns[0];
      console.log('Checking for correct column names:');
      console.log('- ironRate:', typeof product.ironRate !== 'undefined' ? '✓ Present' : '✗ Missing');
      console.log('- washAndIronRate:', typeof product.washAndIronRate !== 'undefined' ? '✓ Present' : '✗ Missing');
      console.log('- dryCleanRate:', typeof product.dryCleanRate !== 'undefined' ? '✓ Present' : '✗ Missing');
      
      // Try to insert a new product
      console.log('\nTesting product creation...');
      const testProduct = {
        id: 'test-' + Date.now(),
        name: 'Test Product',
        ironRate: 5.00,
        washAndIronRate: 10.00,
        dryCleanRate: 15.00,
        category: 'Test',
        barcode: 'TEST123',
        description: 'Test product for column verification'
      };
      
      const { data: insertedProduct, error: insertError } = await supabase
        .from('products')
        .insert([testProduct])
        .select()
        .single();
      
      if (insertError) {
        console.error('Error inserting product:', insertError);
      } else {
        console.log('Product inserted successfully:', insertedProduct);
        
        // Clean up - delete the test product
        const { error: deleteError } = await supabase
          .from('products')
          .delete()
          .eq('id', testProduct.id);
          
        if (deleteError) {
          console.error('Error deleting test product:', deleteError);
        } else {
          console.log('Test product cleaned up successfully');
        }
      }
    } else {
      console.log('No products found in database');
    }
    
    console.log('\nColumn fix test completed');
  } catch (error) {
    console.error('Test failed with error:', error);
  }
}

testColumnFix();