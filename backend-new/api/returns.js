// Vercel serverless function for returns API
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
      // GET all returns with order and customer information
      const returns = await db.query(`
        SELECT r.*, o.total as order_total, c.name as customer_name, c.phone as customer_phone
        FROM returns r
        LEFT JOIN orders o ON r.order_id = o.id
        LEFT JOIN customers c ON o.customer_id = c.id
        ORDER BY r.created_at DESC
      `);
      
      // For each return, get its items with product information
      const returnsWithItems = await Promise.all(returns.map(async (returnRecord) => {
        const items = await db.query(`
          SELECT ri.*, p.name as product_name, p.category, p.description, p.barcode
          FROM return_items ri
          LEFT JOIN products p ON ri.product_id = p.id
          WHERE ri.return_id = ?
        `, [returnRecord.id]);
        
        return { ...returnRecord, items };
      }));
      
      res.status(200).json(returnsWithItems);
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (err) {
    console.error('Error in returns API:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};