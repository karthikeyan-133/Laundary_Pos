// Script to simulate the exact product creation that's failing
const supabase = require('./supabaseClient');

async function simulateProductCreation() {
  console.log('Simulating product creation that causes the 500 error...');
  
  // This is the exact data structure that would come from the frontend
  const productData = {
    name: "Test Product",
    ironRate: "5.00",
    washAndIronRate: "15.00",
    dryCleanRate: "25.00",
    category: "Clothing",
    barcode: "TEST123",
    description: "Test product"
  };
  
  console.log('Product data from frontend:', productData);
  
  try {
    // Simulate what the backend does
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    
    // Convert string rates to numbers (what the backend should do)
    const processedData = {
      id,
      name: productData.name,
      ironRate: parseFloat(productData.ironRate) || 0,
      washAndIronRate: parseFloat(productData.washAndIronRate) || 0,
      dryCleanRate: parseFloat(productData.dryCleanRate) || 0,
      category: productData.category,
      barcode: productData.barcode,
      description: productData.description,
      // Include compatibility fields
      sku: null,
      stock: 0
    };
    
    console.log('Processed data for database:', processedData);
    
    // Try to insert into database
    const { data, error } = await supabase
      .from('products')
      .insert([processedData])
      .select()
      .single();
    
    if (error) {
      console.error('❌ Database insertion failed:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      return;
    }
    
    console.log('✅ Product created successfully:', data);
    
    // Clean up
    await supabase
      .from('products')
      .delete()
      .eq('id', id);
    
    console.log('🧹 Test product cleaned up');
    
  } catch (err) {
    console.error('❌ Unexpected error:', err);
    console.error('Error stack:', err.stack);
  }
}

simulateProductCreation();