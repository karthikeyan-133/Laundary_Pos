const { supabase } = require('./supabaseClient');
const { generateSequentialId } = require('./utils/idGenerator');

async function testIdGeneration() {
  console.log('Testing ID generation...');
  
  try {
    // Test generating a TRX ID
    const orderId = await generateSequentialId('TRX', 6, {
      query: async (query, params) => {
        console.log('Querying id_sequences with params:', params);
        const { data, error } = await supabase
          .from('id_sequences')
          .select('counter_value')
          .eq('prefix', params[0]);
        
        if (error) {
          throw new Error(error.message);
        }
        
        console.log('Query result:', data);
        return data;
      }
    });
    
    console.log('Generated order ID:', orderId);
    
    // Check if this ID already exists in orders
    const { data: existingOrder, error: checkError } = await supabase
      .from('orders')
      .select('id')
      .eq('id', orderId);
    
    if (checkError) {
      console.error('Error checking if order exists:', checkError.message);
      throw checkError;
    }
    
    console.log('Order with this ID exists:', existingOrder && existingOrder.length > 0);
    
    if (existingOrder && existingOrder.length > 0) {
      console.log('ERROR: Generated ID already exists!');
      return false;
    } else {
      console.log('SUCCESS: Generated ID is unique');
      return true;
    }
  } catch (error) {
    console.error('Error in ID generation test:', error.message);
    return false;
  }
}

// Run the test
testIdGeneration().then(success => {
  console.log('Test result:', success ? 'PASSED' : 'FAILED');
  process.exit(success ? 0 : 1);
});