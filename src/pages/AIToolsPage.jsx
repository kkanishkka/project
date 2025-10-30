import Summarizer from "../components/Summarizer";
import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useEffect } from 'react';
import AIExplanationModal from '../components/AIExplanationModal';
import { 
  Brain, 
  Sparkles, 
  Target, 
  RotateCcw, 
  BookOpen,
  Zap,
  Clock,
  TrendingUp
} from 'lucide-react';

const AIToolsPage = () => {
  const { notes, generateAISummary, logStreakEvent } = useData();
  const [selectedNote, setSelectedNote] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [activeTab, setActiveTab] = useState('summaries');

  const tabs = [
    { id: 'summaries', label: 'AI Summaries', icon: <Sparkles className="h-4 w-4" /> },
    { id: 'flashcards', label: 'Flashcards', icon: <Target className="h-4 w-4" /> },
    { id: 'quizzes', label: 'Quizzes', icon: <Brain className="h-4 w-4" /> },
    { id: 'schedule', label: 'Review Schedule', icon: <Clock className="h-4 w-4" /> },
  ];

  const generateFlashcards = (note) => {
    // Simulate AI flashcard generation
    const sampleFlashcards = [
      {
        front: "What is the main concept discussed in this note?",
        back: "The note covers key principles and applications relevant to the subject matter."
      },
      {
        front: "Why is this topic important?",
        back: "It provides foundational knowledge necessary for understanding advanced concepts."
      },
      {
        front: "What are the practical applications?",
        back: "The concepts can be applied in real-world scenarios to solve specific problems."
      }
    ];
    return sampleFlashcards;
  };

  const generateQuiz = (note) => {
    // Simulate AI quiz generation
    return [
      {
        question: "Which of the following best describes the main concept in this note?",
        options: ["Option A", "Option B", "Option C", "Option D"],
        correct: 1
      },
      {
        question: "What is the primary benefit of understanding this topic?",
        options: ["Benefit 1", "Benefit 2", "Benefit 3", "Benefit 4"],
        correct: 2
      }
    ];
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays < 7) return `${diffDays} days`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center space-x-3">
            <Brain className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <span>AI Learning Tools</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Leverage artificial intelligence to enhance your learning experience with personalized study materials.
          </p>
        </div>

        {/* AI Tools Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center space-x-3 mb-3">
              <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full">
                <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Smart Summaries</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              AI-generated concise summaries of your notes
            </p>
            <div className="mt-2 text-2xl font-bold text-blue-600 dark:text-blue-400">
              {notes.length}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center space-x-3 mb-3">
              <div className="bg-purple-100 dark:bg-purple-900 p-2 rounded-full">
                <Target className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Flashcards</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Auto-generated flashcards for active recall
            </p>
            <div className="mt-2 text-2xl font-bold text-purple-600 dark:text-purple-400">
              {notes.length * 3}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center space-x-3 mb-3">
              <div className="bg-green-100 dark:bg-green-900 p-2 rounded-full">
                <Brain className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Quiz Questions</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Practice questions generated from your content
            </p>
            <div className="mt-2 text-2xl font-bold text-green-600 dark:text-green-400">
              {notes.length * 2}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center space-x-3 mb-3">
              <div className="bg-orange-100 dark:bg-orange-900 p-2 rounded-full">
                <RotateCcw className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Spaced Repetition</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Optimized review schedule for retention
            </p>
            <div className="mt-2 text-2xl font-bold text-orange-600 dark:text-orange-400">
              {Math.floor(notes.length * 0.7)}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <div className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
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
            {activeTab === 'summaries' && (
              <div>
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    AI-Generated Summaries
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300">
                    Get concise, intelligent summaries of your notes to quickly review key concepts.
                  </p>
                </div>
                <Summarizer />

                {notes.length > 0 ? (
                  <div className="space-y-4">
                    {notes.map((note) => (
                      <div key={note.id} className="border dark:border-gray-700 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-medium text-gray-900 dark:text-white">
                              {note.title}
                            </h3>
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 mt-1">
                              {note.subject}
                            </span>
                          </div>
                          <button
                            onClick={() => {
                              const summary = generateAISummary(note.content);
                              alert(`AI Summary: ${summary}`);
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors flex items-center space-x-1"
                          >
                            <Sparkles className="h-3 w-3" />
                            <span>Generate Summary</span>
                          </button>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {/* Summary will be displayed here */}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">
                      Create some notes to see AI-generated summaries
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Flashcards Tab */}
            {activeTab === 'flashcards' && (
              <div>
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    AI-Generated Flashcards
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300">
                    Practice with automatically generated flashcards for active recall learning.
                  </p>
                </div>

                {notes.length > 0 ? (
                  <div className="space-y-6">
                    {notes.map((note) => {
                      const flashcards = generateFlashcards(note);
                      return (
                        <div key={note.id} className="border dark:border-gray-700 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h3 className="font-medium text-gray-900 dark:text-white">
                                {note.title}
                              </h3>
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                {flashcards.length} flashcards generated
                              </span>
                            </div>
                            <button
                              onClick={async () => {
                                // Log streak event for flashcard practice
                                await logStreakEvent('review', { noteId: note.id });
                              }}
                              className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                            >
                              Practice
                            </button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {flashcards.map((card, index) => (
                              <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                                <div className="font-medium text-sm text-gray-900 dark:text-white mb-2">
                                  Q: {card.front}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-300">
                                  A: {card.back}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">
                      Create some notes to generate flashcards
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Quizzes Tab */}
            {activeTab === 'quizzes' && (
              <div>
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    AI-Generated Quizzes
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300">
                    Test your knowledge with AI-generated quiz questions based on your notes.
                  </p>
                </div>

                {notes.length > 0 ? (
                  <div className="space-y-6">
                    {notes.map((note) => {
                      const quiz = generateQuiz(note);
                      return (
                        <div key={note.id} className="border dark:border-gray-700 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h3 className="font-medium text-gray-900 dark:text-white">
                                {note.title}
                              </h3>
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                {quiz.length} questions available
                              </span>
                            </div>
                            <button
                              onClick={async () => {
                                // Log streak event for quiz completion
                                await logStreakEvent('quiz', { noteId: note.id });
                              }}
                              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                            >
                              Take Quiz
                            </button>
                          </div>
                          <div className="space-y-4">
                            {quiz.map((question, index) => (
                              <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                                <div className="font-medium text-sm text-gray-900 dark:text-white mb-3">
                                  {index + 1}. {question.question}
                                </div>
                                <div className="space-y-2">
                                  {question.options.map((option, optionIndex) => (
                                    <div key={optionIndex} className="flex items-center space-x-2">
                                      <div className={`w-4 h-4 rounded-full border-2 ${
                                        optionIndex === question.correct
                                          ? 'bg-green-500 border-green-500'
                                          : 'border-gray-300 dark:border-gray-600'
                                      }`}></div>
                                      <span className="text-sm text-gray-600 dark:text-gray-300">
                                        {option}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">
                      Create some notes to generate quiz questions
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Review Schedule Tab */}
            {activeTab === 'schedule' && (
              <div>
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Spaced Repetition Schedule
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300">
                    Optimize your learning with scientifically-backed spaced repetition intervals.
                  </p>
                </div>

                {notes.length > 0 ? (
                  <div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                      <div className="bg-red-50 dark:bg-red-900 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                          {Math.floor(notes.length * 0.2)}
                        </div>
                        <div className="text-sm text-red-800 dark:text-red-200">Due Today</div>
                      </div>
                      <div className="bg-yellow-50 dark:bg-yellow-900 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                          {Math.floor(notes.length * 0.3)}
                        </div>
                        <div className="text-sm text-yellow-800 dark:text-yellow-200">Due This Week</div>
                      </div>
                      <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                          {Math.floor(notes.length * 0.5)}
                        </div>
                        <div className="text-sm text-green-800 dark:text-green-200">Future Reviews</div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {notes.map((note) => (
                        <div key={note.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
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
                              Next review: {note.nextReview ? formatDate(note.nextReview) : 'Not scheduled'}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              Interval: 1 day
                            </div>
                          </div>
                          <button
                            onClick={async () => {
                              // Log streak event for spaced repetition review
                              await logStreakEvent('review', { noteId: note.id });
                            }}
                            className="ml-4 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                          >
                            Review
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">
                      Create some notes to see your review schedule
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
    </div>
  );
};

export default AIToolsPage;