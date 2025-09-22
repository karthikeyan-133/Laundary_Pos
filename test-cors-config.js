// Simple script to test CORS configuration
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration
app.use((req, res, next) => {
  const origin = req.get('Origin');
  console.log('Request from origin:', origin);
  
  // Allow all origins for testing
  res.header('Access-Control-Allow-Origin', origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  next();
});

app.use(express.json());

// Test endpoints
app.get('/', (req, res) => {
  res.json({ message: 'CORS Test Server', timestamp: new Date().toISOString() });
});

app.get('/api/test', (req, res) => {
  res.json({ message: 'API Test Successful', origin: req.get('Origin') });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`CORS Test Server running on port ${PORT}`);
  console.log(`Test endpoint: http://localhost:${PORT}/api/test`);
});