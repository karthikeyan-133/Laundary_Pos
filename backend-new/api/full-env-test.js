// Vercel serverless function for full environment and database test
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
    // Log all environment variables (filter out sensitive ones)
    const safeEnvVars = {};
    Object.keys(process.env).forEach(key => {
      if (!key.includes('KEY') && !key.includes('SECRET') && !key.includes('PASSWORD')) {
        safeEnvVars[key] = process.env[key];
      }
    });
    
    console.log('=== FULL ENVIRONMENT TEST ===');
    console.log('Environment variables (safe):', safeEnvVars);
    console.log('VERCEL:', process.env.VERCEL ? 'YES' : 'NO');
    console.log('VERCEL_ENV:', process.env.VERCEL_ENV || 'NOT SET');
    console.log('VERCEL_URL:', process.env.VERCEL_URL || 'NOT SET');
    
    // Check if required environment variables are set
    const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_NAME'];
    const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
    
    const envTestResult = {
      message: 'Full Environment Test',
      environment: {
        VERCEL: process.env.VERCEL ? 'YES' : 'NO',
        VERCEL_ENV: process.env.VERCEL_ENV || 'NOT SET',
        VERCEL_URL: process.env.VERCEL_URL || 'NOT SET',
        NODE_ENV: process.env.NODE_ENV || 'NOT SET'
      },
      database: {
        DB_HOST: process.env.DB_HOST ? 'SET' : 'NOT SET',
        DB_USER: process.env.DB_USER ? 'SET' : 'NOT SET',
        DB_NAME: process.env.DB_NAME ? 'SET' : 'NOT SET',
        DB_PORT: process.env.DB_PORT || '3306'
      },
      missingEnvVars,
      status: missingEnvVars.length === 0 ? 'ENVIRONMENT_OK' : 'MISSING_ENVIRONMENT_VARIABLES'
    };
    
    // If environment variables are set, try database connection
    if (missingEnvVars.length === 0) {
      try {
        console.log('Attempting database connection...');
        const connection = await mysql.createConnection({
          host: process.env.DB_HOST,
          user: process.env.DB_USER,
          password: process.env.DB_PASSWORD,
          database: process.env.DB_NAME,
          port: process.env.DB_PORT || 3306,
        });
        
        console.log('Database connection established');
        
        // Test query
        const [rows] = await connection.execute('SELECT 1 as connected');
        
        console.log('Database test query successful');
        
        await connection.end();
        
        envTestResult.database.connection = 'SUCCESS';
        envTestResult.database.testQuery = rows.length > 0 ? 'SUCCESS' : 'FAILED';
      } catch (dbErr) {
        console.error('Database connection error:', dbErr);
        envTestResult.database.connection = 'FAILED';
        envTestResult.database.error = dbErr.message;
      }
    }
    
    res.status(200).json(envTestResult);
  } catch (err) {
    console.error('Full environment test error:', err);
    res.status(200).json({ 
      message: 'Full Environment Test Failed',
      error: err.message,
      status: 'ERROR'
    });
  }
};