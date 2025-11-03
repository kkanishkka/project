import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Square, Play, Pause, X } from 'lucide-react';

const VoiceInput = ({ onClose, onVoiceText }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recordingTime, setRecordingTime] = useState(0);
  const [recognition, setRecognition] = useState(null);

  useEffect(() => {
    // Check if Web Speech API is supported
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'en-US';
      
      recognitionInstance.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        setTranscript(prev => prev + finalTranscript + interimTranscript);
      };
      
      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
      };
      
      recognitionInstance.onend = () => {
        setIsRecording(false);
      };
      
      setRecognition(recognitionInstance);
    }

    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, []);

  useEffect(() => {
    let interval;
    if (isRecording && !isPaused) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording, isPaused]);

  const startRecording = () => {
    if (recognition) {
      setIsRecording(true);
      setIsPaused(false);
      setRecordingTime(0);
      recognition.start();
    } else {
      setIsRecording(true);
      setIsPaused(false);
      setRecordingTime(0);
      simulateVoiceInput();
    }
  };

  const pauseRecording = () => {
    if (recognition) {
      recognition.stop();
    }
    setIsPaused(true);
  };

  const resumeRecording = () => {
    if (recognition) {
      recognition.start();
    }
    setIsPaused(false);
  };

  const stopRecording = () => {
    if (recognition) {
      recognition.stop();
    }
    setIsRecording(false);
    setIsPaused(false);
  };

  const simulateVoiceInput = () => {
    const sampleTexts = [
      "Today I learned about machine learning algorithms and their applications in real-world scenarios.",
      "The key concepts in React include components, state management, and the virtual DOM.",
      "Quantum mechanics involves the study of matter and energy at the smallest scales.",
      "Database normalization is important for reducing data redundancy and improving data integrity."
    ];
    
    const randomText = sampleTexts[Math.floor(Math.random() * sampleTexts.length)];
    
    let i = 0;
    const typeInterval = setInterval(() => {
      if (i < randomText.length) {
        setTranscript(prev => prev + randomText[i]);
        i++;
      } else {
        clearInterval(typeInterval);
        setIsRecording(false);
      }
    }, 50);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSaveTranscript = () => {
    if (transcript.trim()) {
      onVoiceText(transcript);
    }
  };

  const clearTranscript = () => {
    setTranscript('');
    setRecordingTime(0);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
            <Mic className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <span>Voice to Text</span>
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="p-6 text-center border-b border-gray-200 dark:border-gray-700">
          <div className="mb-4">
            <div className={`w-24 h-24 rounded-full mx-auto flex items-center justify-center ${
              isRecording 
                ? 'bg-red-100 dark:bg-red-900 animate-pulse' 
                : 'bg-gray-100 dark:bg-gray-700'
            }`}>
              {isRecording ? (
                <Mic className="h-12 w-12 text-red-600 dark:text-red-400" />
              ) : (
                <MicOff className="h-12 w-12 text-gray-400" />
              )}
            </div>
          </div>
          
          <div className="text-2xl font-mono font-bold text-gray-900 dark:text-white mb-2">
            {formatTime(recordingTime)}
          </div>
          
          <div className="text-sm text-gray-600 dark:text-gray-300">
            {isRecording 
              ? (isPaused ? 'Recording paused' : 'Recording in progress...') 
              : 'Ready to record'
            }
          </div>
        </div>

        <div className="p-6 flex justify-center space-x-4 border-b border-gray-200 dark:border-gray-700">
          {!isRecording ? (
            <button
              onClick={startRecording}
              className="bg-red-600 hover:bg-red-700 text-white p-4 rounded-full transition-colors shadow-lg"
            >
              <Mic className="h-6 w-6" />
            </button>
          ) : (
            <>
              {!isPaused ? (
                <button
                  onClick={pauseRecording}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white p-3 rounded-full transition-colors"
                >
                  <Pause className="h-5 w-5" />
                </button>
              ) : (
                <button
                  onClick={resumeRecording}
                  className="bg-green-600 hover:bg-green-700 text-white p-3 rounded-full transition-colors"
                >
                  <Play className="h-5 w-5" />
                </button>
              )}
              <button
                onClick={stopRecording}
                className="bg-gray-600 hover:bg-gray-700 text-white p-3 rounded-full transition-colors"
              >
                <Square className="h-5 w-5" />
              </button>
            </>
          )}
        </div>

        {/* Transcript */}
        <div className="p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Transcript
            </label>
            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              className="w-full h-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
              placeholder={
                'webkitSpeechRecognition' in window || 'SpeechRecognition' in window
                  ? "Your speech will appear here..."
                  : "Click record to see simulated voice-to-text (Speech API not supported in this browser)"
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={clearTranscript}
              className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 text-sm font-medium"
            >
              Clear
            </button>
            
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveTranscript}
                disabled={!transcript.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
              >
                Create Note
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceInput;