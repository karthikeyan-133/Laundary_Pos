import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

interface Admin {
  id: string;
  username: string;
  email: string;
}

interface AuthContextType {
  admin: Admin | null;
  token: string | null;
  login: (token: string, admin: Admin) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isCheckingAuth: boolean; // Add this to track auth verification
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Determine auth API URL based on environment
const getAuthApiUrl = () => {
  // Check for environment variable first
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/$/, '');
  }
  
  // For Vercel deployments, API is at the same domain
  if (typeof window !== 'undefined') {
    if (window.location.hostname.includes('vercel.app')) {
      return '';
    } else if (window.location.hostname.includes('techzontech.com')) {
      return '';
    } else {
      // For local development - use localhost:3001 (updated from 3005)
      return 'http://localhost:3001';
    }
  }
  return 'http://localhost:3001';
};

const AUTH_API_BASE_URL = getAuthApiUrl();

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true); // Track auth verification

  useEffect(() => {
    const verifyToken = async () => {
      const storedToken = localStorage.getItem('adminToken');
      if (storedToken) {
        try {
          // Construct the verification URL
          const verifyUrl = AUTH_API_BASE_URL ? 
            `${AUTH_API_BASE_URL}/api/auth/verify` : 
            '/api/auth/verify';
          
          // Verify token with backend
          const response = await fetch(verifyUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${storedToken}`
            }
          });

          if (response.ok) {
            const data = await response.json();
            setToken(storedToken);
            setAdmin(data.admin);
          } else {
            // Token is invalid, clear it
            localStorage.removeItem('adminToken');
          }
        } catch (error) {
          console.error('Token verification failed:', error);
          // On network error, we'll assume token is still valid for offline support
          // But you might want to handle this differently based on your needs
          setToken(storedToken);
          // Set a basic admin object since we can't verify
          setAdmin({
            id: '1',
            username: 'admin',
            email: 'admin@example.com'
          });
        }
      }
      setIsCheckingAuth(false);
    };

    verifyToken();
  }, []);

  const login = (newToken: string, adminData: Admin) => {
    setToken(newToken);
    setAdmin(adminData);
    localStorage.setItem('adminToken', newToken);
  };

  const logout = () => {
    setToken(null);
    setAdmin(null);
    localStorage.removeItem('adminToken');
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ admin, token, login, logout, isAuthenticated, isCheckingAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};