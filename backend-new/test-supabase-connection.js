const { supabase, testConnection } = require('./supabaseClient');

async function main() {
  console.log('Testing Supabase connection...');
  
  // Check if Supabase URL and Key are set
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.log('⚠️  Supabase credentials not found in environment variables');
    console.log('Please set SUPABASE_URL and SUPABASE_KEY in your .env file');
    console.log('Example .env file:');
    console.log('SUPABASE_URL=https://your-project.supabase.co');
    console.log('SUPABASE_KEY=your-supabase-anon-key-here');
    process.exit(1);
  }
  
  try {
    const isConnected = await testConnection();
    
    if (isConnected) {
      console.log('✅ Supabase connection test passed!');
      
      // Test a simple query
      console.log('Testing a simple query...');
      const { data, error } = await supabase
        .from('settings')
        .select('id')
        .limit(1);
      
      if (error) {
        console.error('❌ Query test failed:', error.message);
      } else {
        console.log('✅ Query test passed!');
        console.log('Sample data:', data);
      }
    } else {
      console.log('❌ Supabase connection test failed!');
      console.log('\nTroubleshooting steps:');
      console.log('1. Verify your SUPABASE_URL and SUPABASE_KEY are correct');
      console.log('2. Check that your Supabase project is not paused');
      console.log('3. Ensure your IP is not blocked by Supabase');
      console.log('4. Make sure you\'re using the anon key, not the service key');
    }
  } catch (error) {
    console.error('❌ Error during connection test:', error.message);
    console.log('\nTroubleshooting steps:');
    console.log('1. Verify your SUPABASE_URL and SUPABASE_KEY are correct');
    console.log('2. Check that your Supabase project is not paused');
    console.log('3. Ensure your IP is not blocked by Supabase');
    console.log('4. Make sure you\'re using the anon key, not the service key');
  }
  
  process.exit(0);
}

main();