
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Layout from './components/Layout';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import ChaletDetails from './pages/ChaletDetails';
import BecomeHost from './pages/BecomeHost';
import ChaletsPage from './pages/Chalets';
import Unauthorized from './pages/Unauthorized';
import AdminLogin from './pages/AdminLogin';
import Concierge from './pages/Concierge';
import { AuthModal } from './components/Auth';
import AIChatbot from './components/AIChatbot';
import { ProtectedRoute } from './components/ProtectedRoute';
import { User, UserRole } from './types';
import { dataService } from './services/dataService';
import { AppProvider } from './contexts/AppContext';

const AppContent: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const currentUser = dataService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
      }
      setIsInitializing(false);
    };
    checkSession();
  }, []);

  const handleLoginSuccess = (authenticatedUser: User) => {
    setUser(authenticatedUser);
    setIsAuthOpen(false);
  };

  const handleLogout = () => {
    dataService.logout();
    setUser(null);
  };

  if (isInitializing) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-reva-900">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-reva-gold border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <Router>
      <Layout 
        user={user} 
        onLogout={handleLogout} 
        onLoginClick={() => setIsAuthOpen(true)}
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/chalets" element={<ChaletsPage />} />
          <Route path="/chalets/:id" element={<ChaletDetails />} />
          <Route path="/become-host" element={<BecomeHost />} />
          <Route path="/concierge" element={<Concierge />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/admin/login" element={
            user?.role === UserRole.ADMIN ? <Navigate to="/admin/dashboard" /> : <AdminLogin onLoginSuccess={handleLoginSuccess} />
          } />

          <Route 
            path="/admin/*" 
            element={
              <ProtectedRoute user={user} allowedRoles={[UserRole.ADMIN]}>
                <Routes>
                  <Route path="dashboard" element={<Dashboard user={user!} />} />
                </Routes>
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/owner/*" 
            element={
              <ProtectedRoute user={user} allowedRoles={[UserRole.OWNER]}>
                <Routes>
                  <Route path="dashboard" element={<Dashboard user={user!} />} />
                </Routes>
              </ProtectedRoute>
            } 
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        <AuthModal 
          isOpen={isAuthOpen} 
          onClose={() => setIsAuthOpen(false)} 
          onLoginSuccess={handleLoginSuccess} 
        />
        
        <AIChatbot />
      </Layout>
    </Router>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;
