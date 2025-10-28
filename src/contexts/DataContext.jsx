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
    const onStorage = (e) => {
      if (e.key === 'thinkstash_token') fetchNotes();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
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
        setNotes(prev => [newNote, ...prev]);
      }
    } catch (err) {
      console.error('Failed to add note:', err);
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
        setNotes(prev => prev.map(n => n._id === id ? updated : n));
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
    }}>
      {children}
    </DataContext.Provider>
  );
};
