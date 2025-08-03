import React, { useState, useEffect } from 'react';
import { X, Brain, Sparkles, BookOpen, Lightbulb } from 'lucide-react';

const AIExplanationModal = ({ term, onClose }) => {
  const [explanation, setExplanation] = useState('');
  const [loading, setLoading] = useState(true);
  const [relatedConcepts, setRelatedConcepts] = useState([]);

  useEffect(() => {
    // Simulate AI explanation generation
    const generateExplanation = () => {
      setLoading(true);
      
      // Simulate API delay
      setTimeout(() => {
        const explanations = {
          'machine learning': {
            definition: 'Machine learning is a subset of artificial intelligence (AI) that provides systems the ability to automatically learn and improve from experience without being explicitly programmed.',
            details: 'It focuses on the development of computer programs that can access data and use it to learn for themselves. The process of learning begins with observations or data, such as examples, direct experience, or instruction, in order to look for patterns in data and make better decisions in the future based on the examples that we provide.',
            related: ['Artificial Intelligence', 'Deep Learning', 'Neural Networks', 'Supervised Learning']
          },
          'react': {
            definition: 'React is a free and open-source front-end JavaScript library for building user interfaces or UI components.',
            details: 'It is maintained by Facebook and a community of individual developers and companies. React can be used as a base in the development of single-page or mobile applications. React applications consist of multiple components, each responsible for rendering a small, reusable piece of HTML.',
            related: ['JavaScript', 'Virtual DOM', 'JSX', 'Components']
          },
          'quantum mechanics': {
            definition: 'Quantum mechanics is a fundamental theory in physics that provides a description of the physical properties of nature at the scale of atoms and subatomic particles.',
            details: 'It is the foundation of all quantum physics including quantum chemistry, quantum field theory, quantum technology, and quantum information science. Quantum mechanics differs from classical physics in that energy, momentum, angular momentum, and other quantities are often restricted to discrete values.',
            related: ['Wave-Particle Duality', 'Uncertainty Principle', 'Quantum Entanglement', 'Superposition']
          }
        };

        const defaultExplanation = {
          definition: `"${term}" is a concept that requires further study and understanding in your chosen field.`,
          details: 'This term appears in your notes and may be important for your learning objectives. Consider researching this topic further through reliable academic sources, textbooks, or consulting with subject matter experts.',
          related: ['Research Methods', 'Academic Sources', 'Study Techniques', 'Knowledge Building']
        };

        const result = explanations[term.toLowerCase()] || defaultExplanation;
        setExplanation(result.definition + ' ' + result.details);
        setRelatedConcepts(result.related);
        setLoading(false);
      }, 1000);
    };

    generateExplanation();
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
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                AI Explanation
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Understanding: "{term}"
              </p>
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
                <span className="text-gray-600 dark:text-gray-300">
                  AI is analyzing the term...
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Main Explanation */}
              <div className="bg-purple-50 dark:bg-purple-900 border border-purple-200 dark:border-purple-700 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  <h3 className="font-semibold text-purple-800 dark:text-purple-200">
                    AI-Generated Explanation
                  </h3>
                </div>
                <p className="text-purple-700 dark:text-purple-300 leading-relaxed">
                  {explanation}
                </p>
              </div>

              {/* Related Concepts */}
              {relatedConcepts.length > 0 && (
                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <Lightbulb className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Related Concepts
                    </h3>
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

              {/* Study Suggestions */}
              <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <h3 className="font-semibold text-blue-800 dark:text-blue-200">
                    Study Suggestions
                  </h3>
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