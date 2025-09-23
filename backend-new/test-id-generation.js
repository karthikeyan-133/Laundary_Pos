const { generateSequentialId } = require('./utils/idGenerator');
const { supabase } = require('./supabaseClient');

async function testIdGeneration() {
  try {
    console.log('Testing sequential ID generation...');
    
    // Create a mock db object that works with Supabase
    const supabaseDb = {
      query: async (query, params) => {
        // Extract table name from query (simplified for this test)
        if (query.includes('orders')) {
          const { data, error } = await supabase
            .from('orders')
            .select('id')
            .eq('id', params[0]);
          
          if (error) {
            throw new Error(error.message);
          }
          
          return data;
        } else if (query.includes('customers')) {
          const { data, error } = await supabase
            .from('customers')
            .select('id')
            .eq('id', params[0]);
          
          if (error) {
            throw new Error(error.message);
          }
          
          return data;
        } else if (query.includes('returns')) {
          const { data, error } = await supabase
            .from('returns')
            .select('id')
            .eq('id', params[0]);
          
          if (error) {
            throw new Error(error.message);
          }
          
          return data;
        }
        return [];
      }
    };
    
    // Test generating a few IDs
    const id1 = await generateSequentialId('TRX', 6, supabaseDb);
    console.log('Generated ID 1:', id1);
    
    const id2 = await generateSequentialId('TRX', 6, supabaseDb);
    console.log('Generated ID 2:', id2);
    
    const id3 = await generateSequentialId('C', 5, supabaseDb);
    console.log('Generated Customer ID:', id3);
    
    const id4 = await generateSequentialId('R', 5, supabaseDb);
    console.log('Generated Return ID:', id4);
    
    console.log('ID generation test completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error testing ID generation:', error);
    process.exit(1);
  }
}

testIdGeneration();