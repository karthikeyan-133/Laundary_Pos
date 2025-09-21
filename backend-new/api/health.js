// Vercel serverless function for health check
const mysql = require('mysql2/promise');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

module.exports = async (req, res) => {
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
    console.log('Health check - Environment variables:', {
      DB_HOST: process.env.DB_HOST ? 'SET' : 'NOT SET',
      DB_USER: process.env.DB_USER ? 'SET' : 'NOT SET',
      DB_NAME: process.env.DB_NAME ? 'SET' : 'NOT SET',
      DB_PORT: process.env.DB_PORT || 3306,
    });
    
    // Check if required environment variables are set
    const missingEnvVars = [];
    if (!process.env.DB_HOST) missingEnvVars.push('DB_HOST');
    if (!process.env.DB_USER) missingEnvVars.push('DB_USER');
    if (!process.env.DB_NAME) missingEnvVars.push('DB_NAME');
    
    if (missingEnvVars.length > 0) {
      console.warn('Missing environment variables:', missingEnvVars);
      return res.status(200).json({ 
        status: 'warning',
        message: 'Missing environment variables',
        missing: missingEnvVars,
        note: 'This is expected in Vercel environment where variables are set in dashboard'
      });
    }
    
    // Try to create database connection
    let connection;
    try {
      connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'Pos_system',
        port: process.env.DB_PORT || 3306,
        connectTimeout: 5000 // 5 seconds timeout
      });
      
      console.log('Database connection established');
      
      // Test query
      const [rows] = await connection.execute('SELECT 1 as connected');
      
      console.log('Database test query successful');
      
      await connection.end();
      
      res.status(200).json({ 
        status: 'healthy',
        message: 'API is running and database is connected',
        database: rows.length > 0 ? 'connected' : 'disconnected'
      });
    } catch (dbError) {
      console.error('Database connection error:', dbError.message);
      
      if (connection) {
        await connection.end();
      }
      
      res.status(200).json({ 
        status: 'warning',
        message: 'API is running but database connection failed',
        database: 'disconnected',
        error: dbError.message
      });
    }
  } catch (err) {
    console.error('Health check error:', err);
    res.status(500).json({ 
      status: 'error',
      error: 'Health check failed',
      message: err.message
    });
  }
};