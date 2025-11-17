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
import ReviewModePage from "./pages/ReviewModePage";

function App() {
  return (
    <Router>
      <ThemeProvider>
        <DataProvider>
          <AuthProvider>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
              <Navbar />

              {/* ✅ All routes must be INSIDE <Routes> */}
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

                {/* ✅ MOVED REVIEW ROUTE INSIDE ROUTES */}
                <Route
                  path="/review"
                  element={
                    <ProtectedRoute>
                      <ReviewModePage />
                    </ProtectedRoute>
                  }
                />
              </Routes>

              {/* Modal Portal */}
              <div id="modal-root" />
            </div>
          </AuthProvider>
        </DataProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
