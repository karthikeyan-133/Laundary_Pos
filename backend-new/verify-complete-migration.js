const supabase = require('./supabaseClient');

async function verifyCompleteMigration() {
  console.log('Verifying complete database migration...');
  
  try {
    // Check if the new columns exist in products table
    console.log('Checking products table structure...');
    const { data: productsData, error: productsError } = await supabase
      .from('products')
      .select('*')
      .limit(1);
    
    if (productsError) {
      console.error('Error fetching products:', productsError.message);
      return;
    }
    
    if (productsData && productsData.length > 0) {
      const product = productsData[0];
      const hasIronRate = 'ironRate' in product;
      const hasWashAndIronRate = 'washAndIronRate' in product;
      const hasDryCleanRate = 'dryCleanRate' in product;
      
      console.log('Products table verification:');
      console.log('- ironRate column exists:', hasIronRate);
      console.log('- washAndIronRate column exists:', hasWashAndIronRate);
      console.log('- dryCleanRate column exists:', hasDryCleanRate);
      
      if (hasIronRate && hasWashAndIronRate && hasDryCleanRate) {
        console.log('✓ Products table structure is correct');
      } else {
        console.log('✗ Products table structure is incomplete');
      }
    }
    
    // Check if the service column exists in order_items table
    console.log('\nChecking order_items table structure...');
    const { data: orderItemsData, error: orderItemsError } = await supabase
      .from('order_items')
      .select('*')
      .limit(1);
    
    if (orderItemsError) {
      console.error('Error fetching order_items:', orderItemsError.message);
      return;
    }
    
    if (orderItemsData && orderItemsData.length > 0) {
      const orderItem = orderItemsData[0];
      const hasService = 'service' in orderItem;
      
      console.log('Order items table verification:');
      console.log('- service column exists:', hasService);
      
      if (hasService) {
        console.log('✓ Order items table structure is correct');
      } else {
        console.log('✗ Order items table structure is incomplete');
      }
    }
    
    // Check sample products have updated rates
    console.log('\nChecking sample product rates...');
    const { data: sampleProducts, error: sampleError } = await supabase
      .from('products')
      .select('id, name, ironRate, washAndIronRate, dryCleanRate')
      .in('id', ['1', '2', '3']);
    
    if (sampleError) {
      console.error('Error fetching sample products:', sampleError.message);
      return;
    }
    
    if (sampleProducts && sampleProducts.length > 0) {
      console.log('Sample product rates:');
      sampleProducts.forEach(product => {
        console.log(`- Product ${product.id}: Iron=${product.ironRate}, Wash&Iron=${product.washAndIronRate}, DryClean=${product.dryCleanRate}`);
      });
      
      // Check if rates are properly set
      const ratesSet = sampleProducts.some(product => 
        product.ironRate > 0 && product.washAndIronRate > 0 && product.dryCleanRate > 0
      );
      
      if (ratesSet) {
        console.log('✓ Sample product rates are properly set');
      } else {
        console.log('⚠ Sample product rates may not be set correctly');
      }
    }
    
    console.log('\nMigration verification completed!');
    
  } catch (err) {
    console.error('Error during verification:', err);
  }
}

// Run the verification
if (require.main === module) {
  verifyCompleteMigration();
}

module.exports = { verifyCompleteMigration };