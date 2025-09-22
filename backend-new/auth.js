const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('./mysqlDb');

const router = express.Router();

// Secret key for JWT (from environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'tally_pos_secret_key';

// Signup endpoint - for initial admin setup
router.post('/signup', async (req, res) => {
  try {
    const { username, email, password, business_name, business_address, business_phone, tax_rate, currency } = req.body;

    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required' });
    }

    // Check if admin already exists
    const settings = await query('SELECT admin_username, admin_email FROM settings WHERE id = 1');
    if (settings.length > 0 && (settings[0].admin_username || settings[0].admin_email)) {
      return res.status(400).json({ error: 'Admin already exists. Please use signin.' });
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Update settings table with admin credentials and business settings
    await query(
      `UPDATE settings SET 
        admin_username = ?, 
        admin_email = ?, 
        admin_password_hash = ?,
        business_name = ?,
        business_address = ?,
        business_phone = ?,
        tax_rate = ?,
        currency = ?
      WHERE id = 1`,
      [
        username, 
        email, 
        passwordHash,
        business_name || 'TallyPrime Café',
        business_address || 'Shop 123, Marina Mall, Dubai Marina, Dubai, UAE',
        business_phone || '+971 4 123 4567',
        tax_rate || 5.00,
        currency || 'AED'
      ]
    );

    // Create JWT token
    const token = jwt.sign({ id: 1, username, email }, JWT_SECRET, { expiresIn: '24h' });

    res.status(201).json({
      message: 'Admin created successfully',
      token,
      admin: { id: 1, username, email }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
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
    const settings = await query('SELECT admin_username, admin_email, admin_password_hash FROM settings WHERE id = 1');
    if (settings.length === 0 || !settings[0].admin_username) {
      return res.status(401).json({ error: 'Admin not found. Please signup first.' });
    }

    const admin = settings[0];

    // Verify username
    if (admin.admin_username !== username) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, admin.admin_password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Create JWT token
    const token = jwt.sign({ id: 1, username: admin.admin_username, email: admin.admin_email }, JWT_SECRET, { expiresIn: '24h' });

    res.json({
      message: 'Signin successful',
      token,
      admin: { id: 1, username: admin.admin_username, email: admin.admin_email }
    });
  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
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

module.exports = { router, authenticateToken };