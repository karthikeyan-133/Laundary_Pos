const { query } = require('./mysqlDb');

async function resetDatabase() {
  try {
    console.log('Dropping existing tables...');
    
    // Drop tables in reverse order to avoid foreign key constraints
    const dropTables = [
      'DROP TABLE IF EXISTS return_items',
      'DROP TABLE IF EXISTS returns',
      'DROP TABLE IF EXISTS order_items',
      'DROP TABLE IF EXISTS orders',
      'DROP TABLE IF EXISTS settings',
      'DROP TABLE IF EXISTS customers',
      'DROP TABLE IF EXISTS products'
    ];
    
    for (let i = 0; i < dropTables.length; i++) {
      console.log(`Dropping table ${i + 1}/${dropTables.length}...`);
      await query(dropTables[i]);
      console.log(`✅ Table ${i + 1} dropped successfully.`);
    }
    
    console.log('✅ All tables dropped successfully!');
    console.log('Now run create-tables.js to recreate the tables.');
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error dropping tables:', err);
    process.exit(1);
  }
}

resetDatabase();