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

// Import MySQL database interface instead of Supabase
const db = require('./mysqlDb');

// Import returns router
const returnsRouter = require('./returns');

console.log('Returns router loaded:', !!returnsRouter);

const app = express();

// Use Vercel's PORT or default to 3004 for local development (changed from 3003 to avoid conflicts)
// Vercel dynamically assigns a PORT through process.env.PORT
const PORT = process.env.PORT || 3004;
console.log('Server configured to run on port:', PORT);

// ✅ Enable CORS for your frontend - Updated for Vercel deployment
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // List of allowed origins
    const allowedOrigins = [
      'http://localhost:5173',     // Default Vite development server
      'http://localhost:5174',     // Alternative Vite development server
      'http://localhost:8080',     // Another development server port
      'http://localhost:8081',     // Another development server port
      'http://127.0.0.1:5173',     // Alternative localhost
      'http://127.0.0.1:5174',     // Alternative localhost
      'http://127.0.0.1:8080',     // Alternative localhost for port 8080
      'http://127.0.0.1:8081',     // Alternative localhost for port 8081
      'https://pos-laundry-ajish.vercel.app',  // Previous frontend domain
      'https://pos-laundry-eight.vercel.app',  // Current frontend domain
      'https://pos-laundry-tau.vercel.app',  // Production frontend
      'https://billing-pos-yjh9.vercel.app',   // Another possible frontend
      'https://pos-laundry-backend.vercel.app',   // Current backend URL
      'https://laundary-pos.vercel.app',   // Current frontend URL
      'https://laundary-pos-zb3p.vercel.app'   // Current backend URL
    ];
    
    // Check if the origin is in our allowed list
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(null, true); // Temporarily allow all origins for debugging
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
  optionsSuccessStatus: 200,
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
};

// Apply CORS middleware to all routes
app.use(cors(corsOptions));

// Handle preflight requests explicitly
app.options('*', cors(corsOptions));

// Simple middleware to ensure CORS headers are set
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.get('Origin') || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});

app.use(express.json({ limit: '10mb' }));

// Use returns router
app.use('/api/returns', returnsRouter);
console.log('Returns router mounted at /api/returns');

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'Tally POS API with MySQL',
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

app.get('/health', async (req, res) => {
  try {
    // Test MySQL connection
    const result = await db.query('SELECT 1 as connected');
    
    if (result.length > 0) {
      res.json({ 
        status: 'healthy', 
        message: 'API is running and database is connected',
        timestamp: new Date().toISOString(),
        database: 'connected'
      });
    } else {
      return res.status(503).json({ 
        status: 'unhealthy', 
        message: 'Database connection failed'
      });
    }
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
    const data = await db.query('SELECT * FROM products');
    
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
    const data = await db.query('SELECT * FROM products WHERE id = ?', [id]);
    
    if (data.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Transform column names to match frontend expectations
    const transformedData = {
      ...data[0],
      ironRate: parseFloat(data[0].ironRate) || 0,
      washAndIronRate: parseFloat(data[0].washAndIronRate) || 0,
      dryCleanRate: parseFloat(data[0].dryCleanRate) || 0
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
    const productData = [
      id,
      name,
      ironRateNum,
      washAndIronRateNum,
      dryCleanRateNum,
      category,
      barcode,
      description || null
    ];
    
    console.log('Attempting to insert product:', productData);
    
    // Insert the product
    const result = await db.query(
      'INSERT INTO products (id, name, ironRate, washAndIronRate, dryCleanRate, category, barcode, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      productData
    );
    
    console.log('Product created successfully:', result);
    
    // Transform response to match frontend expectations
    const responseData = {
      id,
      name,
      ironRate: ironRateNum,
      washAndIronRate: washAndIronRateNum,
      dryCleanRate: dryCleanRateNum,
      category,
      barcode,
      description: description || undefined,
      created_at: new Date().toISOString().slice(0, 19).replace('T', ' '), // Format for MySQL DATETIME
      updated_at: new Date().toISOString().slice(0, 19).replace('T', ' ')  // Format for MySQL DATETIME
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
    description
  };
  
  try {
    const result = await db.query(
      'UPDATE products SET name = ?, ironRate = ?, washAndIronRate = ?, dryCleanRate = ?, category = ?, barcode = ?, description = ? WHERE id = ?',
      [productData.name, productData.ironRate, productData.washAndIronRate, productData.dryCleanRate, productData.category, productData.barcode, productData.description, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Fetch updated product
    const data = await db.query('SELECT * FROM products WHERE id = ?', [id]);
    
    if (data.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(data[0]);
  } catch (err) {
    console.error('Error updating product:', err);
    return res.status(500).json({ error: 'Failed to update product', details: err.message });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    // First, check if the product exists
    const existingProduct = await db.query('SELECT id FROM products WHERE id = ?', [id]);
    
    if (existingProduct.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Check if product is referenced in order_items
    const orderItems = await db.query('SELECT id FROM order_items WHERE product_id = ? LIMIT 1', [id]);
    
    if (orderItems.length > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete product', 
        details: 'This product is referenced in existing orders and cannot be deleted.' 
      });
    }
    
    // Check if product is referenced in return_items
    const returnItems = await db.query('SELECT id FROM return_items WHERE product_id = ? LIMIT 1', [id]);
    
    if (returnItems.length > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete product', 
        details: 'This product is referenced in existing returns and cannot be deleted.' 
      });
    }
    
    // If no references, proceed with deletion
    const result = await db.query('DELETE FROM products WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Product not found' });
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
    const data = await db.query('SELECT * FROM customers');
    res.json(data);
  } catch (err) {
    console.error('Error fetching customers:', err);
    return res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

app.get('/api/customers/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const data = await db.query('SELECT * FROM customers WHERE id = ?', [id]);
    
    if (data.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    res.json(data[0]);
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
    const result = await db.query(
      'INSERT INTO customers (id, name, code, contact_name, phone, email, place, emirate) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [
        id, 
        name, 
        code !== undefined ? code : null,
        contact_name !== undefined ? contact_name : null,
        phone !== undefined ? phone : null,
        email !== undefined ? email : null,
        place !== undefined ? place : null,
        emirate !== undefined ? emirate : null
      ]
    );
    
    // Fetch created customer
    const data = await db.query('SELECT * FROM customers WHERE id = ?', [id]);
    
    res.status(201).json(data[0]);
  } catch (err) {
    console.error('Error creating customer:', err);
    return res.status(500).json({ error: 'Failed to create customer' });
  }
});

// Orders routes
app.get('/api/orders', async (req, res) => {
  try {
    // Get orders with customer information
    const orders = await db.query(`
      SELECT o.*, c.name as customer_name, c.code as customer_code, c.phone as customer_phone 
      FROM orders o 
      LEFT JOIN customers c ON o.customer_id = c.id 
      ORDER BY o.created_at DESC
    `);
    
    // For each order, get its items with product information
    const ordersWithItems = await Promise.all(orders.map(async (order) => {
      const items = await db.query(`
        SELECT oi.*, p.name as product_name, p.ironRate, p.washAndIronRate, p.dryCleanRate, p.category, p.description, p.barcode
        FROM order_items oi
        LEFT JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ?
      `, [order.id]);
      
      return { ...order, items };
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
    const orders = await db.query(`
      SELECT o.*, c.name as customer_name, c.code as customer_code, c.phone as customer_phone 
      FROM orders o 
      LEFT JOIN customers c ON o.customer_id = c.id 
      WHERE o.id = ?
    `, [id]);
    
    if (orders.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    const order = orders[0];
    
    // Get order items with product information
    const items = await db.query(`
      SELECT oi.*, p.name as product_name, p.ironRate, p.washAndIronRate, p.dryCleanRate
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `, [id]);
    
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
    // Insert order, ensuring undefined values are converted to null for the database
    const result = await db.query(
      'INSERT INTO orders (id, customer_id, subtotal, discount, tax, total, payment_method, cash_amount, card_amount, status, delivery_status, payment_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        id, 
        customer_id, 
        subtotal, 
        discount, 
        tax, 
        total, 
        payment_method, 
        cash_amount !== undefined ? cash_amount : null, 
        card_amount !== undefined ? card_amount : null, 
        status, 
        delivery_status !== undefined ? delivery_status : null, 
        payment_status !== undefined ? payment_status : null
      ]
    );
    
    // Insert order items
    if (items && items.length > 0) {
      for (const item of items) {
        const itemId = item.id || Date.now().toString() + Math.random().toString(36).substr(2, 9);
        await db.query(
          'INSERT INTO order_items (id, order_id, product_id, quantity, discount, subtotal, service) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [
            itemId, 
            id, 
            item.product_id, 
            item.quantity, 
            item.discount, 
            item.subtotal, 
            item.service
          ]
        );
      }
    }
    
    // Fetch created order
    const orders = await db.query('SELECT * FROM orders WHERE id = ?', [id]);
    
    res.status(201).json(orders[0]);
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
    // Update order
    const updateData = [];
    const updateFields = [];
    
    if (customer_id !== undefined) {
      updateFields.push('customer_id = ?');
      updateData.push(customer_id);
    }
    if (subtotal !== undefined) {
      updateFields.push('subtotal = ?');
      updateData.push(subtotal);
    }
    if (discount !== undefined) {
      updateFields.push('discount = ?');
      updateData.push(discount);
    }
    if (tax !== undefined) {
      updateFields.push('tax = ?');
      updateData.push(tax);
    }
    if (total !== undefined) {
      updateFields.push('total = ?');
      updateData.push(total);
    }
    if (payment_method !== undefined) {
      updateFields.push('payment_method = ?');
      updateData.push(payment_method);
    }
    if (cash_amount !== undefined) {
      updateFields.push('cash_amount = ?');
      updateData.push(cash_amount !== undefined ? cash_amount : null);
    }
    if (card_amount !== undefined) {
      updateFields.push('card_amount = ?');
      updateData.push(card_amount !== undefined ? card_amount : null);
    }
    if (status !== undefined) {
      updateFields.push('status = ?');
      updateData.push(status);
    }
    if (delivery_status !== undefined) {
      updateFields.push('delivery_status = ?');
      updateData.push(delivery_status !== undefined ? delivery_status : null);
    }
    if (payment_status !== undefined) {
      updateFields.push('payment_status = ?');
      updateData.push(payment_status !== undefined ? payment_status : null);
    }
    
    // Only update if there's data to update
    if (updateFields.length > 0) {
      updateData.push(id); // Add id for WHERE clause
      const result = await db.query(
        `UPDATE orders SET ${updateFields.join(', ')} WHERE id = ?`,
        updateData
      );
      
      // Check if any rows were updated
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Order not found' });
      }
    }
    
    // Fetch updated order
    const orders = await db.query('SELECT * FROM orders WHERE id = ?', [id]);
    
    if (orders.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json(orders[0]);
  } catch (err) {
    console.error('Error updating order:', err);
    return res.status(500).json({ error: 'Failed to update order: ' + err.message });
  }
});

// Settings routes
app.get('/api/settings', async (req, res) => {
  try {
    const data = await db.query('SELECT * FROM settings LIMIT 1');
    
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
    const result = await db.query(
      'UPDATE settings SET tax_rate = ?, currency = ?, business_name = ?, business_address = ?, business_phone = ?, barcode_scanner_enabled = ? WHERE id = 1',
      [
        tax_rate !== undefined ? tax_rate : null,
        currency !== undefined ? currency : null,
        business_name !== undefined ? business_name : null,
        business_address !== undefined ? business_address : null,
        business_phone !== undefined ? business_phone : null,
        barcode_scanner_enabled !== undefined ? barcode_scanner_enabled : null
      ]
    );
    
    if (result.affectedRows === 0) {
      // If no settings exist, insert new ones
      const insertResult = await db.query(
        'INSERT INTO settings (id, tax_rate, currency, business_name, business_address, business_phone, barcode_scanner_enabled) VALUES (1, ?, ?, ?, ?, ?, ?)',
        [
          tax_rate !== undefined ? tax_rate : null,
          currency !== undefined ? currency : null,
          business_name !== undefined ? business_name : null,
          business_address !== undefined ? business_address : null,
          business_phone !== undefined ? business_phone : null,
          barcode_scanner_enabled !== undefined ? barcode_scanner_enabled : null
        ]
      );
      
      // Fetch created settings
      const data = await db.query('SELECT * FROM settings WHERE id = 1');
      res.json(data[0]);
    } else {
      // Fetch updated settings
      const data = await db.query('SELECT * FROM settings WHERE id = 1');
      res.json(data[0]);
    }
  } catch (err) {
    console.error('Error updating settings:', err);
    return res.status(500).json({ error: 'Failed to update settings' });
  }
});

// Vercel requires us to export the app, not start the server directly
// Only start the server if not running on Vercel
if (!process.env.VERCEL) {
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT} with MySQL database`);
    console.log(`Health check: http://localhost:${PORT}/health`);
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

// Export the app for Vercel
module.exports = app;
