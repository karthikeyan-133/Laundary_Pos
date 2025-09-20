// Vercel serverless function for orders API
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
      // GET all orders with customer information
      const orders = await db.query(`
        SELECT o.*, c.name as customer_name, c.code as customer_code, c.phone as customer_phone 
        FROM orders o 
        LEFT JOIN customers c ON o.customer_id = c.id 
        ORDER BY o.created_at DESC
      `);
      
      // For each order, get its items with product information
      const ordersWithItems = await Promise.all(orders.map(async (order) => {
        const items = await db.query(`
          SELECT oi.*, p.name as product_name, p.ironRate, p.washAndIronRate, p.dryCleanRate, p.category, p.description, p.barcode
          FROM order_items oi
          LEFT JOIN products p ON oi.product_id = p.id
          WHERE oi.order_id = ?
        `, [order.id]);
        
        return { ...order, items };
      }));
      
      res.status(200).json(ordersWithItems);
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (err) {
    console.error('Error in orders API:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};