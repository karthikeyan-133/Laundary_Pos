// Vercel serverless function to test environment variables
module.exports = (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  // Log environment variables (without sensitive data)
  const envInfo = {
    DB_HOST: process.env.DB_HOST ? 'SET' : 'NOT SET',
    DB_USER: process.env.DB_USER ? 'SET' : 'NOT SET',
    DB_NAME: process.env.DB_NAME ? 'SET' : 'NOT SET',
    DB_PORT: process.env.DB_PORT || 'NOT SET',
    VERCEL: process.env.VERCEL ? 'YES' : 'NO',
    NODE_ENV: process.env.NODE_ENV || 'NOT SET'
  };
  
  console.log('Environment variables:', envInfo);
  
  // Check if required environment variables are set
  const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_NAME'];
  const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
  
  res.status(200).json({ 
    message: 'Environment variables check',
    envInfo,
    missingEnvVars,
    status: missingEnvVars.length === 0 ? 'OK' : 'MISSING VARIABLES'
  });
};