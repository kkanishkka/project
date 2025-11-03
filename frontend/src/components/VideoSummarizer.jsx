import React, { useState } from 'react';


const VideoSummarizer = () => {
  const [url, setUrl] = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSummarize = async () => {
    setLoading(true);
    setError('');
    setSummary('');

    try {
      const response = await fetch('http://localhost:5000/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ youtubeUrl: url })
      });

      const data = await response.json();
      if (data.error) setError(data.error);
      else setSummary(data.summary);
    } catch (err) {
      setError('Server error.');
    }
    setLoading(false);
  };

  return (
    <div className="video-summarizer-container">
      <h2>YouTube Video Summarizer</h2>
      <input
        type="text"
        placeholder="Enter YouTube link"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />
      <button onClick={handleSummarize} disabled={loading}>
        {loading ? 'Summarizing...' : 'Get Summary'}
      </button>

      {error && <p className="error">{error}</p>}
      {summary && (
        <div className="summary-box">
          <h4>Summary:</h4>
          <p>{summary}</p>
        </div>
      )}
    </div>
  );
};

export default VideoSummarizer;

VideoSummarizer.jsx