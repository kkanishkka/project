// src/contexts/AuthContext.jsx
// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import RevisionModal from '../components/RevisionModal';
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
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [dueNotes, setDueNotes] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('thinkstash_token');
    const storedUser = localStorage.getItem('thinkstash_user');
    if (token && storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        // Ensure parsed is an object we can use
        if (parsed && typeof parsed === 'object') {
          setUser(parsed);
        } else {
          // Stored value is malformed; clean it up
          localStorage.removeItem('thinkstash_user');
        }
      } catch (e) {
        // Invalid JSON in localStorage can happen if something wrote "undefined" or partial data
        console.error('Invalid thinkstash_user in localStorage, clearing it:', e);
        localStorage.removeItem('thinkstash_user');
      }
      checkForDueRevisions(token);
    }
    setLoading(false);
  }, []);

  const checkForDueRevisions = async (token) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/notes`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const notes = await response.json();
        const today = new Date().toISOString().split('T')[0];
        const dueNotes = notes.filter(note =>
          note.revisionDate && note.revisionDate.split('T')[0] <= today
        );
        if (dueNotes.length > 0) {
          setDueNotes(dueNotes);
          setShowRevisionModal(true);
        }
      }
    } catch (error) {
      console.error('Error checking for due revisions:', error);
    }
  };

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

    // Check for due revisions after login
    await checkForDueRevisions(data.token);

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
      {showRevisionModal && (
        <RevisionModal
          notes={dueNotes}
          onClose={() => setShowRevisionModal(false)}
        />
      )}
    </AuthContext.Provider>
  );
};
