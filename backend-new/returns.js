const express = require('express');
const { supabase } = require('./supabaseClient');
const { generateSequentialId } = require('./utils/idGenerator');

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
    // Generate a sequential return ID with R prefix
    const id = await generateSequentialId('R', 5, {
      query: async (query, params) => {
        const { data, error } = await supabase
          .from('returns')
          .select('id')
          .eq('id', params[0]);
        
        if (error) {
          throw new Error(error.message);
        }
        
        return data;
      }
    });
    console.log('Generated return ID:', id);
    
    // Insert return record
    const returnData = {
      id,
      order_id,
      reason: reason || '',
      refund_amount,
      created_at: new Date().toISOString()
    };
    
    const { data: returnResult, error: returnError } = await supabase
      .from('returns')
      .insert([returnData])
      .select()
      .single();
    
    if (returnError) {
      throw new Error(returnError.message);
    }
    
    console.log('Return record created:', returnData);
    
    // Insert return items
    if (items && items.length > 0) {
      const returnItems = await Promise.all(items.map(async (item) => {
        // Generate a sequential ID for return items with RI prefix
        const itemId = await generateSequentialId('RI', 6, {
          query: async (query, params) => {
            const { data, error } = await supabase
              .from('return_items')
              .select('id')
              .eq('id', params[0]);
            
            if (error) {
              throw new Error(error.message);
            }
            
            return data;
          }
        });
        return {
          id: itemId,
          return_id: id,
          product_id: item.product_id,
          quantity: item.quantity,
          refund_amount: item.refund_amount
        };
      }));
      
      console.log('Creating return items:', returnItems);
      
      // Insert all return items
      const { error: itemsError } = await supabase
        .from('return_items')
        .insert(returnItems);
      
      if (itemsError) {
        console.error('Error creating return items:', itemsError);
        // Try to delete the return record if items creation failed
        try {
          await supabase
            .from('returns')
            .delete()
            .eq('id', id);
        } catch (deleteError) {
          console.error('Error deleting return record after items creation failed:', deleteError);
        }
        return res.status(500).json({ error: 'Failed to create return items: ' + itemsError.message });
      }
    }
    
    // Update order status to "returned" to indicate it has been returned
    try {
      const { data: updateResult, error: updateError } = await supabase
        .from('orders')
        .update({ status: 'returned' })
        .eq('id', order_id)
        .select();
      
      if (updateError) {
        throw new Error(updateError.message);
      }
      
      console.log('Order status updated');
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
    let query = supabase
      .from('returns')
      .select('*')
      .order('created_at', { ascending: false });
    
    // Apply date filtering if provided
    const { from_date, to_date } = req.query;
    
    if (from_date) {
      query = query.gte('created_at', new Date(from_date).toISOString());
    }
    
    if (to_date) {
      const toDate = new Date(to_date);
      toDate.setHours(23, 59, 59, 999);
      query = query.lte('created_at', toDate.toISOString());
    }
    
    const { data: returns, error: returnsError } = await query;
    
    if (returnsError) {
      throw new Error(returnsError.message);
    }
    
    // For each return, get its items with product information
    const returnsWithItems = await Promise.all(returns.map(async (returnRecord) => {
      try {
        // Get return items with product information
        const { data: items, error: itemsError } = await supabase
          .from('return_items')
          .select(`
            *,
            products(name, barcode, ironRate, washAndIronRate, dryCleanRate)
          `)
          .eq('return_id', returnRecord.id);
        
        if (itemsError) {
          throw new Error(itemsError.message);
        }
        
        // Get customer information through order
        const { data: orderCustomer, error: orderError } = await supabase
          .from('orders')
          .select(`
            id,
            customers(name)
          `)
          .eq('id', returnRecord.order_id)
          .single();
        
        if (orderError && orderError.code !== 'PGRST116') {
          throw new Error(orderError.message);
        }
        
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
          ironRate: item.products?.ironRate ? Number(item.products.ironRate) : undefined,
          washAndIronRate: item.products?.washAndIronRate ? Number(item.products.washAndIronRate) : undefined,
          dryCleanRate: item.products?.dryCleanRate ? Number(item.products.dryCleanRate) : undefined,
          product_name: item.products?.name || undefined,
          barcode: item.products?.barcode || undefined
        }));
        
        return {
          ...convertedReturnRecord,
          return_items: convertedItems,
          orders: orderCustomer ? { 
            id: orderCustomer.id, 
            customer_name: orderCustomer.customers?.name || null 
          } : null
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
    const { error: itemsError } = await supabase
      .from('return_items')
      .delete();
    
    if (itemsError) {
      throw new Error(itemsError.message);
    }
    
    // Then delete all returns
    const { error: returnsError } = await supabase
      .from('returns')
      .delete();
    
    if (returnsError) {
      throw new Error(returnsError.message);
    }
    
    console.log('All returns cleared successfully');
    res.json({ message: 'All returns cleared successfully' });
  } catch (err) {
    console.error('Error clearing returns:', err);
    return res.status(500).json({ error: 'Failed to clear returns: ' + err.message });
  }
});

module.exports = router;