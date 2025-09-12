# Tally POS System with MySQL Database

This is a modern Point of Sale (POS) system built with React, TypeScript, and TailwindCSS for the frontend, and Node.js with Express for the backend. It uses MySQL as the database.

## Prerequisites

- Node.js (v14 or higher)
- MySQL Server (for local development) OR cPanel hosting account (for production)
- npm or yarn

## Setup Instructions

### 1. Database Setup Options

#### Option A: Local MySQL Database (Development)

1. Create a MySQL database:
```sql
CREATE DATABASE Pos_system;
```

2. Create a dedicated user for the POS system:
```sql
CREATE USER 'pos_user'@'localhost' IDENTIFIED BY 'Welc0me$27';
GRANT ALL PRIVILEGES ON Pos_system.* TO 'pos_user'@'localhost';
FLUSH PRIVILEGES;
```

3. Update the database configuration in `backend/.env`:
```
DB_HOST=localhost
DB_USER=pos_user
DB_PASSWORD=Welc0me$27
DB_NAME=Pos_system
PORT=3001
```

4. Run the database schema:
```bash
mysql -u pos_user -p Pos_system < backend/init_db.sql
```

#### Option B: cPanel Database (Production/Hosting)

1. Log in to your cPanel account
2. Navigate to "MySQL Databases" under the "Databases" section
3. Create a new database named `Pos_system` (or your preferred name)
4. Create a new database user with a secure password
5. Assign the user to your database and grant all privileges
6. Update the database configuration in `backend/.env` with your cPanel credentials:
```
DB_HOST=your_cpanel_hostname
DB_USER=your_cpanel_username
DB_PASSWORD=your_secure_password
DB_NAME=your_cpanel_database_name
DB_PORT=3306
DB_SSL=false
PORT=3001
```
7. If connecting from a remote server, add your server's IP to the "Remote MySQL" whitelist in cPanel

For detailed cPanel setup instructions, see [CPANEL_DATABASE_SETUP.md](CPANEL_DATABASE_SETUP.md)

### 2. Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Initialize the database (run only once):
```bash
# For local development:
npm run init-db

# For cPanel hosting (after setting up database through cPanel interface):
npm run init-db
```

4. Start the backend server:
```bash
npm run dev
```

The backend server will run on http://localhost:3001

### 3. Frontend Setup

1. Navigate to the frontend directory:
```bash
cd modern-pos-spark
```

2. Install dependencies:
```bash
npm install
```

3. Start the frontend development server:
```bash
npm run dev
```

The frontend will run on http://localhost:5173

## Project Structure

```
.
├── backend/
│   ├── db.js              # Database connection
│   ├── init_db.sql        # Database initialization script
│   ├── create_user.sql    # User creation script
│   ├── server.js          # Express server
│   ├── .env              # Environment variables
│   └── package.json      # Backend dependencies
├── modern-pos-spark/
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── hooks/        # Custom hooks
│   │   ├── services/     # API services
│   │   ├── types/        # TypeScript types
│   │   └── pages/        # Page components
│   └── package.json      # Frontend dependencies
```

## Features

- Product management (add, edit, delete)
- Customer management
- Sales transactions
- Order history
- Reporting dashboard
- Home delivery management
- Return processing
- Hold/unhold carts
- Split payment options
- Barcode scanning support

## API Endpoints

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get a specific product
- `POST /api/products` - Create a new product
- `PUT /api/products/:id` - Update a product
- `DELETE /api/products/:id` - Delete a product

### Customers
- `GET /api/customers` - Get all customers
- `GET /api/customers/:id` - Get a specific customer
- `POST /api/customers` - Create a new customer

### Orders
- `GET /api/orders` - Get all orders
- `GET /api/orders/:id` - Get a specific order
- `POST /api/orders` - Create a new order

### Settings
- `GET /api/settings` - Get POS settings
- `PUT /api/settings` - Update POS settings

## Database Schema

The database consists of the following tables:

1. `products` - Stores product information
2. `customers` - Stores customer information
3. `orders` - Stores order information
4. `order_items` - Stores individual items in orders
5. `settings` - Stores POS configuration settings

## Development

To run the application in development mode:

1. Start the backend server:
```bash
cd backend
npm run dev
```

2. Start the frontend development server:
```bash
cd modern-pos-spark
npm run dev
```

## Building for Production

To build the frontend for production:

```bash
cd modern-pos-spark
npm run build
```

The built files will be in the `dist/` directory.