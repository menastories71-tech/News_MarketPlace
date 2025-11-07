import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AdminAuthProvider, useAdminAuth } from './context/AdminAuthContext';
import AuthModal from './components/auth/AuthModal';
import AdminLogin from './components/admin/AdminLogin';
import AdminDashboard from './components/admin/AdminDashboard';
import UserHeader from './components/common/UserHeader';
import UserFooter from './components/common/UserFooter';
import FeatureSlider from './components/common/FeatureSlider';
import TopHeader from './components/common/TopHeader';
import ServiceHeader from './components/common/ServiceHeader';
import TermsAndConditions from './pages/TermsAndConditions';
import Icon from './components/common/Icon';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <UserHeader />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Icon name="arrow-path" size="lg" className="animate-spin text-primary mx-auto mb-4" />
            <p className="body-regular">Loading...</p>
          </div>
        </div>
        <UserFooter />
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/" replace />;
};

// Admin Protected Route Component
const AdminProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAdminAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <UserHeader />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Icon name="arrow-path" size="lg" className="animate-spin text-primary mx-auto mb-4" />
            <p className="body-regular">Loading admin panel...</p>
          </div>
        </div>
        <UserFooter />
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/admin/login" replace />;
};

// Home Page Component
const HomePage = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gray-80">
      <UserHeader onShowAuth={() => setShowAuthModal(true)} />

      {/* Feature Slider */}
      <FeatureSlider />

      <TopHeader />
      <ServiceHeader />

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="heading-1 mb-8">
            Welcome to News Marketplace
          </h1>
          <p className="body-large mb-10 max-w-2xl mx-auto">
            Discover, create, and share premium news content. Join our community of writers and readers.
          </p>

          {!isAuthenticated && (
            <button
              onClick={() => setShowAuthModal(true)}
              className="btn-primary text-lg px-10 py-4"
            >
              Get Started
            </button>
          )}

          {isAuthenticated && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
              <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
                <Icon name="pencil" size="lg" className="text-primary mb-6 mx-auto" />
                <h3 className="heading-4 mb-4">Write Articles</h3>
                <p className="body-small">Create and publish your own news content</p>
              </div>
              <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
                <Icon name="eye" size="lg" className="text-primary mb-6 mx-auto" />
                <h3 className="heading-4 mb-4">Read Premium</h3>
                <p className="body-small">Access exclusive articles and insights</p>
              </div>
              <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
                <Icon name="bell" size="lg" className="text-primary mb-6 mx-auto" />
                <h3 className="heading-4 mb-4">Stay Updated</h3>
                <p className="body-small">Get notified about latest news and trends</p>
              </div>
            </div>
          )}
        </div>
      </main>

      <UserFooter />

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
};

// Dashboard Page Component
const DashboardPage = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <UserHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="heading-2 mb-6">Welcome, {user?.first_name}!</h2>
          <p className="body-regular mb-8">Your dashboard is ready. Start exploring News Marketplace!</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-primary-light p-6 rounded-lg border border-primary">
              <Icon name="pencil" size="lg" className="text-primary mb-4" />
              <h3 className="heading-4 mb-3">Write Articles</h3>
              <p className="body-small">Create and publish your own news content</p>
            </div>
            <div className="bg-secondary-light p-6 rounded-lg border border-secondary">
              <Icon name="eye" size="lg" className="text-secondary mb-4" />
              <h3 className="heading-4 mb-3">Read Premium</h3>
              <p className="body-small">Access exclusive articles and insights</p>
            </div>
            <div className="bg-info-light p-6 rounded-lg border border-info">
              <Icon name="bell" size="lg" className="text-info mb-4" />
              <h3 className="heading-4 mb-3">Stay Updated</h3>
              <p className="body-small">Get notified about latest news and trends</p>
            </div>
          </div>
        </div>
      </main>

      <UserFooter />
    </div>
  );
};

// Main App Component
function App() {
  return (
    <AuthProvider>
      <AdminAuthProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin/dashboard"
              element={
                <AdminProtectedRoute>
                  <AdminDashboard />
                </AdminProtectedRoute>
              }
            />

            {/* Catch all route - redirect to admin login if accessing /admin */}
            <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
            <Route path="/admin/*" element={<Navigate to="/admin/login" replace />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AdminAuthProvider>
    </AuthProvider>
  );
}

export default App;
