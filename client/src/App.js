import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import './App.css';

// Lazy load components for better performance
const LandingPage = React.lazy(() => import('./components/LandingPage'));
const Login = React.lazy(() => import('./components/Login'));
const Dashboard = React.lazy(() => import('./components/Dashboard'));
const Applications = React.lazy(() => import('./components/Applications'));
const Jobs = React.lazy(() => import('./components/Jobs'));
const BotMimicDashboard = React.lazy(() => import('./components/BotMimicDashboard'));
const Navbar = React.lazy(() => import('./components/Navbar'));

// Loading component for Suspense fallback
const LoadingFallback = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
  }}>
    <div style={{
      textAlign: 'center',
      padding: '2rem',
      background: 'rgba(255, 255, 255, 0.9)',
      borderRadius: '20px',
      backdropFilter: 'blur(10px)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        border: '3px solid #e2e8f0',
        borderTop: '3px solid #3b82f6',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        margin: '0 auto 1rem'
      }}></div>
      <p style={{ margin: 0, color: '#64748b', fontSize: '1rem' }}>Loading...</p>
    </div>
    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard" element={<ProtectedRoutes />} />
              <Route path="/dashboard/jobs" element={<ProtectedRoutes />} />
              <Route path="/dashboard/applications" element={<ProtectedRoutes />} />
              <Route path="/dashboard/bot-dashboard" element={<ProtectedRoutes />} />
            </Routes>
          </Suspense>
        </div>
      </Router>
    </AuthProvider>
  );
}

function ProtectedRoutes() {
  const { user, loading } = useAuth();
  const { pathname } = useLocation();

  if (loading) {
    return <LoadingFallback />;
  }

  if (!user) {
    return <Navigate to="/" />;
  }

  // Determine which component to render based on the current path
  const renderComponent = () => {
    if (pathname === '/dashboard/jobs') {
      return <Jobs />;
    } else if (pathname === '/dashboard/applications') {
      return <Applications />;
    } else if (pathname === '/dashboard/bot-dashboard' && user.role === 'bot_mimic') {
      return <BotMimicDashboard />;
    } else {
      return <Dashboard />;
    }
  };

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Navbar />
      {renderComponent()}
    </Suspense>
  );
}

export default App;
