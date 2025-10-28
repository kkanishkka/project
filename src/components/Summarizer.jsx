// src/components/Summarizer.jsx
import React, { useState } from "react";
import { summarizeText } from "../utils";

export default function Summarizer() {
  const [input, setInput] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSummarize = async () => {
    setLoading(true);
    setSummary("");
    try {
      const result = await summarizeText(input);
      setSummary(result);
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
