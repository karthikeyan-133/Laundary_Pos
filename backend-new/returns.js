const express = require('express');
const supabase = require('./supabaseClient');

const router = express.Router();

console.log('Returns router initialized');

// Create a return record
router.post('/', async (req, res) => {
  console.log('POST /api/returns called');
  const { order_id, items, reason, refund_amount } = req.body;
  
  try {
    // Generate a unique ID for the return
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    
    // Insert return record
    const { data: returnData, error: returnError } = await supabase
      .from('returns')
      .insert([
        { 
          id,
          order_id,
          reason,
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
    
    // Insert return items
    if (items && items.length > 0) {
      const returnItems = items.map(item => ({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        return_id: id,
        product_id: item.product_id,
        quantity: item.quantity,
        refund_amount: item.refund_amount
      }));
      
      const { data: itemsData, error: itemsError } = await supabase
        .from('return_items')
        .insert(returnItems);
      
      if (itemsError) {
        console.error('Error creating return items:', itemsError);
        return res.status(500).json({ error: 'Failed to create return items: ' + itemsError.message });
      }
    }
    
    // Update product stock levels
    for (const item of items) {
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
      }
    }
    
    res.status(201).json(returnData);
  } catch (err) {
    console.error('Error processing return:', err);
    return res.status(500).json({ error: 'Failed to process return: ' + err.message });
  }
});

// Get all returns
router.get('/', async (req, res) => {
  console.log('GET /api/returns called');
  try {
    const { data, error } = await supabase
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
    
    if (error) {
      console.error('Error fetching returns:', error);
      return res.status(500).json({ error: 'Failed to fetch returns' });
    }
    
    res.json(data);
  } catch (err) {
    console.error('Error fetching returns:', err);
    return res.status(500).json({ error: 'Failed to fetch returns' });
  }
});

console.log('Returns routes registered');

module.exports = router;