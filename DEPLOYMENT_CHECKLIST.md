# Tally POS System - Vercel Deployment Checklist

## Prerequisites
- [ ] Ensure all environment variables are set in Vercel dashboard
- [ ] Verify database connection settings for cPanel hosting
- [ ] Confirm CORS configuration allows frontend domain

## Backend Deployment (laundary-pos-zb3p.vercel.app)

### Environment Variables
- [ ] DB_HOST=localhost (for cPanel)
- [ ] DB_USER=Pos_User
- [ ] DB_PASSWORD=Welc0me$27
- [ ] DB_NAME=Pos_system
- [ ] DB_PORT=3306
- [ ] JWT_SECRET=tally_pos_jwt_secret_key_2025

### CORS Configuration
- [ ] Allowed origins include:
  - https://laundary-pos.vercel.app (frontend)
  - https://laundary-pos-zb3p.vercel.app (backend)
  - http://localhost:5173 (local development)

## Frontend Deployment (laundary-pos.vercel.app)

### Environment Variables
- [ ] VITE_API_URL=https://laundary-pos-zb3p.vercel.app

### Build Settings
- [ ] Build Command: `npm run build`
- [ ] Output Directory: `dist`
- [ ] Install Command: `npm install`

## Database Setup

### Tables Creation
1. [ ] Run create_tables.sql script in phpMyAdmin
2. [ ] Verify all tables are created:
   - products
   - customers
   - orders
   - order_items
   - returns
   - return_items
   - settings
   - id_sequences

### Sample Data
- [ ] Verify sample products are inserted
- [ ] Verify default settings are inserted
- [ ] Verify walk-in customer is created

## Testing After Deployment

### API Endpoints
- [ ] https://laundary-pos-zb3p.vercel.app/api/test-server (should return success)
- [ ] https://laundary-pos-zb3p.vercel.app/api/products (should return products)
- [ ] https://laundary-pos-zb3p.vercel.app/api/customers (should return customers)
- [ ] https://laundary-pos-zb3p.vercel.app/api/settings (should return settings)

### Frontend Functionality
- [ ] Login page should work
- [ ] Dashboard should load data
- [ ] Product management should work
- [ ] Order creation should work
- [ ] Return processing should work
- [ ] Reports should display correctly

## Troubleshooting

### Common Issues
1. **CORS Errors**:
   - Check that frontend domain is in allowed origins
   - Verify VITE_API_URL is set correctly
   - Ensure credentials are included in requests

2. **Database Connection Errors**:
   - Verify DB_HOST is set to localhost for cPanel
   - Check database credentials
   - Confirm database and tables exist

3. **API Route Issues**:
   - Check vercel.json routing configuration
   - Verify server.js exports the app correctly
   - Ensure all required dependencies are in package.json

### Useful Commands
```bash
# Test database connection locally
npm run test-db

# Test database connection for Vercel environment
npm run test-db-vercel

# Run development server locally
npm run dev

# Build frontend
cd frontend && npm run build
```

## Post-Deployment Verification

- [ ] Verify health check endpoint: https://laundary-pos-zb3p.vercel.app/health
- [ ] Test CORS with: https://laundary-pos-zb3p.vercel.app/api/cors-check
- [ ] Confirm admin login works with default credentials
- [ ] Verify all CRUD operations for products, customers, and orders