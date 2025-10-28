import React, { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { X, Save, Sparkles } from 'lucide-react';

const NoteEditor = ({ note, onClose }) => {
  const { addNote, updateNote, logStreakEvent } = useData();
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    content: '',
    revisionDate: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [aiSummary, setAiSummary] = useState('');

  const subjects = [
    'Computer Science','Mathematics','Physics','Chemistry','Biology',
    'History','Literature','Philosophy','Economics','Psychology','Other'
  ];

  useEffect(() => {
    if (note) {
      setFormData({
        title: note.title || '',
        subject: note.subject || '',
        content: note.content || '',
        revisionDate: note.revisionDate ? new Date(note.revisionDate).toISOString().split('T')[0] : ''
      });
    }
  }, [note]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.subject) newErrors.subject = 'Subject is required';
    if (!formData.content.trim()) newErrors.content = 'Content is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      if (note && note.id) {
        await updateNote(note.id, formData);
        // Log streak event for note edit (meaningful edit detection)
        const contentLength = formData.content.replace(/<[^>]*>/g, '').length;
        if (contentLength >= 20) {
          await logStreakEvent('note', { noteId: note.id, editLength: contentLength });
        }
      } else {
        await addNote(formData);
        // Log streak event for new note creation
        const contentLength = formData.content.replace(/<[^>]*>/g, '').length;
        if (contentLength >= 20) {
          await logStreakEvent('note', { editLength: contentLength });
        }
      }
      onClose();
    } catch (error) {
      console.error('Error saving note:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleGenerateSummary = async () => {
    if (!formData.content.trim()) return;
    setLoading(true);
    setShowSummary(false);
    try {
      const response = await fetch('http://localhost:5000/api/notes/note-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: formData.content }),
      });
      if (!response.ok) throw new Error('Summary generation failed');
      const data = await response.json();
      setAiSummary(data.summary || 'No summary available.');
      setShowSummary(true);
    } catch (error) {
      console.error(error);
      setAiSummary('Error generating summary.');
      setShowSummary(true);
    } finally {
      setLoading(false);
    }
  };

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ color: [] }, { background: [] }],
      ['link', 'blockquote', 'code-block'],
      ['clean']
    ],
  };

  const formats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'color', 'background',
    'link', 'blockquote', 'code-block'
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      {/* Quill toolbar dark mode fix */}
      <style>{`
        .ql-toolbar { color: #374151 !important; }
        .ql-toolbar .ql-formats button, .ql-toolbar .ql-picker { color: #374151 !important; }
        .dark .ql-toolbar { color: #ffffff !important; }
        .dark .ql-toolbar .ql-formats button, .dark .ql-toolbar .ql-picker {
          color: #ffffff !important; filter: invert(1) brightness(2);
        }
        .dark .ql-toolbar .ql-picker-options { background-color: #374151 !important; color: #ffffff !important; }
      `}</style>

      {/* Modal container: max height + scrollable */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {note && note.id ? 'Edit Note' : 'Create New Note'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Form fills remaining space */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1">
          {/* Scrollable content area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.title ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                placeholder="Enter note title..."
              />
              {errors.title && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.title}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Subject *
              </label>
              <select
                value={formData.subject}
                onChange={(e) => handleChange('subject', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.subject ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
              >
                <option value="">Select a subject</option>
                {subjects.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
              {errors.subject && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.subject}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Revision Date
              </label>
              <input
                type="date"
                value={formData.revisionDate}
                onChange={(e) => handleChange('revisionDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Select revision date..."
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Optional: Set a date to be reminded for revision</p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Content *
                </label>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={handleGenerateSummary}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors flex items-center space-x-1"
                  >
                    <Sparkles className="h-3 w-3" />
                    <span>AI Summary</span>
                  </button>
                </div>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <ReactQuill
                  theme="snow"
                  value={formData.content}
                  onChange={(value) => handleChange('content', value)}
                  modules={modules}
                  formats={formats}
                  className="bg-white dark:bg-gray-700"
                  style={{ height: '300px' }}
                />
              </div>
              {errors.content && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.content}</p>}
            </div>

            {showSummary && aiSummary && (
              <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <h3 className="font-medium text-blue-800 dark:text-blue-200">AI Summary</h3>
                </div>
                <p className="text-blue-700 dark:text-blue-300 text-sm">{aiSummary}</p>
              </div>
            )}
          </div>

          {/* Non-scrollable footer: always visible */}
          <div className="shrink-0 flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>{loading ? 'Saving...' : 'Save Note'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NoteEditor;
