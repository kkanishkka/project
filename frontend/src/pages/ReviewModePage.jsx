// src/pages/ReviewModePage.jsx
import React, { useState } from "react";
import { useData } from "../contexts/DataContext";

const ReviewModePage = () => {
  const { reviewQueue, clearNoteFromReview } = useData();
  const [activeNoteId, setActiveNoteId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const notesInQueue = Array.isArray(reviewQueue) ? reviewQueue : [];
  const activeNote =
    activeNoteId && notesInQueue.find((n) => n._id === activeNoteId);

  const handleStartReview = (noteId) => {
    setActiveNoteId(noteId);
  };

  const handleDone = async () => {
    if (!activeNote) return;
    setSubmitting(true);
    const result = await clearNoteFromReview(activeNote._id);
    setSubmitting(false);

    if (!result?.success) {
      alert(result?.error || "Failed to mark note as done.");
      return;
    }

    // After clearing from backend/context, go back to list
    setActiveNoteId(null);
  };

  // If we are in "note view" mode
  if (activeNote) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <h1 className="text-2xl font-semibold mb-2">Review Mode</h1>
        <p className="text-sm text-gray-600 mb-4">
          Reviewing: <span className="font-medium">{activeNote.title}</span>
        </p>

        <div className="bg-white border rounded-xl shadow-sm p-6">
          {activeNote.content ? (
            <div
              className="prose max-w-none"
              // note content is stored as HTML from your editor
              dangerouslySetInnerHTML={{ __html: activeNote.content }}
            />
          ) : (
            <p className="text-gray-500 text-sm">This note has no content.</p>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={handleDone}
            disabled={submitting}
            className="px-4 py-2 rounded-lg bg-black text-white text-sm font-medium hover:bg-gray-800 disabled:opacity-60"
          >
            {submitting ? "Saving..." : "Done"}
          </button>
        </div>
      </div>
    );
  }

  // List view (no active note selected)
  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-2xl font-semibold mb-2">Review Mode</h1>
      <p className="text-sm text-gray-600 mb-4">
        These notes are lined up for spaced repetition based on your reviews in
        AI Tools.
      </p>

      {notesInQueue.length === 0 ? (
        <p className="text-sm text-gray-500">
          No notes are in review yet. Go to <strong>AI Tools → Review
          Schedule</strong>, click a note&apos;s <strong>Review</strong> button
          and choose a difficulty.
        </p>
      ) : (
        <div className="space-y-3">
          {notesInQueue.map((note) => (
            <div
              key={note._id}
              className="flex items-center justify-between border rounded-xl px-4 py-3 bg-white shadow-sm"
            >
              <div>
                <div className="font-medium">{note.title}</div>
                <div className="text-xs text-gray-500">
                  Next review:{" "}
                  {note.nextReviewAt
                    ? new Date(note.nextReviewAt).toLocaleString()
                    : "—"}
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleStartReview(note._id)}
                className="text-sm px-3 py-1 rounded-md border hover:bg-gray-50"
              >
                Start review
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewModePage;
