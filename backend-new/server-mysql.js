const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

// Check if we're running on Vercel
const isVercel = !!process.env.VERCEL;

// Load environment variables only in local development
if (!isVercel) {
  const envPath = path.resolve(__dirname, '.env');
  dotenv.config({ path: envPath });
}

// Import MySQL database interface
const db = require('./mysqlDb');

// Import returns router
const returnsRouter = require('./returns');

console.log('Returns router loaded:', !!returnsRouter);

const app = express();

// Use Vercel's PORT or default to 3003 (to avoid conflicts)
const PORT = process.env.PORT || 3003;

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allow localhost for development
    if (origin.indexOf('localhost') !== -1 || origin.indexOf('127.0.0.1') !== -1) {
      return callback(null, true);
    }
    
    // Allow Vercel deployments
    if (origin.indexOf('.vercel.app') !== -1) {
      return callback(null, true);
    }