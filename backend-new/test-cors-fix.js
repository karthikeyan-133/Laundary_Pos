// Simple test script to verify CORS configuration
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3005;

// CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    console.log('Origin:', origin);
    // Allow all origins for testing
    callback(null, true);
  },
  credentials: true,
  optionsSuccessStatus: 200
}));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  next();
});

app.options('*', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400');
  res.status(200).end();
});

app.get('/api/test', (req, res) => {
  res.json({ message: 'CORS test successful', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`CORS test server running on port ${PORT}`);
});