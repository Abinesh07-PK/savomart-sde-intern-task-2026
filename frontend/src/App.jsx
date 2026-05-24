import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import BottomNav from './components/BottomNav';
import AiChatButton from './components/AiChatButton';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import OffersPage from './pages/OffersPage';
import StoresPage from './pages/StoresPage';
import SupportPage from './pages/SupportPage';
import ProfilePage from './pages/ProfilePage';
import { Toaster } from 'react-hot-toast';

// Layout component to selectively wrap protected pages with the navigation bar and floating AI chatbot
const AppLayout = ({ children }) => {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Responsive Bottom / Desktop Top Navigation bar */}
      <BottomNav />
      
      {/* Main viewport */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6 pb-24 md:pb-6 font-sans">
        {children}
      </main>

      {/* Floating AI chatbot client */}
      <AiChatButton />
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        {/* standard styling rules for all toasts */}
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: '#334155',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: '500',
              borderRadius: '12px',
              padding: '12px 18px',
            },
            success: {
              iconTheme: {
                primary: '#FFF200',
                secondary: '#782B90',
              },
            },
          }}
        />
        
        <AppLayout>
          <Routes>
            {/* Public Auth Gateway */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected Core Screens */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/offers"
              element={
                <ProtectedRoute>
                  <OffersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/stores"
              element={
                <ProtectedRoute>
                  <StoresPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/support"
              element={
                <ProtectedRoute>
                  <SupportPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />

            {/* Catch-all Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppLayout>
      </AuthProvider>
    </Router>
  );
}

export default App;
