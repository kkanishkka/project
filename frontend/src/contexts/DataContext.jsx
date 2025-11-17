import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

const DataContext = createContext();

export const useData = () => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within a DataProvider");
  return ctx;
};

export const DataProvider = ({ children }) => {
  const [notes, setNotes] = useState([]);
  const [flashcards, setFlashcards] = useState([]);
  const [flashcardsByNote, setFlashcardsByNote] = useState({});
  const [quizzesByNote, setQuizzesByNote] = useState({});

  const [reviewMode, setReviewMode] = useState("standard");
  const [reviewQueue, setReviewQueue] = useState([]);

  const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const getToken = () => localStorage.getItem("thinkstash_token");
  const getAuthHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
  });

  const normalizeNote = (n) => ({ ...n, _id: n._id || n.id });

  // ---------- REVIEW QUEUE HELPERS ----------

  const buildReviewQueue = (notesList, mode) => {
    if (!Array.isArray(notesList)) return [];

    const parseDate = (d) => (d ? new Date(d) : null);

    return notesList
      .filter((n) => {
        if (!n.nextReviewAt) return false;
        if (mode && n.reviewMode && n.reviewMode !== mode) return false;
        return true;
      })
      .sort((a, b) => {
        const da = parseDate(a.nextReviewAt);
        const db = parseDate(b.nextReviewAt);
        if (!da || !db) return 0;
        return da - db; // earliest first
      });
  };

  const setReviewModeAndQueue = (mode) => {
    setReviewMode(mode);
    setReviewQueue(buildReviewQueue(notes, mode));
  };

  // ---------- NOTES ----------

  const fetchNotes = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setNotes([]);
      setReviewQueue([]);
      return;
    }
    try {
      const res = await fetch(`${API}/api/notes`, { headers: getAuthHeaders() });

      if (res.ok) {
        const data = await res.json();
        const normalized = (data || []).map(normalizeNote);
        setNotes(normalized);
        setReviewQueue(buildReviewQueue(normalized, reviewMode));
      } else {
        setNotes([]);
        setReviewQueue([]);
      }
    } catch (err) {
      console.error("Failed to fetch notes:", err);
      setNotes([]);
      setReviewQueue([]);
    }
  }, [API, reviewMode]);

  useEffect(() => {
    fetchNotes();

    const onStorage = (e) => {
      if (e.key === "thinkstash_token") fetchNotes();
    };
    window.addEventListener("storage", onStorage);

    const onAuthChanged = () => {
      fetchNotes();
    };
    window.addEventListener("thinkstash-auth-changed", onAuthChanged);

    const onLogout = () => {
      setNotes([]);
      setFlashcards([]);
      setFlashcardsByNote({});
      setQuizzesByNote({});
      setReviewQueue([]);
      setReviewMode("standard");
    };
    window.addEventListener("thinkstash-logout", onLogout);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("thinkstash-auth-changed", onAuthChanged);
      window.removeEventListener("thinkstash-logout", onLogout);
    };
  }, [fetchNotes]);

  const addNote = async (note) => {
    try {
      const res = await fetch(`${API}/api/notes`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(note),
      });
      if (res.ok) {
        const newNote = await res.json();
        await fetchNotes();
        return { success: true, note: newNote };
      } else {
        const error = await res
          .json()
          .catch(() => ({ error: "Failed to save note" }));
        console.error("Failed to add note:", error);
        return {
          success: false,
          error: error.error || "Failed to save note",
        };
      }
    } catch (err) {
      console.error("Failed to add note:", err);
      return { success: false, error: err.message || "Network error occurred" };
    }
  };

  const updateNote = async (id, updatedNote) => {
    try {
      const res = await fetch(`${API}/api/notes/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(updatedNote),
      });
      if (res.ok) {
        const updated = await res.json();
        await fetchNotes();
        return { success: true, note: updated };
      } else {
        const error = await res
          .json()
          .catch(() => ({ error: "Failed to update note" }));
        console.error("Failed to update note:", error);
        return {
          success: false,
          error: error.error || "Failed to update note",
        };
      }
    } catch (err) {
      console.error("Failed to update note:", err);
      return { success: false, error: err.message || "Network error occurred" };
    }
  };

  const deleteNote = async (id) => {
    try {
      const res = await fetch(`${API}/api/notes/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (res.ok) {
        setNotes((prev) => {
          const updated = prev.filter((n) => n._id !== id);
          setReviewQueue(buildReviewQueue(updated, reviewMode));
          return updated;
        });
        setFlashcardsByNote((prev) => {
          const copy = { ...prev };
          delete copy[id];
          return copy;
        });
        setQuizzesByNote((prev) => {
          const copy = { ...prev };
          delete copy[id];
          return copy;
        });
      }
    } catch (err) {
      console.error("Failed to delete note:", err);
    }
  };

  // ---------- AI SUMMARY ----------

  const generateAISummary = async (noteContent) => {
    try {
const res = await fetch(`${API}/api/ai/note-summary`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ content: noteContent }),
      });
      if (res.ok) {
        const data = await res.json();
        return data.summary;
      }
    } catch (err) {
      console.error("Failed to generate AI summary:", err);
    }
    return "Failed to generate summary";
  };

  // ---------- STREAK ----------

  const logStreakEvent = async (type, metadata = {}) => {
    try {
      const res = await fetch(`${API}/api/streak/events`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ type, metadata }),
      });
      if (res.ok) {
        const data = await res.json();
        return data;
      }
    } catch (err) {
      console.error("Failed to log streak event:", err);
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
      console.error("Failed to get streak data:", err);
    }
    return { currentStreak: 0, longestStreak: 0, freezeTokens: 0 };
  };

  const useFreezeToken = async () => {
    try {
      const res = await fetch(`${API}/api/streak/freeze`, {
        method: "POST",
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        return data;
      }
    } catch (err) {
      console.error("Failed to use freeze token:", err);
    }
    return null;
  };

  // ---------- FLASHCARDS ----------

  const fetchFlashcards = async (noteId) => {
    try {
      const res = await fetch(`${API}/api/notes/${noteId}/flashcards`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setFlashcardsByNote((prev) => ({ ...prev, [noteId]: data || [] }));
        return { success: true, data };
      } else {
        const error = await res
          .json()
          .catch(() => ({ message: "Failed to fetch flashcards" }));
        throw new Error(error.message || "Failed to fetch flashcards");
      }
    } catch (err) {
      console.error("Failed to fetch flashcards:", err);
      setFlashcardsByNote((prev) => ({ ...prev, [noteId]: [] }));
      throw err;
    }
  };

  const regenerateFlashcards = async (noteId) => {
    try {
      const res = await fetch(
        `${API}/api/notes/${noteId}/flashcards/regenerate`,
        {
          method: "POST",
          headers: getAuthHeaders(),
        }
      );
      if (res.ok) {
        const data = await res.json();
        setFlashcardsByNote((prev) => ({ ...prev, [noteId]: data }));
        setNotes((prev) =>
          prev.map((n) =>
            n._id === noteId
              ? {
                  ...n,
                  flashcardCount: data.length,
                  flashcardsUpdatedAt: new Date().toISOString(),
                }
              : n
          )
        );
        return { success: true };
      } else {
        const error = await res
          .json()
          .catch(() => ({ message: "Failed to regenerate" }));
        return { success: false, error: error.message };
      }
    } catch (err) {
      console.error("Failed to regenerate flashcards:", err);
      return { success: false, error: err.message };
    }
  };

  // ---------- QUIZZES ----------

  const transformQuizQuestions = (questions) => {
    if (!Array.isArray(questions)) return [];
    return questions.map((q) => {
      const correctIdx =
        q.options && q.answer
          ? q.options.findIndex((opt) => opt === q.answer)
          : 0;
      return {
        ...q,
        correctIndex: correctIdx >= 0 ? correctIdx : 0,
      };
    });
  };

  const fetchQuizzes = async (noteId) => {
    try {
      let res = await fetch(`${API}/api/quizzes?noteId=${noteId}`, {
        headers: getAuthHeaders(),
      });

      if (!res.ok) {
        res = await fetch(`${API}/api/notes/${noteId}/quizzes`, {
          headers: getAuthHeaders(),
        });
      }

      if (res.ok) {
        const data = await res.json();
        const transformedData = transformQuizQuestions(data || []);
        setQuizzesByNote((prev) => ({ ...prev, [noteId]: transformedData }));
        return { success: true, data: transformedData };
      } else {
        const error = await res
          .json()
          .catch(() => ({ message: "Failed to fetch quizzes" }));
        throw new Error(error.message || "Failed to fetch quizzes");
      }
    } catch (err) {
      console.error("Failed to fetch quizzes:", err);
      setQuizzesByNote((prev) => ({ ...prev, [noteId]: [] }));
      throw err;
    }
  };

  const regenerateQuizzes = async (noteId) => {
    try {
      let res = await fetch(`${API}/api/quizzes/${noteId}/generate`, {
        method: "POST",
        headers: getAuthHeaders(),
      });

      if (!res.ok) {
        res = await fetch(
          `${API}/api/notes/${noteId}/quizzes/regenerate`,
          {
            method: "POST",
            headers: getAuthHeaders(),
          }
        );
      }

      if (res.ok) {
        const result = await fetchQuizzes(noteId);
        return { success: true, data: result.data || [] };
      } else {
        let errorMessage = "Failed to regenerate quizzes";
        try {
          const errorData = await res.json();
          errorMessage =
            errorData.message || errorData.error || errorMessage;
        } catch {
          errorMessage = res.statusText || errorMessage;
        }
        return { success: false, error: errorMessage };
      }
    } catch (err) {
      console.error("Failed to regenerate quizzes:", err);
      return {
        success: false,
        error: err.message || "Network error. Please try again.",
      };
    }
  };

  // ---------- REVIEW NOTE (spaced repetition) ----------

  const reviewNote = async (noteId, difficulty) => {
    try {
      const res = await fetch(`${API}/api/notes/${noteId}/review`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ difficulty }),
      });

      if (!res.ok) {
        const error = await res
          .json()
          .catch(() => ({ message: "Failed to review note" }));
        console.error("Failed to review note:", error);
        return {
          success: false,
          error: error.message || "Failed to review note",
        };
      }

      const updated = await res.json();
      const normalized = normalizeNote(updated);

      setNotes((prev) => {
        const updatedList = prev.map((n) =>
          n._id === normalized._id ? normalized : n
        );
        setReviewQueue(buildReviewQueue(updatedList, reviewMode));
        return updatedList;
      });

      return { success: true, note: normalized };
    } catch (err) {
      console.error("Error reviewing note:", err);
      return { success: false, error: err.message || "Network error" };
    }
  };

  // Remove a note from the review queue (set nextReviewAt = null)
  const clearNoteFromReview = async (noteId) => {
    try {
      const res = await fetch(`${API}/api/notes/${noteId}/clear-review`, {
        method: "PUT",
        headers: getAuthHeaders(),
      });

      if (!res.ok) {
        let errorPayload;
        try {
          errorPayload = await res.json();
        } catch {
          errorPayload = await res.text();
        }
        console.error(
          "Failed to clear review:",
          res.status,
          errorPayload
        );
        return {
          success: false,
          error:
            (errorPayload && errorPayload.message) ||
            (errorPayload && errorPayload.error) ||
            `Failed to clear review (status ${res.status})`,
        };
      }

      const updated = await res.json();
      const normalized = normalizeNote(updated);

      setNotes((prev) => {
        const updatedList = prev.map((n) =>
          n._id === normalized._id ? normalized : n
        );
        setReviewQueue(buildReviewQueue(updatedList, reviewMode));
        return updatedList;
      });

      return { success: true };
    } catch (err) {
      console.error("Error clearing review (network):", err);
      return { success: false, error: err.message || "Network error" };
    }
  };

  // ---------- COUNTS + RESET ----------

  const totalQuizQuestions = Object.values(quizzesByNote).reduce(
    (sum, quizQuestions) => {
      if (!Array.isArray(quizQuestions)) return sum;
      return sum + quizQuestions.length;
    },
    0
  );

  const resetData = useCallback(() => {
    setNotes([]);
    setFlashcards([]);
    setFlashcardsByNote({});
    setQuizzesByNote({});
    setReviewQueue([]);
    setReviewMode("standard");
    localStorage.removeItem("thinkstash_notes");
    localStorage.removeItem("thinkstash_flashcards");
  }, []);

  return (
    <DataContext.Provider
      value={{
        notes,
        flashcards,
        flashcardsByNote,
        quizzesByNote,
        totalQuizQuestions,
        addNote,
        updateNote,
        deleteNote,
        generateAISummary,
        fetchNotes,
        fetchFlashcards,
        regenerateFlashcards,
        fetchQuizzes,
        regenerateQuizzes,
        resetData,
        logStreakEvent,
        getStreakData,
        useFreezeToken,

        reviewMode,
        reviewQueue,
        setReviewModeAndQueue,
        reviewNote,
        clearNoteFromReview,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};
