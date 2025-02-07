import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AgentProvider } from './context/AgentContext';
import Home from './pages/Home';
import Footer from './components/Footer';
import SignIn from './pages/auth/SignIn';
import SignUp from './pages/auth/SignUp';
import Editor from './components/editor/Editor';
import { initializeFirebaseServices } from './services/firebase';

// Protected Route wrapper component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  console.log('Protected Route:', { user, loading }); // Debug log

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    console.log('Redirecting to login...'); // Debug log
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  console.log('AppRoutes rendering...'); // Debug log

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />

      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />
      <Route
        path="/editor/:paperId"
        element={
          <ProtectedRoute>
            <Editor />
          </ProtectedRoute>
        }
      />

      {/* Catch-all Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  const [isInitializing, setIsInitializing] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    const initialize = async () => {
      try {
        await initializeFirebaseServices();
        console.log('Firebase services initialized in App');
      } catch (error) {
        console.error('Failed to initialize Firebase:', error);
        setInitError((error as Error).message);
      } finally {
        setIsInitializing(false);
      }
    };

    initialize();
  }, []);

  console.log('App rendering...', { isInitializing, initError }); // Debug log

  const LoadingScreen = () => (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Initializing application...</p>
      </div>
    </div>
  );

  const ErrorScreen = ({ error }: { error: string }) => (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="text-red-600 mb-4">⚠️</div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Initialization Error</h1>
        <p className="text-gray-600">{error}</p>
      </div>
    </div>
  );

  // Show loading screen before Firebase initialization
  if (isInitializing) {
    return <LoadingScreen />;
  }

  // Show error screen if initialization failed
  if (initError) {
    return <ErrorScreen error={initError} />;
  }

  return (
    <Router>
      <AuthProvider>
        <AgentProvider>
          <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col">
            <div className="flex-grow">
              <AppRoutes />
            </div>
            <Footer />
          </div>
        </AgentProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
