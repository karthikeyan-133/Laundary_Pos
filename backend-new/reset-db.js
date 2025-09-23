const { supabase } = require('./supabaseClient');

async function resetDatabase() {
  try {
    console.log('Clearing existing data from tables...');
    
    // Clear tables in reverse order to avoid foreign key constraints
    const tables = [
      'return_items',
      'returns',
      'order_items',
      'orders',
      'settings',
      'customers',
      'products'
    ];
    
    for (let i = 0; i < tables.length; i++) {
      console.log(`Clearing table ${tables[i]} (${i + 1}/${tables.length})...`);
      const { error } = await supabase
        .from(tables[i])
        .delete();
      
      if (error) {
        console.log(`⚠️ Warning clearing table ${tables[i]}:`, error.message);
      } else {
        console.log(`✅ Table ${tables[i]} cleared successfully.`);
      }
    }
    
    console.log('✅ All tables cleared successfully!');
    console.log('Now run create-tables.js to repopulate the tables with sample data.');
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error clearing tables:', err);
    process.exit(1);
  }
}

resetDatabase();