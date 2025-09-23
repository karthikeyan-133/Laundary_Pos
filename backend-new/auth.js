const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { supabase } = require('./supabaseClient');

const router = express.Router();

// Secret key for JWT (from environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'tally_pos_secret_key';

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  // Handle OPTIONS requests - don't require authentication for preflight
  if (req.method === 'OPTIONS') {
    const origin = req.get('Origin');
    if (origin) {
      res.header('Access-Control-Allow-Origin', origin);
    }
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Auth-Token');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    return res.status(200).end();
  }
  
  // Set CORS headers for authentication responses
  const origin = req.get('Origin');
  if (origin) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Auth-Token');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, admin) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.admin = admin;
    next();
  });
};

// Signup endpoint - for initial admin setup
router.post('/signup', async (req, res) => {
  try {
    const { username, email, password, business_name, business_address, business_phone, tax_rate, currency } = req.body;

    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required' });
    }

    // Check if admin already exists
    const { data: settings, error: selectError } = await supabase
      .from('settings')
      .select('admin_username, admin_email')
      .eq('id', 1)
      .single();
    
    if (selectError && selectError.code !== 'PGRST116') {
      console.error('Database error when checking for existing admin:', selectError);
      throw new Error(`Database error: ${selectError.message}`);
    }
    
    if (settings && (settings.admin_username || settings.admin_email)) {
      return res.status(400).json({ error: 'Admin already exists. Please use signin.' });
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Prepare settings data
    const settingsData = {
      id: 1, // Always use id=1 for the settings record
      admin_username: username,
      admin_email: email,
      admin_password_hash: passwordHash,
      business_name: business_name || 'TallyPrime Café',
      business_address: business_address || 'Shop 123, Marina Mall, Dubai Marina, Dubai, UAE',
      business_phone: business_phone || '+971 4 123 4567',
      tax_rate: tax_rate !== undefined ? parseFloat(tax_rate) : 5.00,
      currency: currency || 'AED'
    };

    // Try to update existing settings or insert new ones
    let updateResult, updateError;
    
    if (settings) {
      // Settings record exists, update it
      console.log('Updating existing settings record');
      ({ data: updateResult, error: updateError } = await supabase
        .from('settings')
        .update(settingsData)
        .eq('id', 1)
        .select()
        .single());
    } else {
      // No settings record exists, insert new one
      console.log('Inserting new settings record');
      ({ data: updateResult, error: updateError } = await supabase
        .from('settings')
        .insert([settingsData])
        .select()
        .single());
    }
    
    if (updateError) {
      console.error('Database error when saving settings:', updateError);
      throw new Error(`Failed to save settings: ${updateError.message}`);
    }

    // Create JWT token
    const token = jwt.sign({ id: 1, username, email }, JWT_SECRET, { expiresIn: '24h' });

    res.status(201).json({
      message: 'Admin created successfully',
      token,
      admin: { id: 1, username, email }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: error.message || 'Internal server error during signup' });
  }
});

// Signin endpoint
router.post('/signin', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Find admin in settings table
    const { data: settings, error: selectError } = await supabase
      .from('settings')
      .select('admin_username, admin_email, admin_password_hash')
      .eq('id', 1)
      .single();
    
    if (selectError && selectError.code !== 'PGRST116') {
      console.error('Database error when fetching admin:', selectError);
      throw new Error(`Database error: ${selectError.message}`);
    }
    
    if (!settings || !settings.admin_username) {
      return res.status(401).json({ error: 'Admin not found. Please signup first.' });
    }

    // Verify username
    if (settings.admin_username !== username) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, settings.admin_password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Create JWT token
    const token = jwt.sign({ id: 1, username: settings.admin_username, email: settings.admin_email }, JWT_SECRET, { expiresIn: '24h' });

    res.json({
      message: 'Signin successful',
      token,
      admin: { id: 1, username: settings.admin_username, email: settings.admin_email }
    });
  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({ error: error.message || 'Internal server error during signin' });
  }
});

// Token verification endpoint
router.post('/verify', authenticateToken, (req, res) => {
  // If we reach here, the token is valid
  res.json({
    message: 'Token is valid',
    admin: req.admin
  });
});

module.exports = { router, authenticateToken };