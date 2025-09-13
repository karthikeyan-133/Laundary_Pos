// Test file for Vercel deployment
module.exports = (req, res) => {
  res.json({ 
    message: 'Tally POS Backend API is running on Vercel',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
};