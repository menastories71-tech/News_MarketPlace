import React, { useState, useEffect, useMemo } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import Icon from '../common/Icon';
import Sidebar from './Sidebar';
import ReporterFormModal from './ReporterFormModal';
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

const ReporterManagement = () => {
  const { admin, logout, hasRole, hasAnyRole, getRoleLevel } = useAdminAuth();

  // Check if user has permission to manage reporters
  if (!hasAnyRole(['super_admin', 'content_manager'])) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: theme.backgroundSoft }}>
        <div style={{ textAlign: 'center' }}>
          <Icon name="shield-exclamation" size="lg" style={{ color: theme.danger, marginBottom: '16px' }} />
          <h2 style={{ color: theme.textPrimary, marginBottom: '8px' }}>Access Denied</h2>
          <p style={{ color: theme.textSecondary }}>You don't have permission to access reporter management.</p>
          <p style={{ color: theme.textSecondary, fontSize: '14px', marginTop: '8px' }}>
            Required roles: Super Admin or Content Manager
          </p>
        </div>
      </div>
    );
  }

  const [reporters, setReporters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [positionFilter, setPositionFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFromFilter, setDateFromFilter] = useState('');
  const [dateToFilter, setDateToFilter] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingReporter, setEditingReporter] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortField, setSortField] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedReporters, setSelectedReporters] = useState([]);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

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
    fetchReporters();
  }, []);

  const fetchReporters = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: pageSize,
        ...(debouncedSearchTerm && { name: debouncedSearchTerm }),
        ...(debouncedSearchTerm && { email: debouncedSearchTerm }),
        ...(debouncedSearchTerm && { publication_name: debouncedSearchTerm }),
        ...(departmentFilter && { function_department: departmentFilter }),
        ...(positionFilter && { position: positionFilter }),
        ...(statusFilter && { status: statusFilter }),
        ...(dateFromFilter && { date_from: dateFromFilter }),
        ...(dateToFilter && { date_to: dateToFilter })
      });

      const response = await api.get(`/reporters/admin?${params}`);
      setReporters(response.data.reporters || []);
    } catch (error) {
      console.error('Error fetching reporters:', error);
      if (error.response?.status === 401) {
        // Token expired or invalid, redirect to login
        localStorage.removeItem('adminAccessToken');
        window.location.href = '/admin/login';
        return;
      }
      alert('Failed to load reporters. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Filtered reporters based on search and filters
  const filteredReporters = useMemo(() => {
    let filtered = reporters;

    if (debouncedSearchTerm) {
      filtered = filtered.filter(reporter =>
        reporter.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        reporter.email.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        reporter.publication_name.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      );
    }

    if (departmentFilter) {
      filtered = filtered.filter(reporter => reporter.function_department === departmentFilter);
    }

    if (positionFilter) {
      filtered = filtered.filter(reporter => reporter.position === positionFilter);
    }

    if (statusFilter) {
      filtered = filtered.filter(reporter => reporter.status === statusFilter);
    }

    if (dateFromFilter) {
      filtered = filtered.filter(reporter => new Date(reporter.created_at) >= new Date(dateFromFilter));
    }

    if (dateToFilter) {
      filtered = filtered.filter(reporter => new Date(reporter.created_at) <= new Date(dateToFilter));
    }

    return filtered;
  }, [reporters, debouncedSearchTerm, departmentFilter, positionFilter, statusFilter, dateFromFilter, dateToFilter]);

  // Update filtered reporters when filters change
  useEffect(() => {
    setCurrentPage(1); // Reset to first page when filters change
  }, [debouncedSearchTerm, departmentFilter, positionFilter, statusFilter, dateFromFilter, dateToFilter]);

  // Sorting logic
  const sortedReporters = useMemo(() => {
    return [...filteredReporters].sort((a, b) => {
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
  }, [filteredReporters, sortField, sortDirection]);

  // Pagination logic
  const paginatedReporters = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedReporters.slice(startIndex, startIndex + pageSize);
  }, [sortedReporters, currentPage, pageSize]);

  const totalPages = Math.ceil(sortedReporters.length / pageSize);

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

  // CRUD operations
  const handleCreateReporter = () => {
    setEditingReporter(null);
    setShowFormModal(true);
  };

  const handleEditReporter = (reporter) => {
    setEditingReporter(reporter);
    setShowFormModal(true);
  };

  const handleDeleteReporter = async (reporterId) => {
    if (!window.confirm('Are you sure you want to delete this reporter submission?')) return;

    try {
      await api.delete(`/reporters/admin/${reporterId}`);
      fetchReporters();
    } catch (error) {
      console.error('Error deleting reporter:', error);
      alert('Error deleting reporter. Please try again.');
    }
  };

  const handleApproveReporter = async (reporterId) => {
    if (!window.confirm('Are you sure you want to approve this reporter submission?')) return;

    try {
      await api.put(`/reporters/admin/${reporterId}/approve`);
      fetchReporters();
    } catch (error) {
      console.error('Error approving reporter:', error);
      alert('Error approving reporter. Please try again.');
    }
  };

  const handleRejectReporter = async (reporterId) => {
    const reason = prompt('Please provide a rejection reason:');
    if (!reason || !reason.trim()) return;

    try {
      await api.put(`/reporters/admin/${reporterId}/reject`, {
        rejection_reason: reason.trim()
      });
      fetchReporters();
    } catch (error) {
      console.error('Error rejecting reporter:', error);
      alert('Error rejecting reporter. Please try again.');
    }
  };

  const handleFormSave = () => {
    fetchReporters();
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
    setDepartmentFilter('');
    setPositionFilter('');
    setStatusFilter('');
    setDateFromFilter('');
    setDateToFilter('');
  };

  const getReporterStats = () => {
    const total = reporters.length;
    const pending = reporters.filter(r => r.status === 'pending').length;
    const approved = reporters.filter(r => r.status === 'approved').length;
    const rejected = reporters.filter(r => r.status === 'rejected').length;

    return { total, pending, approved, rejected };
  };

  const stats = getReporterStats();

  // Bulk operations
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedReporters(paginatedReporters.map(r => r.id));
    } else {
      setSelectedReporters([]);
    }
  };

  const handleSelectReporter = (reporterId, checked) => {
    if (checked) {
      setSelectedReporters(prev => [...prev, reporterId]);
    } else {
      setSelectedReporters(prev => prev.filter(id => id !== reporterId));
    }
  };

  const handleBulkApprove = async () => {
    if (selectedReporters.length === 0) return;

    if (!window.confirm(`Are you sure you want to approve ${selectedReporters.length} reporter submissions?`)) return;

    setBulkActionLoading(true);
    try {
      await api.put('/reporters/admin/bulk-approve', { ids: selectedReporters });
      setSelectedReporters([]);
      fetchReporters();
    } catch (error) {
      console.error('Error bulk approving reporters:', error);
      alert('Error bulk approving reporters. Please try again.');
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkReject = async () => {
    const reason = prompt('Please provide a rejection reason for all selected reporters:');
    if (!reason || !reason.trim()) return;

    if (!window.confirm(`Are you sure you want to reject ${selectedReporters.length} reporter submissions?`)) return;

    setBulkActionLoading(true);
    try {
      await api.put('/reporters/admin/bulk-reject', {
        ids: selectedReporters,
        rejection_reason: reason.trim()
      });
      setSelectedReporters([]);
      fetchReporters();
    } catch (error) {
      console.error('Error bulk rejecting reporters:', error);
      alert('Error bulk rejecting reporters. Please try again.');
    } finally {
      setBulkActionLoading(false);
    }
  };

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
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr', gap: '16px', alignItems: 'center' }}>
                        <div>
                          <div style={{ height: '14px', background: '#f3f4f6', borderRadius: 4, width: '120px', marginBottom: '4px' }}></div>
                          <div style={{ height: '12px', background: '#f3f4f6', borderRadius: 4, width: '80px' }}></div>
                        </div>
                        <div style={{ height: '14px', background: '#f3f4f6', borderRadius: 4, width: '60px' }}></div>
                        <div style={{ height: '14px', background: '#f3f4f6', borderRadius: 4, width: '80px' }}></div>
                        <div style={{ height: '14px', background: '#f3f4f6', borderRadius: 4, width: '70px' }}></div>
                        <div style={{ height: '14px', background: '#f3f4f6', borderRadius: 4, width: '50px' }}></div>
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
                    <Icon name="user-group" size="sm" style={{ color: '#1976D2' }} />
                  </div>
                  <h1 style={{ margin: 0, fontSize: 34, fontWeight: 800 }}>Reporter Management</h1>
                </div>
                <p style={{ marginTop: 8, color: '#757575' }}>Manage reporter submissions and approvals</p>
              </div>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button
                  onClick={handleCreateReporter}
                  style={{ ...btnPrimary, fontSize: '14px', padding: '12px 20px' }}
                  disabled={!hasAnyRole(['super_admin', 'content_manager'])}
                >
                  <Icon name="plus" size="sm" style={{ color: '#fff', marginRight: 8 }} />
                  Add Reporter
                </button>
              </div>
            </div>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
              {[
                { label: 'Total Submissions', value: stats.total, icon: 'user-group', bg: '#e6f0ff' },
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
                    placeholder="Search reporters by name, email, publication..."
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
                <select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '6px',
                    fontSize: '14px',
                    backgroundColor: '#fff',
                    cursor: 'pointer',
                    minWidth: '150px'
                  }}
                >
                  <option value="">All Departments</option>
                  <option value="Commercial">Commercial</option>
                  <option value="Procurement">Procurement</option>
                  <option value="Publishing">Publishing</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Accounts and Finance">Accounts and Finance</option>
                </select>

                <select
                  value={positionFilter}
                  onChange={(e) => setPositionFilter(e.target.value)}
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
                  <option value="">All Positions</option>
                  <option value="Journalist">Journalist</option>
                  <option value="Reporter">Reporter</option>
                  <option value="Contributor">Contributor</option>
                  <option value="Staff">Staff</option>
                </select>

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
                  Showing <strong>{paginatedReporters.length}</strong> of <strong>{sortedReporters.length}</strong> reporters
                  {sortedReporters.length !== reporters.length && (
                    <span> (filtered from {reporters.length} total)</span>
                  )}
                </div>
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedReporters.length > 0 && (
              <div style={{ backgroundColor: '#fff', padding: '16px', borderRadius: '12px', marginBottom: '16px', boxShadow: '0 8px 20px rgba(2,6,23,0.06)', display: 'flex', gap: '12px', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', fontWeight: '600' }}>
                  {selectedReporters.length} reporter{selectedReporters.length !== 1 ? 's' : ''} selected
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
                    fontWeight: '500'
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
                    fontWeight: '500'
                  }}
                >
                  {bulkActionLoading ? 'Processing...' : 'Bulk Reject'}
                </button>
                <button
                  onClick={() => setSelectedReporters([])}
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
            )}

            {/* Reporters Table */}
            <div style={{ backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 8px 20px rgba(2,6,23,0.06)', overflow: 'hidden' }}>
              {/* Table Controls */}
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb', backgroundColor: '#f8fafc' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: theme.textPrimary }}>
                      Reporters
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

              <div style={{ overflowX: 'auto', maxHeight: paginatedReporters.length > 50 ? '600px' : 'auto', overflowY: paginatedReporters.length > 50 ? 'auto' : 'visible' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                      <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', fontSize: '12px', color: theme.textPrimary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        <input
                          type="checkbox"
                          checked={selectedReporters.length === paginatedReporters.length && paginatedReporters.length > 0}
                          onChange={(e) => handleSelectAll(e.target.checked)}
                          style={{ marginRight: '8px' }}
                        />
                        Select
                      </th>
                      <th
                        style={{ padding: '16px', textAlign: 'left', fontWeight: '700', fontSize: '12px', color: theme.textPrimary, textTransform: 'uppercase', letterSpacing: '0.5px', cursor: 'pointer' }}
                        onClick={() => handleSort('name')}
                      >
                        Reporter {getSortIcon('name')}
                      </th>
                      <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', fontSize: '12px', color: theme.textPrimary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Publication
                      </th>
                      <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', fontSize: '12px', color: theme.textPrimary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Department & Position
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
                    {paginatedReporters.length === 0 ? (
                      <tr>
                        <td colSpan="7" style={{ padding: '40px', textAlign: 'center', color: theme.textSecondary }}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                            <Icon name="user-group" size="lg" style={{ color: theme.textDisabled }} />
                            <div>No reporters found matching your criteria.</div>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      paginatedReporters.map((reporter, index) => (
                        <tr key={reporter.id} style={{ backgroundColor: index % 2 === 0 ? '#ffffff' : '#fafbfc', borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '16px' }}>
                            <input
                              type="checkbox"
                              checked={selectedReporters.includes(reporter.id)}
                              onChange={(e) => handleSelectReporter(reporter.id, e.target.checked)}
                            />
                          </td>
                          <td style={{ padding: '16px' }}>
                            <div style={{ fontSize: '14px', fontWeight: '600', color: theme.textPrimary, marginBottom: '4px' }}>
                              {reporter.name}
                            </div>
                            <div style={{ fontSize: '12px', color: theme.textSecondary }}>
                              {reporter.email}
                            </div>
                          </td>
                          <td style={{ padding: '16px' }}>
                            <div style={{ fontSize: '13px', color: theme.textPrimary, fontWeight: '500', marginBottom: '2px' }}>
                              {reporter.publication_name}
                            </div>
                            <div style={{ fontSize: '12px', color: theme.textSecondary }}>
                              {reporter.publication_location}
                            </div>
                          </td>
                          <td style={{ padding: '16px' }}>
                            <div style={{ fontSize: '13px', color: theme.textPrimary, fontWeight: '500', marginBottom: '2px' }}>
                              {reporter.function_department}
                            </div>
                            <div style={{ fontSize: '12px', color: theme.textSecondary }}>
                              {reporter.position}
                            </div>
                          </td>
                          <td style={{ padding: '16px' }}>
                            <div style={{ fontSize: '13px', color: theme.textPrimary }}>
                              {formatDate(reporter.created_at)}
                            </div>
                          </td>
                          <td style={{ padding: '16px', fontSize: '14px', color: theme.textPrimary }}>
                            <span style={{
                              padding: '4px 8px',
                              backgroundColor: reporter.status === 'approved' ? theme.success + '20' :
                                reporter.status === 'rejected' ? theme.danger + '20' :
                                  theme.warning + '20',
                              color: reporter.status === 'approved' ? theme.success :
                                reporter.status === 'rejected' ? theme.danger :
                                  theme.warning,
                              borderRadius: '12px',
                              fontSize: '11px',
                              fontWeight: '600'
                            }}>
                              {reporter.status.charAt(0).toUpperCase() + reporter.status.slice(1)}
                            </span>
                          </td>
                          <td style={{ padding: '16px' }}>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                              {reporter.status === 'pending' && (
                                <>
                                  <button
                                    onClick={() => handleApproveReporter(reporter.id)}
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
                                    title="Approve Reporter"
                                  >
                                    <Icon name="check" size="xs" style={{ color: '#fff' }} />
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => handleRejectReporter(reporter.id)}
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
                                    title="Reject Reporter"
                                  >
                                    <Icon name="x" size="xs" style={{ color: '#fff' }} />
                                    Reject
                                  </button>
                                </>
                              )}
                              <button
                                onClick={() => handleEditReporter(reporter)}
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
                                title="Edit Reporter"
                              >
                                <Icon name="pencil" size="xs" style={{ color: '#fff' }} />
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteReporter(reporter.id)}
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
                                title="Delete Reporter"
                              >
                                <Icon name="trash" size="xs" style={{ color: '#fff' }} />
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
              <div style={{ padding: '16px 20px', borderTop: '1px solid #e5e7eb', backgroundColor: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ fontSize: '14px', color: theme.textSecondary }}>
                  Showing {sortedReporters.length > 0 ? ((currentPage - 1) * pageSize) + 1 : 0}-{Math.min(currentPage * pageSize, sortedReporters.length)} of {sortedReporters.length} reporters
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    style={{
                      padding: '6px 10px',
                      backgroundColor: currentPage === 1 ? '#e5e7eb' : theme.primary,
                      color: currentPage === 1 ? theme.textSecondary : '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '12px',
                      cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                      fontWeight: '500'
                    }}
                  >
                    First
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: currentPage === 1 ? '#e5e7eb' : theme.primary,
                      color: currentPage === 1 ? theme.textSecondary : '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '14px',
                      cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                      fontWeight: '500'
                    }}
                  >
                    ← Previous
                  </button>

                  {/* Page numbers */}
                  {totalPages > 0 && Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        style={{
                          padding: '8px 12px',
                          backgroundColor: currentPage === pageNum ? theme.primaryDark : '#f8fafc',
                          color: currentPage === pageNum ? '#fff' : theme.textPrimary,
                          border: '1px solid #e5e7eb',
                          borderRadius: '6px',
                          fontSize: '14px',
                          cursor: 'pointer',
                          fontWeight: currentPage === pageNum ? '600' : '500',
                          minWidth: '40px'
                        }}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages || totalPages === 0}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: currentPage === totalPages || totalPages === 0 ? '#e5e7eb' : theme.primary,
                      color: currentPage === totalPages || totalPages === 0 ? theme.textSecondary : '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '14px',
                      cursor: currentPage === totalPages || totalPages === 0 ? 'not-allowed' : 'pointer',
                      fontWeight: '500'
                    }}
                  >
                    Next →
                  </button>
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages || totalPages === 0}
                    style={{
                      padding: '6px 10px',
                      backgroundColor: currentPage === totalPages || totalPages === 0 ? '#e5e7eb' : theme.primary,
                      color: currentPage === totalPages || totalPages === 0 ? theme.textSecondary : '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '12px',
                      cursor: currentPage === totalPages || totalPages === 0 ? 'not-allowed' : 'pointer',
                      fontWeight: '500'
                    }}
                  >
                    Last
                  </button>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Reporter Form Modal */}
      <ReporterFormModal
        isOpen={showFormModal}
        onClose={() => setShowFormModal(false)}
        reporter={editingReporter}
        onSave={handleFormSave}
      />
    </div>
  );
};

export default ReporterManagement;