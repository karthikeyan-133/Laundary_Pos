const supabase = require('./supabaseClient');

async function updateDbSchema() {
  console.log('Updating database schema to match current requirements...');
  
  try {
    // First, let's check what columns exist
    console.log('Checking current table structure...');
    
    // Since Supabase doesn't have a direct way to alter tables via JavaScript,
    // we'll need to use the Supabase SQL editor or update the table structure
    // through the Supabase dashboard.
    
    // For now, let's just test if we can insert data with the new schema
    console.log('Testing insert with new schema...');
    
    const testProduct = {
      id: 'schema-test-' + Date.now(),
      name: 'Schema Test Product',
      ironRate: 15.00,
      washAndIronRate: 25.00,
      dryCleanRate: 35.00,
      category: 'Test',
      barcode: 'SCHEMA' + Date.now(),
      description: 'Testing new schema'
      // Note: Not including sku and stock columns
    };
    
    const { data, error } = await supabase
      .from('products')
      .insert([testProduct])
      .select()
      .single();
    
    if (error) {
      console.error('Error inserting with new schema:', error);
      
      // Try with all columns to see what works
      console.log('Trying with all columns including old ones...');
      const testProductWithOldColumns = {
        id: 'schema-test-old-' + Date.now(),
        name: 'Schema Test Product Old',
        ironRate: 15.00,
        washAndIronRate: 25.00,
        dryCleanRate: 35.00,
        category: 'Test',
        barcode: 'SCHEMAOLD' + Date.now(),
        description: 'Testing with old schema',
        sku: 'TESTSKU',
        stock: 0
      };
      
      const { data: oldData, error: oldError } = await supabase
        .from('products')
        .insert([testProductWithOldColumns])
        .select()
        .single();
      
      if (oldError) {
        console.error('Error inserting with old schema:', oldError);
      } else {
        console.log('Successfully inserted with old schema:', oldData);
        
        // Clean up
        await supabase
          .from('products')
          .delete()
          .eq('id', testProductWithOldColumns.id);
      }
    } else {
      console.log('Successfully inserted with new schema:', data);
      
      // Clean up
      await supabase
        .from('products')
        .delete()
        .eq('id', testProduct.id);
    }
    
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

updateDbSchema();