import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import SignInForm from './components/auth/SignInForm';
import SignupForm from './components/auth/SignupForm';
import Countries from './Countries';
import CountryDetails from './CountryDetails';
import MyNotes from './MyNotes';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/auth/ProtectedRoute';

const AppContent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [hasRestoredView, setHasRestoredView] = useState(false);

  useEffect(() => {
    if (!hasRestoredView) {
      const savedView = sessionStorage.getItem('currentView');
      if (savedView && savedView !== location.pathname) {
        console.log('Restoring view to:', savedView);
        navigate(savedView, { replace: true });
      }
      setHasRestoredView(true);
    }
  }, [navigate, hasRestoredView, location.pathname]);

  useEffect(() => {
    console.log('Saving current view:', location.pathname);
    sessionStorage.setItem('currentView', location.pathname);
  }, [location.pathname]);

  return (
    <Routes>
      <Route path="/signin" element={<SignInForm />} />
      <Route path="/signup" element={<SignupForm />} />
      <Route
        path="/countries"
        element={
          <ProtectedRoute>
            <Countries />
          </ProtectedRoute>
        }
      />
      <Route
        path="/country/:name"
        element={
          <ProtectedRoute>
            <CountryDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-notes"
        element={
          <ProtectedRoute>
            <MyNotes />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<SignInForm />} />
    </Routes>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <AppContent />
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}