# Backend (MySQL Version)

This is the backend server for the Tally POS system, now configured to use MySQL instead of Supabase.

## Prerequisites

1. Node.js installed
2. MySQL Server installed (MySQL Workbench recommended)
3. MySQL client tools

## Setup Instructions

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure database**:
   - Update the `.env` file with your MySQL database credentials
   - Make sure your MySQL server is running

3. **Initialize the database**:
   ```bash
   npm run init-db
   ```
   Or manually run the `init_db.sql` file in MySQL Workbench

4. **Create tables**:
   ```bash
   npm run create-tables
   ```

5. **Start the server**:
   ```bash
   npm start
   ```
   Or for development with auto-restart:
   ```bash
   npm run dev
   ```

## Database Configuration

The application uses the following environment variables (set in `.env`):
- `DB_HOST`: Database host (default: localhost)
- `DB_USER`: Database user (default: root)
- `DB_PASSWORD`: Database password (default: empty)
- `DB_NAME`: Database name (default: Pos_system)
- `DB_PORT`: Database port (default: 3306)
- `PORT`: Server port (default: 3001)

## API Endpoints

- `GET /` - Health check
- `GET /health` - Detailed health check
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `GET /api/customers` - Get all customers
- `GET /api/customers/:id` - Get customer by ID
- `POST /api/customers` - Create customer
- `GET /api/orders` - Get all orders
- `GET /api/orders/:id` - Get order by ID
- `POST /api/orders` - Create order
- `PUT /api/orders/:id` - Update order
- `GET /api/settings` - Get application settings
- `PUT /api/settings` - Update application settings

## Testing

- `npm run test-connection` - Test database connection
- `npm run test-api` - Test API endpoints