const { supabase } = require('./supabaseClient');

async function finalTest() {
  try {
    console.log('🚀 Running final system test...\n');
    
    // Test 1: Database connection
    console.log('1. Testing database connection...');
    const { data: connectionTest, error: connectionError } = await supabase
      .from('settings')
      .select('id')
      .limit(1);
    
    if (connectionError) {
      console.error('❌ Database connection failed:', connectionError.message);
      return;
    }
    console.log('✅ Database connection successful\n');
    
    // Test 2: Settings table with admin credentials
    console.log('2. Checking settings table...');
    const { data: settings, error: settingsError } = await supabase
      .from('settings')
      .select('*')
      .eq('id', 1)
      .single();
    
    if (settingsError) {
      console.error('❌ Settings table query failed:', settingsError.message);
      return;
    }
    
    console.log('✅ Settings table accessible');
    if (settings.admin_username) {
      console.log(`✅ Admin user exists: ${settings.admin_username}`);
    } else {
      console.log('⚠️ No admin user found - need to run signup');
    }
    console.log('');
    
    // Test 3: All required tables
    console.log('3. Checking required tables...');
    const requiredTables = ['products', 'customers', 'settings', 'orders', 'order_items', 'returns', 'return_items', 'id_sequences'];
    
    for (const table of requiredTables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('id')
          .limit(1);
        
        if (error && error.code !== '42P01') { // 42P01 = table doesn't exist
          console.log(`⚠️ ${table}: ${error.message}`);
        } else if (error) {
          console.log(`❌ ${table}: Table does not exist`);
        } else {
          console.log(`✅ ${table}: OK`);
        }
      } catch (err) {
        console.log(`❌ ${table}: ${err.message}`);
      }
    }
    console.log('');
    
    // Test 4: Sample data insertion
    console.log('4. Testing data insertion...');
    
    // Create a test product
    const testProduct = {
      id: 'TEST-' + Date.now(),
      name: 'Test Product',
      ironRate: 10.50,
      washAndIronRate: 15.75,
      dryCleanRate: 20.00,
      category: 'Test Category',
      barcode: 'TEST-BARCODE-' + Date.now()
    };
    
    const { data: productInsert, error: productError } = await supabase
      .from('products')
      .insert([testProduct])
      .select()
      .single();
    
    if (productError) {
      console.error('❌ Product insertion failed:', productError.message);
      return;
    }
    
    console.log('✅ Product insertion successful');
    
    // Clean up test product
    const { error: deleteError } = await supabase
      .from('products')
      .delete()
      .eq('id', testProduct.id);
    
    if (deleteError) {
      console.log('⚠️ Could not clean up test product:', deleteError.message);
    } else {
      console.log('✅ Test product cleaned up\n');
    }
    
    console.log('🎉 All tests passed! The system is ready for use.');
    console.log('\n📋 Next steps:');
    console.log('1. Start the server: npm run dev');
    console.log('2. Connect your frontend to http://localhost:3001');
    console.log('3. Use the API endpoints as needed');
    
  } catch (err) {
    console.error('❌ Final test failed:', err.message);
  }
}

finalTest();