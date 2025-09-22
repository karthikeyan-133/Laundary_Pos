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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Check if there's a token in localStorage on initial load
    const storedToken = localStorage.getItem('adminToken');
    if (storedToken) {
      setToken(storedToken);
      
      // In a real app, you would verify the token with the backend
      // For now, we'll just set a basic admin object
      // In a production app, you should decode the JWT to get admin info
      setAdmin({
        id: '1',
        username: 'admin',
        email: 'admin@example.com'
      });
    }
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
    <AuthContext.Provider value={{ admin, token, login, logout, isAuthenticated }}>
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