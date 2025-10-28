import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import AIExplanationModal from './AIExplanationModal';
import {
  Edit, Trash2, Calendar, Clock, Brain, Target, MoreHorizontal,
} from 'lucide-react';

const NoteCard = ({ note, viewMode, onEdit }) => {
  const { deleteNote } = useData();
  const [showMenu, setShowMenu] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [selectedTerm, setSelectedTerm] = useState('');

  const handleCardClick = () => {
    onEdit(note);
  };

  const handleContentDoubleClick = () => {
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();
    if (selectedText) {
      setSelectedTerm(selectedText);
      setShowExplanation(true);
    }
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      deleteNote(note.id);
    }
    setShowMenu(false);
  };

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });

  const formatNextReview = (dateString) => {
    if (!dateString) return 'Not scheduled';
    const diffDays = Math.ceil((new Date(dateString) - new Date()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays < 7) return `${diffDays} days`;
    return formatDate(dateString);
  };

  const getSubjectColor = (subject) => {
    const colors = {
      'Computer Science': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      Mathematics: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      Physics: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      Chemistry: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      Biology: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
      History: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
      Literature: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
      Philosophy: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
      Economics: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
      Psychology: 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200',
    };
    return colors[subject] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  };

  const stripHtml = (html) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  return (
    <div
      className="bg-white dark:bg-gray-8 00 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1 cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2 flex-1">
            {note.title}
          </h3>
          <div className="relative ml-2">
            <button
              onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            >
              <MoreHorizontal className="h-4 w-4 text-gray-400" />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                <button
                  onClick={() => { onEdit(note); setShowMenu(false); }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                >
                  <Edit className="h-4 w-4" />
                  <span>Edit</span>
                </button>

                {/* Removed "Generate Summary" option completely */}

                <button
                  onClick={() => { alert('Flashcards generated!'); setShowMenu(false); }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                >
                  <Target className="h-4 w-4" />
                  <span>Create Flashcards</span>
                </button>

                <button
                  onClick={() => { alert('Quiz generated!'); setShowMenu(false); }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                >
                  <Brain className="h-4 w-4" />
                  <span>Generate Quiz</span>
                </button>

                <hr className="border-gray-200 dark:border-gray-700" />

                <button
                  onClick={handleDelete}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 flex items-center space-x-2"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        </div>

        <span
          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mb-3 ${getSubjectColor(note.subject)}`}
        >
          {note.subject}
        </span>

        <p
          onDoubleClick={handleContentDoubleClick}
          className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3 mb-4 cursor-pointer leading-relaxed"
        >
          {stripHtml(note.content)}
        </p>

        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-1">
            <Calendar className="h-3 w-3" />
            <span>{formatDate(note.createdAt)}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="h-3 w-3" />
            <span>{formatNextReview(note.nextReview)}</span>
          </div>
        </div>
      </div>

      {showExplanation && (
        <AIExplanationModal term={selectedTerm} onClose={() => setShowExplanation(false)} />
      )}
    </div>
  );
};

export default NoteCard;
