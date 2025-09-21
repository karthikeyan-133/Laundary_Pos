const express = require('express');
const db = require('./mysqlDb');

const router = express.Router();

console.log('Returns router initialized');

// Create a return record
router.post('/', async (req, res) => {
  console.log('POST /api/returns called with body:', req.body);
  const { order_id, items, reason, refund_amount } = req.body;
  
  // Validate required fields
  if (!order_id) {
    console.log('Missing order_id in request');
    return res.status(400).json({ error: 'order_id is required' });
  }
  
  if (!items || !Array.isArray(items)) {
    console.log('Missing or invalid items in request');
    return res.status(400).json({ error: 'items array is required' });
  }
  
  if (typeof refund_amount !== 'number') {
    console.log('Missing or invalid refund_amount in request');
    return res.status(400).json({ error: 'refund_amount is required and must be a number' });
  }
  
  // Validate items array
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (!item.product_id) {
      console.log('Missing product_id in item at index:', i, item);
      return res.status(400).json({ error: `Missing product_id in item at position ${i + 1}` });
    }
    if (typeof item.quantity !== 'number') {
      console.log('Invalid quantity in item at index:', i, item);
      return res.status(400).json({ error: `Invalid quantity in item at position ${i + 1}` });
    }
    if (typeof item.refund_amount !== 'number') {
      console.log('Invalid refund_amount in item at index:', i, item);
      return res.status(400).json({ error: `Invalid refund_amount in item at position ${i + 1}` });
    }
  }
  
  try {
    // Generate a unique ID for the return
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    console.log('Generated return ID:', id);
    
    // Insert return record
    const returnData = {
      id,
      order_id,
      reason: reason || '',
      refund_amount,
      created_at: new Date().toISOString().slice(0, 19).replace('T', ' ') // Format for MySQL DATETIME
    };
    
    const result = await db.query(
      'INSERT INTO returns (id, order_id, reason, refund_amount, created_at) VALUES (?, ?, ?, ?, ?)',
      [returnData.id, returnData.order_id, returnData.reason, returnData.refund_amount, returnData.created_at]
    );
    
    console.log('Return record created:', returnData);
    
    // Insert return items
    if (items && items.length > 0) {
      const returnItems = items.map(item => ({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        return_id: id,
        product_id: item.product_id,
        quantity: item.quantity,
        refund_amount: item.refund_amount
      }));
      
      console.log('Creating return items:', returnItems);
      
      // Insert all return items
      for (const item of returnItems) {
        try {
          await db.query(
            'INSERT INTO return_items (id, return_id, product_id, quantity, refund_amount) VALUES (?, ?, ?, ?, ?)',
            [item.id, item.return_id, item.product_id, item.quantity, item.refund_amount]
          );
        } catch (itemError) {
          console.error('Error creating return item:', itemError);
          // Try to delete the return record if items creation failed
          try {
            await db.query('DELETE FROM returns WHERE id = ?', [id]);
          } catch (deleteError) {
            console.error('Error deleting return record after items creation failed:', deleteError);
          }
          return res.status(500).json({ error: 'Failed to create return items: ' + itemError.message });
        }
      }
    }
    
    // Update order status to "returned" to indicate it has been returned
    try {
      const updateResult = await db.query(
        'UPDATE orders SET status = ? WHERE id = ?',
        ['returned', order_id]
      );
      
      console.log('Order status updated, affected rows:', updateResult.affectedRows);
    } catch (err) {
      console.error('Error updating order status:', err);
      return res.status(500).json({ error: 'Failed to update order status: ' + err.message });
    }
    
    res.status(201).json(returnData);
  } catch (err) {
    console.error('Error processing return:', err);
    return res.status(500).json({ error: 'Failed to process return: ' + err.message });
  }
});

// Get all returns
router.get('/', async (req, res) => {
  console.log('GET /api/returns called with query params:', req.query);
  try {
    // Get returns with related data
    let query = 'SELECT * FROM returns ORDER BY created_at DESC';
    let queryParams = [];
    
    // Apply date filtering if provided
    const { from_date, to_date } = req.query;
    
    if (from_date || to_date) {
      query = 'SELECT * FROM returns WHERE created_at >= ? AND created_at <= ? ORDER BY created_at DESC';
      
      // Set time ranges
      const fromDate = from_date ? new Date(from_date) : new Date(0);
      fromDate.setHours(0, 0, 0, 0);
      
      const toDate = to_date ? new Date(to_date) : new Date();
      toDate.setHours(23, 59, 59, 999);
      
      queryParams = [fromDate.toISOString(), toDate.toISOString()];
    }
    
    const returns = await db.query(query, queryParams);
    
    // For each return, get its items with product information
    const returnsWithItems = await Promise.all(returns.map(async (returnRecord) => {
      try {
        // Get return items with product information
        const items = await db.query(`
          SELECT ri.*, p.name as product_name, p.barcode, p.ironRate, p.washAndIronRate, p.dryCleanRate
          FROM return_items ri
          LEFT JOIN products p ON ri.product_id = p.id
          WHERE ri.return_id = ?
        `, [returnRecord.id]);
        
        // Get customer information through order
        const orderCustomer = await db.query(`
          SELECT o.id, c.name as customer_name
          FROM orders o
          LEFT JOIN customers c ON o.customer_id = c.id
          WHERE o.id = ?
        `, [returnRecord.order_id]);
        
        // Convert numeric fields to proper JavaScript numbers
        const convertedReturnRecord = {
          ...returnRecord,
          refund_amount: Number(returnRecord.refund_amount) || 0
        };
        
        // Convert numeric fields in return items
        const convertedItems = items.map(item => ({
          ...item,
          quantity: Number(item.quantity) || 0,
          refund_amount: Number(item.refund_amount) || 0,
          ironRate: item.ironRate ? Number(item.ironRate) : undefined,
          washAndIronRate: item.washAndIronRate ? Number(item.washAndIronRate) : undefined,
          dryCleanRate: item.dryCleanRate ? Number(item.dryCleanRate) : undefined
        }));
        
        return {
          ...convertedReturnRecord,
          return_items: convertedItems,
          orders: orderCustomer.length > 0 ? orderCustomer[0] : null
        };
      } catch (err) {
        console.error('Error processing return record:', err);
        // Return the return record without items if there's an error
        return {
          ...returnRecord,
          refund_amount: Number(returnRecord.refund_amount) || 0,
          return_items: [],
          orders: null
        };
      }
    }));
    
    console.log('Returns fetched:', returnsWithItems);
    res.json(returnsWithItems);
  } catch (err) {
    console.error('Error fetching returns:', err);
    return res.status(500).json({ error: 'Failed to fetch returns: ' + err.message });
  }
});

console.log('Returns routes registered');

// Clear all returns
router.delete('/clear', async (req, res) => {
  console.log('DELETE /api/returns/clear called');
  try {
    // First delete all return items
    const itemsResult = await db.query('DELETE FROM return_items');
    
    // Then delete all returns
    const returnsResult = await db.query('DELETE FROM returns');
    
    console.log('All returns cleared successfully');
    res.json({ message: 'All returns cleared successfully' });
  } catch (err) {
    console.error('Error clearing returns:', err);
    return res.status(500).json({ error: 'Failed to clear returns: ' + err.message });
  }
});

module.exports = router;