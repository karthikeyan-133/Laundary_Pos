// Simple CORS test server
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3006;

// Enhanced CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    console.log('Received request from origin:', origin);
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // List of allowed origins
    const allowedOrigins = [
      'http://localhost:8080',
      'http://localhost:3000',
      'http://localhost:3004',
      'http://127.0.0.1:8080',
      'https://pos-laundry-tau.vercel.app',
      'https://pos-laundry-backend.vercel.app'
    ];
    
    // Check if origin is in allowed list or is a Vercel app
    if (allowedOrigins.includes(origin) || origin.includes('.vercel.app')) {
      console.log('Allowing origin:', origin);
      return callback(null, true);
    }
    
    // Allow any origin in development
    console.log('Allowing origin in development:', origin);
    return callback(null, true);
  },
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Additional CORS headers
app.use((req, res, next) => {
  const origin = req.get('Origin');
  res.setHeader('Access-Control-Allow-Origin', origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  next();
});

app.options('*', (req, res) => {
  const origin = req.get('Origin');
  res.setHeader('Access-Control-Allow-Origin', origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400');
  res.status(200).end();
});

app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'CORS test successful', 
    timestamp: new Date().toISOString(),
    origin: req.get('Origin')
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`CORS test server running on http://localhost:${PORT}`);
  console.log('Test endpoint: http://localhost:3006/api/test');
});