import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import {
  BookOpen,
  Plus,
  Brain,
  Target,
  Clock,
  TrendingUp,
  Calendar,
  Award,
  Youtube,
  Flame
} from 'lucide-react';

const YouTubeSummarizerModal = ({ onClose }) => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [summary, setSummary] = useState('');

  // Frontend .env → VITE_API_URL=http://localhost:5000
  const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const handleSummarize = async () => {
    if (!url.trim()) return setError('Please paste a YouTube link.');
    setLoading(true);
    setError('');
    setSummary('');
    try {
      const token = localStorage.getItem('thinkstash_token');
      if (!token) {
        setError('Authentication required. Please log in.');
        setLoading(false);
        return;
      }

      const res = await fetch(`${API}/api/youtube-summary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ youtubeUrl: url }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to summarize');
      setSummary(data.summary || '(No summary returned)');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-900 p-6 rounded-lg w-full max-w-2xl shadow-lg relative">
        <button
          className="absolute top-2 right-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 text-2xl font-bold"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>

        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          YouTube Summary
        </h2>

        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Paste YouTube link (https://youtu.be/... or https://www.youtube.com/watch?v=...)"
          className="w-full p-2 mb-4 border rounded-md dark:bg-gray-800 dark:text-white"
        />

        <button
          onClick={handleSummarize}
          disabled={!url || loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white py-2 px-4 rounded"
        >
          {loading ? 'Summarizing...' : 'Summarize'}
        </button>

        {error && <div className="mt-3 text-red-500 text-sm">{error}</div>}

        {summary && (
          <div className="mt-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Summary</h3>
            <div className="prose dark:prose-invert max-w-none text-sm leading-6 whitespace-pre-wrap">
              {summary}
            </div>
            <div className="mt-3">
              <button
                onClick={() => navigator.clipboard.writeText(summary)}
                className="text-xs bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded"
              >
                Copy summary
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const { notes, notesCount, getStreakData, useFreezeToken } = useData();
  const [showYouTubeModal, setShowYouTubeModal] = useState(false);
  const [streakData, setStreakData] = useState({ currentStreak: 0, longestStreak: 0, freezeTokens: 0 });
  const [streakMessage, setStreakMessage] = useState('');

  useEffect(() => {
    const fetchStreak = async () => {
      const data = await getStreakData();
      setStreakData(data);

      // Set streak milestone message
      if (data.currentStreak > 0) {
        if (data.currentStreak === 7) setStreakMessage('🎉 Week streak! Keep it up!');
        else if (data.currentStreak === 30) setStreakMessage('🏆 Month streak! Amazing dedication!');
        else if (data.currentStreak === 100) setStreakMessage('🌟 Century streak! Legendary!');
        else if (data.currentStreak % 10 === 0) setStreakMessage(`🔥 ${data.currentStreak} days! You're on fire!`);
      }
    };
    fetchStreak();
  }, [getStreakData]);

  const stats = [
    { title: 'Total Notes', value: notesCount ?? notes.length, icon: <BookOpen className="h-6 w-6" />, color: 'bg-blue-500', change: '+12%' },
    { title: 'Study Streak', value: `${streakData.currentStreak} days`, icon: <Flame className="h-6 w-6" />, color: 'bg-orange-500', change: streakData.currentStreak > 0 ? '🔥' : 'Start today!' },
    { title: 'Reviews Due', value: Math.floor(notes.length * 0.3), icon: <Clock className="h-6 w-6" />, color: 'bg-orange-500', change: 'Today' },
    { title: 'Mastery Score', value: '82%', icon: <Award className="h-6 w-6" />, color: 'bg-purple-500', change: '+5%' }
  ];

  const recentNotes = notes.slice(-3).reverse();

  const upcomingReviews = notes
    .filter(note => note.revisionDate)
    .sort((a, b) => new Date(a.revisionDate) - new Date(b.revisionDate))
    .slice(0, 5);

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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Ready to continue your learning journey? Here's your progress overview.
          </p>
          {streakMessage && (
            <div className="mt-4 p-4 bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900 dark:to-red-900 rounded-lg border border-orange-200 dark:border-orange-700">
              <p className="text-orange-800 dark:text-orange-200 font-medium">{streakMessage}</p>
            </div>
          )}
          {streakData.freezeTokens > 0 && (
            <div className="mt-4 flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900 rounded-lg border border-blue-200 dark:border-blue-700">
              <div>
                <p className="text-blue-800 dark:text-blue-200 font-medium">Freeze Tokens Available: {streakData.freezeTokens}</p>
                <p className="text-blue-600 dark:text-blue-300 text-sm">Use to preserve your streak if you miss a day</p>
              </div>
              <button
                onClick={async () => {
                  const result = await useFreezeToken();
                  if (result) {
                    setStreakData(prev => ({ ...prev, freezeTokens: prev.freezeTokens - 1 }));
                    alert('Freeze token used! Your streak is preserved.');
                  }
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Use Freeze Token
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</p>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">{stat.change}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-full text-white`}>{stat.icon}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <Link to="/notes" className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow group">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition-colors">
                <Plus className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Create New Note</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Start capturing your ideas</p>
              </div>
            </div>
          </Link>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow group cursor-pointer">
            <div className="flex items-center space-x-4">
              <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-full group-hover:bg-purple-200 dark:group-hover:bg-purple-800 transition-colors">
                <Brain className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI Study Session</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Generate flashcards & quizzes</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow group cursor-pointer">
            <div className="flex items-center space-x-4">
              <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full group-hover:bg-green-200 dark:group-hover:bg-green-800 transition-colors">
                <Target className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Review Mode</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Practice with spaced repetition</p>
              </div>
            </div>
          </div>

          <div
            onClick={() => setShowYouTubeModal(true)}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow group cursor-pointer"
          >
            <div className="flex items-center space-x-4">
              <div className="bg-yellow-100 dark:bg-yellow-900 p-3 rounded-full group-hover:bg-yellow-200 dark:group-hover:bg-yellow-800 transition-colors">
                <Youtube className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">YouTube Summary</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Summarize YouTube videos</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Notes */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Notes</h2>
              <Link to="/notes" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium">View All</Link>
            </div>
            {recentNotes.length > 0 ? (
              <div className="space-y-3">
                {recentNotes.map((note) => (
                  <div key={note._id || note.id} className="border dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-gray-900 dark:text-white truncate">{note.title}</h3>
                      <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap ml-2">{new Date(note.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                      {note.content.replace(/<[^>]*>/g, '').substring(0, 100)}...
                    </p>
                    {Array.isArray(note.tags) && note.tags.length > 0 && (
                      <div className="flex items-center mt-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          {note.tags[0]}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No notes yet</p>
                <Link to="/notes" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium">Create your first note</Link>
              </div>
            )}
          </div>

          {/* Upcoming Reviews */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">REVISION</h2>
              <Calendar className="h-5 w-5 text-gray-400" />
            </div>
            {upcomingReviews.length > 0 ? (
              <div className="space-y-3">
                {upcomingReviews.map((note) => (
                  <div key={note._id || note.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{note.title}</p>
                      {Array.isArray(note.tags) && note.tags.length > 0 && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">{note.tags[0]}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-medium text-gray-900 dark:text-white">{formatDate(note.revisionDate)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No reviews scheduled</p>
                <p className="text-sm text-gray-400 dark:text-gray-500">Create notes to see review schedule</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* hidden fallback opener for modal (optional) */}
      <button onClick={() => setShowYouTubeModal(true)} style={{ display: 'none' }}>
        Open YouTube Summarizer
      </button>

      {showYouTubeModal && (
        <YouTubeSummarizerModal onClose={() => setShowYouTubeModal(false)} />
      )}
    </div>
  );
};

export default Dashboard;
