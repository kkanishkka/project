import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored user data on app load
    const storedUser = localStorage.getItem('thinkstash_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (email, password) => {
    // Simulate login - in real app, this would be an API call
    const userData = {
      id: Date.now(),
      email,
      name: email.split('@')[0],
      joinedAt: new Date().toISOString(),
    };
    setUser(userData);
    localStorage.setItem('thinkstash_user', JSON.stringify(userData));
    return Promise.resolve(userData);
  };

  const signup = (name, email, password) => {
    // Simulate signup - in real app, this would be an API call
    const userData = {
      id: Date.now(),
      email,
      name,
      joinedAt: new Date().toISOString(),
    };
    setUser(userData);
    localStorage.setItem('thinkstash_user', JSON.stringify(userData));
    return Promise.resolve(userData);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('thinkstash_user');
  };

  const value = {
    user,
    login,
    signup,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};