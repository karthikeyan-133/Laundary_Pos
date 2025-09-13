// Test script to verify Supabase connection
const supabase = require('./backend/supabaseClient');

async function testConnection() {
  console.log('Testing Supabase connection...');
  
  try {
    // Test 1: Check if we can connect to the database
    const { data, error } = await supabase
      .from('settings')
      .select('id')
      .limit(1);
    
    if (error) {
      console.log('❌ Database connection test failed:');
      console.log('Error:', error.message);
      return;
    }
    
    console.log('✅ Database connection successful');
    
    // Test 2: Check if settings table exists and has data
    const { data: settingsData, error: settingsError } = await supabase
      .from('settings')
      .select('*')
      .limit(1);
    
    if (settingsError) {
      console.log('⚠️  Settings table access failed:');
      console.log('Error:', settingsError.message);
    } else {
      if (settingsData && settingsData.length > 0) {
        console.log('✅ Settings table exists and has data');
        console.log('Settings:', JSON.stringify(settingsData[0], null, 2));
      } else {
        console.log('⚠️  Settings table exists but is empty');
      }
    }
    
    // Test 3: Check other tables
    const tables = ['products', 'customers', 'orders'];
    
    for (const table of tables) {
      try {
        const { data: tableData, error: tableError } = await supabase
          .from(table)
          .select('id')
          .limit(1);
        
        if (tableError) {
          console.log(`⚠️  ${table} table access failed:`, tableError.message);
        } else {
          console.log(`✅ ${table} table exists and is accessible`);
        }
      } catch (err) {
        console.log(`⚠️  Error accessing ${table} table:`, err.message);
      }
    }
    
    console.log('\n🎉 All tests completed!');
    
  } catch (err) {
    console.error('❌ Test failed with exception:', err.message);
  }
}

// Run the test
testConnection();