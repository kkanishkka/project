import React, { useState, useEffect } from 'react';
import { X, Brain, Sparkles, BookOpen, Lightbulb } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const AIExplanationModal = ({ term, onClose }) => {
  const [explanation, setExplanation] = useState('');
  const [loading, setLoading] = useState(true);
  const [relatedConcepts, setRelatedConcepts] = useState([]);

  useEffect(() => {
    const fetchExplanation = async () => {
      setLoading(true);
      try {
        // Use your backend endpoint here to proxy Hugging Face API calls
       const token = localStorage.getItem("thinkstash_token");

const response = await fetch(`${API}/api/ai/explanation`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
  },
  body: JSON.stringify({ term }),
});


        const data = await response.json();

        if (response.ok) {
          setExplanation(data.explanation || data.definition || 'No explanation available.');
          setRelatedConcepts(data.related || []);
        } else {
          setExplanation('Failed to generate explanation.');
          setRelatedConcepts([]);
        }
      } catch (error) {
        setExplanation('Error fetching explanation.');
        setRelatedConcepts([]);
      } finally {
        setLoading(false);
      }
    };

    if (term && term.trim() !== '') {
      fetchExplanation();
    }
  }, [term]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="bg-purple-100 dark:bg-purple-900 p-2 rounded-full">
              <Brain className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">AI Explanation</h2>
              <p className="text-sm text-gray-600 dark:text-gray-300">Term: "{term}"</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                <span className="text-gray-600 dark:text-gray-300">AI is generating the explanation...</span>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-purple-50 dark:bg-purple-900 border border-purple-200 dark:border-purple-700 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  <h3 className="font-semibold text-purple-800 dark:text-purple-200">AI-Generated Explanation</h3>
                </div>
                <p className="text-purple-700 dark:text-purple-300 leading-relaxed whitespace-pre-wrap">{explanation}</p>
              </div>

              {relatedConcepts.length > 0 && (
                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <Lightbulb className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">Related Concepts</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {relatedConcepts.map((concept, index) => (
                      <div
                        key={index}
                        className="bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer transition-colors"
                      >
                        {concept}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <h3 className="font-semibold text-blue-800 dark:text-blue-200">Study Suggestions</h3>
                </div>
                <ul className="text-blue-700 dark:text-blue-300 text-sm space-y-1">
                  <li>• Create flashcards for this concept and related terms</li>
                  <li>• Look for real-world examples and applications</li>
                  <li>• Connect this concept to other topics in your notes</li>
                  <li>• Schedule a review session in 2-3 days</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <button
            onClick={() => {
              alert('Flashcard created for: ' + term);
              onClose();
            }}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors text-sm"
          >
            Create Flashcard
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIExplanationModal;
