// Vercel serverless function for products API
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
      // GET all products
      const data = await db.query('SELECT * FROM products');
      
      // Transform column names to match frontend expectations
      const transformedData = data.map(product => ({
        ...product,
        ironRate: parseFloat(product.ironRate) || 0,
        washAndIronRate: parseFloat(product.washAndIronRate) || 0,
        dryCleanRate: parseFloat(product.dryCleanRate) || 0
      }));
      
      res.status(200).json(transformedData);
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (err) {
    console.error('Error in products API:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};