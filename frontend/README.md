# Tally POS Frontend

## Project Overview

This is the frontend for the Tally POS system, built with React, TypeScript, and Vite.

## Setup Instructions

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment variables**:
   Create a `.env` file based on `.env.example` and set `VITE_API_URL` to match your backend URL (typically `http://localhost:3004` for local development)

3. **Start the development server**:
   ```bash
   npm run dev
   ```

   The frontend will run on port 5173 by default.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Project Structure

- `src/components/` - React components
- `src/services/` - API service functions
- `src/hooks/` - Custom React hooks
- `src/types/` - TypeScript type definitions
- `src/utils/` - Utility functions

## Connecting to Backend

The frontend connects to the backend API through the URL specified in the `VITE_API_URL` environment variable. For local development, this should be set to `http://localhost:3004`.

## Troubleshooting

### CORS Issues

If you encounter CORS errors:

1. Ensure the backend CORS configuration allows your frontend origin (typically `http://localhost:5173`)
2. Check that both servers are running
3. Verify the `VITE_API_URL` in the frontend `.env` file matches the backend URL

### API Connection Issues

1. Verify the backend server is running
2. Check that the `VITE_API_URL` is correctly set in the `.env` file
3. Ensure there are no firewall or network issues blocking the connection