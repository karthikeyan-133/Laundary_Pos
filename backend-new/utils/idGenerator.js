/**
 * Utility functions for generating sequential IDs with specific formats
 */

// In-memory storage for sequence numbers (in production, this should be stored in the database)
const sequenceCounters = new Map();

/**
 * Generate a sequential ID with the specified prefix and padding
 * @param {string} prefix - The prefix for the ID (e.g., 'TRX', 'C', 'S')
 * @param {number} padding - The number of digits to pad with zeros (default: 6)
 * @param {Map} counters - Optional counters map (for testing)
 * @returns {string} The formatted sequential ID
 */
async function generateSequentialId(prefix, padding = 6, db = null) {
  try {
    let nextNumber = 1;
    
    if (db) {
      // Use database to track sequence numbers for persistence
      const result = await db.query(
        'SELECT counter_value FROM id_sequences WHERE prefix = ? FOR UPDATE',
        [prefix]
      );
      
      if (result.length > 0) {
        nextNumber = result[0].counter_value + 1;
        await db.query(
          'UPDATE id_sequences SET counter_value = ? WHERE prefix = ?',
          [nextNumber, prefix]
        );
      } else {
        // Initialize the sequence if it doesn't exist
        await db.query(
          'INSERT INTO id_sequences (prefix, counter_value) VALUES (?, ?)',
          [prefix, nextNumber]
        );
      }
    } else {
      // Fallback to in-memory storage (not recommended for production)
      if (sequenceCounters.has(prefix)) {
        nextNumber = sequenceCounters.get(prefix) + 1;
      }
      sequenceCounters.set(prefix, nextNumber);
    }
    
    // Format the ID with zero padding
    const paddedNumber = nextNumber.toString().padStart(padding, '0');
    return `${prefix}${paddedNumber}`;
  } catch (error) {
    console.error('Error generating sequential ID:', error);
    throw error;
  }
}

/**
 * Initialize the sequence counters from the database
 * @param {Object} db - Database connection
 */
async function initializeSequences(db) {
  try {
    const results = await db.query('SELECT prefix, counter_value FROM id_sequences');
    for (const row of results) {
      sequenceCounters.set(row.prefix, row.counter_value);
    }
  } catch (error) {
    console.error('Error initializing sequences:', error);
  }
}

module.exports = {
  generateSequentialId,
  initializeSequences
};