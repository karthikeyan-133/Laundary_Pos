// Vercel serverless function to test database connection
const mysql = require('mysql2/promise');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

module.exports = async (req, res) => {
  let connection;
  
  try {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }
    
    // Log environment variables (without sensitive data)
    console.log('Environment variables:', {
      DB_HOST: process.env.DB_HOST || 'localhost',
      DB_USER: process.env.DB_USER || 'root',
      DB_NAME: process.env.DB_NAME || 'Pos_system',
      DB_PORT: process.env.DB_PORT || 3306,
    });
    
    if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_NAME) {
      console.error('Missing environment variables');
      return res.status(500).json({ 
        error: 'Missing environment variables',
        message: 'Please set DB_HOST, DB_USER, and DB_NAME in Vercel environment variables'
      });
    }
    
    // Create database connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'Pos_system',
      port: process.env.DB_PORT || 3306,
    });
    
    console.log('Connected to database successfully');
    
    // Test query
    const [rows] = await connection.execute('SELECT 1 as connected');
    
    console.log('Database test query result:', rows);
    
    res.status(200).json({ 
      message: 'Database connection successful',
      connected: rows.length > 0
    });
  } catch (err) {
    console.error('Database connection error:', err);
    res.status(500).json({ 
      error: 'Database connection failed',
      message: err.message
    });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};