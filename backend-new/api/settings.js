// Vercel serverless function for settings API
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
      // GET settings
      const [rows] = await connection.execute('SELECT * FROM settings LIMIT 1');
      
      if (rows.length === 0) {
        res.status(404).json({ error: 'Settings not found' });
      } else {
        res.status(200).json(rows[0]);
      }
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (err) {
    console.error('Error in settings API:', err);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};