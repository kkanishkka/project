import React, { useState } from 'react';

const YouTubeSummarizerModal = ({ onClose }) => {
  const [url, setUrl] = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSummarize = async () => {
    setLoading(true);
    setSummary('');
    setError('');
    try {
      const res = await fetch('http://localhost:5000/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ youtubeUrl: url }),
      });
      const data = await res.json();
      if (res.ok) {
        setSummary(data.summary);
      } else {
        setError(data.detail || 'Error summarizing video');
      }
    } catch (err) {
      setError('Network error');
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-900 p-6 rounded-lg w-full max-w-xl shadow-lg relative">
        <button
          className="absolute top-2 right-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 text-2xl font-bold"
          onClick={onClose}
        >
          ×
        </button>
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">YouTube Summary</h2>
        <input
          type="text"
          placeholder="Paste YouTube video link"
          className="w-full p-2 mb-4 border rounded-md dark:bg-gray-800 dark:text-white"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <button
          onClick={handleSummarize}
          disabled={loading || !url}
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded mb-4"
        >
          {loading ? 'Summarizing...' : 'Get Summary'}
        </button>

        {error && <p className="text-red-600">{error}</p>}
        {summary && (
          <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded">
            <h4 className="font-semibold mb-2">Summary:</h4>
            <p>{summary}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default YouTubeSummarizerModal;
