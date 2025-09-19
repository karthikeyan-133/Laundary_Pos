// Simple test to check products API
import { productsApi } from './services/api';

async function testProductsAPI() {
  try {
    console.log('Testing products API...');
    const products = await productsApi.getAll();
    console.log('Products fetched:', products);
    
    if (products.length > 0) {
      console.log('First product:', products[0]);
    }
  } catch (error) {
    console.error('Error fetching products:', error);
  }
}

testProductsAPI();