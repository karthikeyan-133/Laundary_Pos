// Vercel serverless function to test database connection
const mysql = require('mysql2/promise');

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  try {
    // Log environment variables (without sensitive data)
    console.log('Environment variables:');
    console.log('DB_HOST:', process.env.DB_HOST ? 'SET' : 'NOT SET');
    console.log('DB_USER:', process.env.DB_USER ? 'SET' : 'NOT SET');
    console.log('DB_NAME:', process.env.DB_NAME ? 'SET' : 'NOT SET');
    console.log('DB_PORT:', process.env.DB_PORT || 'NOT SET');
    
    // Check if required environment variables are set
    if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_NAME) {
      return res.status(200).json({ 
        status: 'error',
        message: 'Missing required environment variables',
        missing: {
          DB_HOST: !process.env.DB_HOST,
          DB_USER: !process.env.DB_USER,
          DB_NAME: !process.env.DB_NAME
        }
      });
    }
    
    // Try to create database connection
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT || 3306,
    });
    
    console.log('Database connection established');
    
    // Test query
    const [rows] = await connection.execute('SELECT 1 as connected');
    
    console.log('Database test query successful');
    
    await connection.end();
    
    res.status(200).json({ 
      status: 'success',
      message: 'Database connection successful',
      connected: rows.length > 0
    });
  } catch (err) {
    console.error('Database connection error:', err);
    res.status(200).json({ 
      status: 'error',
      message: 'Database connection failed',
      error: err.message
    });
  }
};