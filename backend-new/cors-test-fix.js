// Simple CORS test script to verify our fixes
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3005;

// CORS configuration
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
      'https://pos-laundry-tau.vercel.app',  // Production frontend
      'https://billing-pos-yjh9.vercel.app',   // Another possible frontend
      'https://pos-laundry-backend.vercel.app'   // Current backend URL
    ];
    
    // Check if the origin is in our allowed list
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
  optionsSuccessStatus: 200
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Add explicit CORS headers middleware
app.use((req, res, next) => {
  // Get the origin from the request
  const origin = req.get('Origin');
  
  // Set CORS headers
  res.header('Access-Control-Allow-Origin', origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Max-Age', '86400');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  next();
});

// Handle all OPTIONS requests explicitly
app.options('*', (req, res) => {
  // Get the origin from the request
  const origin = req.get('Origin');
  
  // Set CORS headers for preflight requests
  res.header('Access-Control-Allow-Origin', origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Max-Age', '86400');
  res.status(200).end();
});

// Test endpoints
app.get('/api/test', (req, res) => {
  res.json({ message: "CORS working 🚀" });
});

app.get('/api/settings', (req, res) => {
  res.json({ 
    tax_rate: 0.05,
    currency: "AED",
    business_name: "Test Business",
    business_address: "Test Address",
    business_phone: "123-456-7890",
    barcode_scanner_enabled: true
  });
});

app.get('/api/products', (req, res) => {
  res.json([
    {
      id: "1",
      name: "Test Product",
      ironRate: 10.0,
      washAndIronRate: 15.0,
      dryCleanRate: 20.0,
      category: "Clothing",
      barcode: "123456789012",
      description: "Test product description"
    }
  ]);
});

app.get('/api/customers', (req, res) => {
  res.json([
    {
      id: "1",
      name: "Test Customer",
      code: "C001",
      contact_name: "John Doe",
      phone: "123-456-7890",
      email: "john@example.com",
      place: "Dubai",
      emirate: "Dubai"
    }
  ]);
});

app.get('/api/orders', (req, res) => {
  res.json([
    {
      id: "1",
      customer_id: "1",
      subtotal: 100.0,
      discount: 10.0,
      tax: 5.0,
      total: 95.0,
      payment_method: "cash",
      status: "completed",
      created_at: new Date().toISOString()
    }
  ]);
});

app.get('/api/returns', (req, res) => {
  res.json([
    {
      id: "1",
      order_id: "1",
      reason: "Damaged item",
      refund_amount: 50.0,
      created_at: new Date().toISOString()
    }
  ]);
});

app.listen(PORT, () => {
  console.log(`CORS test server running on port ${PORT}`);
  console.log('Test endpoints:');
  console.log(`- http://localhost:${PORT}/api/test`);
  console.log(`- http://localhost:${PORT}/api/settings`);
  console.log(`- http://localhost:${PORT}/api/products`);
  console.log(`- http://localhost:${PORT}/api/customers`);
  console.log(`- http://localhost:${PORT}/api/orders`);
  console.log(`- http://localhost:${PORT}/api/returns`);
});