const { supabase } = require('./supabaseClient');

// Export helper functions that match the MySQL interface
module.exports = {
  // Query function that mimics the MySQL query interface
  query: async (table, operation, params = {}) => {
    try {
      let query = supabase.from(table);
      
      switch (operation) {
        case 'select':
          return await query.select(params.columns || '*');
          
        case 'insert':
          return await query.insert(params.data);
          
        case 'update':
          return await query.update(params.data).match(params.match || {});
          
        case 'delete':
          return await query.delete().match(params.match || {});
          
        default:
          throw new Error(`Unsupported operation: ${operation}`);
      }
    } catch (error) {
      console.error('Database operation error:', error);
      throw error;
    }
  },
  
  // Specific helper functions for common operations
  select: async (table, columns = '*', match = {}) => {
    let query = supabase.from(table).select(columns);
    
    // Apply filters if provided
    if (Object.keys(match).length > 0) {
      query = query.match(match);
    }
    
    const { data, error } = await query;
    
    if (error) {
      throw new Error(`Error selecting from ${table}: ${error.message}`);
    }
    
    return data;
  },
  
  insert: async (table, data) => {
    const { data: result, error } = await supabase.from(table).insert(data);
    
    if (error) {
      throw new Error(`Error inserting into ${table}: ${error.message}`);
    }
    
    return result;
  },
  
  update: async (table, data, match) => {
    const { data: result, error } = await supabase.from(table).update(data).match(match);
    
    if (error) {
      throw new Error(`Error updating ${table}: ${error.message}`);
    }
    
    return result;
  },
  
  delete: async (table, match) => {
    const { data: result, error } = await supabase.from(table).delete().match(match);
    
    if (error) {
      throw new Error(`Error deleting from ${table}: ${error.message}`);
    }
    
    return result;
  },
  
  // Transaction-like function (Supabase doesn't support true transactions)
  transaction: async (operations) => {
    try {
      const results = [];
      for (const operation of operations) {
        const result = await module.exports.query(
          operation.table,
          operation.operation,
          operation.params
        );
        results.push(result);
      }
      return results;
    } catch (error) {
      throw new Error(`Transaction failed: ${error.message}`);
    }
  },
  
  // Retry function for database operations
  retryQuery: async (fn, maxRetries = 3, delay = 2000) => {
    let lastError;
    
    for (let i = 0; i <= maxRetries; i++) {
      try {
        const result = await fn();
        if (i > 0) {
          console.log(`✅ Database operation succeeded after ${i} retry attempts`);
        }
        return result;
      } catch (error) {
        lastError = error;
        if (i < maxRetries) {
          console.log(`⚠️ Database operation failed (attempt ${i + 1}/${maxRetries + 1}):`, error.message);
          console.log(`⏳ Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          // Exponential backoff
          delay *= 2;
        }
      }
    }
    
    console.error('❌ Database operation failed after all retry attempts:', lastError);
    throw lastError;
  }
};