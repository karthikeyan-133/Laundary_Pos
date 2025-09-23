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

// Import auth router and middleware
const { router: authRouter, authenticateToken } = require('./auth');

// Import Supabase database interface instead of MySQL
const { supabase } = require('./supabaseClient');
const { generateSequentialId, initializeSequences } = require('./utils/idGenerator');

// Import returns router
const returnsRouter = require('./returns');

console.log('Returns router loaded:', !!returnsRouter);

const app = express();

// Use Vercel's PORT or default to 3001 for local development
const PORT = process.env.PORT || 3001;
console.log('Server configured to run on port:', PORT);

// ✅ Custom CORS middleware to ensure headers are always set
app.use((req, res, next) => {
  const origin = req.get('Origin');
  console.log('Request received from origin:', origin);
  
  // For production, allow all vercel.app origins to communicate with each other
  if (origin && origin.endsWith('.vercel.app')) {
    res.header('Access-Control-Allow-Origin', origin);
  } else if (origin) {
    // List of allowed origins for development
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:8080',
      'http://localhost:8081',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5174',
      'http://127.0.0.1:8080',
      'http://127.0.0.1:8081',
      'https://laundary-pos.vercel.app',
      'https://laundary-pos-zb3p.vercel.app'
    ];
    
    if (allowedOrigins.includes(origin)) {
      res.header('Access-Control-Allow-Origin', origin);
    }
  } else {
    // For requests with no origin (like mobile apps or curl requests)
    res.header('Access-Control-Allow-Origin', '*');
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Auth-Token');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Max-Age', '86400'); // 24 hours
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  next();
});

// Apply express.json middleware
app.use(express.json({ limit: '10mb' }));

// Special CORS middleware for API routes - ensure it's applied before any other middleware
app.use('/api/*', (req, res, next) => {
  const origin = req.get('Origin');
  if (origin) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Auth-Token');
  res.header('Access-Control-Allow-Credentials', 'true');
  // Handle OPTIONS requests specifically for API routes
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.status(200).end();
    return;
  }
  next();
});

// Use returns router
app.use('/api/returns', returnsRouter);
console.log('Returns router mounted at /api/returns');

// Use auth router with CORS headers
app.use('/api/auth', authRouter);
console.log('Auth router mounted at /api/auth');

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'Tally POS API with Supabase',
    timestamp: new Date().toISOString(),
    status: 'healthy'
  });
});

// Add a test CORS endpoint
app.get('/test-cors', (req, res) => {
  console.log('Test CORS endpoint called');
  console.log('Origin:', req.get('Origin'));
  res.json({ 
    message: 'CORS test successful',
    origin: req.get('Origin'),
    headers: req.headers
  });
});

// Simple test endpoint to verify server is working
app.get('/api/test-server', (req, res) => {
  console.log('Test server endpoint called');
  res.json({ 
    message: 'Server test successful',
    timestamp: new Date().toISOString(),
    server: 'Express server is running correctly'
  });
});

// ✅ Add CORS check endpoint
app.get("/api/cors-check", (req, res) => {
  res.json({ cors: "ok" });
});

// Health check endpoint
app.get('/health', async (req, res) => {
  const healthStatus = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: {
      connected: false,
      error: null
    },
    uptime: process.uptime()
  };

  try {
    // Test Supabase connection
    const { data, error } = await supabase
      .from('settings')
      .select('id')
      .limit(1);
    
    if (error) {
      throw new Error(error.message);
    }
    
    healthStatus.database.connected = true;
  } catch (error) {
    healthStatus.database.connected = false;
    healthStatus.database.error = error.message;
    healthStatus.status = 'degraded';
  }

  res.status(healthStatus.database.connected ? 200 : 503).json(healthStatus);
});

// Protect all API routes except auth routes
app.use('/api/products', authenticateToken);
app.use('/api/customers', authenticateToken);
app.use('/api/orders', authenticateToken);
app.use('/api/settings', authenticateToken);
app.use('/api/returns', authenticateToken);

// Products routes
app.get('/api/products', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*');
    
    if (error) {
      throw new Error(error.message);
    }
    
    // Transform column names to match frontend expectations
    const transformedData = data.map(product => ({
      ...product,
      ironRate: parseFloat(product.ironRate) || 0,
      washAndIronRate: parseFloat(product.washAndIronRate) || 0,
      dryCleanRate: parseFloat(product.dryCleanRate) || 0
    }));
    
    res.json(transformedData);
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
      throw new Error(error.message);
    }
    
    if (!data) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Transform column names to match frontend expectations
    const transformedData = {
      ...data,
      ironRate: parseFloat(data.ironRate) || 0,
      washAndIronRate: parseFloat(data.washAndIronRate) || 0,
      dryCleanRate: parseFloat(data.dryCleanRate) || 0
    };
    
    res.json(transformedData);
  } catch (err) {
    console.error('Error fetching product:', err);
    return res.status(500).json({ error: 'Failed to fetch product' });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    // Generate a unique ID if not provided
    const id = req.body.id || Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const { name, ironRate, washAndIronRate, dryCleanRate, category, barcode, description } = req.body;
    
    // Log incoming request for debugging
    console.log('Product creation request received:', { name, category, barcode });
    
    // Validate required fields
    if (!name || !category || !barcode) {
      return res.status(400).json({ 
        error: 'Missing required fields', 
        details: 'Name, category, and barcode are required',
        received: { name: !!name, category: !!category, barcode: !!barcode }
      });
    }
    
    // Ensure all rate fields are provided and are valid numbers
    const ironRateNum = parseFloat(ironRate);
    const washAndIronRateNum = parseFloat(washAndIronRate);
    const dryCleanRateNum = parseFloat(dryCleanRate);
    
    // Validate that rates are valid numbers
    if (isNaN(ironRateNum) || isNaN(washAndIronRateNum) || isNaN(dryCleanRateNum)) {
      return res.status(400).json({ 
        error: 'Invalid rate values', 
        details: 'All rate values must be valid numbers',
        received: { ironRate, washAndIronRate, dryCleanRate }
      });
    }
    
    // Prepare product data
    const productData = {
      id,
      name,
      ironRate: ironRateNum,
      washAndIronRate: washAndIronRateNum,
      dryCleanRate: dryCleanRateNum,
      category,
      barcode,
      description: description || null
    };
    
    console.log('Attempting to insert product:', productData);
    
    // Insert the product
    const { data, error } = await supabase
      .from('products')
      .insert([productData])
      .select()
      .single();
    
    if (error) {
      throw new Error(error.message);
    }
    
    console.log('Product created successfully:', data);
    
    // Transform response to match frontend expectations
    const responseData = {
      id: data.id,
      name: data.name,
      ironRate: parseFloat(data.ironRate) || 0,
      washAndIronRate: parseFloat(data.washAndIronRate) || 0,
      dryCleanRate: parseFloat(data.dryCleanRate) || 0,
      category: data.category,
      barcode: data.barcode,
      description: data.description || undefined,
      created_at: data.created_at,
      updated_at: data.updated_at
    };
    
    // Remove undefined fields
    Object.keys(responseData).forEach(key => {
      if (responseData[key] === undefined) {
        delete responseData[key];
      }
    });
    
    res.status(201).json(responseData);
  } catch (err) {
    console.error('Unexpected error in product creation:', err);
    return res.status(500).json({ 
      error: 'Failed to create product',
      details: err.message
    });
  }
});

app.put('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  const { name, ironRate, washAndIronRate, dryCleanRate, category, barcode, description } = req.body;
  
  // Ensure all rate fields are provided and are numbers
  const productData = {
    name,
    ironRate: parseFloat(ironRate) || 0,
    washAndIronRate: parseFloat(washAndIronRate) || 0,
    dryCleanRate: parseFloat(dryCleanRate) || 0,
    category,
    barcode,
    description,
    updated_at: new Date().toISOString()
  };
  
  try {
    const { data, error } = await supabase
      .from('products')
      .update(productData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      throw new Error(error.message);
    }
    
    if (!data) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(data);
  } catch (err) {
    console.error('Error updating product:', err);
    return res.status(500).json({ error: 'Failed to update product', details: err.message });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    // First, check if the product exists
    const { data: existingProduct, error: fetchError } = await supabase
      .from('products')
      .select('id')
      .eq('id', id)
      .single();
    
    if (fetchError && fetchError.code !== 'PGRST116') {
      throw new Error(fetchError.message);
    }
    
    if (!existingProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Check if product is referenced in order_items
    const { data: orderItems, error: orderItemsError } = await supabase
      .from('order_items')
      .select('id')
      .eq('product_id', id)
      .limit(1);
    
    if (orderItemsError) {
      throw new Error(orderItemsError.message);
    }
    
    if (orderItems && orderItems.length > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete product', 
        details: 'This product is referenced in existing orders and cannot be deleted.' 
      });
    }
    
    // Check if product is referenced in return_items
    const { data: returnItems, error: returnItemsError } = await supabase
      .from('return_items')
      .select('id')
      .eq('product_id', id)
      .limit(1);
    
    if (returnItemsError) {
      throw new Error(returnItemsError.message);
    }
    
    if (returnItems && returnItems.length > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete product', 
        details: 'This product is referenced in existing returns and cannot be deleted.' 
      });
    }
    
    // If no references, proceed with deletion
    const { data, error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    
    if (error) {
      throw new Error(error.message);
    }
    
    res.status(204).send();
  } catch (err) {
    console.error('Error deleting product:', err);
    return res.status(500).json({ error: 'Failed to delete product', details: err.message });
  }
});

// Customers routes
app.get('/api/customers', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('*');
    
    if (error) {
      throw new Error(error.message);
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
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Customer not found' });
      }
      throw new Error(error.message);
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
  try {
    // Generate a sequential customer ID with C prefix
    // Note: For Supabase, we might want to use auto-generated IDs or a different approach
    const id = await generateSequentialId('C', 5, {
      query: async (query, params) => {
        const { data, error } = await supabase
          .from('customers')
          .select('id')
          .eq('id', params[0]);
        
        if (error) {
          throw new Error(error.message);
        }
        
        return data;
      }
    });
    
    const { name, code, contact_name, phone, email, place, emirate } = req.body;
    
    const customerData = {
      id,
      name,
      code: code !== undefined ? code : null,
      contact_name: contact_name !== undefined ? contact_name : null,
      phone: phone !== undefined ? phone : null,
      email: email !== undefined ? email : null,
      place: place !== undefined ? place : null,
      emirate: emirate !== undefined ? emirate : null
    };
    
    const { data, error } = await supabase
      .from('customers')
      .insert([customerData])
      .select()
      .single();
    
    if (error) {
      throw new Error(error.message);
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
      throw new Error(ordersError.message);
    }
    
    // For each order, get its items with product information
    const ordersWithItems = await Promise.all(orders.map(async (order) => {
      const { data: items, error: itemsError } = await supabase
        .from('order_items')
        .select(`
          *,
          products(name, ironRate, washAndIronRate, dryCleanRate, category, description, barcode)
        `)
        .eq('order_id', order.id);
      
      if (itemsError) {
        throw new Error(itemsError.message);
      }
      
      return { 
        ...order, 
        customer_name: order.customers?.name || null,
        customer_code: order.customers?.code || null,
        customer_phone: order.customers?.phone || null,
        items: items.map(item => ({
          ...item,
          product_name: item.products?.name || null,
          ironRate: item.products?.ironRate || null,
          washAndIronRate: item.products?.washAndIronRate || null,
          dryCleanRate: item.products?.dryCleanRate || null,
          category: item.products?.category || null,
          description: item.products?.description || null,
          barcode: item.products?.barcode || null
        }))
      };
    }));
    
    // Clean up the response by removing the nested objects
    const cleanedOrders = ordersWithItems.map(order => {
      const { customers, ...cleanedOrder } = order;
      return cleanedOrder;
    });
    
    res.json(cleanedOrders);
  } catch (err) {
    console.error('Error fetching orders:', err);
    return res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

app.get('/api/orders/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    // Get order with customer information
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select(`
        *,
        customers(name, code, phone)
      `)
      .eq('id', id)
      .single();
    
    if (ordersError) {
      if (ordersError.code === 'PGRST116') {
        return res.status(404).json({ error: 'Order not found' });
      }
      throw new Error(ordersError.message);
    }
    
    if (!orders) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    const order = orders;
    
    // Get order items with product information
    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .select(`
        *,
        products(name, ironRate, washAndIronRate, dryCleanRate)
      `)
      .eq('order_id', id);
    
    if (itemsError) {
      throw new Error(itemsError.message);
    }
    
    const orderWithItems = {
      ...order,
      customer_name: order.customers?.name || null,
      customer_code: order.customers?.code || null,
      customer_phone: order.customers?.phone || null,
      items: items.map(item => ({
        ...item,
        product_name: item.products?.name || null,
        ironRate: item.products?.ironRate || null,
        washAndIronRate: item.products?.washAndIronRate || null,
        dryCleanRate: item.products?.dryCleanRate || null
      }))
    };
    
    // Clean up the response by removing the nested objects
    const { customers, ...cleanedOrder } = orderWithItems;
    
    res.json(cleanedOrder);
  } catch (err) {
    console.error('Error fetching order:', err);
    return res.status(500).json({ error: 'Failed to fetch order' });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    // Generate a sequential order ID with TRX prefix
    // Note: For Supabase, we might want to use auto-generated IDs or a different approach
    const id = await generateSequentialId('TRX', 6, {
      query: async (query, params) => {
        const { data, error } = await supabase
          .from('orders')
          .select('id')
          .eq('id', params[0]);
        
        if (error) {
          throw new Error(error.message);
        }
        
        return data;
      }
    });
    
    const { customer_id, subtotal, discount, tax, total, payment_method, cash_amount, card_amount, status, delivery_status, payment_status, items } = req.body;
    
    // Insert order
    const orderData = {
      id,
      customer_id,
      subtotal,
      discount,
      tax,
      total,
      payment_method,
      cash_amount: cash_amount !== undefined ? cash_amount : null,
      card_amount: card_amount !== undefined ? card_amount : null,
      status,
      delivery_status: delivery_status !== undefined ? delivery_status : null,
      payment_status: payment_status !== undefined ? payment_status : null
    };
    
    const { data: orderResult, error: orderError } = await supabase
      .from('orders')
      .insert([orderData])
      .select()
      .single();
    
    if (orderError) {
      throw new Error(orderError.message);
    }
    
    // Insert order items
    if (items && items.length > 0) {
      const orderItemsData = await Promise.all(items.map(async (item) => {
        // Generate a sequential ID for order items with ITM prefix
        const itemId = await generateSequentialId('ITM', 6, {
          query: async (query, params) => {
            const { data, error } = await supabase
              .from('order_items')
              .select('id')
              .eq('id', params[0]);
            
            if (error) {
              throw new Error(error.message);
            }
            
            return data;
          }
        });
        
        return {
          id: itemId,
          order_id: id,
          product_id: item.product_id,
          quantity: item.quantity,
          discount: item.discount,
          subtotal: item.subtotal,
          service: item.service
        };
      }));
      
      const { data: itemsResult, error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItemsData);
      
      if (itemsError) {
        throw new Error(itemsError.message);
      }
    }
    
    res.status(201).json(orderResult);
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
    // Prepare update data
    const updateData = {};
    
    if (customer_id !== undefined) updateData.customer_id = customer_id;
    if (subtotal !== undefined) updateData.subtotal = subtotal;
    if (discount !== undefined) updateData.discount = discount;
    if (tax !== undefined) updateData.tax = tax;
    if (total !== undefined) updateData.total = total;
    if (payment_method !== undefined) updateData.payment_method = payment_method;
    if (cash_amount !== undefined) updateData.cash_amount = cash_amount !== undefined ? cash_amount : null;
    if (card_amount !== undefined) updateData.card_amount = card_amount !== undefined ? card_amount : null;
    if (status !== undefined) updateData.status = status;
    if (delivery_status !== undefined) updateData.delivery_status = delivery_status !== undefined ? delivery_status : null;
    if (payment_status !== undefined) updateData.payment_status = payment_status !== undefined ? payment_status : null;
    updateData.updated_at = new Date().toISOString();
    
    // Update order
    const { data: orderResult, error: orderError } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (orderError) {
      if (orderError.code === 'PGRST116') {
        return res.status(404).json({ error: 'Order not found' });
      }
      throw new Error(orderError.message);
    }
    
    if (!orderResult) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json(orderResult);
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
      .limit(1)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Settings not found' });
      }
      throw new Error(error.message);
    }
    
    res.json(data);
  } catch (err) {
    console.error('Error fetching settings:', err);
    return res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

app.put('/api/settings', async (req, res) => {
  const { tax_rate, currency, business_name, business_address, business_phone, barcode_scanner_enabled } = req.body;
  
  try {
    // Prepare update data
    const updateData = {};
    if (tax_rate !== undefined) updateData.tax_rate = tax_rate;
    if (currency !== undefined) updateData.currency = currency;
    if (business_name !== undefined) updateData.business_name = business_name;
    if (business_address !== undefined) updateData.business_address = business_address;
    if (business_phone !== undefined) updateData.business_phone = business_phone;
    if (barcode_scanner_enabled !== undefined) updateData.barcode_scanner_enabled = barcode_scanner_enabled;
    updateData.updated_at = new Date().toISOString();
    
    // Try to update existing settings
    const { data: updateResult, error: updateError } = await supabase
      .from('settings')
      .update(updateData)
      .eq('id', 1)
      .select()
      .single();
    
    if (updateError && updateError.code !== 'PGRST116') {
      throw new Error(updateError.message);
    }
    
    if (updateResult) {
      res.json(updateResult);
    } else {
      // If no settings exist, insert new ones
      const insertData = {
        id: 1,
        tax_rate: tax_rate !== undefined ? tax_rate : null,
        currency: currency !== undefined ? currency : null,
        business_name: business_name !== undefined ? business_name : null,
        business_address: business_address !== undefined ? business_address : null,
        business_phone: business_phone !== undefined ? business_phone : null,
        barcode_scanner_enabled: barcode_scanner_enabled !== undefined ? barcode_scanner_enabled : null
      };
      
      const { data: insertResult, error: insertError } = await supabase
        .from('settings')
        .insert([insertData])
        .select()
        .single();
      
      if (insertError) {
        throw new Error(insertError.message);
      }
      
      res.json(insertResult);
    }
  } catch (err) {
    console.error('Error updating settings:', err);
    return res.status(500).json({ error: 'Failed to update settings' });
  }
});

// Vercel requires us to export the app, not start the server directly
// Only start the server if not running on Vercel
if (!process.env.VERCEL) {
  // Initialize the database connection and start the server
  async function startServer() {
    try {
      // Test Supabase connection
      console.log('🔄 Attempting to connect to Supabase database...');
      const { data, error } = await supabase
        .from('settings')
        .select('id')
        .limit(1);
      
      if (error) {
        throw new Error(error.message);
      }
      
      console.log('✅ Successfully connected to Supabase database');
      
      // Start the server
      const server = app.listen(PORT, '0.0.0.0', () => {
        console.log(`🚀 Server running on port ${PORT}`);
        console.log(`📡 Access server at: http://localhost:${PORT}`);
      });
      
      // Handle server errors
      server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          console.error(`Port ${PORT} is already in use. Please close the application using that port or use a different port.`);
        } else {
          console.error('Server error:', err);
        }
      });
    } catch (err) {
      console.error('❌ Failed to start server:', err);
      if (err.message.includes('Invalid API key')) {
        console.error('\n❌ Supabase Connection Error:');
        console.error('1. Check that your SUPABASE_URL and SUPABASE_KEY are correct');
        console.error('2. Verify that your Supabase project is not paused');
        console.error('3. Ensure your API key has the necessary permissions');
      }
      
      // Instead of exiting, let's start the server without database connection
      // This allows the API to run for non-database operations
      console.log('\n⚠️ Starting server in limited mode without database connection...');
      console.log('⚠️ Some features may not work properly without database access');
      
      const server = app.listen(PORT, '0.0.0.0', () => {
        console.log(`🚀 Server running on port ${PORT} (limited mode - no database)`);
        console.log(`📡 Access server at: http://localhost:${PORT}`);
      });
      
      // Handle server errors
      server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          console.error(`Port ${PORT} is already in use. Please close the application using that port or use a different port.`);
        } else {
          console.error('Server error:', err);
        }
      });
    }
  }

  startServer();
}

// Export the app for Vercel
module.exports = app;