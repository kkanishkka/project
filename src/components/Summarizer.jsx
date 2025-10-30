// src/components/Summarizer.jsx
import React, { useState } from "react";
import { useData } from "../contexts/DataContext";

export default function Summarizer() {
  const [input, setInput] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const { logStreakEvent } = useData();

  const handleSummarize = async () => {
    setLoading(true);
    setSummary("");
    try {
      const token = localStorage.getItem('thinkstash_token');
      if (!token) {
        setSummary("❌ Authentication required. Please log in.");
        setLoading(false);
        return;
      }

      const response = await fetch("http://localhost:5000/api/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ content: input }),
      });

      if (!response.ok) {
        throw new Error("Summarization API failed");
      }

      const result = await response.json();
      setSummary(result.summary || "Could not generate summary");

      // Log streak event for AI summarization
      if (result.summary) {
        await logStreakEvent('ai_session', { contentLength: input.length });
      }
    } catch (err) {
      setSummary("❌ " + err.message);
    }
    setLoading(false);
  };

  const handleClear = () => {
    setInput("");
    setSummary("");
  };

  return (
    <div className="p-4 border rounded bg-white dark:bg-gray-800">
      <h2 className="text-lg font-bold mb-2">AI Text Summarizer</h2>

      <textarea
        className="w-full p-2 border rounded mb-2"
        rows="4"
        placeholder="Paste text here..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />

      <div className="flex gap-2">
        <button
          onClick={handleSummarize}
          disabled={loading || !input}
          className="px-3 py-1 bg-blue-600 text-white rounded"
        >
          {loading ? "Summarizing..." : "Summarize"}
        </button>
        <button
          onClick={handleClear}
          className="px-3 py-1 bg-gray-400 text-white rounded"
        >
          Clear
        </button>
      </div>

      {summary && (
        <p className="mt-3 text-sm text-gray-700 dark:text-gray-300">
          <b>Summary:</b> {summary}
        </p>
      )}
    </div>
  );
}
