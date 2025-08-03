import React, { createContext, useContext, useState, useEffect } from 'react';

const DataContext = createContext();

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider = ({ children }) => {
  const [notes, setNotes] = useState([]);
  const [flashcards, setFlashcards] = useState([]);

  useEffect(() => {
    // Load data from localStorage
    const storedNotes = localStorage.getItem('thinkstash_notes');
    const storedFlashcards = localStorage.getItem('thinkstash_flashcards');
    
    if (storedNotes) {
      setNotes(JSON.parse(storedNotes));
    }
    if (storedFlashcards) {
      setFlashcards(JSON.parse(storedFlashcards));
    }
  }, []);

  const addNote = (note) => {
    const newNote = {
      id: Date.now(),
      ...note,
      createdAt: new Date().toISOString(),
      lastReview: null,
      nextReview: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 1 day from now
    };
    const updatedNotes = [...notes, newNote];
    setNotes(updatedNotes);
    localStorage.setItem('thinkstash_notes', JSON.stringify(updatedNotes));
  };

  const updateNote = (id, updatedNote) => {
    const updatedNotes = notes.map(note => 
      note.id === id ? { ...note, ...updatedNote } : note
    );
    setNotes(updatedNotes);
    localStorage.setItem('thinkstash_notes', JSON.stringify(updatedNotes));
  };

  const deleteNote = (id) => {
    const updatedNotes = notes.filter(note => note.id !== id);
    setNotes(updatedNotes);
    localStorage.setItem('thinkstash_notes', JSON.stringify(updatedNotes));
  };

  const generateAISummary = (noteContent) => {
    // Simulate AI summary generation
    const summaries = [
      "This note covers key concepts in machine learning, focusing on supervised learning algorithms and their applications.",
      "The content discusses important principles of software architecture, emphasizing scalability and maintainability.",
      "This note explores fundamental data structures and their time complexity characteristics.",
      "The material covers essential web development concepts including responsive design and performance optimization.",
    ];
    return summaries[Math.floor(Math.random() * summaries.length)];
  };

  const value = {
    notes,
    flashcards,
    addNote,
    updateNote,
    deleteNote,
    generateAISummary,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};