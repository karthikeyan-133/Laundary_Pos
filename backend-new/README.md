# Backend Deployment Guide

This directory contains the backend API for the Tally POS application, built with Node.js and Express.

## Local Development Setup

### Prerequisites

1. Node.js (v16 or higher)
2. npm (comes with Node.js)
3. A Supabase account with a project created

### Environment Variables

For local development, copy the `.env.example` file to `.env` and update the values:

```bash
cp .env.example .env
```

Then edit the `.env` file and replace the placeholder values with your actual Supabase credentials:

- `SUPABASE_URL` - Your Supabase project URL (e.g., https://your-project.supabase.co)
- `SUPABASE_KEY` - Your Supabase anon key (found in your Supabase project settings)
- `PORT` - The port for the server (optional, defaults to 3001)

### Installing Dependencies

All dependencies are managed in the root directory. Make sure to install them:

```bash
cd ..
npm install
```

### Running the Server Locally

To run the backend locally:

```bash
cd ..
npm start
```

Or directly from this directory:

```bash
node server.js
```

The server will start on the port specified in your `.env` file (default: 3001).

## Deployment to Vercel

The backend can be deployed to Vercel as a serverless function. When deployed through the root directory's vercel.json configuration, Vercel will automatically handle the deployment of this backend.

### Environment Variables

The following environment variables must be set in your Vercel project:

1. `SUPABASE_URL` - Your Supabase project URL
2. `SUPABASE_KEY` - Your Supabase anon key
3. `PORT` - The port for the server (optional, defaults to 3001)

### Deployment Process

1. Ensure all environment variables are set in Vercel project settings
2. The root vercel.json file will automatically configure the backend deployment
3. All API routes will be available at `/api/*` endpoints

### API Endpoints

- `/api/products` - Product management
- `/api/customers` - Customer management
- `/api/orders` - Order processing
- `/api/settings` - Application settings

### Supabase Integration

The backend connects to a Supabase database using the Supabase JavaScript client. All database operations are performed through Supabase API calls rather than direct SQL queries.