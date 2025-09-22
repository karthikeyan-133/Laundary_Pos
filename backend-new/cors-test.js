// Simple CORS test script
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3006;

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    console.log('Received request from origin:', origin);
    
    // List of allowed origins
    const allowedOrigins = [
      'http://localhost:5173',
      'https://laundary-pos.vercel.app',
      'https://laundary-pos-zb3p.vercel.app'
    ];
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      console.log('No origin provided, allowing request');
      return callback(null, true);
    }
    
    // Check if the origin is in our allowed list
    if (allowedOrigins.indexOf(origin) !== -1) {
      console.log('Origin is allowed');
      callback(null, true);
    } else {
      console.log('Origin is not allowed');
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
  optionsSuccessStatus: 200,
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());

app.get('/test', (req, res) => {
  res.json({ message: 'CORS test successful' });
});

app.listen(PORT, () => {
  console.log(`CORS test server running on port ${PORT}`);
});