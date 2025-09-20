// Vercel serverless function for customers API
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
    
    // Create database connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'Pos_system',
      port: process.env.DB_PORT || 3306,
    });
    
    if (req.method === 'GET') {
      // GET all customers
      const [rows] = await connection.execute('SELECT * FROM customers');
      res.status(200).json(rows);
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (err) {
    console.error('Error in customers API:', err);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};