import React, { useState, useEffect, useMemo } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import Icon from '../common/Icon';
import Sidebar from './Sidebar';
import api from '../../services/api';

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
  borderDark: '#757575'      // Border Dark
};

const PodcasterManagementView = () => {
  const { admin, logout, hasRole, hasAnyRole, getRoleLevel } = useAdminAuth();

  // Check if user has permission to view podcaster submissions
  if (!hasAnyRole(['super_admin', 'content_manager'])) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: theme.backgroundSoft }}>
        <div style={{ textAlign: 'center' }}>
          <Icon name="shield-exclamation" size="lg" style={{ color: theme.danger, marginBottom: '16px' }} />
          <h2 style={{ color: theme.textPrimary, marginBottom: '8px' }}>Access Denied</h2>
          <p style={{ color: theme.textSecondary }}>You don't have permission to view podcaster submissions.</p>
          <p style={{ color: theme.textSecondary, fontSize: '14px', marginTop: '8px' }}>
            Required roles: Super Admin or Content Manager
          </p>
        </div>
      </div>
    );
  }

  const [podcasters, setPodcasters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFromFilter, setDateFromFilter] = useState('');
  const [dateToFilter, setDateToFilter] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortField, setSortField] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedPodcaster, setSelectedPodcaster] = useState(null);
  const [selectedPodcasters, setSelectedPodcasters] = useState([]);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPodcaster, setEditingPodcaster] = useState(null);

  // Layout constants (same as AdminDashboard)
  const headerZ = 1000;
  const mobileOverlayZ = 500;
  const sidebarZ = 200;
  const headerHeight = 64;
  const mainPaddingTop = headerHeight + 18;
  const sidebarWidth = 240;
  const leftGap = 24;

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
    fetchPodcasters();
  }, []);

  const fetchPodcasters = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: pageSize,
        ...(debouncedSearchTerm && { podcast_name: debouncedSearchTerm }),
        ...(statusFilter && { status: statusFilter }),
        ...(dateFromFilter && { date_from: dateFromFilter }),
        ...(dateToFilter && { date_to: dateToFilter })
      });

      const response = await api.get(`/podcasters/admin?${params}`);
      setPodcasters(response.data.podcasters || []);
    } catch (error) {
      console.error('Error fetching podcasters:', error.response?.data || error.message || error);
      if (error.response?.status === 401) {
        // Token expired or invalid, redirect to login
        localStorage.removeItem('adminAccessToken');
        window.location.href = '/admin/login';
        return;
      }
      if (error.response?.status === 500) {
        alert('Server error. Please try again later.');
      } else {
        alert('Failed to load podcasters. Please check your connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Filtered podcasters based on search and filters
  const filteredPodcasters = useMemo(() => {
    let filtered = podcasters;

    if (debouncedSearchTerm) {
      filtered = filtered.filter(podcaster =>
        podcaster.podcast_name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        (podcaster.podcast_host && podcaster.podcast_host.toLowerCase().includes(debouncedSearchTerm.toLowerCase())) ||
        (podcaster.podcast_focus_industry && podcaster.podcast_focus_industry.toLowerCase().includes(debouncedSearchTerm.toLowerCase()))
      );
    }

    if (statusFilter) {
      filtered = filtered.filter(podcaster => podcaster.status === statusFilter);
    }

    if (dateFromFilter) {
      filtered = filtered.filter(podcaster => new Date(podcaster.created_at) >= new Date(dateFromFilter));
    }

    if (dateToFilter) {
      filtered = filtered.filter(podcaster => new Date(podcaster.created_at) <= new Date(dateToFilter));
    }

    return filtered;
  }, [podcasters, debouncedSearchTerm, statusFilter, dateFromFilter, dateToFilter]);

  // Update filtered podcasters when filters change
  useEffect(() => {
    setCurrentPage(1); // Reset to first page when filters change
  }, [debouncedSearchTerm, statusFilter, dateFromFilter, dateToFilter]);

  // Sorting logic
  const sortedPodcasters = useMemo(() => {
    return [...filteredPodcasters].sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (sortField === 'created_at' || sortField === 'updated_at') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      } else {
        aValue = String(aValue || '').toLowerCase();
        bValue = String(bValue || '').toLowerCase();
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [filteredPodcasters, sortField, sortDirection]);

  // Pagination logic
  const paginatedPodcasters = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedPodcasters.slice(startIndex, startIndex + pageSize);
  }, [sortedPodcasters, currentPage, pageSize]);

  const totalPages = Math.ceil(sortedPodcasters.length / pageSize);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
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

  const handleViewPodcaster = (podcaster) => {
    setSelectedPodcaster(podcaster);
  };

  const handleApprovePodcaster = async (podcaster) => {
    if (!confirm(`Are you sure you want to approve "${podcaster.podcast_name}"?`)) return;

    try {
      await api.put(`/podcasters/admin/${podcaster.id}/approve`);
      // Update local state
      setPodcasters(prev => prev.map(p => p.id === podcaster.id ? { ...p, status: 'approved', approved_at: new Date(), approved_by: admin?.adminId } : p));
      alert('Podcaster approved successfully!');
    } catch (error) {
      console.error('Error approving podcaster:', error);
      alert('Failed to approve podcaster. Please try again.');
    }
  };

  const handleRejectPodcaster = async (podcaster) => {
    const reason = prompt('Please provide a rejection reason:');
    if (!reason || reason.trim().length === 0) return;

    try {
      await api.put(`/podcasters/admin/${podcaster.id}/reject`, { rejection_reason: reason.trim() });
      // Update local state
      setPodcasters(prev => prev.map(p => p.id === podcaster.id ? { ...p, status: 'rejected', rejected_at: new Date(), rejected_by: admin?.adminId, rejection_reason: reason.trim() } : p));
      alert('Podcaster rejected successfully!');
    } catch (error) {
      console.error('Error rejecting podcaster:', error);
      alert('Failed to reject podcaster. Please try again.');
    }
  };

  const handleBulkApprove = async () => {
    if (selectedPodcasters.length === 0) {
      alert('Please select podcasters to approve.');
      return;
    }

    if (!confirm(`Are you sure you want to approve ${selectedPodcasters.length} podcaster(s)?`)) return;

    setBulkActionLoading(true);
    try {
      await api.put('/podcasters/bulk-approve', { ids: selectedPodcasters });
      // Update local state
      setPodcasters(prev => prev.map(p =>
        selectedPodcasters.includes(p.id) ? { ...p, status: 'approved', approved_at: new Date(), approved_by: admin?.adminId } : p
      ));
      setSelectedPodcasters([]);
      alert(`${selectedPodcasters.length} podcaster(s) approved successfully!`);
    } catch (error) {
      console.error('Error bulk approving podcasters:', error);
      alert('Failed to approve selected podcasters. Please try again.');
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkReject = async () => {
    if (selectedPodcasters.length === 0) {
      alert('Please select podcasters to reject.');
      return;
    }

    const reason = prompt('Please provide a rejection reason for all selected podcasters:');
    if (!reason || reason.trim().length === 0) return;

    if (!confirm(`Are you sure you want to reject ${selectedPodcasters.length} podcaster(s)?`)) return;

    setBulkActionLoading(true);
    try {
      await api.put('/podcasters/bulk-reject', { ids: selectedPodcasters, rejection_reason: reason.trim() });
      // Update local state
      setPodcasters(prev => prev.map(p =>
        selectedPodcasters.includes(p.id) ? { ...p, status: 'rejected', rejected_at: new Date(), rejected_by: admin?.adminId, rejection_reason: reason.trim() } : p
      ));
      setSelectedPodcasters([]);
      alert(`${selectedPodcasters.length} podcaster(s) rejected successfully!`);
    } catch (error) {
      console.error('Error bulk rejecting podcasters:', error);
      alert('Failed to reject selected podcasters. Please try again.');
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleSelectPodcaster = (podcasterId) => {
    setSelectedPodcasters(prev =>
      prev.includes(podcasterId)
        ? prev.filter(id => id !== podcasterId)
        : [...prev, podcasterId]
    );
  };

  const handleSelectAll = () => {
    if (selectedPodcasters.length === paginatedPodcasters.length) {
      setSelectedPodcasters([]);
    } else {
      setSelectedPodcasters(paginatedPodcasters.map(p => p.id));
    }
  };

  const handleEditPodcaster = (podcaster) => {
    setEditingPodcaster(podcaster);
    setShowCreateModal(true);
  };

  const handleDeletePodcaster = async (podcaster) => {
    if (!confirm(`Are you sure you want to permanently delete "${podcaster.podcast_name}"? This action cannot be undone.`)) return;

    try {
      await api.delete(`/podcasters/admin/${podcaster.id}`);
      setPodcasters(prev => prev.filter(p => p.id !== podcaster.id));
      alert('Podcaster deleted successfully!');
    } catch (error) {
      console.error('Error deleting podcaster:', error);
      alert('Failed to delete podcaster. Please try again.');
    }
  };

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setDateFromFilter('');
    setDateToFilter('');
  };

  const getPodcasterStats = () => {
    const total = podcasters.length;
    const pending = podcasters.filter(p => p.status === 'pending').length;
    const approved = podcasters.filter(p => p.status === 'approved').length;
    const rejected = podcasters.filter(p => p.status === 'rejected').length;

    return { total, pending, approved, rejected };
  };

  const stats = getPodcasterStats();

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
                <Icon name="shield-check" size="lg" style={{ color: '#1976D2' }} />
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
                {[1, 2, 3, 4].map(i => (
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
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr', gap: '16px', alignItems: 'center' }}>
                        <div>
                          <div style={{ height: '14px', background: '#f3f4f6', borderRadius: 4, width: '120px', marginBottom: '4px' }}></div>
                          <div style={{ height: '12px', background: '#f3f4f6', borderRadius: 4, width: '80px' }}></div>
                        </div>
                        <div style={{ height: '14px', background: '#f3f4f6', borderRadius: 4, width: '60px' }}></div>
                        <div style={{ height: '14px', background: '#f3f4f6', borderRadius: 4, width: '80px' }}></div>
                        <div style={{ height: '14px', background: '#f3f4f6', borderRadius: 4, width: '70px' }}></div>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <div style={{ width: '60px', height: '24px', background: '#f3f4f6', borderRadius: 4 }}></div>
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
            <div className="flex items-center">
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
                <Icon name="shield-check" size="lg" style={{ color: '#1976D2' }} />
                <span style={{ fontWeight: 700, fontSize: 18 }}>News Marketplace Admin</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 700 }}>{admin?.first_name ? `${admin.first_name} ${admin.last_name}` : 'Master Admin'}</div>
                <div style={{ marginTop: 6 }}>
                  <span style={{
                    backgroundColor: theme.secondaryLight,
                    color: theme.secondaryDark,
                    padding: '0.125rem 0.5rem',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    lineHeight: 1
                  }}>{roleDisplayNames[admin?.role] || '—'}</span>
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
                    <Icon name="microphone" size="sm" style={{ color: '#1976D2' }} />
                  </div>
                  <h1 style={{ margin: 0, fontSize: 34, fontWeight: 800 }}>Podcaster Management</h1>
                </div>
                <p style={{ marginTop: 8, color: '#757575' }}>View and manage podcaster profile submissions</p>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                style={{
                  ...btnPrimary,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 20px',
                  fontSize: '14px'
                }}
              >
                <Icon name="plus" size="sm" style={{ color: '#fff' }} />
                Create Podcaster
              </button>
            </div>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
              {[
                { label: 'Total Submissions', value: stats.total, icon: 'microphone', bg: '#e6f0ff' },
                { label: 'Pending Review', value: stats.pending, icon: 'clock', bg: '#fef3c7' },
                { label: 'Approved', value: stats.approved, icon: 'check-circle', bg: '#dcfce7' },
                { label: 'Rejected', value: stats.rejected, icon: 'x-circle', bg: '#fee2e2' }
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

            {/* Bulk Actions */}
            {selectedPodcasters.length > 0 && (
              <div style={{ backgroundColor: '#fff', padding: '16px', borderRadius: '12px', marginBottom: '16px', boxShadow: '0 8px 20px rgba(2,6,23,0.06)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: theme.textPrimary }}>
                    {selectedPodcasters.length} podcaster(s) selected
                  </span>
                  <button
                    onClick={handleBulkApprove}
                    disabled={bulkActionLoading}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: theme.success,
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '14px',
                      cursor: bulkActionLoading ? 'not-allowed' : 'pointer',
                      fontWeight: '500',
                      opacity: bulkActionLoading ? 0.6 : 1
                    }}
                  >
                    {bulkActionLoading ? 'Processing...' : 'Bulk Approve'}
                  </button>
                  <button
                    onClick={handleBulkReject}
                    disabled={bulkActionLoading}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: theme.danger,
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '14px',
                      cursor: bulkActionLoading ? 'not-allowed' : 'pointer',
                      fontWeight: '500',
                      opacity: bulkActionLoading ? 0.6 : 1
                    }}
                  >
                    {bulkActionLoading ? 'Processing...' : 'Bulk Reject'}
                  </button>
                  <button
                    onClick={() => setSelectedPodcasters([])}
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
                    Clear Selection
                  </button>
                </div>
              </div>
            )}

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
                    placeholder="Search podcasters by name, host, industry..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                      width: '100%',
                      paddingTop: '12px',
                      paddingRight: '16px',
                      paddingBottom: '12px',
                      paddingLeft: '44px',
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
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '6px',
                    fontSize: '14px',
                    backgroundColor: '#fff',
                    cursor: 'pointer',
                    minWidth: '120px'
                  }}
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>

                <input
                  type="date"
                  value={dateFromFilter}
                  onChange={(e) => setDateFromFilter(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '6px',
                    fontSize: '14px',
                    minWidth: '140px'
                  }}
                  placeholder="From Date"
                />

                <input
                  type="date"
                  value={dateToFilter}
                  onChange={(e) => setDateToFilter(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '6px',
                    fontSize: '14px',
                    minWidth: '140px'
                  }}
                  placeholder="To Date"
                />

                <button
                  onClick={clearFilters}
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

              {/* Search Results Summary */}
              <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div style={{ fontSize: '14px', color: theme.textSecondary }}>
                  Showing <strong>{paginatedPodcasters.length}</strong> of <strong>{sortedPodcasters.length}</strong> podcasters
                  {sortedPodcasters.length !== podcasters.length && (
                    <span> (filtered from {podcasters.length} total)</span>
                  )}
                </div>
              </div>
            </div>

            {/* Podcasters Table */}
            <div style={{ backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 8px 20px rgba(2,6,23,0.06)', overflow: 'hidden' }}>
              {/* Table Controls */}
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb', backgroundColor: '#f8fafc' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: theme.textPrimary }}>
                      Podcaster Submissions
                    </span>
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

              <div style={{ overflowX: 'auto', maxHeight: paginatedPodcasters.length > 50 ? '600px' : 'auto', overflowY: paginatedPodcasters.length > 50 ? 'auto' : 'visible' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                      <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', fontSize: '12px', color: theme.textPrimary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        <input
                          type="checkbox"
                          checked={selectedPodcasters.length === paginatedPodcasters.length && paginatedPodcasters.length > 0}
                          onChange={handleSelectAll}
                          style={{ marginRight: '8px' }}
                        />
                        Podcast
                      </th>
                      <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', fontSize: '12px', color: theme.textPrimary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Host
                      </th>
                      <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', fontSize: '12px', color: theme.textPrimary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Industry
                      </th>
                      <th
                        style={{ padding: '16px', textAlign: 'left', fontWeight: '700', fontSize: '12px', color: theme.textPrimary, textTransform: 'uppercase', letterSpacing: '0.5px', cursor: 'pointer' }}
                        onClick={() => handleSort('created_at')}
                      >
                        Submitted {getSortIcon('created_at')}
                      </th>
                      <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', fontSize: '12px', color: theme.textPrimary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Status
                      </th>
                      <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', fontSize: '12px', color: theme.textPrimary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedPodcasters.length === 0 ? (
                      <tr>
                        <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: theme.textSecondary }}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                            <Icon name="microphone" size="lg" style={{ color: theme.textDisabled }} />
                            <div>No podcasters found matching your criteria.</div>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      paginatedPodcasters.map((podcaster, index) => (
                        <tr key={podcaster.id} style={{ backgroundColor: index % 2 === 0 ? '#ffffff' : '#fafbfc', borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <input
                                type="checkbox"
                                checked={selectedPodcasters.includes(podcaster.id)}
                                onChange={() => handleSelectPodcaster(podcaster.id)}
                              />
                              <div>
                                <div style={{ fontSize: '14px', fontWeight: '600', color: theme.textPrimary, marginBottom: '4px' }}>
                                  {podcaster.podcast_name}
                                </div>
                                <div style={{ fontSize: '12px', color: theme.textSecondary }}>
                                  {podcaster.podcast_region || 'Region not specified'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '16px' }}>
                            <div style={{ fontSize: '14px', fontWeight: '500', color: theme.textPrimary }}>
                              {podcaster.podcast_host || 'Not specified'}
                            </div>
                          </td>
                          <td style={{ padding: '16px' }}>
                            <div style={{ fontSize: '13px', color: theme.textPrimary, fontWeight: '500' }}>
                              {podcaster.podcast_focus_industry || 'Not specified'}
                            </div>
                          </td>
                          <td style={{ padding: '16px' }}>
                            <div style={{ fontSize: '13px', color: theme.textPrimary }}>
                              {formatDate(podcaster.created_at)}
                            </div>
                          </td>
                          <td style={{ padding: '16px', fontSize: '14px', color: theme.textPrimary }}>
                            <span style={{
                              padding: '4px 8px',
                              backgroundColor: podcaster.status === 'approved' ? theme.success + '20' : podcaster.status === 'rejected' ? theme.danger + '20' : theme.warning + '20',
                              color: podcaster.status === 'approved' ? theme.success : podcaster.status === 'rejected' ? theme.danger : theme.warning,
                              borderRadius: '12px',
                              fontSize: '11px',
                              fontWeight: '600'
                            }}>
                              {podcaster.status.charAt(0).toUpperCase() + podcaster.status.slice(1)}
                            </span>
                          </td>
                          <td style={{ padding: '16px' }}>
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                              <button
                                onClick={() => handleViewPodcaster(podcaster)}
                                style={{
                                  padding: '6px 12px',
                                  backgroundColor: theme.primary,
                                  color: '#fff',
                                  border: 'none',
                                  borderRadius: '6px',
                                  fontSize: '12px',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}
                                title="View Podcaster Details"
                              >
                                <Icon name="eye" size="xs" style={{ color: '#fff' }} />
                                View
                              </button>
                              <button
                                onClick={() => handleEditPodcaster(podcaster)}
                                style={{
                                  padding: '6px 12px',
                                  backgroundColor: theme.warning,
                                  color: '#fff',
                                  border: 'none',
                                  borderRadius: '6px',
                                  fontSize: '12px',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}
                                title="Edit Podcaster"
                              >
                                <Icon name="pencil" size="xs" style={{ color: '#fff' }} />
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeletePodcaster(podcaster)}
                                style={{
                                  padding: '6px 12px',
                                  backgroundColor: theme.danger,
                                  color: '#fff',
                                  border: 'none',
                                  borderRadius: '6px',
                                  fontSize: '12px',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}
                                title="Delete Podcaster"
                              >
                                <Icon name="trash" size="xs" style={{ color: '#fff' }} />
                                Delete
                              </button>
                              {podcaster.status === 'pending' && (
                                <>
                                  <button
                                    onClick={() => handleApprovePodcaster(podcaster)}
                                    style={{
                                      padding: '6px 12px',
                                      backgroundColor: theme.success,
                                      color: '#fff',
                                      border: 'none',
                                      borderRadius: '6px',
                                      fontSize: '12px',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '4px'
                                    }}
                                    title="Approve Podcaster"
                                  >
                                    <Icon name="check" size="xs" style={{ color: '#fff' }} />
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => handleRejectPodcaster(podcaster)}
                                    style={{
                                      padding: '6px 12px',
                                      backgroundColor: '#f44336',
                                      color: '#fff',
                                      border: 'none',
                                      borderRadius: '6px',
                                      fontSize: '12px',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '4px'
                                    }}
                                    title="Reject Podcaster"
                                  >
                                    <Icon name="x" size="xs" style={{ color: '#fff' }} />
                                    Reject
                                  </button>
                                </>
                              )}
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

      {/* Podcaster Detail Modal */}
      {selectedPodcaster && (
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
        }} onClick={() => setSelectedPodcaster(null)}>
          <div style={{
            background: '#fff',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '900px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
            margin: 'auto'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '800' }}>
                Podcaster Profile Details
              </h2>
              <button onClick={() => setSelectedPodcaster(null)} style={{ background: 'transparent', border: 'none', fontSize: '24px', cursor: 'pointer' }}>
                ×
              </button>
            </div>

            <div style={{ display: 'grid', gap: '16px' }}>
              {/* Basic Information */}
              <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px' }}>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', fontWeight: '700', color: theme.textPrimary }}>Basic Information</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                  <div><strong>Podcast Name:</strong> {selectedPodcaster.podcast_name}</div>
                  <div><strong>Podcast Host:</strong> {selectedPodcaster.podcast_host || 'Not specified'}</div>
                  <div><strong>Focus Industry:</strong> {selectedPodcaster.podcast_focus_industry || 'Not specified'}</div>
                  <div><strong>Target Audience:</strong> {selectedPodcaster.podcast_target_audience || 'Not specified'}</div>
                  <div><strong>Region:</strong> {selectedPodcaster.podcast_region || 'Not specified'}</div>
                  <div><strong>Website:</strong> {selectedPodcaster.podcast_website ? <a href={selectedPodcaster.podcast_website} target="_blank" rel="noopener noreferrer">{selectedPodcaster.podcast_website}</a> : 'Not provided'}</div>
                </div>
              </div>

              {/* Social Media */}
              <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px' }}>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', fontWeight: '700', color: theme.textPrimary }}>Social Media & Platforms</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                  <div><strong>Instagram:</strong> {selectedPodcaster.podcast_ig ? <a href={selectedPodcaster.podcast_ig} target="_blank" rel="noopener noreferrer">{selectedPodcaster.podcast_ig}</a> : 'Not provided'}</div>
                  <div><strong>Instagram Username:</strong> {selectedPodcaster.podcast_ig_username || 'Not provided'}</div>
                  <div><strong>Instagram Followers:</strong> {selectedPodcaster.podcast_ig_followers ? selectedPodcaster.podcast_ig_followers.toLocaleString() : 'Not provided'}</div>
                  <div><strong>Instagram Engagement Rate:</strong> {selectedPodcaster.podcast_ig_engagement_rate ? `${selectedPodcaster.podcast_ig_engagement_rate}%` : 'Not provided'}</div>
                  <div><strong>LinkedIn:</strong> {selectedPodcaster.podcast_linkedin ? <a href={selectedPodcaster.podcast_linkedin} target="_blank" rel="noopener noreferrer">{selectedPodcaster.podcast_linkedin}</a> : 'Not provided'}</div>
                  <div><strong>Facebook:</strong> {selectedPodcaster.podcast_facebook ? <a href={selectedPodcaster.podcast_facebook} target="_blank" rel="noopener noreferrer">{selectedPodcaster.podcast_facebook}</a> : 'Not provided'}</div>
                  <div><strong>TikTok:</strong> {selectedPodcaster.tiktok ? <a href={selectedPodcaster.tiktok} target="_blank" rel="noopener noreferrer">{selectedPodcaster.tiktok}</a> : 'Not provided'}</div>
                </div>
              </div>

              {/* Streaming Platforms */}
              <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px' }}>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', fontWeight: '700', color: theme.textPrimary }}>Streaming Platforms</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                  <div><strong>Spotify Channel Name:</strong> {selectedPodcaster.spotify_channel_name || 'Not provided'}</div>
                  <div><strong>Spotify URL:</strong> {selectedPodcaster.spotify_channel_url ? <a href={selectedPodcaster.spotify_channel_url} target="_blank" rel="noopener noreferrer">{selectedPodcaster.spotify_channel_url}</a> : 'Not provided'}</div>
                  <div><strong>YouTube Channel Name:</strong> {selectedPodcaster.youtube_channel_name || 'Not provided'}</div>
                  <div><strong>YouTube URL:</strong> {selectedPodcaster.youtube_channel_url ? <a href={selectedPodcaster.youtube_channel_url} target="_blank" rel="noopener noreferrer">{selectedPodcaster.youtube_channel_url}</a> : 'Not provided'}</div>
                </div>
              </div>

              {/* Additional Information */}
              <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px' }}>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', fontWeight: '700', color: theme.textPrimary }}>Additional Information</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                  <div><strong>Call to Action:</strong> {selectedPodcaster.cta || 'Not provided'}</div>
                  <div><strong>Contact for Podcast:</strong> {selectedPodcaster.contact_us_to_be_on_podcast || 'Not provided'}</div>
                  <div style={{ gridColumn: '1 / -1' }}><strong>Prominent Guests:</strong> {selectedPodcaster.podcast_ig_prominent_guests || 'Not provided'}</div>
                </div>
              </div>

              {/* Status Information */}
              <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px' }}>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', fontWeight: '700', color: theme.textPrimary }}>Status Information</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                  <div><strong>Status:</strong> <span style={{
                    padding: '4px 8px',
                    backgroundColor: selectedPodcaster.status === 'approved' ? theme.success + '20' : selectedPodcaster.status === 'rejected' ? theme.danger + '20' : theme.warning + '20',
                    color: selectedPodcaster.status === 'approved' ? theme.success : selectedPodcaster.status === 'rejected' ? theme.danger : theme.warning,
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: '600'
                  }}>{selectedPodcaster.status.charAt(0).toUpperCase() + selectedPodcaster.status.slice(1)}</span></div>
                  <div><strong>Submitted:</strong> {formatDate(selectedPodcaster.created_at)}</div>
                  <div><strong>Last Updated:</strong> {formatDate(selectedPodcaster.updated_at)}</div>
                  {selectedPodcaster.approved_at && <div><strong>Approved:</strong> {formatDate(selectedPodcaster.approved_at)}</div>}
                  {selectedPodcaster.rejected_at && <div><strong>Rejected:</strong> {formatDate(selectedPodcaster.rejected_at)}</div>}
                  {selectedPodcaster.rejection_reason && (
                    <div style={{ gridColumn: '1 / -1' }}>
                      <strong>Rejection Reason:</strong>
                      <div style={{ backgroundColor: '#fee2e2', padding: '8px', borderRadius: '4px', marginTop: '4px', color: theme.danger }}>
                        {selectedPodcaster.rejection_reason}
                      </div>
                    </div>
                  )}
                  {selectedPodcaster.admin_comments && (
                    <div style={{ gridColumn: '1 / -1' }}>
                      <strong>Admin Comments:</strong>
                      <div style={{ backgroundColor: '#e0f2fe', padding: '8px', borderRadius: '4px', marginTop: '4px', color: theme.info }}>
                        {selectedPodcaster.admin_comments}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px' }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                {selectedPodcaster.status === 'pending' && (
                  <>
                    <button
                      onClick={() => {
                        setSelectedPodcaster(null);
                        handleApprovePodcaster(selectedPodcaster);
                      }}
                      style={{
                        padding: '10px 20px',
                        backgroundColor: theme.success,
                        color: '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        cursor: 'pointer',
                        fontWeight: '600'
                      }}
                    >
                      Approve Podcaster
                    </button>
                    <button
                      onClick={() => {
                        setSelectedPodcaster(null);
                        handleRejectPodcaster(selectedPodcaster);
                      }}
                      style={{
                        padding: '10px 20px',
                        backgroundColor: theme.danger,
                        color: '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        cursor: 'pointer',
                        fontWeight: '600'
                      }}
                    >
                      Reject Podcaster
                    </button>
                  </>
                )}
              </div>
              <button
                onClick={() => setSelectedPodcaster(null)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#f3f4f6',
                  color: theme.textPrimary,
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Podcaster Modal */}
      {showCreateModal && (
        <PodcasterFormModal
          podcaster={editingPodcaster}
          onClose={() => {
            setShowCreateModal(false);
            setEditingPodcaster(null);
          }}
          onSuccess={(newPodcaster) => {
            if (editingPodcaster) {
              // Update existing podcaster
              setPodcasters(prev => prev.map(p => p.id === newPodcaster.id ? newPodcaster : p));
            } else {
              // Add new podcaster
              setPodcasters(prev => [newPodcaster, ...prev]);
            }
            setShowCreateModal(false);
            setEditingPodcaster(null);
          }}
        />
      )}
    </div>
  );
};

// Podcaster Form Modal Component
const PodcasterFormModal = ({ podcaster, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    podcast_name: podcaster?.podcast_name || '',
    podcast_host: podcaster?.podcast_host || '',
    podcast_focus_industry: podcaster?.podcast_focus_industry || '',
    podcast_target_audience: podcaster?.podcast_target_audience || '',
    podcast_region: podcaster?.podcast_region || '',
    podcast_website: podcaster?.podcast_website || '',
    podcast_ig: podcaster?.podcast_ig || '',
    podcast_linkedin: podcaster?.podcast_linkedin || '',
    podcast_facebook: podcaster?.podcast_facebook || '',
    podcast_ig_username: podcaster?.podcast_ig_username || '',
    podcast_ig_followers: podcaster?.podcast_ig_followers || '',
    podcast_ig_engagement_rate: podcaster?.podcast_ig_engagement_rate || '',
    podcast_ig_prominent_guests: podcaster?.podcast_ig_prominent_guests || '',
    spotify_channel_name: podcaster?.spotify_channel_name || '',
    spotify_channel_url: podcaster?.spotify_channel_url || '',
    youtube_channel_name: podcaster?.youtube_channel_name || '',
    youtube_channel_url: podcaster?.youtube_channel_url || '',
    tiktok: podcaster?.tiktok || '',
    cta: podcaster?.cta || '',
    contact_us_to_be_on_podcast: podcaster?.contact_us_to_be_on_podcast || '',
    status: podcaster?.status || 'approved' // Default to approved for admin-created podcasters
  });

  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.podcast_name.trim()) {
      newErrors.podcast_name = 'Podcast name is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const submitData = new FormData();
      Object.keys(formData).forEach(key => {
        submitData.append(key, formData[key]);
      });
      if (image) {
        submitData.append('image', image);
      }

      let response;
      if (podcaster) {
        // Update existing
        response = await api.put(`/podcasters/admin/${podcaster.id}`, submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        // Create new
        response = await api.post('/podcasters/admin', submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      onSuccess(response.data.podcaster || response.data);
    } catch (error) {
      console.error('Error saving podcaster:', error);
      alert('Failed to save podcaster. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const theme = {
    primary: '#1976D2',
    textPrimary: '#212121',
    textSecondary: '#757575',
    background: '#FFFFFF',
    borderLight: '#E0E0E0'
  };

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
        maxWidth: '800px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
        margin: 'auto'
      }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '800' }}>
            {podcaster ? 'Edit Podcaster' : 'Create New Podcaster'}
          </h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', fontSize: '24px', cursor: 'pointer' }}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.textPrimary, marginBottom: '6px' }}>
                Podcast Name *
              </label>
              <input
                type="text"
                name="podcast_name"
                value={formData.podcast_name}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: `1px solid ${errors.podcast_name ? '#f44336' : theme.borderLight}`,
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
                required
              />
              {errors.podcast_name && <div style={{ color: '#f44336', fontSize: '12px', marginTop: '4px' }}>{errors.podcast_name}</div>}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.textPrimary, marginBottom: '6px' }}>
                Podcast Host
              </label>
              <input
                type="text"
                name="podcast_host"
                value={formData.podcast_host}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: `1px solid ${theme.borderLight}`,
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.textPrimary, marginBottom: '6px' }}>
                Focus Industry
              </label>
              <input
                type="text"
                name="podcast_focus_industry"
                value={formData.podcast_focus_industry}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: `1px solid ${theme.borderLight}`,
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.textPrimary, marginBottom: '6px' }}>
                Target Audience
              </label>
              <input
                type="text"
                name="podcast_target_audience"
                value={formData.podcast_target_audience}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: `1px solid ${theme.borderLight}`,
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.textPrimary, marginBottom: '6px' }}>
                Region
              </label>
              <input
                type="text"
                name="podcast_region"
                value={formData.podcast_region}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: `1px solid ${theme.borderLight}`,
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.textPrimary, marginBottom: '6px' }}>
                Website
              </label>
              <input
                type="url"
                name="podcast_website"
                value={formData.podcast_website}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: `1px solid ${theme.borderLight}`,
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.textPrimary, marginBottom: '6px' }}>
                Instagram
              </label>
              <input
                type="url"
                name="podcast_ig"
                value={formData.podcast_ig}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: `1px solid ${theme.borderLight}`,
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.textPrimary, marginBottom: '6px' }}>
                LinkedIn
              </label>
              <input
                type="url"
                name="podcast_linkedin"
                value={formData.podcast_linkedin}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: `1px solid ${theme.borderLight}`,
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.textPrimary, marginBottom: '6px' }}>
                Facebook
              </label>
              <input
                type="url"
                name="podcast_facebook"
                value={formData.podcast_facebook}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: `1px solid ${theme.borderLight}`,
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.textPrimary, marginBottom: '6px' }}>
                Instagram Username
              </label>
              <input
                type="text"
                name="podcast_ig_username"
                value={formData.podcast_ig_username}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: `1px solid ${theme.borderLight}`,
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.textPrimary, marginBottom: '6px' }}>
                Instagram Followers
              </label>
              <input
                type="number"
                name="podcast_ig_followers"
                value={formData.podcast_ig_followers}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: `1px solid ${theme.borderLight}`,
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.textPrimary, marginBottom: '6px' }}>
                Engagement Rate (%)
              </label>
              <input
                type="number"
                name="podcast_ig_engagement_rate"
                value={formData.podcast_ig_engagement_rate}
                onChange={handleInputChange}
                min="0"
                max="100"
                step="0.1"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: `1px solid ${theme.borderLight}`,
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.textPrimary, marginBottom: '6px' }}>
                Spotify Channel Name
              </label>
              <input
                type="text"
                name="spotify_channel_name"
                value={formData.spotify_channel_name}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: `1px solid ${theme.borderLight}`,
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.textPrimary, marginBottom: '6px' }}>
                Spotify URL
              </label>
              <input
                type="url"
                name="spotify_channel_url"
                value={formData.spotify_channel_url}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: `1px solid ${theme.borderLight}`,
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.textPrimary, marginBottom: '6px' }}>
                YouTube Channel Name
              </label>
              <input
                type="text"
                name="youtube_channel_name"
                value={formData.youtube_channel_name}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: `1px solid ${theme.borderLight}`,
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.textPrimary, marginBottom: '6px' }}>
                YouTube URL
              </label>
              <input
                type="url"
                name="youtube_channel_url"
                value={formData.youtube_channel_url}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: `1px solid ${theme.borderLight}`,
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.textPrimary, marginBottom: '6px' }}>
                TikTok
              </label>
              <input
                type="text"
                name="tiktok"
                value={formData.tiktok}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: `1px solid ${theme.borderLight}`,
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.textPrimary, marginBottom: '6px' }}>
                Call to Action
              </label>
              <input
                type="text"
                name="cta"
                value={formData.cta}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: `1px solid ${theme.borderLight}`,
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.textPrimary, marginBottom: '6px' }}>
                Contact for Podcast
              </label>
              <input
                type="text"
                name="contact_us_to_be_on_podcast"
                value={formData.contact_us_to_be_on_podcast}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: `1px solid ${theme.borderLight}`,
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.textPrimary, marginBottom: '6px' }}>
                Prominent Guests
              </label>
              <textarea
                name="podcast_ig_prominent_guests"
                value={formData.podcast_ig_prominent_guests}
                onChange={handleInputChange}
                rows="3"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: `1px solid ${theme.borderLight}`,
                  borderRadius: '8px',
                  fontSize: '14px',
                  resize: 'vertical'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.textPrimary, marginBottom: '6px' }}>
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: `1px solid ${theme.borderLight}`,
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.textPrimary, marginBottom: '6px' }}>
                Podcast Image
              </label>
              {podcaster?.image && (
                <div style={{ marginBottom: '12px' }}>
                  <img
                    src={`/api/uploads/podcasters/${podcaster.image}`}
                    alt="Current podcast image"
                    style={{
                      width: '100px',
                      height: '100px',
                      objectFit: 'cover',
                      borderRadius: '8px',
                      border: `1px solid ${theme.borderLight}`
                    }}
                  />
                  <p style={{ fontSize: '12px', color: theme.textSecondary, marginTop: '4px' }}>
                    Current image - upload a new one to replace
                  </p>
                </div>
              )}
              <input
                type="file"
                onChange={handleImageChange}
                accept="image/*"
                style={{
                  width: '100%',
                  padding: '8px',
                  border: `1px solid ${theme.borderLight}`,
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 20px',
                backgroundColor: '#f3f4f6',
                color: theme.textPrimary,
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                cursor: 'pointer'
              }}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                padding: '10px 20px',
                backgroundColor: theme.primary,
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1
              }}
              disabled={loading}
            >
              {loading ? 'Saving...' : (podcaster ? 'Update Podcaster' : 'Create Podcaster')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PodcasterManagementView;
