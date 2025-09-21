// Vercel serverless function for routing debug
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
  
  // Log request details
  console.log('=== ROUTING DEBUG INFO ===');
  console.log('Request URL:', req.url);
  console.log('Request Method:', req.method);
  console.log('Request Headers:', req.headers);
  console.log('Query Parameters:', req.query);
  console.log('VERCEL Environment:', process.env.VERCEL ? 'YES' : 'NO');
  console.log('VERCEL_URL:', process.env.VERCEL_URL || 'NOT SET');
  console.log('NOW_REGION:', process.env.NOW_REGION || 'NOT SET');
  
  res.status(200).json({ 
    message: 'Routing Debug Information',
    request: {
      url: req.url,
      method: req.method,
      headers: req.headers,
      query: req.query
    },
    environment: {
      VERCEL: process.env.VERCEL ? 'YES' : 'NO',
      VERCEL_URL: process.env.VERCEL_URL || 'NOT SET',
      NOW_REGION: process.env.NOW_REGION || 'NOT SET'
    },
    timestamp: new Date().toISOString(),
    status: 'ROUTING_DEBUG_SUCCESS'
  });
};