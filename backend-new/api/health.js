// Vercel serverless function for health check
const mysql = require('mysql2/promise');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Simple health check endpoint
module.exports = (req, res) => {
  res.status(200).json({ 
    status: 'OK',
    message: 'Health check endpoint is working',
    timestamp: new Date().toISOString()
  });
};
