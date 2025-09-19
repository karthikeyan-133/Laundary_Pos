// Test script for the product creation fix
const supabase = require('./supabaseClient');

async function testFix() {
  console.log('Testing the product creation fix...');
  
  // Test data without the old fields
  const productData = {
    id: 'test-' + Date.now() + Math.random().toString(36).substr(2, 5),
    name: 'Fixed Test Product',
    ironRate: 5.00,
    washAndIronRate: 15.00,
    dryCleanRate: 25.00,
    category: 'Clothing',
    barcode: 'FIXED' + Date.now(),
    description: 'Test product without old fields'
    // Note: No sku or stock fields
  };
  
  console.log('Product data (without old fields):', productData);
  
  try {
    // Try to insert into database
    const { data, error } = await supabase
      .from('products')
      .insert([productData])
      .select()
      .single();
    
    if (error) {
      console.error('❌ Database insertion failed:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      return;
    }
    
    console.log('✅ Product created successfully:', data);
    
    // Clean up
    await supabase
      .from('products')
      .delete()
      .eq('id', productData.id);
    
    console.log('🧹 Test product cleaned up');
    console.log('🎉 Fix is working! The issue was including old fields that no longer exist in the database schema.');
    
  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

testFix();