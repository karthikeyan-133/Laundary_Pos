// Vercel serverless function for detailed database connection test
const mysql = require('mysql2/promise');

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
    console.log('=== DETAILED DATABASE CONNECTION TEST ===');
    
    // Check environment variables
    const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_NAME'];
    const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
    
    if (missingEnvVars.length > 0) {
      console.log('Missing environment variables:', missingEnvVars);
      return res.status(200).json({
        status: 'error',
        message: 'Missing required environment variables',
        missing: missingEnvVars
      });
    }
    
    console.log('Environment variables present');
    console.log('DB_HOST:', process.env.DB_HOST);
    console.log('DB_USER:', process.env.DB_USER);
    console.log('DB_NAME:', process.env.DB_NAME);
    console.log('DB_PORT:', process.env.DB_PORT || 3306);
    
    // Test different connection configurations
    const connectionConfigs = [
      {
        name: 'Standard Connection',
        config: {
          host: process.env.DB_HOST,
          user: process.env.DB_USER,
          password: process.env.DB_PASSWORD,
          database: process.env.DB_NAME,
          port: process.env.DB_PORT || 3306,
        }
      },
      {
        name: 'Connection with SSL Disabled',
        config: {
          host: process.env.DB_HOST,
          user: process.env.DB_USER,
          password: process.env.DB_PASSWORD,
          database: process.env.DB_NAME,
          port: process.env.DB_PORT || 3306,
          ssl: false
        }
      }
    ];
    
    const results = [];
    
    for (const connectionConfig of connectionConfigs) {
      try {
        console.log(`Testing ${connectionConfig.name}...`);
        const connection = await mysql.createConnection(connectionConfig.config);
        console.log(`${connectionConfig.name} successful`);
        
        // Test a simple query
        const [rows] = await connection.execute('SELECT 1 as test');
        console.log(`${connectionConfig.name} query test successful`);
        
        await connection.end();
        
        results.push({
          name: connectionConfig.name,
          status: 'SUCCESS',
          queryTest: rows.length > 0 ? 'PASSED' : 'FAILED'
        });
      } catch (connErr) {
        console.error(`${connectionConfig.name} failed:`, connErr.message);
        results.push({
          name: connectionConfig.name,
          status: 'FAILED',
          error: connErr.message,
          code: connErr.code,
          errno: connErr.errno,
          sqlState: connErr.sqlState
        });
      }
    }
    
    res.status(200).json({
      message: 'Database Connection Test Results',
      environment: {
        DB_HOST: process.env.DB_HOST,
        DB_USER: process.env.DB_USER,
        DB_NAME: process.env.DB_NAME,
        DB_PORT: process.env.DB_PORT || 3306
      },
      results,
      overallStatus: results.some(r => r.status === 'SUCCESS') ? 'PARTIAL_SUCCESS' : 'ALL_FAILED'
    });
  } catch (err) {
    console.error('Database connection test error:', err);
    res.status(200).json({
      message: 'Database Connection Test Failed',
      error: err.message,
      stack: err.stack
    });
  }
};