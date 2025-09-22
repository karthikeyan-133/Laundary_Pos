// CORS Debug Script
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3005;

// Custom CORS middleware
app.use((req, res, next) => {
  const origin = req.get('Origin');
  console.log('=== CORS DEBUG ===');
  console.log('Request method:', req.method);
  console.log('Request origin:', origin);
  console.log('Request headers:', req.headers);
  
  // List of allowed origins
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
  
  // Set CORS headers
  if (origin && allowedOrigins.includes(origin)) {
    console.log('Setting CORS headers for allowed origin:', origin);
    res.header('Access-Control-Allow-Origin', origin);
  } else if (!origin) {
    console.log('Setting CORS headers for no origin (allow all)');
    res.header('Access-Control-Allow-Origin', '*');
  } else {
    console.log('Origin not allowed, but still setting headers for debugging');
    res.header('Access-Control-Allow-Origin', origin || '*');
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Auth-Token');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Max-Age', '86400');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS request');
    res.status(200).end();
    return;
  }
  
  next();
});

app.use(express.json());

// Test endpoints
app.get('/', (req, res) => {
  res.json({ message: 'CORS Debug Server Running' });
});

app.get('/api/test', (req, res) => {
  res.json({ message: 'API Test Successful' });
});

app.get('/api/cors-check', (req, res) => {
  res.json({ cors: 'ok' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`CORS Debug Server running on port ${PORT}`);
  console.log(`Test endpoint: http://localhost:${PORT}/api/cors-check`);
});