import React, { useState, useEffect, useMemo } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import Icon from '../common/Icon';
import Sidebar from './Sidebar';
import BlogFormModal from './BlogFormModal';
import { adminAPI } from '../../services/api';
import api from '../../services/api';
import { Download } from 'lucide-react';


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

// Download Options Modal
const DownloadOptionsModal = ({ isOpen, onClose, onDownload }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      padding: '20px'
    }} onClick={onClose}>
      <div style={{
        background: '#fff',
        borderRadius: '12px',
        padding: '24px',
        width: '100%',
        maxWidth: '400px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#111827' }}>Download Options</h3>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#6b7280' }}>×</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button
            onClick={() => onDownload(false)}
            style={{
              padding: '12px',
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '8px',
              color: '#1d4ed8',
              fontWeight: '600',
              cursor: 'pointer',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontSize: '14px'
            }}
          >
            <div style={{ padding: '8px', backgroundColor: '#fff', borderRadius: '6px' }}>
              <Download size={16} />
            </div>
            <div>
              <div style={{ fontWeight: '700' }}>Filtered Data</div>
              <div style={{ fontSize: '12px', fontWeight: '400', marginTop: '2px' }}>Download only currently visible records</div>
            </div>
          </button>

          <button
            onClick={() => onDownload(true)}
            style={{
              padding: '12px',
              backgroundColor: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '8px',
              color: '#15803d',
              fontWeight: '600',
              cursor: 'pointer',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontSize: '14px'
            }}
          >
            <div style={{ padding: '8px', backgroundColor: '#fff', borderRadius: '6px' }}>
              <Download size={16} />
            </div>
            <div>
              <div style={{ fontWeight: '700' }}>All Data</div>
              <div style={{ fontSize: '12px', fontWeight: '400', marginTop: '2px' }}>Download all records in database</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

const BlogManagement = () => {

  const { admin, logout, hasRole, hasAnyRole, getRoleLevel } = useAdminAuth();

  // Check if user has permission to manage blogs
  if (!hasAnyRole(['super_admin', 'content_manager', 'editor'])) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: theme.backgroundSoft }}>
        <div style={{ textAlign: 'center' }}>
          <Icon name="shield-exclamation" size="lg" style={{ color: theme.danger, marginBottom: '16px' }} />
          <h2 style={{ color: theme.textPrimary, marginBottom: '8px' }}>Access Denied</h2>
          <p style={{ color: theme.textSecondary }}>You don't have permission to access blog management.</p>
          <p style={{ color: theme.textSecondary, fontSize: '14px', marginTop: '8px' }}>
            Required roles: Super Admin, Content Manager, or Editor
          </p>
        </div>
      </div>
    );
  }

  // State declarations
  const [blogs, setBlogs] = useState([]);
  const [totalBlogs, setTotalBlogs] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortField, setSortField] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingBlog, setDeletingBlog] = useState(null);
  const fileInputRef = React.useRef(null);

  // Layout constants
  const headerHeight = 64;
  const sidebarWidth = 280;
  const leftGap = 24;
  const mainPaddingTop = 40;
  const headerZ = 40;
  const sidebarZ = 50;
  const mobileOverlayZ = 45;

  const sidebarStyles = {
    position: 'fixed',
    top: headerHeight,
    bottom: 0,
    left: 0,
    width: sidebarWidth,
    backgroundColor: '#fff',
    borderRight: `1px solid ${theme.borderLight}`,
    zIndex: sidebarZ,
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.3s ease-in-out',
    boxShadow: '0 4px 6px rgba(0,0,0,0.02)'
  };

  const mobileSidebarOverlay = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: mobileOverlayZ,
    display: isMobile && sidebarOpen ? 'block' : 'none'
  };

  const btnPrimary = {
    backgroundColor: theme.primary,
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 20px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    boxShadow: '0 2px 4px rgba(25, 118, 210, 0.2)',
    transition: 'all 0.2s'
  };

  const getRoleStyle = (role) => {
    return {
      display: 'inline-block',
      padding: '4px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '600',
      textTransform: 'capitalize',
      ...theme.roleColors[role] || theme.roleColors.other
    };
  };

  const roleDisplayNames = {
    super_admin: 'Super Admin',
    content_manager: 'Content Manager',
    editor: 'Editor',
    registered_user: 'User',
    agency: 'Agency'
  };

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Mobile detection
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetchBlogs();
  }, [currentPage, pageSize, debouncedSearchTerm, categoryFilter, sortField, sortDirection]);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: pageSize,
        search: debouncedSearchTerm,
        category: categoryFilter,
        sortBy: sortField === 'publishDate' ? 'publishDate' : 'created_at', // Map fields if necessary
        sortOrder: sortDirection.toUpperCase()
      };

      const response = await adminAPI.getBlogs(params);
      setBlogs(response.data.blogs || []);
      setTotalBlogs(response.data.pagination?.total || 0);
    } catch (error) {
      console.error('Error fetching blogs:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('adminAccessToken');
        window.location.href = '/admin/login';
      } else {
        // alert('Failed to load blogs. Please try again.'); 
        // Suppress alert on search typing to avoid annoyance
      }
    } finally {
      setLoading(false);
    }
  };

  // ...

  // Since we are doing server-side sorting/filtering, client-side logic is redundant for the displayed list
  // But we might want to keep `sortedBlogs` if we do client-side sorting on the *fetched* page (which is less useful).
  // Ideally, sort should trigger fetch. I added sort dependencies to useEffect above.

  const paginatedBlogs = blogs; // Display whatever the server returned
  const totalPages = Math.ceil(totalBlogs / pageSize);

  // ...

  const getBlogStats = () => {
    // Note: detailed stats like "withImages" will only reflect the current page
    // unless we have a separate stats endpoint. For now, use totalBlogs for total.
    const withImages = blogs.filter(b => b.image).length;
    const withCategories = blogs.filter(b => b.category).length;

    return { total: totalBlogs, withImages, withCategories };
  };


  const handleDownloadTemplate = async () => {
    try {
      const response = await api.get('/blogs/download-template', {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'blog_template.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading template:', error);
      alert('Failed to download template.');
    }
  };

  const handleBulkUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      // Using direct api call because adminAPI might not specific method or updated yet
      const response = await api.post('/blogs/bulk-upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      alert(response.data.message);
      if (response.data.errors) {
        console.warn('Upload warnings:', response.data.errors);
      }
      fetchBlogs();
    } catch (error) {
      console.error('Error uploading file:', error);
      alert(error.response?.data?.error || 'Failed to upload file.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDownloadCSV = async (downloadAll = false) => {
    try {
      setDownloading(true);
      const params = new URLSearchParams();

      if (!downloadAll) {
        if (debouncedSearchTerm) params.append('search', debouncedSearchTerm);
        if (categoryFilter) params.append('category', categoryFilter);
      }

      const response = await api.get(`/blogs/download-csv?${params.toString()}`, {
        responseType: 'blob'
      });

      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `blogs_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      setShowDownloadModal(false);
    } catch (error) {
      console.error('Error downloading CSV:', error);
      alert('Failed to download CSV. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  // Blog CRUD handlers
  const handleCreateBlog = () => {
    setSelectedBlog(null);
    setShowModal(true);
  };

  const handleEditBlog = (blog) => {
    setSelectedBlog(blog);
    setShowModal(true);
  };

  const handleDeleteBlog = async (blog) => {
    if (!window.confirm(`Are you sure you want to delete "${blog.title}"?`)) {
      return;
    }
    
    try {
      await adminAPI.deleteBlog(blog.id);
      fetchBlogs();
      alert('Blog deleted successfully!');
    } catch (error) {
      console.error('Error deleting blog:', error);
      alert('Failed to delete blog. Please try again.');
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedBlog(null);
  };

  const handleModalSave = () => {
    fetchBlogs();
    handleModalClose();
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return '';
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleConfirmDelete = async () => {
    if (!deletingBlog) return;
    
    try {
      setLoading(true);
      await adminAPI.deleteBlog(deletingBlog.id);
      setShowDeleteModal(false);
      setDeletingBlog(null);
      fetchBlogs();
    } catch (error) {
      console.error('Error deleting blog:', error);
      alert('Failed to delete blog. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  const stats = getBlogStats();

  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: theme.backgroundSoft, color: theme.text, paddingBottom: '3rem' }}>
        {/* Header */}
        <header
          className="shadow-sm"
          style={{
            position: 'sticky',
            top: 0,
            zIndex: headerZ,
            backgroundColor: theme.background,
            boxShadow: '0 6px 20px rgba(2,6,23,0.06)',
            borderBottom: `1px solid ${theme.borderLight}`
          }}
        >
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10" style={{ minHeight: 64 }}>
            <div className="flex justify-between items-center py-3">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Icon name="document-text" size="lg" style={{ color: '#1976D2' }} />
                <span style={{ fontWeight: 700, fontSize: 18 }}>News Marketplace Admin</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700 }}>Loading...</div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-10">
          <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
            {/* Skeleton Filters Sidebar */}
            <aside style={{
              width: '280px',
              backgroundColor: '#fff',
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 8px 20px rgba(2,6,23,0.06)',
              height: 'fit-content'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {[1, 2, 3].map(i => (
                  <div key={i}>
                    <div style={{
                      height: '14px',
                      backgroundColor: '#f3f4f6',
                      borderRadius: '4px',
                      marginBottom: '8px',
                      width: '60%'
                    }}></div>
                    <div style={{
                      height: '32px',
                      backgroundColor: '#f3f4f6',
                      borderRadius: '6px',
                      width: '100%'
                    }}></div>
                  </div>
                ))}
              </div>
            </aside>

            <main style={{ flex: 1, minWidth: 0 }}>
              {/* Page Header Skeleton */}
              <div style={{ background: '#fff', borderRadius: 12, padding: 28, marginBottom: 24, border: `4px solid #000` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: '#f3f4f6' }}></div>
                  <div style={{ height: 34, background: '#f3f4f6', borderRadius: 4, width: '300px' }}></div>
                </div>
                <div style={{ height: 16, background: '#f3f4f6', borderRadius: 4, width: '200px' }}></div>
              </div>

              {/* Table Skeleton */}
              <div style={{ backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 8px 20px rgba(2,6,23,0.06)', overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                  {[...Array(10)].map((_, index) => (
                    <div key={index} style={{
                      borderBottom: '1px solid #f1f5f9',
                      backgroundColor: index % 2 === 0 ? '#ffffff' : '#fafbfc',
                      padding: '16px'
                    }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '50px 2fr 1fr 1fr 1fr', gap: '16px', alignItems: 'center' }}>
                        <div style={{ width: '20px', height: '20px', background: '#f3f4f6', borderRadius: '50%' }}></div>
                        <div>
                          <div style={{ height: '14px', background: '#f3f4f6', borderRadius: 4, width: '120px', marginBottom: '4px' }}></div>
                          <div style={{ height: '12px', background: '#f3f4f6', borderRadius: 4, width: '80px' }}></div>
                        </div>
                        <div style={{ height: '14px', background: '#f3f4f6', borderRadius: 4, width: '60px' }}></div>
                        <div style={{ height: '14px', background: '#f3f4f6', borderRadius: 4, width: '80px' }}></div>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <div style={{ width: '50px', height: '24px', background: '#f3f4f6', borderRadius: 4 }}></div>
                          <div style={{ width: '50px', height: '24px', background: '#f3f4f6', borderRadius: 4 }}></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: theme.backgroundSoft, color: theme.text, paddingBottom: '3rem' }}>
      {/* Header */}
      <header
        className="shadow-sm"
        style={{
          position: 'sticky',
          top: 0,
          zIndex: headerZ,
          backgroundColor: theme.background,
          boxShadow: '0 6px 20px rgba(2,6,23,0.06)',
          borderBottom: `1px solid ${theme.borderLight}`
        }}
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10" style={{ minHeight: 64 }}>
          <div className="flex justify-between items-center py-3">
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="mr-3 md:hidden"
                aria-label="Toggle sidebar"
                style={{ background: 'transparent', border: 'none', padding: 6, cursor: 'pointer' }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={theme.text} strokeWidth="2"><path d="M3 6h18M3 12h18M3 18h18" /></svg>
              </button>

              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="mr-3 hidden md:block"
                aria-label="Toggle sidebar"
                style={{ background: 'transparent', border: 'none', padding: 6, cursor: 'pointer' }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={theme.text} strokeWidth="2"><path d="M3 6h18M3 12h18M3 18h18" /></svg>
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Icon name="document-text" size="lg" style={{ color: '#1976D2' }} />
                <span style={{ fontWeight: 700, fontSize: 18 }}>News Marketplace Admin</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 700 }}>{admin?.first_name ? `${admin.first_name} ${admin.last_name}` : 'Master Admin'}</div>
                <div style={{ marginTop: 6 }}>
                  <span style={getRoleStyle(admin?.role)}>{roleDisplayNames[admin?.role] || '—'}</span>
                </div>
              </div>

              <button onClick={logout} style={{ ...btnPrimary, padding: '0.45rem 0.75rem' }}>
                <Icon name="arrow-right-on-rectangle" size="sm" style={{ color: '#fff', marginRight: 8 }} />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-10" style={{
        paddingTop: mainPaddingTop,
        marginLeft: !isMobile && sidebarOpen ? (sidebarWidth + leftGap) : 0,
        transition: 'margin-left 0.28s ease-in-out'
      }}>
        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
          <main style={{ flex: 1, minWidth: 0, paddingLeft: !isMobile ? leftGap : 0 }}>
            {/* Page Header */}
            <div style={{ background: '#fff', borderRadius: 12, padding: 28, border: `4px solid #000`, display: 'flex', justifyContent: 'space-between', gap: 16, marginBottom: 24, alignItems: 'center' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: '#e6f0ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name="document-text" size="sm" style={{ color: '#1976D2' }} />
                  </div>
                  <h1 style={{ margin: 0, fontSize: 34, fontWeight: 800 }}>Blog Management</h1>
                </div>
                <p style={{ marginTop: 8, color: '#757575' }}>Create and manage blog posts for the news marketplace</p>
              </div>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button
                  onClick={handleCreateBlog}
                  style={{ ...btnPrimary, fontSize: '14px', padding: '12px 20px' }}
                  disabled={!hasAnyRole(['super_admin', 'content_manager'])}
                >
                  <Icon name="plus" size="sm" style={{ color: '#fff', marginRight: 8 }} />
                  Create Blog
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleBulkUpload}
                  style={{ display: 'none' }}
                  accept=".csv"
                />
                <button
                  onClick={handleDownloadTemplate}
                  style={{ ...btnPrimary, backgroundColor: theme.secondary, fontSize: '14px', padding: '12px 20px' }}
                >
                  <Icon name="arrow-down-tray" size="sm" style={{ color: '#fff', marginRight: 8 }} />
                  Template
                </button>
                <button
                  onClick={() => fileInputRef.current.click()}
                  style={{ ...btnPrimary, backgroundColor: theme.info, fontSize: '14px', padding: '12px 20px' }}
                  disabled={uploading}
                >
                  <Icon name="cloud-arrow-up" size="sm" style={{ color: '#fff', marginRight: 8 }} />
                  {uploading ? 'Uploading...' : 'Bulk Upload'}
                </button>
                <button
                  onClick={() => setShowDownloadModal(true)}
                  style={{ ...btnPrimary, backgroundColor: '#00897B', fontSize: '14px', padding: '12px 20px' }}
                  disabled={downloading}
                >
                  <Download size={18} style={{ color: '#fff', marginRight: 8 }} />
                  {downloading ? 'Downloading...' : 'Download CSV'}
                </button>

              </div>
            </div>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
              {[
                { label: 'Total Blogs', value: stats.total, icon: 'document-text', bg: '#e6f0ff' },
                { label: 'With Images', value: stats.withImages, icon: 'camera', bg: '#dcfce7' },
                { label: 'Categorized', value: stats.withCategories, icon: 'tag', bg: '#fef3c7' }
              ].map((stat, index) => (
                <div key={index} style={{ background: '#fff', borderRadius: 12, padding: 18, boxShadow: '0 8px 20px rgba(2,6,23,0.06)', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 10, background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name={stat.icon} size="lg" style={{ color: '#1976D2' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 20, fontWeight: 800 }}>{stat.value}</div>
                    <div style={{ fontSize: 12, color: '#757575' }}>{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Search and Filters */}
            <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', marginBottom: '16px', boxShadow: '0 8px 20px rgba(2,6,23,0.06)' }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '300px' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={theme.textSecondary} strokeWidth="2" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}>
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.35-4.35"></path>
                  </svg>
                  <input
                    type="text"
                    placeholder="Search blogs by title, content, or category..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 16px 12px 44px',
                      border: '2px solid #e0e0e0',
                      borderRadius: '8px',
                      fontSize: '14px',
                      transition: 'border-color 0.2s',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = theme.primary}
                    onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                  />

                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '4px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={theme.textSecondary} strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {/* Filter Row */}
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap', marginTop: '16px' }}>
                <input
                  type="text"
                  placeholder="Filter by category"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '6px',
                    fontSize: '14px',
                    minWidth: '150px'
                  }}
                />

                <button
                  onClick={clearAllFilters}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#f3f4f6',
                    color: theme.textPrimary,
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    cursor: 'pointer',
                    fontWeight: '500'
                  }}
                >
                  Clear Filters
                </button>
              </div>

              {/* Applied Filters Tags */}
              {appliedFilters.length > 0 && (
                <div style={{ marginTop: '16px', display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: theme.textSecondary, fontWeight: '500' }}>
                    Active filters:
                  </span>
                  {appliedFilters.map((filter, index) => (
                    <span key={index} style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '4px 8px',
                      backgroundColor: '#e0f2fd',
                      color: theme.primary,
                      borderRadius: '16px',
                      fontSize: '12px',
                      fontWeight: '500',
                      cursor: 'pointer'
                    }}
                      onClick={() => removeFilter(filter.type)}
                    >
                      {filter.label}
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </span>
                  ))}
                </div>
              )}

              {/* Search Results Summary */}
              <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div style={{ fontSize: '14px', color: theme.textSecondary }}>
                  {debouncedSearchTerm ? (
                    <>
                      <span style={{ color: theme.primary, fontWeight: '600' }}>Search:</span> Found <strong>{sortedBlogs.length}</strong> blogs
                    </>
                  ) : (
                    <>
                      Showing <strong>{paginatedBlogs.length}</strong> of <strong>{sortedBlogs.length}</strong> blogs
                      {sortedBlogs.length !== blogs.length && (
                        <span> (filtered from {blogs.length} total)</span>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Bulk Actions Bar */}
            {selectedBlogs.length > 0 && (
              <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '16px', marginBottom: '24px', boxShadow: '0 8px 20px rgba(2,6,23,0.06)', border: '1px solid #e0e0e0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                  <div style={{ fontSize: '14px', color: '#212121' }}>
                    {selectedBlogs.length} blog{selectedBlogs.length !== 1 ? 's' : ''} selected
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    <button
                      onClick={handleBulkDelete}
                      style={{
                        padding: '8px 12px',
                        backgroundColor: theme.danger,
                        color: '#fff',
                        borderRadius: '6px',
                        fontWeight: 600,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.25rem',
                        cursor: 'pointer',
                        border: 'none',
                        boxShadow: '0 4px 12px rgba(244,67,54,0.14)',
                        fontSize: '13px',
                        whiteSpace: 'nowrap',
                        flexShrink: 0
                      }}
                      disabled={!hasRole('super_admin')}
                    >
                      <Icon name="trash" size="sm" style={{ color: '#fff' }} />
                      Delete ({selectedBlogs.length})
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Blogs Table */}
            <div style={{ backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 8px 20px rgba(2,6,23,0.06)', overflow: 'hidden' }}>
              {/* Table Controls */}
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb', backgroundColor: '#f8fafc' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: theme.textPrimary }}>
                      {selectedBlogs.length > 0 ? `${selectedBlogs.length} selected` : 'Select blogs'}
                    </span>
                    {selectedBlogs.length > 0 && (
                      <button
                        onClick={() => setSelectedBlogs([])}
                        style={{
                          padding: '4px 8px',
                          backgroundColor: '#e5e7eb',
                          color: theme.textPrimary,
                          border: 'none',
                          borderRadius: '4px',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <select
                      value={pageSize}
                      onChange={(e) => {
                        setPageSize(parseInt(e.target.value));
                        setCurrentPage(1);
                      }}
                      style={{
                        padding: '6px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px',
                        backgroundColor: '#fff'
                      }}
                    >
                      <option value="10">10 per page</option>
                      <option value="25">25 per page</option>
                      <option value="50">50 per page</option>
                      <option value="100">100 per page</option>
                    </select>
                  </div>
                </div>
              </div>

              <div style={{ overflowX: 'auto', maxHeight: paginatedBlogs.length > 50 ? '600px' : 'auto', overflowY: paginatedBlogs.length > 50 ? 'auto' : 'visible' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                      <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', fontSize: '12px', color: theme.textPrimary, textTransform: 'uppercase', letterSpacing: '0.5px', width: '50px' }}>
                        <input
                          type="checkbox"
                          checked={paginatedBlogs.length > 0 && selectedBlogs.length === paginatedBlogs.length}
                          onChange={handleSelectAll}
                          style={{ transform: 'scale(1.2)', cursor: 'pointer' }}
                        />
                      </th>
                      <th
                        style={{ padding: '16px', textAlign: 'left', fontWeight: '700', fontSize: '12px', color: theme.textPrimary, textTransform: 'uppercase', letterSpacing: '0.5px', cursor: 'pointer' }}
                        onClick={() => handleSort('title')}
                      >
                        Title {getSortIcon('title')}
                      </th>
                      <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', fontSize: '12px', color: theme.textPrimary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Category
                      </th>
                      <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', fontSize: '12px', color: theme.textPrimary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Image
                      </th>
                      <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', fontSize: '12px', color: theme.textPrimary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Publish Date
                      </th>
                      <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', fontSize: '12px', color: theme.textPrimary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedBlogs.length === 0 ? (
                      <tr>
                        <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: theme.textSecondary }}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                            <Icon name="document-text" size="lg" style={{ color: theme.textDisabled }} />
                            <div>No blogs found matching your criteria.</div>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      paginatedBlogs.map((blog, index) => (
                        <tr key={blog.id} style={{
                          borderBottom: '1px solid #f1f5f9',
                          backgroundColor: selectedBlogs.includes(blog.id) ? '#e0f2fe' : (index % 2 === 0 ? '#ffffff' : '#fafbfc'),
                          transition: 'all 0.2s'
                        }}
                          onMouseEnter={(e) => {
                            if (!selectedBlogs.includes(blog.id)) {
                              e.target.closest('tr').style.backgroundColor = '#f1f5f9';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!selectedBlogs.includes(blog.id)) {
                              e.target.closest('tr').style.backgroundColor = index % 2 === 0 ? '#ffffff' : '#fafbfc';
                            }
                          }}
                        >
                          <td style={{ padding: '16px' }}>
                            <input
                              type="checkbox"
                              checked={selectedBlogs.includes(blog.id)}
                              onChange={() => handleSelectBlog(blog.id)}
                              style={{ transform: 'scale(1.1)', cursor: 'pointer' }}
                            />
                          </td>
                          <td style={{ padding: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                backgroundColor: '#f3f4f6',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                border: '2px solid #e5e7eb'
                              }}>
                                <span style={{ fontSize: '16px', color: theme.textSecondary, fontWeight: '600' }}>
                                  {blog.title.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <div style={{ fontWeight: '600', fontSize: '14px', color: theme.textPrimary, marginBottom: '4px' }}>
                                  {blog.title}
                                </div>
                                <div style={{ fontSize: '12px', color: theme.textSecondary }}>
                                  ID: {blog.id}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '16px', fontSize: '14px', color: theme.textPrimary }}>
                            {blog.category || 'Uncategorized'}
                          </td>
                          <td style={{ padding: '16px' }}>
                            {blog.image ? (
                              <span style={{
                                padding: '4px 8px',
                                backgroundColor: theme.success + '20',
                                color: theme.success,
                                borderRadius: '12px',
                                fontSize: '11px',
                                fontWeight: '600'
                              }}>
                                ✓ Has Image
                              </span>
                            ) : (
                              <span style={{
                                padding: '4px 8px',
                                backgroundColor: theme.textDisabled + '20',
                                color: theme.textDisabled,
                                borderRadius: '12px',
                                fontSize: '11px',
                                fontWeight: '600'
                              }}>
                                No Image
                              </span>
                            )}
                          </td>
                          <td style={{ padding: '16px', fontSize: '14px', color: theme.textPrimary }}>
                            {blog.publishDate ? new Date(blog.publishDate).toLocaleDateString() : 'Not set'}
                          </td>
                          <td style={{ padding: '16px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              <button
                                onClick={() => handleEditBlog(blog)}
                                style={{
                                  padding: '6px 10px',
                                  backgroundColor: theme.primary,
                                  color: '#fff',
                                  border: 'none',
                                  borderRadius: '4px',
                                  fontSize: '12px',
                                  cursor: hasAnyRole(['super_admin', 'content_manager']) ? 'pointer' : 'not-allowed',
                                  fontWeight: '600',
                                  opacity: hasAnyRole(['super_admin', 'content_manager']) ? 1 : 0.5,
                                  transition: 'all 0.2s'
                                }}
                                disabled={!hasAnyRole(['super_admin', 'content_manager'])}
                                onMouseEnter={(e) => {
                                  if (hasAnyRole(['super_admin', 'content_manager'])) {
                                    e.target.style.backgroundColor = theme.primaryDark;
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (hasAnyRole(['super_admin', 'content_manager'])) {
                                    e.target.style.backgroundColor = theme.primary;
                                  }
                                }}
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteBlog(blog)}
                                style={{
                                  padding: '6px 10px',
                                  backgroundColor: '#dc2626',
                                  color: '#fff',
                                  border: 'none',
                                  borderRadius: '4px',
                                  fontSize: '12px',
                                  cursor: 'pointer',
                                  fontWeight: '600',
                                  transition: 'background-color 0.2s'
                                }}
                                disabled={!hasRole('super_admin')}
                                onMouseEnter={(e) => e.target.style.backgroundColor = '#b91c1c'}
                                onMouseLeave={(e) => e.target.style.backgroundColor = '#dc2626'}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
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
            </div>
          </main>
        </div>
      </div>

      {/* Blog Form Modal */}
      <BlogFormModal
        isOpen={showFormModal}
        onClose={() => setShowFormModal(false)}
        blog={editingBlog}
        onSave={handleFormSave}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deletingBlog && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '20px'
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '400px',
            width: '100%',
            boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
          }}>
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '600', color: theme.textPrimary }}>
                Delete Blog
              </h3>
              <p style={{ margin: 0, color: theme.textSecondary, fontSize: '14px' }}>
                Are you sure you want to delete "{deletingBlog.title}"? This action cannot be undone.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletingBlog(null);
                }}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#f3f4f6',
                  color: theme.textPrimary,
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={loading}
                style={{
                  padding: '10px 20px',
                  backgroundColor: theme.danger,
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontWeight: '500',
                  opacity: loading ? 0.5 : 1
                }}
              >
                {loading ? 'Deleting...' : 'Delete Blog'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Download Options Modal */}
      <DownloadOptionsModal
        isOpen={showDownloadModal}
        onClose={() => setShowDownloadModal(false)}
        onDownload={handleDownloadCSV}
      />
    </div>
  );
};

export default BlogManagement;