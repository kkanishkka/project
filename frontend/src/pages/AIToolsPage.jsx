import Summarizer from "../components/Summarizer";
import React, { useEffect, useMemo, useState } from "react";
import { useData } from "../contexts/DataContext";
import AIExplanationModal from "../components/AIExplanationModal";
import FlashcardsSection from "../components/FlashcardsSection";
import QuizSection from "../components/QuizSection";
import {
  Brain,
  Sparkles,
  Target,
  BookOpen,
  Clock,
  ArrowUpRight,
} from "lucide-react";
import ReviewDifficultyModal from "../components/ReviewDifficultyModal";



const AIToolsPage = () => {
  const {
    notes,
    generateAISummary,
    logStreakEvent,
    quizzesByNote,
    totalQuizQuestions,
    fetchQuizzes,
    reviewNote,
     reviewMode,
  setReviewModeAndQueue,
  } = useData();

  const [showExplanation, setShowExplanation] = useState(false);
  const [activeTab, setActiveTab] = useState("summaries");

  const noteCount = notes.length;

  const [selectedNote, setSelectedNote] = useState(null);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [manualText, setManualText] = useState("");
  const [manualSummary, setManualSummary] = useState("");
  const [noteSummaries, setNoteSummaries] = useState({});

  



  // ⭐ OPEN MODAL
const openReviewModal = (note) => {
  setSelectedNote(note);
};

// ⭐ CLOSE MODAL
const closeReviewModal = () => {
  if (!submittingReview) setSelectedNote(null);
};

// ⭐ HANDLE DIFFICULTY CLICK
const handleDifficultySelect = async (difficulty) => {
  if (!selectedNote) return;

  setSubmittingReview(true);
  await reviewNote(selectedNote._id || selectedNote.id, difficulty);
  setSubmittingReview(false);

  setSelectedNote(null);
};
const handleManualSummarize = async () => {
  if (!manualText.trim()) {
    alert("Please enter some text");
    return;
  }
  const summary = await generateAISummary(manualText);
  setManualSummary(summary);
};

const handleGenerateNoteSummary = async (note) => {
  const summary = await generateAISummary(note.content || "");
  setNoteSummaries((prev) => ({
    ...prev,
    [note._id || note.id]: summary,
  }));
};


const handleCloseSummary = (noteId) => {
  setNoteSummaries((prev) => {
    const copy = { ...prev };
    delete copy[noteId];
    return copy;
  });
};





  const subjectCount = useMemo(() => {
    const subjects = new Set();
    notes.forEach((note) => {
      if (note.subject) subjects.add(note.subject);
    });
    return subjects.size;
  }, [notes]);

  const totalFlashcards = useMemo(
    () => notes.reduce((total, note) => total + (note.flashcardCount || 0), 0),
    [notes]
  );

  const averageFlashcards = noteCount
    ? Math.round(totalFlashcards / noteCount)
    : 0;

  const upcomingReview = useMemo(() => {
    return [...notes]
      .filter((note) => note.nextReview)
      .sort((a, b) => new Date(a.nextReview) - new Date(b.nextReview))[0];
  }, [notes]);

  const summaryProgress = noteCount
    ? Math.min(100, Math.round((noteCount / 10) * 100))
    : 0;
  const flashcardProgress = averageFlashcards
    ? Math.min(100, Math.round((averageFlashcards / 5) * 100))
    : 0;
  const quizProgress = totalQuizQuestions
    ? Math.min(
        100,
        Math.round(
          (totalQuizQuestions / Math.max(1, noteCount * 5)) * 100
        )
      )
    : 0;

  // Prefetch quizzes when the user switches to the Quizzes tab
  useEffect(() => {
    if (activeTab !== "quizzes") return;
    (async () => {
      for (const n of notes) {
        const nid = n._id || n.id;
        if (!quizzesByNote[nid]) {
          try {
            await fetchQuizzes(nid);
          } catch {
            /* swallow to keep UI flowing */
          }
        }
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, notes]);

  const tabs = useMemo(
    () => [
      {
        id: "summaries",
        label: "AI Summaries",
        icon: <Sparkles className="h-4 w-4" />,
      },
      {
        id: "flashcards",
        label: "Flashcards",
        icon: <Target className="h-4 w-4" />,
      },
      { id: "quizzes", label: "Quizzes", icon: <Brain className="h-4 w-4" /> },
      {
        id: "schedule",
        label: "Review Schedule",
        icon: <Clock className="h-4 w-4" />,
      },
    ],
    []
  );

  const insights = useMemo(
    () => [
      {
        id: "subjects",
        label: "Subjects tracked",
        value: subjectCount || "—",
        detail: subjectCount
          ? "Maintain balanced coverage"
          : "Add subjects to unlock trends",
      },
      {
        id: "flashcards",
        label: "Avg flashcards / note",
        value: averageFlashcards || 0,
        detail: averageFlashcards
          ? "Aim for 5+ cards each note"
          : "Generate flashcards to see insights",
      },
      {
        id: "quizbank",
        label: "Questions generated",
        value: totalQuizQuestions || 0,
        detail: totalQuizQuestions
          ? "Your quiz bank keeps growing"
          : "Create quizzes to measure mastery",
      },
    ],
    [subjectCount, averageFlashcards, totalQuizQuestions]
  );

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays < 7) return `${diffDays} days`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center space-x-3">
              <Brain className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              <span>AI Learning Tools</span>
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Summaries, flashcards, quizzes and spaced repetition — all in one
              place to support your study flow.
            </p>
          </div>

          <button
            onClick={() => setShowExplanation(true)}
            className="inline-flex items-center rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
          >
            Need an AI explanation?
            <ArrowUpRight className="ml-1 h-4 w-4" />
          </button>
        </div>

        {/* Hero (simplified, blue/white and readable) */}
        <div className="mb-8 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/40 dark:text-blue-200">
                Powered by ThinkStash AI
              </p>
              <h2 className="mt-4 text-2xl font-semibold text-gray-900 dark:text-white lg:text-3xl">
                Your AI workspace for faster, deeper learning
              </h2>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                Keep all your AI tools organised: generate summaries, practise
                with flashcards, take quizzes and follow a review schedule.
              </p>
            </div>

            <div className="w-full max-w-sm rounded-2xl bg-blue-50 p-5 text-gray-900 dark:bg-blue-900/30 dark:text-blue-50">
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-200">
                Overview
              </p>
              <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold">{noteCount}</p>
                  <p className="text-xs text-gray-600 dark:text-blue-100">
                    Active notes
                  </p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{subjectCount || 0}</p>
                  <p className="text-xs text-gray-600 dark:text-blue-100">
                    Subjects
                  </p>
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {totalQuizQuestions || 0}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-blue-100">
                    Quiz questions
                  </p>
                </div>
              </div>
              <div className="mt-4 border-t border-blue-100 pt-3 text-sm dark:border-blue-800">
                {upcomingReview ? (
                  <>
                    <p className="font-medium">
                      Next review: {formatDate(upcomingReview.nextReview)}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-blue-100">
                      {upcomingReview.title}
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-gray-700 dark:text-blue-100">
                    No reviews scheduled yet. Use the schedule tab to plan your
                    next session.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Insights */}
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          {insights.map((insight) => (
            <div
              key={insight.id}
              className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800"
            >
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {insight.label}
              </p>
              <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">
                {insight.value}
              </p>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                {insight.detail}
              </p>
            </div>
          ))}
        </div>

        {/* AI Tools Overview (simple blue/white cards) */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm dark:border-blue-900/40 dark:bg-gray-800">
            <div className="flex items-center space-x-3 mb-3">
              <div className="bg-blue-100 dark:bg-blue-900/60 p-2 rounded-full">
                <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Smart Summaries
              </h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              AI-generated concise summaries of your notes.
            </p>
            <div className="mt-2 text-2xl font-bold text-blue-600 dark:text-blue-400">
              {noteCount}
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>Goal: 10+ notes</span>
                <span>{summaryProgress}%</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-blue-100/70 dark:bg-blue-900/30">
                <div
                  className="h-full rounded-full bg-blue-500 dark:bg-blue-400"
                  style={{ width: `${summaryProgress}%` }}
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-purple-100 bg-white p-6 shadow-sm dark:border-purple-900/40 dark:bg-gray-800">
            <div className="flex items-center space-x-3 mb-3">
              <div className="bg-purple-100 dark:bg-purple-900/60 p-2 rounded-full">
                <Target className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Flashcards
              </h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Auto-generated flashcards for active recall.
            </p>
            <div className="mt-2 text-2xl font-bold text-purple-600 dark:text-purple-400">
              {notes.length * 3}
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>Target: 5 per note</span>
                <span>{flashcardProgress}%</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-purple-100/70 dark:bg-purple-900/30">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
                  style={{ width: `${flashcardProgress}%` }}
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-green-100 bg-white p-6 shadow-sm dark:border-green-900/40 dark:bg-gray-800">
            <div className="flex items-center space-x-3 mb-3">
              <div className="bg-green-100 dark:bg-green-900/60 p-2 rounded-full">
                <Brain className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Quiz Questions
              </h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Practice questions generated from your content.
            </p>
            <div className="mt-2 text-2xl font-bold text-green-600 dark:text-green-400">
              {totalQuizQuestions}
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>Goal: 5 per note</span>
                <span>{quizProgress}%</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-green-100/70 dark:bg-green-900/30">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-sky-500"
                  style={{ width: `${quizProgress}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <div className="flex space-x-8 px-6 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600 dark:text-blue-400"
                      : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            {/* AI Summaries Tab */}
            {activeTab === "summaries" && (
              <div>
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    AI-Generated Summaries
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300">
                    Get concise, intelligent summaries of your notes to
                    quickly review key concepts.
                  </p>
                </div>
          <Summarizer />

{notes.length > 0 ? (
  <div className="space-y-4 mt-4">
    {notes.map((note) => {
      const noteId = note._id || note.id;
      const summary = noteSummaries[noteId];

      return (
        <div
          key={noteId}
          className="border dark:border-gray-700 rounded-lg p-4"
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">
                {note.title}
              </h3>
              {note.subject && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 mt-1">
                  {note.subject}
                </span>
              )}
            </div>
            <button
              onClick={() => handleGenerateNoteSummary(note)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center space-x-2 shadow-sm"
            >
              <Sparkles className="h-4 w-4" />
              <span>Generate Summary</span>
            </button>
          </div>

          {/* Summary box under the note */}
          {summary && (
            <div className="mt-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-blue-200 dark:border-blue-500/40 p-3">
              <div className="flex items-start justify-between mb-2">
                <h4 className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                  AI Summary
                </h4>
                <button
                  onClick={() => handleCloseSummary(noteId)}
                  className="text-xs px-2 py-1 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                >
                  Done
                </button>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-200 whitespace-pre-line">
                {summary}
              </p>
            </div>
          )}
        </div>
      );
    })}
  </div>
) : (
  <div className="text-center py-8">
    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
    <p className="text-gray-500 dark:text-gray-400">
      Create some notes to see AI-generated summaries.
    </p>
  </div>
)}

              </div>
            )}

            {/* Flashcards Tab */}
            {activeTab === "flashcards" && (
              <div>
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    AI-Generated Flashcards
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300">
                    Practice with automatically generated flashcards for
                    active recall learning.
                  </p>
                </div>

                {notes.length > 0 ? (
                  <div className="space-y-6">
                   {notes.map((note) => (
  <div key={note._id} className="border rounded-md p-3 mb-3">
    <div className="flex justify-between items-center mb-2">
      <div>
        <h3 className="font-semibold">{note.title}</h3>
        {note.subject && (
          <span className="inline-block text-xs mt-1 px-2 py-1 rounded-full bg-blue-100 text-blue-700">
            {note.subject}
          </span>
        )}
      </div>
      <button
        className="btn-primary"
        onClick={() => handleGenerateNoteSummary(note)}
      >
        ⚡ Generate Summary
      </button>
    </div>

    {noteSummaries[note._id] && (
      <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
        <strong>AI Summary:</strong>
        <p>{noteSummaries[note._id]}</p>
      </div>
    )}
  </div>
))}

                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">
                      Create some notes to generate flashcards.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Quizzes Tab */}
            {activeTab === "quizzes" && (
              <div>
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    AI-Generated Quizzes
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300">
                    Test your knowledge with AI-generated quiz questions
                    based on your notes.
                  </p>
                </div>

                {notes.length > 0 ? (
                  <div className="space-y-6">
                    {notes.map((note) => {
                      const nid = note._id || note.id;
                      return (
                        <div
                          key={nid}
                          className="border dark:border-gray-700 rounded-lg p-4"
                        >
                          <QuizSection note={{ ...note, _id: nid }} />
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">
                      Create some notes to generate quiz questions.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Review Schedule Tab */}
            {activeTab === "schedule" && (
              <div>
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Spaced Repetition Schedule
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300">
                    Optimize your learning with spaced repetition intervals.
                  </p>
                </div>

             {notes.length > 0 ? (
      <div>
        {/* 🔹 Mode selector – this updates global review queue used by Dashboard "Review Mode" */}
        <div className="flex flex-wrap gap-2 mb-4">
          {[
            { id: "light", label: "Light" },
            { id: "standard", label: "Standard" },
            { id: "intense", label: "Intense" },
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => setReviewModeAndQueue(mode.id)}
              className={`px-3 py-1 rounded-full border text-xs font-medium ${
                reviewMode === mode.id
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
          Selected mode:{" "}
          <span className="font-semibold">
            {reviewMode || "standard"}
          </span>{" "}
          · Notes you review here will appear in Dashboard →{" "}
          <strong>Review Mode</strong> sorted by next review.
        </p>

        {/* Stats row (same as before) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-red-50 dark:bg-red-900 p-4 rounded-lg">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {Math.floor(notes.length * 0.2)}
            </div>
            <div className="text-sm text-red-800 dark:text-red-200">
              Due Today
            </div>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900 p-4 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {Math.floor(notes.length * 0.3)}
            </div>
            <div className="text-sm text-yellow-800 dark:text-yellow-200">
              Due This Week
            </div>
          </div>
          <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {Math.floor(notes.length * 0.5)}
            </div>
            <div className="text-sm text-green-800 dark:text-green-200">
              Future Reviews
            </div>
          </div>
        </div>

        {/* List of notes with Review button */}
        <div className="space-y-3">
          {notes.map((note) => (
            <div
              key={note._id || note.id}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 dark:text-white">
                  {note.title}
                </h3>
                <div className="flex items-center space-x-4 mt-1">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    {note.subject}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Difficulty: Medium
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  Next review:{" "}
                  {note.nextReview
                    ? formatDate(note.nextReview)
                    : "Not scheduled"}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Interval: 1 day
                </div>
              </div>
              <button
                onClick={() => openReviewModal(note)}
                className="ml-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center space-x-2 shadow-sm"
              >
                <Clock className="h-4 w-4" />
                <span>Review</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    ) : (
      <div className="bg-gray-50 dark:bg-gray-800 border border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
          You don&apos;t have any notes yet.
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Create a note first, then you can schedule reviews for it.
        </p>
      </div>
    )}

              </div>
            )}
          </div>
        </div>

        {/* AI Explanation Modal */}
        {showExplanation && (
          <AIExplanationModal
            term="Selected Term"
            onClose={() => setShowExplanation(false)}
          />
        )}
      </div>
      <ReviewDifficultyModal
  note={selectedNote}
  onClose={closeReviewModal}
  onSelectDifficulty={handleDifficultySelect}
/>

    </div>
  );
};

export default AIToolsPage;
