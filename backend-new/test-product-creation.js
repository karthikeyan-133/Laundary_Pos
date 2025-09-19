const supabase = require('./supabaseClient');

async function testProductCreation() {
  console.log('Testing product creation with exact data that would come from frontend...');
  
  try {
    // This is the exact data structure that comes from the frontend
    const productData = {
      name: "Test Shirt",
      ironRate: 5.00,
      washAndIronRate: 15.00,
      dryCleanRate: 25.00,
      category: "Clothing",
      barcode: "TEST123456",
      description: "Test shirt for debugging"
    };
    
    console.log('Product data to insert:', productData);
    
    // Try to insert exactly like the server does
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const fullProductData = {
      id,
      ...productData
    };
    
    console.log('Full product data with ID:', fullProductData);
    
    const { data, error } = await supabase
      .from('products')
      .insert([fullProductData])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating product:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
    } else {
      console.log('Successfully created product:', data);
      
      // Clean up
      const { error: deleteError } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      
      if (deleteError) {
        console.error('Error deleting test product:', deleteError);
      } else {
        console.log('Successfully cleaned up test product');
      }
    }
    
  } catch (err) {
    console.error('Unexpected error:', err);
    console.error('Error stack:', err.stack);
  }
}

testProductCreation();