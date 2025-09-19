// Script to migrate existing data to the new structure
const supabase = require('./supabaseClient');

async function migrateExistingData() {
  console.log('Starting data migration...');
  
  try {
    // Check if we have the old price column
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .limit(1);
    
    if (productsError) {
      console.error('Error fetching products:', productsError);
      return;
    }
    
    // If we have products with the old structure, migrate them
    if (products && products.length > 0) {
      const firstProduct = products[0];
      
      // Check if this is the old structure (has price column)
      if (firstProduct.hasOwnProperty('price') && !firstProduct.hasOwnProperty('ironRate')) {
        console.log('Detected old database structure. Migrating data...');
        
        // Update all products to populate the new service rate columns
        for (const product of products) {
          const { error: updateError } = await supabase
            .from('products')
            .update({
              ironRate: product.price * 0.5 || 0,
              washAndIronRate: product.price * 0.8 || 0,
              dryCleanRate: product.price * 1.2 || 0
            })
            .eq('id', product.id);
          
          if (updateError) {
            console.error(`Error updating product ${product.id}:`, updateError);
          } else {
            console.log(`Updated product ${product.id} with service rates`);
          }
        }
        
        console.log('Data migration completed!');
      } else {
        console.log('Database structure is already up to date.');
      }
    }
    
    // Ensure all order_items have a service value
    const { data: orderItems, error: orderItemsError } = await supabase
      .from('order_items')
      .select('*')
      .is('service', null);
    
    if (orderItemsError) {
      console.error('Error fetching order items:', orderItemsError);
      return;
    }
    
    if (orderItems && orderItems.length > 0) {
      console.log(`Found ${orderItems.length} order items without service. Setting default value...`);
      
      for (const item of orderItems) {
        const { error: updateError } = await supabase
          .from('order_items')
          .update({ service: 'iron' })
          .eq('id', item.id);
        
        if (updateError) {
          console.error(`Error updating order item ${item.id}:`, updateError);
        } else {
          console.log(`Updated order item ${item.id} with default service`);
        }
      }
      
      console.log('Order items migration completed!');
    }
    
    console.log('All data migration tasks completed successfully!');
    
  } catch (error) {
    console.error('Error during data migration:', error);
  }
}

// Run the migration
migrateExistingData();