import React, { useState, useEffect, useMemo } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import Icon from '../common/Icon';
import Sidebar from './Sidebar';
import api from '../../services/api';
import { Eye, Edit, Trash2, CheckCircle, XCircle, RefreshCw, FileText } from 'lucide-react';

// Brand colors from Color palette .pdf - using only defined colors
const theme = {
  primary: '#1976D2',        // Primary Blue
  primaryDark: '#0D47A1',    // Primary Dark
  primaryLight: '#E3F2FD',   // Primary Light
  secondary: '#00796B',      // Secondary Teal
  secondaryDark: '#004D40',  // Secondary Dark
  secondaryLight: '#E0F2F1', // Secondary Light
  success: '#4CAF50',        // Success Green
  warning: '#FF9800',        // Warning Orange
  danger: '#F44336',         // Error Red
  info: '#9C27B0',           // Info Purple
  textPrimary: '#212121',    // Text Primary
  textSecondary: '#757575',  // Text Secondary
  textDisabled: '#BDBDBD',   // Text Disabled
  background: '#FFFFFF',     // Background
  backgroundAlt: '#FAFAFA',  // Background Alt
  backgroundSoft: '#F5F5F5', // Background Soft
  borderLight: '#E0E0E0',    // Border Light
  borderMedium: '#BDBDBD',   // Border Medium
  borderDark: '#757575',     // Border Dark
  roleColors: {
    super_admin: { bg: '#E0F2F1', color: '#004D40' }, // Using secondary colors
    content_manager: { bg: '#E3F2FD', color: '#0D47A1' }, // Using primary colors
    editor: { bg: '#FAFAFA', color: '#212121' }, // Using neutral colors
    registered_user: { bg: '#F5F5F5', color: '#757575' }, // Using neutral colors
    agency: { bg: '#E0F2F1', color: '#00796B' }, // Using secondary colors
    other: { bg: '#FAFAFA', color: '#757575' } // Using neutral colors
  }
};

const AiArticlesManagement = () => {
  const { admin, logout, hasRole, hasAnyRole, getRoleLevel } = useAdminAuth();

  // Check if user has permission to manage AI articles
  if (!hasAnyRole(['super_admin', 'content_manager'])) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: theme.backgroundSoft, color: theme.text }}>
        <div style={{ textAlign: 'center' }}>
          <Icon name="shield-exclamation" size="lg" style={{ color: theme.danger, marginBottom: '16px' }} />
          <h2 style={{ color: theme.textPrimary, marginBottom: '8px' }}>Access Denied</h2>
          <p style={{ color: theme.textSecondary }}>You don't have permission to access AI articles management.</p>
          <p style={{ color: theme.textSecondary, fontSize: '14px', marginTop: '8px' }}>
            Required roles: Super Admin or Content Manager
          </p>
        </div>
      </div>
    );
  }

  // Layout constants (same as AdminDashboard)
  const headerZ = 1000;
  const mobileOverlayZ = 500;
  const sidebarZ = 200;
  const headerHeight = 64;
  const mainPaddingTop = headerHeight + 18;
  const sidebarWidth = 240;
  const leftGap = 24;

  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    story_type: '',
    search: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    onResize(); // Set initial value
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    if (sidebarOpen && isMobile) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }
    return undefined;
  }, [sidebarOpen, isMobile]);

  useEffect(() => {
    fetchArticles();
  }, [currentPage, pageSize, filters]);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: pageSize,
        ...filters
      });

      const response = await api.get(`/ai-generated-articles?${params.toString()}`);
      setArticles(response.data.articles || []);
      setTotalPages(response.data.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Error fetching AI articles:', error);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (articleId, newStatus) => {
    try {
      await api.patch(`/ai-generated-articles/${articleId}/status`, { status: newStatus });
      fetchArticles(); // Refresh the list
    } catch (error) {
      console.error('Error updating article status:', error);
      alert('Failed to update article status');
    }
  };

  const handleDelete = async (articleId) => {
    if (!confirm('Are you sure you want to delete this AI article?')) return;

    try {
      await api.delete(`/ai-generated-articles/${articleId}`);
      fetchArticles(); // Refresh the list
    } catch (error) {
      console.error('Error deleting article:', error);
      alert('Failed to delete article');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <CheckCircle size={16} />;
      case 'rejected': return <XCircle size={16} />;
      default: return null;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const sidebarStyles = {
    width: sidebarWidth,
    backgroundColor: theme.background,
    borderRight: `1px solid ${theme.borderLight}`,
    padding: 16,
    boxSizing: 'border-box',
    borderRadius: 8
  };

  const mobileSidebarOverlay = {
    position: 'fixed',
    top: headerHeight,
    left: 0,
    height: `calc(100vh - ${headerHeight}px)`,
    zIndex: mobileOverlayZ,
    backgroundColor: '#fff',
    padding: 16,
    boxSizing: 'border-box',
    width: sidebarWidth,
    boxShadow: '0 8px 24px rgba(0,0,0,0.08)'
  };

  const roleDisplayNames = {
    'super_admin': 'Super Administrator',
    'content_manager': 'Content Manager',
    'editor': 'Editor',
    'registered_user': 'Registered User',
    'agency': 'Agency',
    'other': 'Other'
  };

  const btnPrimary = {
    backgroundColor: theme.primary,
    color: '#fff',
    padding: '0.625rem 1rem',
    borderRadius: '0.5rem',
    fontWeight: 600,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    cursor: 'pointer',
    border: 'none',
    boxShadow: `0 6px 18px rgba(25,118,210,0.14)`
  };

  const getRoleStyle = (role) => {
    const r = theme.roleColors[role] || theme.roleColors.other;
    return {
      backgroundColor: r.bg,
      color: r.color,
      padding: '0.125rem 0.5rem',
      borderRadius: '9999px',
      fontSize: '0.75rem',
      fontWeight: 600,
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.25rem',
      lineHeight: 1
    };
  };

  return (
    <div style={{ backgroundColor: theme.backgroundSoft, minHeight: '100vh', color: theme.textPrimary }}>
      {/* Header */}
      <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: headerHeight,
        backgroundColor: theme.background,
        borderBottom: `1px solid ${theme.borderLight}`,
        zIndex: headerZ,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.04)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={theme.textSecondary} strokeWidth="2">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #1976D2, #0D47A1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#fff', fontSize: '18px', fontWeight: '800' }}>N</span>
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: theme.textPrimary }}>News MarketPlace</h1>
              <p style={{ margin: 0, fontSize: '12px', color: theme.textSecondary }}>Admin Panel</p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '14px', fontWeight: '600', color: theme.textPrimary }}>
              {admin?.first_name} {admin?.last_name}
            </div>
            <div style={getRoleStyle(admin?.role)}>
              {roleDisplayNames[admin?.role] || 'User'}
            </div>
          </div>

          <button
            onClick={logout}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#fee2e2'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            title="Logout"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={theme.danger} strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16,17 21,12 16,7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </header>

      {/* Sidebar */}
      {sidebarOpen && (
        <>
          {isMobile && (
            <div
              style={mobileSidebarOverlay}
              onClick={() => setSidebarOpen(false)}
            />
          )}
          <aside style={{
            position: isMobile ? 'fixed' : 'fixed',
            top: headerHeight,
            left: 0,
            width: sidebarWidth,
            height: `calc(100vh - ${headerHeight}px)`,
            zIndex: sidebarZ,
            ...sidebarStyles
          }}>
            <Sidebar
              admin={admin}
              roleDisplayNames={roleDisplayNames}
              theme={theme}
              sidebarOpen={sidebarOpen}
              setSidebarOpen={setSidebarOpen}
              sidebarStyles={sidebarStyles}
              mobileSidebarOverlay={mobileSidebarOverlay}
              isMobile={isMobile}
              headerHeight={headerHeight}
              sidebarWidth={sidebarWidth}
              sidebarZ={sidebarZ}
              mobileOverlayZ={mobileOverlayZ}
            />
          </aside>
        </>
      )}

      {/* Main Content */}
      <main style={{
        marginLeft: sidebarOpen && !isMobile ? sidebarWidth + leftGap : leftGap,
        paddingTop: mainPaddingTop,
        paddingRight: leftGap,
        paddingBottom: leftGap,
        minHeight: '100vh',
        transition: 'margin-left 0.3s ease'
      }}>
        {/* Page Header */}
        <div style={{ background: '#fff', borderRadius: 12, padding: 28, border: `4px solid #000`, display: 'flex', justifyContent: 'space-between', gap: '16px', marginBottom: 24, alignItems: 'center' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: '#e6f0ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="document-text" size="sm" style={{ color: '#1976D2' }} />
              </div>
              <h1 style={{ margin: 0, fontSize: 34, fontWeight: 800 }}>AI Articles Management</h1>
            </div>
            <p style={{ marginTop: 8, color: '#757575' }}>Manage AI-generated article submissions</p>
          </div>
        </div>

        <div style={{ backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 8px 20px rgba(2,6,23,0.06)', padding: '24px' }}>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">AI Articles Management</h2>
            <p className="text-gray-600">Manage AI-generated article submissions</p>
          </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="draft">Draft</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Story Type</label>
            <select
              value={filters.story_type}
              onChange={(e) => setFilters({ ...filters, story_type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="profile">Profile</option>
              <option value="editorial">Editorial</option>
              <option value="advertorial">Advertorial</option>
              <option value="listicle">Listicle</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              placeholder="Search by name, publication..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Articles Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Table Controls */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-semibold text-gray-900">AI Articles</span>
            </div>
            <div className="flex items-center gap-4">
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(parseInt(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="10">10 per page</option>
                <option value="25">25 per page</option>
                <option value="50">50 per page</option>
                <option value="100">100 per page</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
            <span className="ml-2 text-gray-600">Loading articles...</span>
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-12">
            <FileText size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No AI articles found</h3>
            <p className="text-gray-600">No articles match your current filters.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Article Info
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {articles.map((article) => (
                    <tr key={article.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="flex items-center">
                            <span className="text-sm font-medium text-gray-900 capitalize">
                              {article.story_type}
                            </span>
                            {article.publication && (
                              <span className="ml-2 text-sm text-gray-500">
                                • {article.publication.publication_name}
                              </span>
                            )}
                          </div>
                          {article.name && (
                            <div className="text-sm text-gray-600 mt-1">
                              {article.name}
                            </div>
                          )}
                          {article.generated_content && (
                            <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                              {article.generated_content.substring(0, 100)}...
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {article.user?.first_name} {article.user?.last_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {article.user?.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={article.status}
                          onChange={(e) => handleStatusChange(article.id, e.target.value)}
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border-0 cursor-pointer ${getStatusColor(article.status)}`}
                        >
                          <option value="draft">Draft</option>
                          <option value="pending">Pending</option>
                          <option value="approved">Approved</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(article.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setSelectedArticle(article);
                              setShowModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>

                          {article.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleStatusChange(article.id, 'approved')}
                                className="text-green-600 hover:text-green-900"
                                title="Approve"
                              >
                                <CheckCircle size={16} />
                              </button>
                              <button
                                onClick={() => handleStatusChange(article.id, 'rejected')}
                                className="text-red-600 hover:text-red-900"
                                title="Reject"
                              >
                                <XCircle size={16} />
                              </button>
                            </>
                          )}

                          <button
                            onClick={() => handleDelete(article.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ padding: '16px 20px', borderTop: '1px solid #e5e7eb', backgroundColor: '#f8fafc', display: 'flex', justifyContent: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    style={{
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      backgroundColor: currentPage === 1 ? '#f3f4f6' : '#fff',
                      color: currentPage === 1 ? '#9ca3af' : theme.textPrimary,
                      cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    Previous
                  </button>

                  <span style={{ fontSize: '14px', color: theme.textSecondary }}>
                    Page {currentPage} of {totalPages}
                  </span>

                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    style={{
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      backgroundColor: currentPage === totalPages ? '#f3f4f6' : '#fff',
                      color: currentPage === totalPages ? '#9ca3af' : theme.textPrimary,
                      cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Article Details Modal */}
      {showModal && selectedArticle && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">AI Article Details</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Story Type</label>
                  <p className="text-sm text-gray-900 capitalize">{selectedArticle.story_type}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedArticle.status)}`}>
                    {getStatusIcon(selectedArticle.status)}
                    <span className="ml-1 capitalize">{selectedArticle.status}</span>
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Publication</label>
                  <p className="text-sm text-gray-900">{selectedArticle.publication?.publication_name || 'Not Assigned'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Created</label>
                  <p className="text-sm text-gray-900">{formatDate(selectedArticle.created_at)}</p>
                </div>
              </div>

              {selectedArticle.name && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Subject Name</label>
                  <p className="text-sm text-gray-900">{selectedArticle.name}</p>
                </div>
              )}

              {selectedArticle.generated_content && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Generated Content</label>
                  <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
                    <div className="prose prose-sm max-w-none">
                      <div dangerouslySetInnerHTML={{ __html: selectedArticle.generated_content }} />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
        </div>
      </main>
    </div>
  );
};

export default AiArticlesManagement;