// Vercel serverless function for returns API
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
    
    // Log database connection info (without sensitive data)
    console.log('Connected to database:', {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      database: process.env.DB_NAME || 'Pos_system',
      port: process.env.DB_PORT || 3306,
    });
    
    if (req.method === 'GET') {
      console.log('GET request received for /api/returns');
      
      try {
        // Check if tables exist
        const [tables] = await connection.execute("SHOW TABLES LIKE 'returns'");
        const [itemsTables] = await connection.execute("SHOW TABLES LIKE 'return_items'");
        
        console.log('Tables check:', { returnsTable: tables.length, returnItemsTable: itemsTables.length });
        
        if (tables.length === 0 || itemsTables.length === 0) {
          console.error('Required tables do not exist');
          return res.status(500).json({ error: 'Database tables not found' });
        }
        
        // GET all returns with order and customer information
        const [returns] = await connection.execute(`
          SELECT r.*, o.total as order_total, c.name as customer_name, c.phone as customer_phone
          FROM returns r
          LEFT JOIN orders o ON r.order_id = o.id
          LEFT JOIN customers c ON o.customer_id = c.id
          ORDER BY r.created_at DESC
        `);
        
        console.log('Returns fetched:', returns.length);
        
        // For each return, get its items with product information
        const returnsWithItems = await Promise.all(returns.map(async (returnRecord) => {
          const [items] = await connection.execute(`
            SELECT ri.*, p.name as product_name, p.barcode, p.ironRate, p.washAndIronRate, p.dryCleanRate
            FROM return_items ri
            LEFT JOIN products p ON ri.product_id = p.id
            WHERE ri.return_id = ?
          `, [returnRecord.id]);
          
          console.log('Items for return', returnRecord.id, ':', items.length);
          
          // Convert numeric fields to proper JavaScript numbers
          const convertedItems = items.map(item => ({
            ...item,
            quantity: Number(item.quantity) || 0,
            refund_amount: Number(item.refund_amount) || 0,
            ironRate: item.ironRate ? Number(item.ironRate) : undefined,
            washAndIronRate: item.washAndIronRate ? Number(item.washAndIronRate) : undefined,
            dryCleanRate: item.dryCleanRate ? Number(item.dryCleanRate) : undefined
          }));
          
          return {
            ...returnRecord,
            refund_amount: Number(returnRecord.refund_amount) || 0,
            return_items: convertedItems
          };
        }));
        
        console.log('Final returns with items:', returnsWithItems.length);
        res.status(200).json(returnsWithItems);
      } catch (queryError) {
        console.error('Database query error:', queryError);
        res.status(500).json({ error: 'Database query error: ' + queryError.message });
      }
    } else if (req.method === 'POST') {
      const { order_id, items, reason, refund_amount } = req.body;
      
      console.log('POST request received for /api/returns', { order_id, itemsCount: items?.length, reason, refund_amount });
      
      // Validate required fields
      if (!order_id) {
        return res.status(400).json({ error: 'order_id is required' });
      }
      
      if (!items || !Array.isArray(items)) {
        return res.status(400).json({ error: 'items array is required' });
      }
      
      if (typeof refund_amount !== 'number') {
        return res.status(400).json({ error: 'refund_amount is required and must be a number' });
      }
      
      // Validate items array
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (!item.product_id) {
          return res.status(400).json({ error: `Missing product_id in item at position ${i + 1}` });
        }
        if (typeof item.quantity !== 'number') {
          return res.status(400).json({ error: `Invalid quantity in item at position ${i + 1}` });
        }
        if (typeof item.refund_amount !== 'number') {
          return res.status(400).json({ error: `Invalid refund_amount in item at position ${i + 1}` });
        }
      }
      
      // Generate a unique ID for the return
      const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
      
      // Insert return record
      const returnData = {
        id,
        order_id,
        reason: reason || '',
        refund_amount,
        created_at: new Date().toISOString().slice(0, 19).replace('T', ' ') // Format for MySQL DATETIME
      };
      
      await connection.execute(
        'INSERT INTO returns (id, order_id, reason, refund_amount, created_at) VALUES (?, ?, ?, ?, ?)',
        [returnData.id, returnData.order_id, returnData.reason, returnData.refund_amount, returnData.created_at]
      );
      
      // Insert return items
      if (items && items.length > 0) {
        for (const item of items) {
          const itemId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
          await connection.execute(
            'INSERT INTO return_items (id, return_id, product_id, quantity, refund_amount) VALUES (?, ?, ?, ?, ?)',
            [itemId, id, item.product_id, item.quantity, item.refund_amount]
          );
        }
      }
      
      // Update order status to "returned"
      await connection.execute(
        'UPDATE orders SET status = ? WHERE id = ?',
        ['returned', order_id]
      );
      
      res.status(201).json(returnData);
    } else if (req.method === 'DELETE' && req.url === '/clear') {
      console.log('DELETE request received for /api/returns/clear');
      
      // Clear all returns
      await connection.execute('DELETE FROM return_items');
      await connection.execute('DELETE FROM returns');
      
      res.status(200).json({ message: 'All returns cleared successfully' });
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (err) {
    console.error('Error in returns API:', err);
    res.status(500).json({ error: 'Internal server error: ' + err.message });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};