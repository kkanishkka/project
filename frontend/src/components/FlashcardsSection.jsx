import { useEffect, useState } from "react";
import { useData } from "../contexts/DataContext";
import { RefreshCw, AlertCircle } from "lucide-react";

export default function FlashcardsSection({ note }) {
  const { flashcardsByNote, fetchFlashcards, regenerateFlashcards } = useData();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fetching, setFetching] = useState(false);
  const noteId = note?._id || note?.id;
  const cards = noteId ? (flashcardsByNote[noteId] || []) : [];

  useEffect(() => {
    if (!noteId) return;
    if (!flashcardsByNote[noteId] && !fetching) {
      setFetching(true);
      fetchFlashcards(noteId).catch(err => {
        setError("Failed to load flashcards. Please try again.");
        console.error("Error fetching flashcards:", err);
      }).finally(() => setFetching(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [noteId]);

  const onRegen = async () => {
    if (!noteId) {
      setError("Note ID is missing. Cannot regenerate flashcards.");
      return;
    }
    setLoading(true);
    setError(null);
    try { 
      const result = await regenerateFlashcards(noteId);
      if (!result.success) {
        setError(result.error || "Failed to regenerate flashcards. Please try again.");
      }
    } catch (err) {
      setError("An error occurred while regenerating flashcards. Please try again.");
      console.error("Error regenerating flashcards:", err);
    } finally { 
      setLoading(false);
    }
  };

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI-Generated Flashcards</h3>
        <button
          onClick={onRegen}
          disabled={loading || fetching}
          className="px-3 py-1 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300"
          title="Regenerate from note content"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          {loading ? "Generating..." : "Regenerate"}
        </button>
      </div>

      {error && (
        <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {fetching && cards.length === 0 && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Loading flashcards...</p>
      )}

      {!fetching && cards.length === 0 && !error && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">No flashcards yet. Click "Regenerate" to generate flashcards from this note.</p>
      )}

      {cards.length > 0 && (
        <div className="grid md:grid-cols-3 gap-3 mt-3">
          {cards.map((c) => (
            <div key={c._id} className="rounded-xl border border-gray-200 dark:border-gray-700 p-3 shadow-sm bg-white dark:bg-gray-800">
              <p className="text-sm font-medium text-gray-900 dark:text-white">Q: {c.question}</p>
              <p className="text-sm mt-2 text-gray-700 dark:text-gray-300">A: {c.answer}</p>
              {c.tag && (
                <span className="inline-block text-xs mt-2 px-2 py-0.5 border border-gray-300 dark:border-gray-600 rounded-full text-gray-600 dark:text-gray-400">
                  {c.tag}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
