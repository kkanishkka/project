import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Brain, 
  BookOpen, 
  Zap, 
  Users, 
  Clock, 
  Target,
  ArrowRight,
  CheckCircle,
  Sparkles,
  Mic,
  RotateCcw
} from 'lucide-react';

const LandingPage = () => {
  const { user } = useAuth();

  const features = [
    { icon: <Brain className="h-8 w-8 text-blue-600" />, title: "AI-Powered Summaries", description: "Transform lengthy notes into concise, intelligent summaries that capture key concepts and insights." },
    { icon: <RotateCcw className="h-8 w-8 text-blue-700" />, title: "Spaced Repetition", description: "Optimize your learning with scientifically-backed spaced repetition scheduling for long-term retention." },
    { icon: <Target className="h-8 w-8 text-sky-600" />, title: "Active Recall", description: "Generate flashcards and quizzes automatically from your notes to enhance memory consolidation." },
    { icon: <Mic className="h-8 w-8 text-blue-500" />, title: "Voice-to-Text", description: "Capture thoughts instantly with advanced voice recognition technology for seamless note-taking." },
    { icon: <Sparkles className="h-8 w-8 text-cyan-600" />, title: "Smart Explanations", description: "Get instant AI-powered explanations for difficult terms and concepts right within your notes." },
    { icon: <Clock className="h-8 w-8 text-indigo-600" />, title: "Progress Tracking", description: "Monitor your learning progress and retention rates with detailed analytics and insights." }
  ];

  return (
    <div className="min-h-screen">

      {/* HERO — blue/white taped-paper look */}
      <section className="relative overflow-hidden bg-gradient-to-br from-white via-blue-50 to-white dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
        {/* soft blobs */}
        <div className="pointer-events-none absolute -top-24 -left-24 h-80 w-80 rounded-full bg-blue-200/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 -right-28 h-96 w-96 rounded-full bg-sky-200/40 blur-3xl" />
        {/* subtle dot pattern */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              'radial-gradient(rgba(59,130,246,0.25) 1px, transparent 1.5px)',
            backgroundSize: '18px 18px'
          }}
        />
        {/* angled scribbles (SVG) */}
        <svg
          className="pointer-events-none absolute -top-10 right-10 w-56 opacity-30"
          viewBox="0 0 200 80" fill="none"
        >
          <path d="M10 40 C 40 10, 80 70, 120 25 S 180 60, 190 35" stroke="#60A5FA" strokeWidth="3" strokeLinecap="round"/>
        </svg>
        <svg
          className="pointer-events-none absolute bottom-8 left-10 w-48 rotate-6 opacity-25"
          viewBox="0 0 200 80" fill="none"
        >
          <path d="M10 55 C 50 15, 90 65, 140 20 S 190 65, 195 30" stroke="#38BDF8" strokeWidth="3" strokeLinecap="round"/>
        </svg>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="text-center">
            {/* “paper” card under your existing hero text */}
            <div className="relative mx-auto max-w-3xl">
              {/* paper sheet */}
              <div className="relative rounded-[18px] bg-white/95 shadow-xl ring-1 ring-blue-100 dark:bg-gray-900/90 dark:ring-white/10 p-8 md:p-10">
                <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                  Transforming Notes into
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-sky-600 block">
                    Intelligent Learning Tools
                  </span>
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
                  Harness the power of AI to enhance your learning experience. Create smarter notes, 
                  generate instant summaries, and master any subject with adaptive spaced repetition.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  {/* keep your original button exactly */}
                  <Link
                    to={user ? "/dashboard" : "/signup"}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                  >
                    <span>Get Started</span>
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </div>
              </div>

              {/* tape corners */}
              <span className="pointer-events-none absolute -top-3 -left-3 h-10 w-24 rotate-[-8deg] rounded-sm bg-blue-200/70 shadow" />
              <span className="pointer-events-none absolute -bottom-3 -right-3 h-10 w-24 rotate-[12deg] rounded-sm bg-sky-200/70 shadow" />
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES (colors nudged to blue/white, structure unchanged) */}
      <section id="features" className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Powerful Features for Smart Learning
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Everything you need to transform your study habits and achieve better learning outcomes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-blue-50/60 dark:bg-gray-700/60 border border-blue-100/70 dark:border-gray-700 p-8 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS (kept same, just blue/white) */}
      <section className="py-20 bg-blue-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              How ThinkStash Vault Works
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              A simple 3-step process to revolutionize your learning experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 dark:bg-blue-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <BookOpen className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                1. Create Notes
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Write, record, or dictate your notes with our intuitive interface and voice-to-text technology.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-100 dark:bg-blue-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <Zap className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                2. AI Enhancement
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Our AI automatically generates summaries, flashcards, and explanations from your content.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-100 dark:bg-blue-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <Target className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                3. Smart Review
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Follow personalized spaced repetition schedules to maximize retention and learning efficiency.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA (unchanged layout, slightly brighter blue) */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-sky-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Learning?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of students, professionals, and lifelong learners who are already 
            using ThinkStash Vault to achieve their learning goals.
          </p>
          <Link
            to={user ? "/dashboard" : "/signup"}
            className="bg-white text-blue-700 hover:bg-gray-100 px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl inline-flex items-center space-x-2"
          >
            <span>Start Learning Smarter Today</span>
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
