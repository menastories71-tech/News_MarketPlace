import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AdminAuthProvider, useAdminAuth } from './context/AdminAuthContext';
import AuthModal from './components/auth/AuthModal';
import AdminLogin from './components/admin/AdminLogin';
import AdminDashboard from './components/admin/AdminDashboard';
import GroupManagement from './components/admin/GroupManagement';
import ContactManagement from './components/admin/ContactManagement';
import UserManagement from './components/admin/UserManagement';
import PublicationManagement from './components/admin/PublicationManagement';
import UserHeader from './components/common/UserHeader';
import UserFooter from './components/common/UserFooter';
import FeatureSlider from './components/common/FeatureSlider';
import TopHeader from './components/common/TopHeader';
import ServiceHeader from './components/common/ServiceHeader';
import TermsAndConditions from './pages/TermsAndConditions';
import PrivacyPolicy from './pages/PrivacyPolicy';
import CookiePolicy from './pages/CookiePolicy';
import RefundPolicy from './pages/RefundPolicy';
import AboutUs from './pages/AboutUs';
import FAQ from './pages/FAQ';
import ContactUs from './pages/ContactUs';
import Home from './pages/Home';
import ServicesOverview from './pages/ServicesOverview';
import HowItWorks from './pages/HowItWorks';
import VideoTutorials from './pages/VideoTutorials';
import PodcastersList from './pages/PodcastersList';
import PodcasterDetail from './pages/PodcasterDetail';
import RealEstateList from './pages/RealEstateList';
import RealEstateDetail from './pages/RealEstateDetail';
import HowToGuides from './pages/HowToGuides';
import DownloadCenter from './pages/DownloadCenter';
import ResourceLibrary from './pages/ResourceLibrary';
import PublicationsPage from './pages/PublicationsPage';
import PublicationDetailPage from './pages/PublicationDetailPage';
import Radio from './pages/Radio';
import RadioDetails from './pages/RadioDetails';
import Paparazzi from './pages/Paparazzi';
import PaparazziDetailPage from './pages/PaparazziDetailPage';
import PaparazziSubmissionPage from './pages/PaparazziSubmissionPage';
import UserProfile from './pages/UserProfile';
import AgencyRegistrationPage from './pages/AgencyRegistrationPage';
import ReporterRegistrationPage from './pages/ReporterRegistrationPage';
import ReporterManagement from './components/admin/ReporterManagement';
import EventEnquiriesView from './components/admin/EventEnquiriesView';
import AffiliateEnquiriesView from './components/admin/AffiliateEnquiriesView';
import PowerlistPage from './pages/PowerlistPage';
import PowerListDetailPage from './pages/PowerListDetailPage';
import PowerListManagement from './components/admin/PowerListManagement';
import AwardsPage from './pages/AwardsPage';
import AwardDetailPage from './pages/AwardDetailPage';
import AwardManagement from './components/admin/AwardManagement';
import AwardSubmissionManagement from './components/admin/AwardSubmissionManagement';
import ArticleSubmissionsManagement from './components/admin/ArticleSubmissionsManagement';
import AiArticlesManagement from './components/admin/AiArticlesManagement';
import ThemesPage from './pages/ThemesPage';
import ThemeDetailPage from './pages/ThemeDetailPage';
import ThemeSubmissionPage from './pages/ThemeSubmissionPage';
import WebsiteSubmissionPage from './pages/WebsiteSubmissionPage';
import PressPacksPage from './pages/PressPacksPage';
import PressPackDetailPage from './pages/PressPackDetailPage';
import RadioManagement from './components/admin/RadioManagement';
import ThemeManagement from './components/admin/ThemeManagement';
import PressPackManagement from './components/admin/PressPackManagement';
import PaparazziManagement from './components/admin/PaparazziManagement';
import PodcasterManagementView from './components/admin/PodcasterManagementView';
import RealEstateManagementView from './components/admin/RealEstateManagementView';
import AgencyManagement from './components/admin/AgencyManagement';
import WebsiteManagement from './components/admin/WebsiteManagement';
import ReporterSubmissionsDashboard from './components/user/ReporterSubmissionsDashboard';
import EventEnquiryPage from './pages/EventEnquiryPage';
import AffiliateEnquiryPage from './pages/AffiliateEnquiryPage';
import CareersPage from './pages/CareersPage';
import CareerDetailPage from './pages/CareerDetailPage';
import CareerManagement from './components/admin/CareerManagement';
import BlogManagement from './components/admin/BlogManagement';
import BlogListingPage from './pages/BlogListingPage';
import BlogDetailPage from './pages/BlogDetailPage';
import PublishedWorksPage from './pages/PublishedWorksPage';
import PublishedWorkDetailPage from './pages/PublishedWorkDetailPage';
import PublishedWorkManagement from './components/admin/PublishedWorkManagement';
import ArticlesPage from './pages/ArticlesPage';
import ArticleDetailPage from './pages/ArticleDetailPage';
import ArticleSubmissionPage from './pages/ArticleSubmissionPage';
import AiArticleQuestionnairePage from './pages/AiArticleQuestionnairePage';
import AiArticleGenerationPage from './pages/AiArticleGenerationPage';
import RolePermissionManagement from './components/admin/RolePermissionManagement';
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
  const { isAuthenticated, loading, admin } = useAdminAuth();

  // Show loading state during initial auth check
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

  // If authenticated and admin data is loaded, show children
  if (isAuthenticated && admin) {
    return children;
  }

  // If not authenticated or no admin data, redirect to login
  return <Navigate to="/admin/login" replace />;
};

// New: small rounded badge that matches Terms page icon style (ensure it uses inline Icon component or the SVGIcon)
const IconBadge = ({ name = 'document', size = 20, bg = '#E3F2FD', color = '#0D47A1', className = '' }) => {
  // simple mapping to inline SVG for HomePage use
  const Svg = ({ n }) => {
    switch (n) {
      case 'pencil':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'eye':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
            <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" stroke={color} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="12" cy="12" r="3" stroke={color} strokeWidth="1.3"/>
          </svg>
        );
      case 'bell':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
            <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0 1 18 14.158V11a6 6 0 1 0-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5" stroke={color} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke={color} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      default:
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.4"/>
          </svg>
        );
    }
  };

  return (
    <div
      className={`w-12 h-12 rounded-lg flex items-center justify-center ${className}`}
      style={{ backgroundColor: bg }}
      aria-hidden="true"
    >
      <Svg n={name} />
    </div>
  );
};

// Home Page Component
const HomePage = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { isAuthenticated } = useAuth();

  const handleShowAuth = () => {
    setShowAuthModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-80">
      <UserHeader onShowAuth={handleShowAuth} />

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
              onClick={handleShowAuth}
              className="btn-primary text-lg px-10 py-4"
            >
              Get Started
            </button>
          )}

          {isAuthenticated && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
              <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
                <div className="mb-6 flex justify-center">
                  <IconBadge name="pencil" />
                </div>
                <h3 className="heading-4 mb-4">Write Articles</h3>
                <p className="body-small">Create and publish your own news content</p>
              </div>
              <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
                <div className="mb-6 flex justify-center">
                  <IconBadge name="eye" />
                </div>
                <h3 className="heading-4 mb-4">Read Premium</h3>
                <p className="body-small">Access exclusive articles and insights</p>
              </div>
              <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
                <div className="mb-6 flex justify-center">
                  <IconBadge name="bell" />
                </div>
                <h3 className="heading-4 mb-4">Stay Updated</h3>
                <p className="body-small">Get notified about latest news and trends</p>
              </div>
            </div>
          )}
        </div>
      </main>
      <FAQ />
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
            <Route path="/" element={<Home />} />
            <Route path="/about-us" element={<AboutUs />} />
            <Route path="/contact-us" element={<ContactUs />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/cookie-policy" element={<CookiePolicy />} />
            <Route path="/refund-policy" element={<RefundPolicy />} />
            <Route path="/services-overview" element={<ServicesOverview />} />
            <Route path="/podcasters" element={<PodcastersList />} />
            <Route path="/podcasters/:id" element={<PodcasterDetail />} />
            <Route path="/real-estates" element={<RealEstateList />} />
            <Route path="/real-estates/:id" element={<RealEstateDetail />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/video-tutorials"
              element={
                <ProtectedRoute>
                  <VideoTutorials />
                </ProtectedRoute>
              }
            />
            <Route
              path="/how-to-guides"
              element={
                <ProtectedRoute>
                  <HowToGuides />
                </ProtectedRoute>
              }
            />
            <Route
              path="/download-center"
              element={
                <ProtectedRoute>
                  <DownloadCenter />
                </ProtectedRoute>
              }
            />
            <Route
              path="/resource-library"
              element={
                <ProtectedRoute>
                  <ResourceLibrary />
                </ProtectedRoute>
              }
            />
            <Route path="/careers/:id" element={<CareerDetailPage />} />
            <Route path="/blogs" element={<BlogListingPage />} />
            <Route path="/blog/:id" element={<BlogDetailPage />} />
            <Route path="/radio" element={<Radio />} />
            <Route path="/publications" element={<PublicationsPage />} />
            <Route path="/publications/:id" element={<PublicationDetailPage />} />
            <Route path="/published-works" element={<PublishedWorksPage />} />
            <Route path="/published-works/:id" element={<PublishedWorkDetailPage />} />
            <Route path="/articles" element={<ArticlesPage />} />
            <Route path="/articles/:slug" element={<ArticleDetailPage />} />
            <Route path="/careers" element={<CareersPage />} />
            <Route path="/careers/:id" element={<CareerDetailPage />} />
            <Route path="/radio" element={<Radio />} />
            <Route path="/radio/:id" element={<RadioDetails />} />
            <Route path="/paparazzi" element={<Paparazzi />} />
            <Route path="/paparazzi/:id" element={<PaparazziDetailPage />} />
            <Route
              path="/paparazzi/submit"
              element={
                <ProtectedRoute>
                  <PaparazziSubmissionPage />
                </ProtectedRoute>
              }
            />
            <Route path="/power-lists" element={<PowerlistPage />} />
            <Route path="/power-lists/:id" element={<PowerListDetailPage />} />
            <Route path="/awards" element={<AwardsPage />} />
            <Route path="/awards/:id" element={<AwardDetailPage />} />
            <Route path="/themes" element={<ThemesPage />} />
            <Route path="/themes/:id" element={<ThemeDetailPage />} />
            <Route
              path="/themes/submit"
              element={
                <ProtectedRoute>
                  <ThemeSubmissionPage />
                </ProtectedRoute>
              }
            />
            <Route path="/press-packs" element={<PressPacksPage />} />
            <Route path="/press-packs/:id" element={<PressPackDetailPage />} />
            <Route path="/event-enquiry" element={<EventEnquiryPage />} />
            <Route
              path="/affiliate-program"
              element={
                <ProtectedRoute>
                  <AffiliateEnquiryPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <UserProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/agency-registration"
              element={
                <ProtectedRoute>
                  <AgencyRegistrationPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reporter-registration"
              element={
                <ProtectedRoute>
                  <ReporterRegistrationPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/website-submission"
              element={
                <ProtectedRoute>
                  <WebsiteSubmissionPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/submit-article"
              element={
                <ProtectedRoute>
                  <ArticleSubmissionPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ai-article-questionnaire"
              element={
                <ProtectedRoute>
                  <AiArticleQuestionnairePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ai-article-generation/:id"
              element={
                <ProtectedRoute>
                  <AiArticleGenerationPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reporter-submissions"
              element={
                <ProtectedRoute>
                  <ReporterSubmissionsDashboard />
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
            <Route
              path="/admin/groups"
              element={
                <AdminProtectedRoute>
                  <div className="min-h-screen bg-gray-50">
                    <GroupManagement />
                  </div>
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/contacts"
              element={
                <AdminProtectedRoute>
                  <div className="min-h-screen bg-gray-50">
                    <ContactManagement />
                  </div>
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <AdminProtectedRoute>
                  <div className="min-h-screen bg-gray-50">
                    <UserManagement />
                  </div>
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/publications"
              element={
                <AdminProtectedRoute>
                  <div className="min-h-screen bg-gray-50">
                    <PublicationManagement />
                  </div>
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/power-lists"
              element={
                <AdminProtectedRoute>
                  <div className="min-h-screen bg-gray-50">
                    <PowerListManagement />
                  </div>
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/awards"
              element={
                <AdminProtectedRoute>
                  <div className="min-h-screen bg-gray-50">
                    <AwardManagement />
                  </div>
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/award-submissions"
              element={
                <AdminProtectedRoute>
                  <div className="min-h-screen bg-gray-50">
                    <AwardSubmissionManagement />
                  </div>
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/article-submissions"
              element={
                <AdminProtectedRoute>
                  <div className="min-h-screen bg-gray-50">
                    <ArticleSubmissionsManagement />
                  </div>
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/ai-articles"
              element={
                <AdminProtectedRoute>
                  <div className="min-h-screen bg-gray-50">
                    <AiArticlesManagement />
                  </div>
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/radios"
              element={
                <AdminProtectedRoute>
                  <div className="min-h-screen bg-gray-50">
                    <RadioManagement />
                  </div>
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/themes"
              element={
                <AdminProtectedRoute>
                  <div className="min-h-screen bg-gray-50">
                    <ThemeManagement />
                  </div>
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/press-packs"
              element={
                <AdminProtectedRoute>
                  <div className="min-h-screen bg-gray-50">
                    <PressPackManagement />
                  </div>
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/paparazzi"
              element={
                <AdminProtectedRoute>
                  <div className="min-h-screen bg-gray-50">
                    <PaparazziManagement />
                  </div>
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/agencies"
              element={
                <AdminProtectedRoute>
                  <div className="min-h-screen bg-gray-50">
                    <AgencyManagement />
                  </div>
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/websites"
              element={
                <AdminProtectedRoute>
                  <div className="min-h-screen bg-gray-50">
                    <WebsiteManagement />
                  </div>
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/reporters"
              element={
                <AdminProtectedRoute>
                  <div className="min-h-screen bg-gray-50">
                    <ReporterManagement />
                  </div>
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/podcasters"
              element={
                <AdminProtectedRoute>
                  <div className="min-h-screen bg-gray-50">
                    <PodcasterManagementView />
                  </div>
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/real-estates"
              element={
                <AdminProtectedRoute>
                  <div className="min-h-screen bg-gray-50">
                    <RealEstateManagementView />
                  </div>
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/event-enquiries"
              element={
                <AdminProtectedRoute>
                  <div className="min-h-screen bg-gray-50">
                    <EventEnquiriesView />
                  </div>
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/affiliate-enquiries"
              element={
                <AdminProtectedRoute>
                  <div className="min-h-screen bg-gray-50">
                    <AffiliateEnquiriesView />
                  </div>
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/careers"
              element={
                <AdminProtectedRoute>
                  <div className="min-h-screen bg-gray-50">
                    <CareerManagement />
                  </div>
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/blogs"
              element={
                <AdminProtectedRoute>
                  <div className="min-h-screen bg-gray-50">
                    <BlogManagement />
                  </div>
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/published-works"
              element={
                <AdminProtectedRoute>
                  <div className="min-h-screen bg-gray-50">
                    <PublishedWorkManagement />
                  </div>
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/roles-permissions"
              element={
                <AdminProtectedRoute>
                  <div className="min-h-screen bg-gray-50">
                    <RolePermissionManagement />
                  </div>
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
