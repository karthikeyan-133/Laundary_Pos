const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

// Check if we're running on Vercel
const isVercel = !!process.env.VERCEL;

// Load environment variables only in local development
if (!isVercel) {
  const envPath = path.resolve(__dirname, '.env');
  dotenv.config({ path: envPath });
}

// Import Supabase client
const supabase = require('./supabaseClient');

// Import returns router
const returnsRouter = require('./returns');

console.log('Returns router loaded:', !!returnsRouter);

const app = express();

// Use Vercel's PORT or default to 3001
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allow localhost for development
    if (origin.indexOf('localhost') !== -1 || origin.indexOf('127.0.0.1') !== -1) {
      return callback(null, true);
    }
    
    // Allow Vercel deployments
    if (origin.indexOf('.vercel.app') !== -1) {
      return callback(null, true);
    }
    
    // Add your production domain here when you have one
    // if (origin === 'https://your-production-domain.com') {
    //   return callback(null, true);
    // }
    
    // For now, allow all origins in development
    return callback(null, true);
  },
  credentials: true
}));
app.use(express.json());

// Use returns router (moved after middleware)
app.use('/api/returns', returnsRouter);
console.log('Returns router mounted at /api/returns');

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'Tally POS API with Supabase',
    timestamp: new Date().toISOString(),
    status: 'healthy'
  });
});

app.get('/health', async (req, res) => {
  try {
    // Test Supabase connection
    const { data, error } = await supabase
      .from('settings')
      .select('id')
      .limit(1);
    
    if (error) {
      return res.status(503).json({ 
        status: 'unhealthy', 
        message: 'Database connection failed',
        error: error.message 
      });
    }
    
    res.json({ 
      status: 'healthy', 
      message: 'API is running and database is connected',
      timestamp: new Date().toISOString(),
      database: 'connected'
    });
  } catch (err) {
    res.status(503).json({ 
      status: 'unhealthy', 
      message: 'Health check failed',
      error: err.message 
    });
  }
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
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select(`
        *,
        customers(name, code, phone)
      `)
      .order('created_at', { ascending: false });
    
    if (ordersError) {
      console.error('Error fetching orders:', ordersError);
      return res.status(500).json({ error: 'Failed to fetch orders' });
    }
    
    // For each order, get its items with product information
    const ordersWithItems = await Promise.all(orders.map(async (order) => {
      const { data: items, error: itemsError } = await supabase
        .from('order_items')
        .select(`
          *,
          products(name, sku, price, category, stock, description, barcode)
        `)
        .eq('order_id', order.id);
      
      if (itemsError) {
        console.error('Error fetching order items for order', order.id, ':', itemsError);
        return { ...order, items: [] };
      }
      
      // Convert products to product to match frontend expectations
      const itemsWithProduct = items.map(item => ({
        ...item,
        product: item.products // Rename products to product
      })).map(({ products, ...rest }) => rest); // Remove the products field
      
      return { ...order, items: itemsWithProduct };
    }));
    
    res.json(ordersWithItems);
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
  const { customer_id, subtotal, discount, tax, total, payment_method, cash_amount, card_amount, status, delivery_status, payment_status, items } = req.body;
  
  try {
    // Check if Supabase is properly configured
    if (!supabase || !supabase.from) {
      console.error('Supabase not properly configured');
      return res.status(500).json({ error: 'Database not configured properly' });
    }
    
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
          cash_amount, 
          card_amount, 
          status, 
          delivery_status, 
          payment_status 
        }
      ])
      .select()
      .single();
    
    if (orderError) {
      console.error('Error creating order:', orderError);
      return res.status(500).json({ error: 'Failed to create order: ' + orderError.message });
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
        return res.status(500).json({ error: 'Failed to create order items: ' + itemsError.message });
      }
    }
    
    res.status(201).json(orderData);
  } catch (err) {
    console.error('Error creating order:', err);
    return res.status(500).json({ error: 'Failed to create order: ' + err.message });
  }
});

// PUT endpoint for updating orders
app.put('/api/orders/:id', async (req, res) => {
  const { id } = req.params;
  const { customer_id, subtotal, discount, tax, total, payment_method, cash_amount, card_amount, status, delivery_status, payment_status, items } = req.body;
  
  try {
    // Check if Supabase is properly configured
    if (!supabase || !supabase.from) {
      console.error('Supabase not properly configured');
      return res.status(500).json({ error: 'Database not configured properly' });
    }
    
    // Update order
    const updateData = {};
    if (customer_id !== undefined) updateData.customer_id = customer_id;
    if (subtotal !== undefined) updateData.subtotal = subtotal;
    if (discount !== undefined) updateData.discount = discount;
    if (tax !== undefined) updateData.tax = tax;
    if (total !== undefined) updateData.total = total;
    if (payment_method !== undefined) updateData.payment_method = payment_method;
    if (cash_amount !== undefined) updateData.cash_amount = cash_amount;
    if (card_amount !== undefined) updateData.card_amount = card_amount;
    if (status !== undefined) updateData.status = status;
    if (delivery_status !== undefined) updateData.delivery_status = delivery_status;
    if (payment_status !== undefined) updateData.payment_status = payment_status;
    
    // Only update if there's data to update
    if (Object.keys(updateData).length > 0) {
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', id)
        .select();
      
      if (orderError) {
        console.error('Error updating order:', orderError);
        return res.status(500).json({ error: 'Failed to update order: ' + orderError.message });
      }
      
      // Check if any rows were updated
      if (!orderData || orderData.length === 0) {
        return res.status(404).json({ error: 'Order not found' });
      }
      
      res.json(orderData[0]);
    } else {
      // If no update data provided, just return the order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', id);
      
      if (orderError) {
        console.error('Error fetching order:', orderError);
        return res.status(500).json({ error: 'Failed to fetch order: ' + orderError.message });
      }
      
      if (!orderData || orderData.length === 0) {
        return res.status(404).json({ error: 'Order not found' });
      }
      
      res.json(orderData[0]);
    }
  } catch (err) {
    console.error('Error updating order:', err);
    return res.status(500).json({ error: 'Failed to update order: ' + err.message });
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

// Vercel requires us to export the app, not start the server directly
// Only start the server if not running on Vercel
if (!process.env.VERCEL) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT} with Supabase database`);
    console.log(`Health check: http://localhost:${PORT}/health`);
  });
}

// Export the app for Vercel
module.exports = app;