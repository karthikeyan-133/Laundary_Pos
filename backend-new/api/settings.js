// Vercel serverless function for settings API
const db = require('../mysqlDb');

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
    if (req.method === 'GET') {
      // GET settings
      const data = await db.query('SELECT * FROM settings LIMIT 1');
      
      if (data.length === 0) {
        res.status(404).json({ error: 'Settings not found' });
      } else {
        res.status(200).json(data[0]);
      }
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (err) {
    console.error('Error in settings API:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};