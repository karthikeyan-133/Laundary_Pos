const { supabase } = require('./supabaseDb');

async function initDatabase() {
  console.log('Initializing Supabase database...');
  
  try {
    // Create products table
    const { error: productsError } = await supabase.rpc('create_products_table');
    if (productsError) {
      console.log('Products table may already exist or RPC not available:', productsError.message);
      // We'll create the table using direct Supabase operations instead
      console.log('Creating products table with Supabase operations...');
    }
    
    // Create customers table
    const { error: customersError } = await supabase.rpc('create_customers_table');
    if (customersError) {
      console.log('Customers table may already exist or RPC not available:', customersError.message);
    }
    
    // Create orders table
    const { error: ordersError } = await supabase.rpc('create_orders_table');
    if (ordersError) {
      console.log('Orders table may already exist or RPC not available:', ordersError.message);
    }
    
    // Create order_items table
    const { error: orderItemsError } = await supabase.rpc('create_order_items_table');
    if (orderItemsError) {
      console.log('Order items table may already exist or RPC not available:', orderItemsError.message);
    }
    
    // Create settings table
    const { error: settingsError } = await supabase.rpc('create_settings_table');
    if (settingsError) {
      console.log('Settings table may already exist or RPC not available:', settingsError.message);
    }
    
    console.log('Database initialization completed!');
    console.log('Please create the tables manually in your Supabase dashboard or using SQL commands.');
    
  } catch (err) {
    console.error('Error initializing database:', err);
  }
}

// Alternative approach: Create tables using Supabase operations
async function createTables() {
  console.log('Creating tables using Supabase operations...');
  
  // Note: In Supabase, you typically create tables through the dashboard or SQL editor
  // This is just for demonstration of how you might check if tables exist
  try {
    // Check if products table exists by trying to select from it
    const { data, error } = await supabase
      .from('products')
      .select('id')
      .limit(1);
    
    if (error) {
      console.log('Products table may not exist. Please create it in your Supabase dashboard.');
      console.log('SQL for products table:');
      console.log(`
        CREATE TABLE products (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          ironRate NUMERIC NOT NULL,
          washAndIronRate NUMERIC NOT NULL,
          dryCleanRate NUMERIC NOT NULL,
          category TEXT,
          barcode TEXT,
          description TEXT,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
      `);
    } else {
      console.log('Products table exists');
    }
    
    // Check other tables similarly...
    console.log('\nPlease create the following tables in your Supabase dashboard if they do not exist:');
    console.log('\n1. Customers table:');
    console.log(`
      CREATE TABLE customers (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        code TEXT,
        contact_name TEXT,
        phone TEXT,
        email TEXT,
        place TEXT,
        emirate TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    
    console.log('\n2. Orders table:');
    console.log(`
      CREATE TABLE orders (
        id TEXT PRIMARY KEY,
        customer_id TEXT REFERENCES customers(id),
        subtotal NUMERIC NOT NULL,
        discount NUMERIC DEFAULT 0,
        tax NUMERIC DEFAULT 0,
        total NUMERIC NOT NULL,
        payment_method TEXT,
        status TEXT,
        delivery_status TEXT,
        payment_status TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    
    console.log('\n3. Order Items table:');
    console.log(`
      CREATE TABLE order_items (
        id TEXT PRIMARY KEY,
        order_id TEXT REFERENCES orders(id),
        product_id TEXT REFERENCES products(id),
        quantity INTEGER NOT NULL,
        discount NUMERIC DEFAULT 0,
        subtotal NUMERIC NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    
    console.log('\n4. Settings table:');
    console.log(`
      CREATE TABLE settings (
        id INTEGER PRIMARY KEY,
        tax_rate NUMERIC DEFAULT 5.0,
        currency TEXT DEFAULT 'AED',
        business_name TEXT DEFAULT 'TallyPrime Café',
        business_address TEXT DEFAULT 'Shop 123, Marina Mall, Dubai Marina, Dubai, UAE',
        business_phone TEXT DEFAULT '+971 4 123 4567',
        barcode_scanner_enabled BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    
    console.log('\nAfter creating the tables, insert default settings:');
    console.log(`
      INSERT INTO settings (id, tax_rate, currency, business_name, business_address, business_phone, barcode_scanner_enabled)
      VALUES (1, 5.0, 'AED', 'TallyPrime Café', 'Shop 123, Marina Mall, Dubai Marina, Dubai, UAE', '+971 4 123 4567', true);
    `);
    
  } catch (err) {
    console.error('Error checking tables:', err);
  }
}

// Run the initialization
initDatabase();
createTables();