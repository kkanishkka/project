// src/components/QuizSection.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useData } from "../contexts/DataContext";
import { RefreshCcw, Loader2 } from "lucide-react";

const QuizSection = ({ note, noteId: propNoteId }) => {
  const {
    quizzesByNote,
    fetchQuizzes,
    regenerateQuizzes,
  } = useData();

  // Support both: note._id passed OR explicit noteId prop
  const noteId = propNoteId || note?._id;
  const storedQuizzes = noteId ? quizzesByNote[noteId] || [] : [];

  const [loading, setLoading] = useState(false);
  const [regenLoading, setRegenLoading] = useState(false);
  const [error, setError] = useState("");
  const [answers, setAnswers] = useState({}); // { questionId: optionIndex }
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(null);

  const quizTitle = useMemo(() => {
    if (storedQuizzes.length > 0 && storedQuizzes[0].noteTitle) {
      return storedQuizzes[0].noteTitle;
    }
    return note?.title || "AI-Generated Quiz";
  }, [storedQuizzes, note]);

  // Load quiz when note changes
  useEffect(() => {
    if (!noteId) return;
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError("");
      setSubmitted(false);
      setScore(null);
      setAnswers({});
      try {
        await fetchQuizzes(noteId);
      } catch (err) {
        if (!cancelled) {
          setError(
            err?.message ||
              "Failed to load quiz. Please try again or regenerate."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
    // ✅ Depend only on noteId so we don't loop when fetchQuizzes identity changes
  }, [noteId]);

  const handleOptionSelect = (questionId, optionIndex) => {
    if (submitted) return;
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const handleSubmit = () => {
    if (!storedQuizzes.length) return;

    let correct = 0;
    storedQuizzes.forEach((q, idx) => {
      const questionId = q._id || q.id || `${idx}`;
      const selectedIndex = answers[questionId];

      const correctIndex =
        typeof q.correctIndex === "number"
          ? q.correctIndex
          : q.options?.findIndex((opt) => opt === q.answer) ?? 0;

      if (selectedIndex === correctIndex) correct += 1;
    });

    setScore(correct);
    setSubmitted(true);
  };

  const handleRegenerate = async () => {
    if (!noteId) return;
    setRegenLoading(true);
    setError("");
    setSubmitted(false);
    setScore(null);
    setAnswers({});
    try {
      const result = await regenerateQuizzes(noteId);
      if (!result.success) {
        setError(result.error || "Failed to regenerate quiz.");
      }
    } catch (err) {
      setError(err?.message || "Failed to regenerate quiz.");
    } finally {
      setRegenLoading(false);
    }
  };

  const totalQuestions = storedQuizzes.length;
  const answeredCount = Object.keys(answers).length;
  const canSubmit = totalQuestions > 0 && answeredCount === totalQuestions;

  if (!noteId) {
    return (
      <div className="bg-white shadow-sm rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">
          AI-Generated Quizzes
        </h2>
        <p className="text-gray-500 text-sm">
          Select a note first to generate a quiz from its content.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-sm rounded-xl border border-gray-200 p-6">
      {/* Section header */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <div>
          <p className="text-xs font-semibold tracking-wide text-indigo-500 uppercase">
            AI-Generated Quiz
          </p>
          <h2 className="text-xl font-semibold text-gray-900 mt-1">
            {quizTitle}
          </h2>
          {totalQuestions > 0 && (
            <p className="text-xs text-gray-500 mt-1">
              {answeredCount}/{totalQuestions} answered
            </p>
          )}
        </div>

        {/* Regenerate button */}
        <button
          type="button"
          onClick={handleRegenerate}
          disabled={regenLoading || loading}
          className="inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium
                     border border-indigo-200 text-indigo-600
                     hover:bg-indigo-50 disabled:opacity-60 disabled:cursor-not-allowed
                     transition-colors"
        >
          {regenLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Regenerating…
            </>
          ) : (
            <>
              <RefreshCcw className="w-4 h-4 mr-2" />
              Regenerate Quiz
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-10 text-sm text-gray-500">
          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          Loading quiz questions…
        </div>
      )}

      {!loading && !storedQuizzes.length && !error && (
        <p className="text-sm text-gray-500">
          No quiz available yet for this note. Try clicking{" "}
          <span className="font-medium text-indigo-600">Regenerate Quiz</span>.
        </p>
      )}

      {/* Questions */}
      {!loading && storedQuizzes.length > 0 && (
        <div className="space-y-6">
          {storedQuizzes.map((q, idx) => {
            const questionId = q._id || q.id || `${idx}`;
            const selectedIndex = answers[questionId];
            const correctIndex =
              typeof q.correctIndex === "number"
                ? q.correctIndex
                : q.options?.findIndex((opt) => opt === q.answer) ?? 0;

            return (
              <div
                key={questionId}
                className="rounded-lg border border-gray-200 p-4 bg-gray-50/70"
              >
                <p className="text-sm font-medium text-gray-900 mb-3">
                  {idx + 1}. {q.question}
                </p>
                <div className="grid gap-2">
                  {q.options?.map((opt, optIdx) => {
                    const isSelected = selectedIndex === optIdx;
                    const isCorrect = submitted && optIdx === correctIndex;
                    const isWrongSelected =
                      submitted && isSelected && optIdx !== correctIndex;

                    let baseClasses =
                      "w-full text-left px-3 py-2 rounded-lg border text-sm transition-colors";
                    let stateClasses =
                      "border-gray-200 bg-white hover:bg-indigo-50 text-gray-800";

                    if (!submitted && isSelected) {
                      stateClasses =
                        "border-indigo-500 bg-indigo-50 text-indigo-700";
                    }

                    if (submitted && isCorrect) {
                      stateClasses =
                        "border-emerald-500 bg-emerald-50 text-emerald-800";
                    } else if (submitted && isWrongSelected) {
                      stateClasses =
                        "border-red-500 bg-red-50 text-red-700 line-through";
                    }

                    return (
                      <button
                        key={optIdx}
                        type="button"
                        onClick={() => handleOptionSelect(questionId, optIdx)}
                        className={`${baseClasses} ${stateClasses}`}
                      >
                        <span className="font-semibold mr-1">
                          {String.fromCharCode(65 + optIdx)}.
                        </span>
                        {opt}
                      </button>
                    );
                  })}
                </div>

                {/* Explanation after submit */}
                {submitted && q.explanation && (
                  <p className="mt-3 text-xs text-gray-600">
                    <span className="font-semibold text-gray-800">
                      Explanation:
                    </span>{" "}
                    {q.explanation}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Footer with score + Submit button */}
      {!loading && storedQuizzes.length > 0 && (
        <div className="mt-6 flex items-center justify-between gap-4">
          <div className="text-sm text-gray-600">
            {submitted && score !== null ? (
              <span className="font-semibold text-indigo-600">
                You scored {score}/{totalQuestions}
              </span>
            ) : (
              <span>
                Answer all questions to enable{" "}
                <span className="font-semibold">Submit Quiz</span>.
              </span>
            )}
          </div>

          {/* ✅ Visible Submit button text */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit || submitted}
            className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold
                        transition-colors shadow-sm
                        ${
                          !canSubmit || submitted
                            ? "bg-gray-200 text-gray-700 cursor-not-allowed"
                            : "bg-indigo-600 text-white hover:bg-indigo-700"
                        }`}
          >
            Submit Quiz
          </button>
        </div>
      )}
    </div>
  );
};

export default QuizSection;
