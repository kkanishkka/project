import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback
} from 'react';

export const DataContext = createContext();

export const useData = () => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within a DataProvider');
  return ctx;
};

export const DataProvider = ({ children }) => {
  const [notes, setNotes] = useState([]);
  const [notesCount, setNotesCount] = useState(0);
  const [flashcards, setFlashcards] = useState([]);

  const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const getToken = () => localStorage.getItem('thinkstash_token');
  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getToken()}`,
  });

  const fetchNotes = async () => {
    const token = getToken();
    if (!token) { setNotes([]); setNotesCount(0); return; }
    try {
      const res = await fetch(`${API}/api/notes`, { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        setNotes(data);
        // Also update count locally
        setNotesCount(Array.isArray(data) ? data.length : 0);
      } else if (res.status === 401) {
        // Token invalid, clear auth
        setNotes([]);
        setNotesCount(0);
        window.dispatchEvent(new Event('thinkstash-logout'));
      } else {
        setNotes([]);
        setNotesCount(0);
      }
    } catch (err) {
      console.error('Failed to fetch notes:', err);
      setNotes([]);
      setNotesCount(0);
    }
  };

  const fetchNotesCount = async () => {
    const token = getToken();
    if (!token) { setNotesCount(0); return; }
    try {
      const res = await fetch(`${API}/api/notes/count`, { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        setNotesCount(typeof data.count === 'number' ? data.count : 0);
      }
    } catch {}
  };

  useEffect(() => {
    fetchNotes();
    fetchNotesCount();
    const onStorage = (e) => {
      if (e.key === 'thinkstash_token') fetchNotes();
    };
    const onAuthChanged = () => { fetchNotes(); fetchNotesCount(); };
    const onLogout = () => { setNotes([]); setNotesCount(0); };
    window.addEventListener('storage', onStorage);
    window.addEventListener('thinkstash-auth-changed', onAuthChanged);
    window.addEventListener('thinkstash-logout', onLogout);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('thinkstash-auth-changed', onAuthChanged);
      window.removeEventListener('thinkstash-logout', onLogout);
    };
  }, []);

  const addNote = async (note) => {
    try {
      const payload = {
        title: note.title,
        content: note.content,
        revisionDate: note.revisionDate || undefined,
        tags: note.subject ? [note.subject] : (Array.isArray(note.tags) ? note.tags : []),
      };
      const res = await fetch(`${API}/api/notes`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const newNote = await res.json();
        setNotes(prev => [newNote, ...prev]);
        setNotesCount(prev => prev + 1);
      } else {
        const text = await res.text();
        console.error('Add note failed', res.status, text);
      }
    } catch (err) {
      console.error('Failed to add note:', err);
    }
  };

  const updateNote = async (id, updatedNote) => {
    try {
      const payload = {
        title: updatedNote.title,
        content: updatedNote.content,
        revisionDate: updatedNote.revisionDate || undefined,
        tags: updatedNote.subject ? [updatedNote.subject] : (Array.isArray(updatedNote.tags) ? updatedNote.tags : []),
      };
      const res = await fetch(`${API}/api/notes/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const updated = await res.json();
        setNotes(prev => prev.map(n => n._id === id ? updated : n));
      } else {
        const text = await res.text();
        console.error('Update note failed', res.status, text);
      }
    } catch (err) {
      console.error('Failed to update note:', err);
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
         setNotesCount(prev => Math.max(0, prev - 1));
      } else {
        const text = await res.text();
        console.error('Delete note failed', res.status, text);
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
      notesCount,
      flashcards,
      addNote,
      updateNote,
      deleteNote,
      generateAISummary,
      fetchNotes,
      fetchNotesCount,
      resetData,
      logStreakEvent,
      getStreakData,
      useFreezeToken,
      getAuthHeaders,
    }}>
      {children}
    </DataContext.Provider>
  );
};
