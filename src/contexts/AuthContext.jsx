// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom'; // optional if you want to redirect

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  // const navigate = useNavigate(); // optional
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('thinkstash_token');
    const storedUser = localStorage.getItem('thinkstash_user');
    if (token && storedUser) setUser(JSON.parse(storedUser));
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Login failed');

    localStorage.setItem('thinkstash_token', data.token);
    localStorage.setItem('thinkstash_user', JSON.stringify(data.user));
    setUser(data.user);

    // 🔔 notify data layer that auth changed (so it can refetch notes)
    window.dispatchEvent(new Event('thinkstash-auth-changed'));
    return data.user;
  };

  const signup = async (name, email, password) => {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Signup failed');

    localStorage.setItem('thinkstash_token', data.token);
    localStorage.setItem('thinkstash_user', JSON.stringify(data.user));
    setUser(data.user);

    // 🔔 same as login
    window.dispatchEvent(new Event('thinkstash-auth-changed'));
    return data.user;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('thinkstash_token');
    localStorage.removeItem('thinkstash_user');

    // 🧹 tell DataContext to clear notes immediately
    window.dispatchEvent(new Event('thinkstash-logout'));

    // navigate('/login'); // optional redirect
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
