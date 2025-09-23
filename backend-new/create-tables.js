const { supabase } = require('./supabaseClient');

// This script will insert sample data into the Supabase database

console.log('Inserting sample data into Supabase database...');

// Insert sample data
async function insertSampleData() {
  try {
    console.log('Inserting sample data...');
    
    // Insert settings
    const { error: settingsError } = await supabase
      .from('settings')
      .upsert({
        id: 1,
        tax_rate: 5.00,
        currency: 'AED',
        business_name: 'TallyPrime Café',
        business_address: 'Shop 123, Marina Mall, Dubai Marina, Dubai, UAE',
        business_phone: '+971 4 123 4567',
        barcode_scanner_enabled: true,
        admin_username: 'admin',
        admin_email: 'admin@example.com',
        admin_password_hash: '$2a$10$8K1p/a0dURXAm7QiTRqNa.E3YPWs8UkrpC4rGHv7rIbx4s9usV6Wi'
      }, { onConflict: 'id' });
    
    if (settingsError) {
      console.log('⚠️ Settings insertion warning:', settingsError.message);
    } else {
      console.log('✅ Settings inserted successfully.');
    }
    
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
    
    const { error: productsError } = await supabase
      .from('products')
      .upsert(products, { onConflict: 'id' });
    
    if (productsError) {
      console.log('⚠️ Products insertion warning:', productsError.message);
    } else {
      console.log('✅ Sample products inserted successfully.');
    }
    
    // Insert default customer
    const { error: customerError } = await supabase
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
    
    if (customerError) {
      console.log('⚠️ Customer insertion warning:', customerError.message);
    } else {
      console.log('✅ Default customer inserted successfully.');
    }
    
    console.log('✅ All sample data inserted successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error inserting sample data:', err);
    process.exit(1);
  }
}

// Run the sample data insertion
insertSampleData();