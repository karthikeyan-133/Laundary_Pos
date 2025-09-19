// Simple script to check products in the database
const supabase = require('./supabaseClient');

async function checkProducts() {
  console.log('Checking products in database...');
  
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*');
    
    if (error) {
      console.error('Error fetching products:', error);
      return;
    }
    
    console.log('Found', data.length, 'products');
    
    if (data.length > 0) {
      console.log('First product:', data[0]);
      
      // Check the structure of the first product
      const product = data[0];
      console.log('Product structure:');
      console.log('- id:', product.id);
      console.log('- name:', product.name);
      console.log('- ironRate:', product.ironRate);
      console.log('- washAndIronRate:', product.washAndIronRate);
      console.log('- dryCleanRate:', product.dryCleanRate);
      console.log('- category:', product.category);
      console.log('- barcode:', product.barcode);
      console.log('- description:', product.description);
    } else {
      console.log('No products found in database');
    }
  } catch (err) {
    console.error('Error checking products:', err);
  }
}

checkProducts();