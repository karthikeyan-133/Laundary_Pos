const { supabase } = require('./supabaseClient');

async function verifySetup() {
  try {
    console.log('🔍 Verifying Supabase setup...');
    
    // Test 1: Connection
    console.log('\n1. Testing database connection...');
    const { data: connectionTest, error: connectionError } = await supabase
      .from('settings')
      .select('id')
      .limit(1);
    
    if (connectionError) {
      console.error('❌ Connection test failed:', connectionError.message);
      return;
    }
    console.log('✅ Connection successful');
    
    // Test 2: Settings table structure
    console.log('\n2. Checking settings table structure...');
    const { data: tableData, error: tableError } = await supabase
      .from('settings')
      .select('*')
      .limit(1);
    
    if (tableError) {
      console.error('❌ Settings table query failed:', tableError.message);
      return;
    }
    
    if (tableData && tableData.length > 0) {
      console.log('✅ Settings table exists and has data');
      const columns = Object.keys(tableData[0]);
      console.log('📋 Available columns:', columns);
      
      // Check for required admin columns
      const requiredColumns = ['admin_username', 'admin_email', 'admin_password_hash'];
      const missingColumns = requiredColumns.filter(col => !columns.includes(col));
      
      if (missingColumns.length === 0) {
        console.log('✅ All required admin columns are present');
      } else {
        console.log('❌ Missing columns:', missingColumns);
        console.log('💡 Solution: Run the SQL commands from supabase-setup-instructions.md');
      }
    } else {
      console.log('⚠️ Settings table is empty');
      // Try to insert default row
      const { data: insertData, error: insertError } = await supabase
        .from('settings')
        .insert([{ id: 1 }])
        .select();
      
      if (insertError) {
        console.error('❌ Failed to insert default row:', insertError.message);
      } else {
        console.log('✅ Default row inserted');
      }
    }
    
    // Test 3: All required tables
    console.log('\n3. Checking required tables...');
    const requiredTables = ['products', 'customers', 'settings', 'orders', 'order_items', 'returns', 'return_items', 'id_sequences'];
    
    for (const table of requiredTables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('id')
          .limit(1);
        
        if (error && error.code !== '42P01') { // 42P01 = table doesn't exist
          console.log(`⚠️  ${table}: ${error.message}`);
        } else if (error) {
          console.log(`❌ ${table}: Table does not exist`);
        } else {
          console.log(`✅ ${table}: OK`);
        }
      } catch (err) {
        console.log(`❌ ${table}: ${err.message}`);
      }
    }
    
    console.log('\n✨ Setup verification complete!');
    console.log('\nNext steps:');
    console.log('1. If any columns are missing, run the SQL commands from supabase-setup-instructions.md');
    console.log('2. Restart your server: npm run dev');
    console.log('3. Test the signup endpoint');
    
  } catch (err) {
    console.error('❌ Unexpected error during setup verification:', err.message);
  }
}

verifySetup();