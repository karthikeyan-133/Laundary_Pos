const { supabase } = require('./supabaseClient');

async function initDatabase() {
  console.log('Initializing Supabase database tables...');
  
  try {
    // Note: In Supabase, tables are typically created via the dashboard or SQL editor
    // This script will attempt to insert initial data assuming tables exist
    // If tables don't exist, you'll need to create them first via the Supabase dashboard
    
    console.log('Checking if tables exist and inserting initial data...');
    
    // Test connection by querying settings table
    const { data: settingsData, error: settingsError } = await supabase
      .from('settings')
      .select('id')
      .limit(1);
    
    if (settingsError && settingsError.code !== '42P01') { // 42P01 = undefined_table
      console.error('❌ Error connecting to database:', settingsError.message);
      process.exit(1);
    }
    
    if (settingsError && settingsError.code === '42P01') {
      console.log('❌ Required tables do not exist in the database');
      console.log('\nPlease create the tables first using one of these methods:');
      console.log('1. Copy the contents of supabase-schema.sql into the Supabase SQL Editor and run it');
      console.log('2. Use the Supabase Table Editor to create tables manually');
      console.log('3. Refer to the SUPABASE_SETUP.md guide for detailed instructions');
      process.exit(1);
    }
    
    console.log('✅ Database connection successful and tables exist');
    
    // Insert initial data
    console.log('Inserting initial data...');
    
    // Insert sample products
    const products = [
      { id: '1', name: 'Shirt', ironRate: 5.00, washAndIronRate: 15.00, dryCleanRate: 25.00, category: 'Clothing', barcode: 'CL001', description: 'Cotton shirt' },
      { id: '2', name: 'Pant', ironRate: 7.00, washAndIronRate: 20.00, dryCleanRate: 35.00, category: 'Clothing', barcode: 'CL002', description: 'Formal pant' },
      { id: '3', name: 'Jacket', ironRate: 10.00, washAndIronRate: 25.00, dryCleanRate: 50.00, category: 'Clothing', barcode: 'CL003', description: 'Winter jacket' },
      { id: '4', name: 'Dress', ironRate: 8.00, washAndIronRate: 22.00, dryCleanRate: 40.00, category: 'Clothing', barcode: 'CL004', description: 'Evening dress' },
      { id: '5', name: 'Suit', ironRate: 15.00, washAndIronRate: 35.00, dryCleanRate: 75.00, category: 'Clothing', barcode: 'CL005', description: 'Formal suit' },
      { id: '6', name: 'Bed Sheet', ironRate: 12.00, washAndIronRate: 30.00, dryCleanRate: 45.00, category: 'Household', barcode: 'HH001', description: 'Queen size bed sheet' },
      { id: '7', name: 'Towel', ironRate: 3.00, washAndIronRate: 8.00, dryCleanRate: 15.00, category: 'Household', barcode: 'HH002', description: 'Cotton towel' },
      { id: '8', name: 'Curtain', ironRate: 20.00, washAndIronRate: 50.00, dryCleanRate: 80.00, category: 'Household', barcode: 'HH003', description: 'Living room curtain' },
      { id: '9', name: 'Carpet', ironRate: 25.00, washAndIronRate: 60.00, dryCleanRate: 100.00, category: 'Household', barcode: 'HH004', description: 'Small carpet' },
      { id: '10', name: 'Saree', ironRate: 10.00, washAndIronRate: 30.00, dryCleanRate: 60.00, category: 'Clothing', barcode: 'CL006', description: 'Silk saree' }
    ];
    
    const { error: insertProductsError } = await supabase
      .from('products')
      .upsert(products, { onConflict: 'id' });
    
    if (insertProductsError) {
      console.log('Warning - products insertion:', insertProductsError.message);
    } else {
      console.log('✅ Sample products inserted or already exist');
    }
    
    // Insert default customer
    const { error: insertCustomerError } = await supabase
      .from('customers')
      .upsert({
        id: '1',
        name: 'Walk-in Customer',
        code: 'WIC001',
        contact_name: '',
        phone: '',
        email: '',
        place: '',
        emirate: ''
      }, { onConflict: 'id' });
    
    if (insertCustomerError) {
      console.log('Warning - customer insertion:', insertCustomerError.message);
    } else {
      console.log('✅ Default customer inserted or already exists');
    }
    
    // Insert default settings
    const { error: insertSettingsError } = await supabase
      .from('settings')
      .upsert({
        id: 1,
        tax_rate: 5.00,
        currency: 'AED',
        business_name: 'TallyPrime Café',
        business_address: null,
        business_phone: '+971 4 123 4567',
        barcode_scanner_enabled: true
      }, { onConflict: 'id' });
    
    if (insertSettingsError) {
      console.log('Warning - settings insertion:', insertSettingsError.message);
    } else {
      console.log('✅ Default settings inserted or already exists');
    }
    
    console.log('\n✅ Database initialization completed!');
    console.log('\nNext steps:');
    console.log('1. Test your connection with: npm run test-supabase');
    console.log('2. Start your server with: npm start');
    console.log('\nNote: For foreign key constraints and the service check constraint,');
    console.log('please add them via the Supabase dashboard if needed.');
    
  } catch (error) {
    console.error('❌ Error initializing database:', error.message);
    console.log('\nTroubleshooting tips:');
    console.log('1. Ensure all required tables exist in your Supabase database');
    console.log('2. Check that your SUPABASE_URL and SUPABASE_KEY are correct');
    console.log('3. Verify your Supabase project is not paused');
  }
  
  process.exit(0);
}

initDatabase();