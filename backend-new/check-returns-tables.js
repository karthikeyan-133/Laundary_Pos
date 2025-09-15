const { supabase } = require('./supabaseDb');

async function checkReturnsTables() {
  console.log('Checking if returns tables exist in Supabase...');
  
  try {
    // Check if returns table exists
    console.log('Checking returns table...');
    const { data: returnsData, error: returnsError } = await supabase
      .from('returns')
      .select('id')
      .limit(1);
    
    if (returnsError) {
      console.log('Returns table error:', returnsError.message);
      if (returnsError.message.includes('relation "returns" does not exist')) {
        console.log('❌ Returns table does not exist');
        console.log('Please create the returns table with the following SQL:');
        console.log(`
CREATE TABLE returns (
  id TEXT PRIMARY KEY,
  order_id TEXT REFERENCES orders(id),
  reason TEXT,
  refund_amount NUMERIC NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
        `);
      } else {
        console.log('Returns table exists but has an error');
      }
    } else {
      console.log('✅ Returns table exists and is accessible');
      console.log('Sample data:', returnsData);
    }
    
    // Check if return_items table exists
    console.log('Checking return_items table...');
    const { data: returnItemsData, error: returnItemsError } = await supabase
      .from('return_items')
      .select('id')
      .limit(1);
    
    if (returnItemsError) {
      console.log('Return items table error:', returnItemsError.message);
      if (returnItemsError.message.includes('relation "return_items" does not exist')) {
        console.log('❌ Return items table does not exist');
        console.log('Please create the return_items table with the following SQL:');
        console.log(`
CREATE TABLE return_items (
  id TEXT PRIMARY KEY,
  return_id TEXT REFERENCES returns(id),
  product_id TEXT REFERENCES products(id),
  quantity INTEGER NOT NULL,
  refund_amount NUMERIC NOT NULL
);
        `);
      } else {
        console.log('Return items table exists but has an error');
      }
    } else {
      console.log('✅ Return items table exists and is accessible');
      console.log('Sample data:', returnItemsData);
    }
    
    console.log('\nIf tables do not exist, please create them using the SQL commands above');
    
  } catch (err) {
    console.error('Error checking returns tables:', err);
  }
}

// Run the function
checkReturnsTables();