import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('cms_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('cms_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('cms_token');
      if (storedToken) {
        try {
          const userData = await authService.getCurrentUser();
          setUser(userData);
          localStorage.setItem('cms_user', JSON.stringify(userData));
        } catch (error) {
          console.error('Session validation failed:', error);
          authService.logout();
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const data = await authService.login(email, password);
    setUser(data);
    setToken(data.token);
    return data;
  };

  const register = async (userData) => {
    const data = await authService.register(userData);
    setUser(data);
    setToken(data.token);
    return data;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setToken(null);
  };

  const updateProfileState = (updatedUser) => {
    const merged = { ...user, ...updatedUser };
    setUser(merged);
    localStorage.setItem('cms_user', JSON.stringify(merged));
  };

  const role = user?.role;
  const isAdmin = role === 'ADMIN';
  const isEmployee = role === 'EMPLOYEE';
  const isCitizen = role === 'CITIZEN';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateProfileState,
        isAuthenticated: !!token && !!user,
        isAdmin,
        isEmployee,
        isCitizen,
        role,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
