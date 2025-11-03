import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback
} from 'react';

const DataContext = createContext();

export const useData = () => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within a DataProvider');
  return ctx;
};

export const DataProvider = ({ children }) => {
  const [notes, setNotes] = useState([]);
  const [flashcards, setFlashcards] = useState([]);

  const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const getToken = () => localStorage.getItem('thinkstash_token');
  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getToken()}`,
  });

  const fetchNotes = async () => {
    const token = getToken();
    if (!token) { setNotes([]); return; }
    try {
      const res = await fetch(`${API}/api/notes`, { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        setNotes(data);
      } else {
        setNotes([]);
      }
    } catch (err) {
      console.error('Failed to fetch notes:', err);
    }
  };

  useEffect(() => {
    fetchNotes();
    
    // Listen for storage events (cross-tab)
    const onStorage = (e) => {
      if (e.key === 'thinkstash_token') fetchNotes();
    };
    window.addEventListener('storage', onStorage);
    
    // Listen for auth changes (same tab) - dispatched by AuthContext
    const onAuthChanged = () => {
      fetchNotes();
    };
    window.addEventListener('thinkstash-auth-changed', onAuthChanged);
    
    // Listen for logout events
    const onLogout = () => {
      setNotes([]);
      setFlashcards([]);
    };
    window.addEventListener('thinkstash-logout', onLogout);
    
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('thinkstash-auth-changed', onAuthChanged);
      window.removeEventListener('thinkstash-logout', onLogout);
    };
  }, []);

  const addNote = async (note) => {
    try {
      const res = await fetch(`${API}/api/notes`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(note),
      });
      if (res.ok) {
        const newNote = await res.json();
        // Refetch notes to ensure we have the complete, server-filtered list
        await fetchNotes();
        return { success: true, note: newNote };
      } else {
        const error = await res.json().catch(() => ({ error: 'Failed to save note' }));
        console.error('Failed to add note:', error);
        return { success: false, error: error.error || 'Failed to save note' };
      }
    } catch (err) {
      console.error('Failed to add note:', err);
      return { success: false, error: err.message || 'Network error occurred' };
    }
  };

  const updateNote = async (id, updatedNote) => {
    try {
      const res = await fetch(`${API}/api/notes/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updatedNote),
      });
      if (res.ok) {
        const updated = await res.json();
        // Refetch to ensure we have the latest data from server
        await fetchNotes();
        return { success: true, note: updated };
      } else {
        const error = await res.json().catch(() => ({ error: 'Failed to update note' }));
        console.error('Failed to update note:', error);
        return { success: false, error: error.error || 'Failed to update note' };
      }
    } catch (err) {
      console.error('Failed to update note:', err);
      return { success: false, error: err.message || 'Network error occurred' };
    }
  };

  const deleteNote = async (id) => {
    try {
      const res = await fetch(`${API}/api/notes/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        setNotes(prev => prev.filter(n => n._id !== id));
      }
    } catch (err) {
      console.error('Failed to delete note:', err);
    }
  };

  const generateAISummary = async (noteContent) => {
    try {
      const res = await fetch(`${API}/api/note-summary`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ content: noteContent }),
      });
      if (res.ok) {
        const data = await res.json();
        return data.summary;
      }
    } catch (err) {
      console.error('Failed to generate AI summary:', err);
    }
    return 'Failed to generate summary';
  };

  // Streak functions
  const logStreakEvent = async (type, metadata = {}) => {
    try {
      const res = await fetch(`${API}/api/streak/events`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ type, metadata }),
      });
      if (res.ok) {
        const data = await res.json();
        return data;
      }
    } catch (err) {
      console.error('Failed to log streak event:', err);
    }
    return null;
  };

  const getStreakData = async () => {
    try {
      const res = await fetch(`${API}/api/streak/streak`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        return data;
      }
    } catch (err) {
      console.error('Failed to get streak data:', err);
    }
    return { currentStreak: 0, longestStreak: 0, freezeTokens: 0 };
  };

  const useFreezeToken = async () => {
    try {
      const res = await fetch(`${API}/api/streak/freeze`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        return data;
      }
    } catch (err) {
      console.error('Failed to use freeze token:', err);
    }
    return null;
  };

  // used by Navbar before logout()
  const resetData = useCallback(() => {
    setNotes([]);
    setFlashcards([]);
    localStorage.removeItem('thinkstash_notes');
    localStorage.removeItem('thinkstash_flashcards');
  }, []);

  return (
    <DataContext.Provider value={{
      notes,
      flashcards,
      addNote,
      updateNote,
      deleteNote,
      generateAISummary,
      fetchNotes,
      resetData,
      logStreakEvent,
      getStreakData,
      useFreezeToken,
    }}>
      {children}
    </DataContext.Provider>
  );
};
