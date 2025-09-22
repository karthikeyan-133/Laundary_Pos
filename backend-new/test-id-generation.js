const { generateSequentialId } = require('./utils/idGenerator');
const db = require('./mysqlDb');

async function testIdGeneration() {
  try {
    console.log('Testing sequential ID generation...');
    
    // Test generating a few IDs
    const id1 = await generateSequentialId('TRX', 6, db);
    console.log('Generated ID 1:', id1);
    
    const id2 = await generateSequentialId('TRX', 6, db);
    console.log('Generated ID 2:', id2);
    
    const id3 = await generateSequentialId('C', 5, db);
    console.log('Generated Customer ID:', id3);
    
    const id4 = await generateSequentialId('R', 5, db);
    console.log('Generated Return ID:', id4);
    
    console.log('ID generation test completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error testing ID generation:', error);
    process.exit(1);
  }
}

testIdGeneration();