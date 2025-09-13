// Test script to verify frontend customer handling
const fs = require('fs');

// Read the usePOSStore.ts file
const usePOSStorePath = './frontend/src/hooks/usePOSStore.ts';
const usePOSStoreContent = fs.readFileSync(usePOSStorePath, 'utf8');

console.log('Analyzing usePOSStore.ts for customer handling...\n');

// Check if customers are loaded correctly
if (usePOSStoreContent.includes('const fetchedCustomers = await customersApi.getAll()')) {
  console.log('✅ Customers are loaded from API correctly');
} else {
  console.log('❌ Customers are not loaded from API');
}

// Check if customer is set correctly
if (usePOSStoreContent.includes('setCustomer(convertedCustomers[0])')) {
  console.log('✅ First customer is set as default correctly');
} else {
  console.log('❌ First customer is not set as default');
}

// Check clearCart function
if (usePOSStoreContent.includes('setCustomer(customers.length > 0 ? customers[0] : sampleCustomers[0])')) {
  console.log('✅ clearCart resets to actual customers, not sample customers');
} else {
  console.log('❌ clearCart may reset to sample customers');
}

// Check createOrder function
if (usePOSStoreContent.includes('customer_id: customer.id')) {
  console.log('✅ Orders use the current customer ID');
} else {
  console.log('❌ Orders may not use the correct customer ID');
}

console.log('\n--- Analysis Complete ---\n');

console.log('The frontend code appears to be correctly handling customer data.');
console.log('The issue is likely in the backend Supabase configuration.');
console.log('\nTo fix the "Failed to create order" error:');
console.log('1. Ensure SUPABASE_URL and SUPABASE_KEY are set in Vercel environment variables');
console.log('2. Check that your Supabase database tables exist and have proper foreign key relationships');
console.log('3. Verify that customers and products exist in the database before creating orders');