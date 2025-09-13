const { supabase } = require('./supabaseDb');

async function createReturnsTablesDirect() {
  console.log('Creating returns tables directly in Supabase...');
  
  try {
    // Create returns table
    console.log('Creating returns table...');
    const { error: returnsError } = await supabase.rpc('create_returns_table');
    if (returnsError) {
      console.log('Returns table may already exist or RPC not available:', returnsError.message);
      console.log('Creating returns table manually...');
      
      // Try to create the table directly
      const { error: directReturnsError } = await supabase
        .from('returns')
        .select('id')
        .limit(1);
      
      if (directReturnsError && directReturnsError.message.includes('relation "returns" does not exist')) {
        console.log('Returns table does not exist, you need to create it in Supabase dashboard:');
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
        console.log('Returns table already exists or is accessible.');
      }
    } else {
      console.log('Returns table created successfully');
    }
    
    // Create return_items table
    console.log('Creating return_items table...');
    const { error: returnItemsError } = await supabase.rpc('create_return_items_table');
    if (returnItemsError) {
      console.log('Return items table may already exist or RPC not available:', returnItemsError.message);
      console.log('Creating return_items table manually...');
      
      // Try to create the table directly
      const { error: directReturnItemsError } = await supabase
        .from('return_items')
        .select('id')
        .limit(1);
      
      if (directReturnItemsError && directReturnItemsError.message.includes('relation "return_items" does not exist')) {
        console.log('Return items table does not exist, you need to create it in Supabase dashboard:');
        console.log(`
        CREATE TABLE return_items (
          id TEXT PRIMARY KEY,
          return_id TEXT REFERENCES returns(id),
          product_id TEXT REFERENCES products(id),
          quantity INTEGER NOT NULL,
          refund_amount NUMERIC NOT NULL,
          created_at TIMESTAMP DEFAULT NOW()
        );
        `);
      } else {
        console.log('Return items table already exists or is accessible.');
      }
    } else {
      console.log('Return items table created successfully');
    }
    
    console.log('\nIf the tables do not exist, please create them in your Supabase dashboard.');
    console.log('\nAfter creating the tables, you can test the returns functionality.');
    
  } catch (err) {
    console.error('Error checking/creating returns tables:', err);
  }
}

// Run the function
createReturnsTablesDirect();