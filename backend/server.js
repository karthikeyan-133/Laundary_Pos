const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const envPath = path.resolve(__dirname, '.env');
dotenv.config({ path: envPath });
// Replace MySQL with Supabase
const { supabase } = require('./supabaseDb');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Tally POS API with Supabase' });
});

// Products routes
app.get('/api/products', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*');
    
    if (error) {
      console.error('Error fetching products:', error);
      return res.status(500).json({ error: 'Failed to fetch products' });
    }
    
    res.json(data);
  } catch (err) {
    console.error('Error fetching products:', err);
    return res.status(500).json({ error: 'Failed to fetch products' });
  }
});

app.get('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching product:', error);
      return res.status(500).json({ error: 'Failed to fetch product' });
    }
    
    if (!data) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(data);
  } catch (err) {
    console.error('Error fetching product:', err);
    return res.status(500).json({ error: 'Failed to fetch product' });
  }
});

app.post('/api/products', async (req, res) => {
  // Generate a unique ID if not provided
  const id = req.body.id || Date.now().toString() + Math.random().toString(36).substr(2, 9);
  const { name, price, category, sku, barcode, stock, description } = req.body;
  
  try {
    const { data, error } = await supabase
      .from('products')
      .insert([
        { id, name, price, category, sku, barcode, stock, description }
      ])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating product:', error);
      return res.status(500).json({ error: 'Failed to create product' });
    }
    
    res.status(201).json(data);
  } catch (err) {
    console.error('Error creating product:', err);
    return res.status(500).json({ error: 'Failed to create product' });
  }
});

app.put('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  const { name, price, category, sku, barcode, stock, description } = req.body;
  
  try {
    const { data, error } = await supabase
      .from('products')
      .update({ name, price, category, sku, barcode, stock, description })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating product:', error);
      return res.status(500).json({ error: 'Failed to update product' });
    }
    
    if (!data) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(data);
  } catch (err) {
    console.error('Error updating product:', err);
    return res.status(500).json({ error: 'Failed to update product' });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const { data, error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting product:', error);
      return res.status(500).json({ error: 'Failed to delete product' });
    }
    
    if (data.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.status(204).send();
  } catch (err) {
    console.error('Error deleting product:', err);
    return res.status(500).json({ error: 'Failed to delete product' });
  }
});

// Customers routes
app.get('/api/customers', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('*');
    
    if (error) {
      console.error('Error fetching customers:', error);
      return res.status(500).json({ error: 'Failed to fetch customers' });
    }
    
    res.json(data);
  } catch (err) {
    console.error('Error fetching customers:', err);
    return res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

app.get('/api/customers/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching customer:', error);
      return res.status(500).json({ error: 'Failed to fetch customer' });
    }
    
    if (!data) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    res.json(data);
  } catch (err) {
    console.error('Error fetching customer:', err);
    return res.status(500).json({ error: 'Failed to fetch customer' });
  }
});

app.post('/api/customers', async (req, res) => {
  // Generate a unique ID if not provided
  const id = req.body.id || Date.now().toString() + Math.random().toString(36).substr(2, 9);
  const { name, code, contact_name, phone, email, place, emirate } = req.body;
  
  try {
    const { data, error } = await supabase
      .from('customers')
      .insert([
        { id, name, code, contact_name: contact_name, phone, email, place, emirate }
      ])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating customer:', error);
      return res.status(500).json({ error: 'Failed to create customer' });
    }
    
    res.status(201).json(data);
  } catch (err) {
    console.error('Error creating customer:', err);
    return res.status(500).json({ error: 'Failed to create customer' });
  }
});

// Orders routes
app.get('/api/orders', async (req, res) => {
  try {
    // Get orders with customer information
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        customers(name, code, phone)
      `)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching orders:', error);
      return res.status(500).json({ error: 'Failed to fetch orders' });
    }
    
    res.json(data);
  } catch (err) {
    console.error('Error fetching orders:', err);
    return res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

app.get('/api/orders/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    // Get order with customer information
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        customers(name, code, phone)
      `)
      .eq('id', id)
      .single();
    
    if (orderError) {
      console.error('Error fetching order:', orderError);
      return res.status(500).json({ error: 'Failed to fetch order' });
    }
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Get order items with product information
    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .select(`
        *,
        products(name, sku, price)
      `)
      .eq('order_id', id);
    
    if (itemsError) {
      console.error('Error fetching order items:', itemsError);
      return res.status(500).json({ error: 'Failed to fetch order items' });
    }
    
    const orderWithItems = {
      ...order,
      items: items
    };
    
    res.json(orderWithItems);
  } catch (err) {
    console.error('Error fetching order:', err);
    return res.status(500).json({ error: 'Failed to fetch order' });
  }
});

app.post('/api/orders', async (req, res) => {
  // Generate a unique ID if not provided
  const id = req.body.id || Date.now().toString() + Math.random().toString(36).substr(2, 9);
  const { customer_id, subtotal, discount, tax, total, payment_method, status, delivery_status, payment_status, items } = req.body;
  
  try {
    // Insert order
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert([
        { 
          id, 
          customer_id, 
          subtotal, 
          discount, 
          tax, 
          total, 
          payment_method, 
          status, 
          delivery_status, 
          payment_status 
        }
      ])
      .select()
      .single();
    
    if (orderError) {
      console.error('Error creating order:', orderError);
      return res.status(500).json({ error: 'Failed to create order' });
    }
    
    // Insert order items
    if (items && items.length > 0) {
      const orderItems = items.map(item => ({
        id: item.id || Date.now().toString() + Math.random().toString(36).substr(2, 9),
        order_id: id,
        product_id: item.product_id,
        quantity: item.quantity,
        discount: item.discount,
        subtotal: item.subtotal
      }));
      
      const { data: itemsData, error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);
      
      if (itemsError) {
        console.error('Error creating order items:', itemsError);
        return res.status(500).json({ error: 'Failed to create order items' });
      }
    }
    
    res.status(201).json(orderData);
  } catch (err) {
    console.error('Error creating order:', err);
    return res.status(500).json({ error: 'Failed to create order' });
  }
});

// Settings routes
app.get('/api/settings', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Error fetching settings:', error);
      return res.status(500).json({ error: 'Failed to fetch settings' });
    }
    
    if (data.length === 0) {
      return res.status(404).json({ error: 'Settings not found' });
    }
    
    res.json(data[0]);
  } catch (err) {
    console.error('Error fetching settings:', err);
    return res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

app.put('/api/settings', async (req, res) => {
  const { tax_rate, currency, business_name, business_address, business_phone, barcode_scanner_enabled } = req.body;
  
  try {
    // Try to update existing settings
    const { data: updateData, error: updateError } = await supabase
      .from('settings')
      .update({ 
        tax_rate, 
        currency, 
        business_name, 
        business_address, 
        business_phone, 
        barcode_scanner_enabled 
      })
      .eq('id', 1)
      .select()
      .single();
    
    if (updateError) {
      // If no settings exist, insert new ones
      const { data: insertData, error: insertError } = await supabase
        .from('settings')
        .insert([
          { 
            id: 1,
            tax_rate, 
            currency, 
            business_name, 
            business_address, 
            business_phone, 
            barcode_scanner_enabled 
          }
        ])
        .select()
        .single();
      
      if (insertError) {
        console.error('Error creating settings:', insertError);
        return res.status(500).json({ error: 'Failed to create settings' });
      }
      
      res.json(insertData);
    } else {
      res.json(updateData);
    }
  } catch (err) {
    console.error('Error updating settings:', err);
    return res.status(500).json({ error: 'Failed to update settings' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} with Supabase database`);
});