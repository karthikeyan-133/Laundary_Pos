const express = require('express');
const supabase = require('./supabaseClient');

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
    const { data: returnData, error: returnError } = await supabase
      .from('returns')
      .insert([
        { 
          id,
          order_id,
          reason: reason || '',
          refund_amount,
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single();
    
    if (returnError) {
      console.error('Error creating return record:', returnError);
      return res.status(500).json({ error: 'Failed to create return record: ' + returnError.message });
    }
    
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
      
      const { data: itemsData, error: itemsError } = await supabase
        .from('return_items')
        .insert(returnItems);
      
      if (itemsError) {
        console.error('Error creating return items:', itemsError);
        // Try to delete the return record if items creation failed
        try {
          await supabase.from('returns').delete().eq('id', id);
        } catch (deleteError) {
          console.error('Error deleting return record after items creation failed:', deleteError);
        }
        return res.status(500).json({ error: 'Failed to create return items: ' + itemsError.message });
      }
      
      console.log('Return items created:', itemsData);
    }
    
    // Update product stock levels
    for (const item of items) {
      try {
        // Validate item
        if (!item.product_id || typeof item.quantity !== 'number') {
          console.log('Invalid item data:', item);
          continue;
        }
        
        // Get current product stock
        const { data: productData, error: productError } = await supabase
          .from('products')
          .select('stock')
          .eq('id', item.product_id)
          .single();
        
        if (productError) {
          console.error('Error fetching product:', productError);
          continue;
        }
        
        console.log('Current product data:', productData);
        
        // Update stock (increase by returned quantity)
        const newStock = productData.stock + item.quantity;
        const { data: updatedProduct, error: updateError } = await supabase
          .from('products')
          .update({ stock: newStock })
          .eq('id', item.product_id)
          .select()
          .single();
        
        if (updateError) {
          console.error('Error updating product stock:', updateError);
        } else {
          console.log('Product stock updated:', updatedProduct);
        }
      } catch (err) {
        console.error('Error processing product stock update:', err);
      }
    }
    
    // Update order status to "returned" to indicate it has been returned
    try {
      const { data: updatedOrder, error: orderError } = await supabase
        .from('orders')
        .update({ status: 'returned' })
        .eq('id', order_id)
        .select()
        .single();
      
      if (orderError) {
        console.error('Error updating order status:', orderError);
        return res.status(500).json({ error: 'Failed to update order status: ' + orderError.message });
      } else {
        console.log('Order status updated:', updatedOrder);
      }
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
    let query = supabase
      .from('returns')
      .select(`
        *,
        return_items(
          *,
          products(name, sku)
        ),
        orders(
          id,
          customers(name)
        )
      `)
      .order('created_at', { ascending: false });
    
    // Apply date filtering if provided
    const { from_date, to_date } = req.query;
    
    if (from_date) {
      // Set time to start of day for from_date
      const fromDate = new Date(from_date);
      fromDate.setHours(0, 0, 0, 0);
      query = query.gte('created_at', fromDate.toISOString());
    }
    
    if (to_date) {
      // Set time to end of day for to_date
      const toDate = new Date(to_date);
      toDate.setHours(23, 59, 59, 999);
      query = query.lte('created_at', toDate.toISOString());
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching returns:', error);
      return res.status(500).json({ error: 'Failed to fetch returns: ' + error.message });
    }
    
    console.log('Returns fetched:', data);
    res.json(data);
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
    const { error: itemsError } = await supabase
      .from('return_items')
      .delete()
      .gt('id', 0); // Delete all items
    
    if (itemsError) {
      console.error('Error clearing return items:', itemsError);
      return res.status(500).json({ error: 'Failed to clear return items: ' + itemsError.message });
    }
    
    // Then delete all returns
    const { error: returnsError } = await supabase
      .from('returns')
      .delete()
      .gt('id', 0); // Delete all returns
    
    if (returnsError) {
      console.error('Error clearing returns:', returnsError);
      return res.status(500).json({ error: 'Failed to clear returns: ' + returnsError.message });
    }
    
    console.log('All returns cleared successfully');
    res.json({ message: 'All returns cleared successfully' });
  } catch (err) {
    console.error('Error clearing returns:', err);
    return res.status(500).json({ error: 'Failed to clear returns: ' + err.message });
  }
});

module.exports = router;