const { supabase } = require('./supabaseDb');

async function createReturnsTables() {
  console.log('Creating returns tables in Supabase...');
  
  try {
    // Create returns table
    console.log('Creating returns table...');
    const { error: returnsError } = await supabase.rpc('create_returns_table');
    if (returnsError) {
      console.log('Returns table may already exist or RPC not available:', returnsError.message);
      console.log('SQL for returns table:');
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
      console.log('Returns table created successfully');
    }
    
    // Create return_items table
    console.log('Creating return_items table...');
    const { error: returnItemsError } = await supabase.rpc('create_return_items_table');
    if (returnItemsError) {
      console.log('Return items table may already exist or RPC not available:', returnItemsError.message);
      console.log('SQL for return_items table:');
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
      console.log('Return items table created successfully');
    }
    
    console.log('\nPlease create the above tables in your Supabase dashboard if they do not exist.');
    console.log('\nAfter creating the tables, you can test the returns functionality.');
    
  } catch (err) {
    console.error('Error creating returns tables:', err);
  }
}

// Run the function
createReturnsTables();