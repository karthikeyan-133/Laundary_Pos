// Database Schema Fix Script for Tally POS System
// This script addresses the database schema mismatch issue
// where old 'sku' and 'stock' columns still exist in the products table

const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
const envPath = path.resolve(__dirname, '.env');
dotenv.config({ path: envPath });

// Import Supabase client
let supabase;
try {
  supabase = require('./supabaseClient');
  console.log('✅ Supabase client loaded successfully');
} catch (error) {
  console.error('❌ Failed to load Supabase client:', error.message);
  process.exit(1);
}

async function checkAndFixSchema() {
  console.log('🔍 Checking database schema...');
  
  try {
    // Test connection by fetching a sample product
    const { data: sampleData, error: sampleError } = await supabase
      .from('products')
      .select('*')
      .limit(1);
    
    if (sampleError) {
      console.error('❌ Database connection error:', sampleError.message);
      return;
    }
    
    if (sampleData && sampleData.length > 0) {
      console.log('✅ Database connection successful');
      console.log('📋 Current product structure:');
      
      // Display current columns
      const columns = Object.keys(sampleData[0]);
      columns.forEach(col => console.log(`   • ${col}`));
      
      // Check for old columns
      const hasSku = columns.includes('sku');
      const hasStock = columns.includes('stock');
      
      if (hasSku || hasStock) {
        console.log('\n⚠️  Schema Issue Detected:');
        if (hasSku) console.log('   • Found deprecated "sku" column');
        if (hasStock) console.log('   • Found deprecated "stock" column');
        
        console.log('\n💡 Solution:');
        console.log('   The database schema needs to be updated manually through the Supabase dashboard.');
        console.log('   Please follow these steps:');
        console.log('   1. Go to your Supabase project dashboard');
        console.log('   2. Navigate to Table Editor');
        console.log('   3. Select the "products" table');
        console.log('   4. Click on the "Edit Table" button');
        console.log('   5. Delete the "sku" and "stock" columns');
        console.log('   6. Save the changes');
        
        // Test if we can still work with the current schema
        console.log('\n🧪 Testing product creation with compatibility mode...');
        await testProductCreation();
      } else {
        console.log('\n✅ Database schema is up to date!');
        console.log('   No deprecated columns found');
        await testProductCreation();
      }
    } else {
      console.log('ℹ️  Products table is empty');
      await testProductCreation();
    }
    
  } catch (err) {
    console.error('❌ Unexpected error during schema check:', err.message);
  }
}

async function testProductCreation() {
  console.log('\n🧪 Testing product creation...');
  
  // Test data that matches the current frontend expectations
  const testData = {
    id: 'test-' + Date.now() + Math.random().toString(36).substr(2, 5),
    name: 'Schema Test Product',
    ironRate: 10.00,
    washAndIronRate: 20.00,
    dryCleanRate: 30.00,
    category: 'Test',
    barcode: 'TEST' + Date.now(),
    description: 'Test product for schema validation'
  };
  
  try {
    // Try to insert with the new schema (without sku and stock)
    console.log('   Attempting to create product with new schema...');
    const { data, error } = await supabase
      .from('products')
      .insert([testData])
      .select()
      .single();
    
    if (error) {
      console.error('   ❌ Failed to create product:', error.message);
      console.error('   Details:', JSON.stringify(error, null, 2));
      
      // Try with compatibility mode (including old fields)
      console.log('   Attempting compatibility mode...');
      const compatData = {
        ...testData,
        sku: null,
        stock: 0
      };
      
      const { data: compatDataResult, error: compatError } = await supabase
        .from('products')
        .insert([compatData])
        .select()
        .single();
      
      if (compatError) {
        console.error('   ❌ Compatibility mode also failed:', compatError.message);
        return;
      }
      
      console.log('   ✅ Product created successfully with compatibility mode');
      
      // Clean up
      await cleanupTestProduct(compatData.id);
    } else {
      console.log('   ✅ Product created successfully with new schema');
      
      // Clean up
      await cleanupTestProduct(testData.id);
    }
  } catch (err) {
    console.error('   ❌ Unexpected error during product creation test:', err.message);
  }
}

async function cleanupTestProduct(id) {
  try {
    await supabase
      .from('products')
      .delete()
      .eq('id', id);
    console.log('   🧹 Test product cleaned up');
  } catch (err) {
    console.error('   ⚠️  Failed to clean up test product:', err.message);
  }
}

// Run the schema check
checkAndFixSchema()
  .then(() => {
    console.log('\n🏁 Schema check completed');
    process.exit(0);
  })
  .catch(err => {
    console.error('\n💥 Schema check failed:', err.message);
    process.exit(1);
  });