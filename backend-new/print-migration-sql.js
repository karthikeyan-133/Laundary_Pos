const fs = require('fs');
const path = require('path');

// Read and print the migration SQL file
const migrationSqlPath = path.join(__dirname, 'supabase-complete-migration.sql');

try {
  const migrationSql = fs.readFileSync(migrationSqlPath, 'utf8');
  console.log('=== COMPLETE MIGRATION SQL ===');
  console.log(migrationSql);
  console.log('=== END OF MIGRATION SQL ===');
  console.log('\nInstructions:');
  console.log('1. Copy the SQL above');
  console.log('2. Go to your Supabase dashboard');
  console.log('3. Navigate to SQL Editor');
  console.log('4. Paste the SQL and click "Run"');
} catch (error) {
  console.error('Error reading migration SQL file:', error.message);
  process.exit(1);
}