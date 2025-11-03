// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { DataProvider } from './contexts/DataContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import Dashboard from './pages/Dashboard';
import NotesPage from './pages/NotesPage';
import AIToolsPage from './pages/AIToolsPage';

function App() {
  return (
    // 👇 Router is outermost, so all descendants can use useNavigate()
    <Router>
      <ThemeProvider>
        <DataProvider>
          <AuthProvider>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
              <Navbar />

              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/notes"
                  element={
                    <ProtectedRoute>
                      <NotesPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/ai-tools"
                  element={
                    <ProtectedRoute>
                      <AIToolsPage />
                    </ProtectedRoute>
                  }
                />
              </Routes>

              {/* Portal host INSIDE Router & providers */}
              <div id="modal-root" />
            </div>
          </AuthProvider>
        </DataProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
