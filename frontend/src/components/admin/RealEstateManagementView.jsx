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

const RealEstateManagementView = () => {
  const { admin, logout, hasRole, hasAnyRole, getRoleLevel } = useAdminAuth();

  // Check if user has permission to view real estate submissions
  if (!hasAnyRole(['super_admin', 'content_manager'])) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: theme.backgroundSoft }}>
        <div style={{ textAlign: 'center' }}>
          <Icon name="shield-exclamation" size="lg" style={{ color: theme.danger, marginBottom: '16px' }} />
          <h2 style={{ color: theme.textPrimary, marginBottom: '8px' }}>Access Denied</h2>
          <p style={{ color: theme.textSecondary }}>You don't have permission to view real estate submissions.</p>
          <p style={{ color: theme.textSecondary, fontSize: '14px', marginTop: '8px' }}>
            Required roles: Super Admin or Content Manager
          </p>
        </div>
      </div>
    );
  }

  const [realEstates, setRealEstates] = useState([]);
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
  const [selectedRealEstate, setSelectedRealEstate] = useState(null);
  const [selectedRealEstates, setSelectedRealEstates] = useState([]);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingRealEstate, setEditingRealEstate] = useState(null);


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
    paddingTop: '0.625rem',
    paddingBottom: '0.625rem',
    paddingLeft: '1rem',
    paddingRight: '1rem',
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
    fetchRealEstates();
  }, []);

  const fetchRealEstates = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: pageSize,
        ...(debouncedSearchTerm && { title: debouncedSearchTerm }),
        ...(statusFilter && { status: statusFilter }),
        ...(dateFromFilter && { date_from: dateFromFilter }),
        ...(dateToFilter && { date_to: dateToFilter })
      });

      const response = await api.get(`/real-estates/admin?${params}`);
      setRealEstates(response.data.realEstates || []);
    } catch (error) {
      console.error('Error fetching real estates:', error.response?.data || error.message || error);
      if (error.response?.status === 401) {
        // Token expired or invalid, redirect to login
        localStorage.removeItem('adminAccessToken');
        window.location.href = '/admin/login';
        return;
      }
      if (error.response?.status === 500) {
        alert('Server error. Please try again later.');
      } else {
        alert('Failed to load real estates. Please check your connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Filtered real estates based on search and filters
  const filteredRealEstates = useMemo(() => {
    let filtered = realEstates;

    if (debouncedSearchTerm) {
      filtered = filtered.filter(realEstate =>
        realEstate.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        (realEstate.location && realEstate.location.toLowerCase().includes(debouncedSearchTerm.toLowerCase())) ||
        (realEstate.property_type && realEstate.property_type.toLowerCase().includes(debouncedSearchTerm.toLowerCase()))
      );
    }

    if (statusFilter) {
      filtered = filtered.filter(realEstate => realEstate.status === statusFilter);
    }

    if (dateFromFilter) {
      filtered = filtered.filter(realEstate => new Date(realEstate.created_at) >= new Date(dateFromFilter));
    }

    if (dateToFilter) {
      filtered = filtered.filter(realEstate => new Date(realEstate.created_at) <= new Date(dateToFilter));
    }

    return filtered;
  }, [realEstates, debouncedSearchTerm, statusFilter, dateFromFilter, dateToFilter]);

  // Update filtered real estates when filters change
  useEffect(() => {
    setCurrentPage(1); // Reset to first page when filters change
  }, [debouncedSearchTerm, statusFilter, dateFromFilter, dateToFilter]);

  // Sorting logic
  const sortedRealEstates = useMemo(() => {
    return [...filteredRealEstates].sort((a, b) => {
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
  }, [filteredRealEstates, sortField, sortDirection]);

  // Pagination logic
  const paginatedRealEstates = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedRealEstates.slice(startIndex, startIndex + pageSize);
  }, [sortedRealEstates, currentPage, pageSize]);

  const totalPages = Math.ceil(sortedRealEstates.length / pageSize);

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

  const handleViewRealEstate = (realEstate) => {
    setSelectedRealEstate(realEstate);
  };

  const handleApproveRealEstate = async (realEstate) => {
    if (!confirm(`Are you sure you want to approve "${realEstate.title}"?`)) return;

    try {
      await api.put(`/real-estates/admin/${realEstate.id}/approve`);
      // Update local state
      setRealEstates(prev => prev.map(r => r.id === realEstate.id ? { ...r, status: 'approved', approved_at: new Date(), approved_by: admin?.adminId } : r));
      alert('Real estate approved successfully!');
    } catch (error) {
      console.error('Error approving real estate:', error);
      alert('Failed to approve real estate. Please try again.');
    }
  };

  const handleRejectRealEstate = async (realEstate) => {
    const reason = prompt('Please provide a rejection reason:');
    if (!reason || reason.trim().length === 0) return;

    try {
      await api.put(`/real-estates/admin/${realEstate.id}/reject`, { rejection_reason: reason.trim() });
      // Update local state
      setRealEstates(prev => prev.map(r => r.id === realEstate.id ? { ...r, status: 'rejected', rejected_at: new Date(), rejected_by: admin?.adminId, rejection_reason: reason.trim() } : r));
      alert('Real estate rejected successfully!');
    } catch (error) {
      console.error('Error rejecting real estate:', error);
      alert('Failed to reject real estate. Please try again.');
    }
  };

  const handleBulkApprove = async () => {
    if (selectedRealEstates.length === 0) {
      alert('Please select real estates to approve.');
      return;
    }

    if (!confirm(`Are you sure you want to approve ${selectedRealEstates.length} real estate(s)?`)) return;

    setBulkActionLoading(true);
    try {
      await api.put('/real-estates/bulk-approve', { ids: selectedRealEstates });
      // Update local state
      setRealEstates(prev => prev.map(r =>
        selectedRealEstates.includes(r.id) ? { ...r, status: 'approved', approved_at: new Date(), approved_by: admin?.adminId } : r
      ));
      setSelectedRealEstates([]);
      alert(`${selectedRealEstates.length} real estate(s) approved successfully!`);
    } catch (error) {
      console.error('Error bulk approving real estates:', error);
      alert('Failed to approve selected real estates. Please try again.');
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkReject = async () => {
    if (selectedRealEstates.length === 0) {
      alert('Please select real estates to reject.');
      return;
    }

    const reason = prompt('Please provide a rejection reason for all selected real estates:');
    if (!reason || reason.trim().length === 0) return;

    if (!confirm(`Are you sure you want to reject ${selectedRealEstates.length} real estate(s)?`)) return;

    setBulkActionLoading(true);
    try {
      await api.put('/real-estates/bulk-reject', { ids: selectedRealEstates, rejection_reason: reason.trim() });
      // Update local state
      setRealEstates(prev => prev.map(r =>
        selectedRealEstates.includes(r.id) ? { ...r, status: 'rejected', rejected_at: new Date(), rejected_by: admin?.adminId, rejection_reason: reason.trim() } : r
      ));
      setSelectedRealEstates([]);
      alert(`${selectedRealEstates.length} real estate(s) rejected successfully!`);
    } catch (error) {
      console.error('Error bulk rejecting real estates:', error);
      alert('Failed to reject selected real estates. Please try again.');
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleSelectRealEstate = (realEstateId) => {
    setSelectedRealEstates(prev =>
      prev.includes(realEstateId)
        ? prev.filter(id => id !== realEstateId)
        : [...prev, realEstateId]
    );
  };

  const handleSelectAll = () => {
    if (selectedRealEstates.length === paginatedRealEstates.length) {
      setSelectedRealEstates([]);
    } else {
      setSelectedRealEstates(paginatedRealEstates.map(r => r.id));
    }
  };

  const handleEditRealEstate = async (realEstate) => {
    try {
      // Fetch the full real estate details including images
      const response = await api.get(`/real-estates/admin/${realEstate.id}`);
      setEditingRealEstate(response.data.realEstate);
      setShowCreateModal(true);
    } catch (error) {
      console.error('Error fetching real estate for edit:', error);
      alert('Failed to load real estate details for editing.');
    }
  };

  const handleDeleteRealEstate = async (realEstate) => {
    if (!confirm(`Are you sure you want to permanently delete "${realEstate.title}"? This action cannot be undone.`)) return;

    try {
      await api.delete(`/real-estates/admin/${realEstate.id}`);
      setRealEstates(prev => prev.filter(r => r.id !== realEstate.id));
      alert('Real estate deleted successfully!');
    } catch (error) {
      console.error('Error deleting real estate:', error);
      alert('Failed to delete real estate. Please try again.');
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

  const getRealEstateStats = () => {
    const total = realEstates.length;
    const pending = realEstates.filter(r => r.status === 'pending').length;
    const approved = realEstates.filter(r => r.status === 'approved').length;
    const rejected = realEstates.filter(r => r.status === 'rejected').length;

    return { total, pending, approved, rejected };
  };

  const stats = getRealEstateStats();

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
              paddingTop: '20px',
              paddingBottom: '20px',
              paddingLeft: '20px',
              paddingRight: '20px',
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
              <div style={{ background: '#fff', borderRadius: 12, paddingTop: '28px', paddingBottom: '28px', paddingLeft: '28px', paddingRight: '28px', marginBottom: 24, border: `4px solid #000` }}>
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
                    <Icon name="home" size="sm" style={{ color: '#1976D2' }} />
                  </div>
                  <h1 style={{ margin: 0, fontSize: 34, fontWeight: 800 }}>Real Estate Management</h1>
                </div>
                <p style={{ marginTop: 8, color: '#757575' }}>View and manage real estate listings</p>
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
                Create Listing
              </button>
            </div>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
              {[
                { label: 'Total Listings', value: stats.total, icon: 'home', bg: '#e6f0ff' },
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
            {selectedRealEstates.length > 0 && (
              <div style={{ backgroundColor: '#fff', padding: '16px', borderRadius: '12px', marginBottom: '16px', boxShadow: '0 8px 20px rgba(2,6,23,0.06)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: theme.textPrimary }}>
                    {selectedRealEstates.length} real estate(s) selected
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
                    onClick={() => setSelectedRealEstates([])}
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
                    placeholder="Search real estates by title, location, type..."
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
                  Showing <strong>{paginatedRealEstates.length}</strong> of <strong>{sortedRealEstates.length}</strong> real estates
                  {sortedRealEstates.length !== realEstates.length && (
                    <span> (filtered from {realEstates.length} total)</span>
                  )}
                </div>
              </div>
            </div>

            {/* Real Estates Table */}
            <div style={{ backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 8px 20px rgba(2,6,23,0.06)', overflow: 'hidden' }}>
              {/* Table Controls */}
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb', backgroundColor: '#f8fafc' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: theme.textPrimary }}>
                      Real Estate Listings
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

              <div style={{ overflowX: 'auto', maxHeight: paginatedRealEstates.length > 50 ? '600px' : 'auto', overflowY: paginatedRealEstates.length > 50 ? 'auto' : 'visible' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                      <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', fontSize: '12px', color: theme.textPrimary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        <input
                          type="checkbox"
                          checked={selectedRealEstates.length === paginatedRealEstates.length && paginatedRealEstates.length > 0}
                          onChange={handleSelectAll}
                          style={{ marginRight: '8px' }}
                        />
                        Property
                      </th>
                      <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', fontSize: '12px', color: theme.textPrimary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Location
                      </th>
                      <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', fontSize: '12px', color: theme.textPrimary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Price
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
                    {paginatedRealEstates.length === 0 ? (
                      <tr>
                        <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: theme.textSecondary }}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                            <Icon name="home" size="lg" style={{ color: theme.textDisabled }} />
                            <div>No real estates found matching your criteria.</div>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      paginatedRealEstates.map((realEstate, index) => (
                        <tr key={realEstate.id} style={{ backgroundColor: index % 2 === 0 ? '#ffffff' : '#fafbfc', borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <input
                                type="checkbox"
                                checked={selectedRealEstates.includes(realEstate.id)}
                                onChange={() => handleSelectRealEstate(realEstate.id)}
                              />
                              <div>
                                <div style={{ fontSize: '14px', fontWeight: '600', color: theme.textPrimary, marginBottom: '4px' }}>
                                  {realEstate.title}
                                </div>
                                <div style={{ fontSize: '12px', color: theme.textSecondary }}>
                                  {realEstate.property_type || 'Type not specified'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '16px' }}>
                            <div style={{ fontSize: '14px', fontWeight: '500', color: theme.textPrimary }}>
                              {realEstate.location || 'Not specified'}
                            </div>
                          </td>
                          <td style={{ padding: '16px' }}>
                            <div style={{ fontSize: '13px', color: theme.textPrimary, fontWeight: '500' }}>
                              {realEstate.price ? `$${realEstate.price.toLocaleString()}` : 'Not specified'}
                            </div>
                          </td>
                          <td style={{ padding: '16px' }}>
                            <div style={{ fontSize: '13px', color: theme.textPrimary }}>
                              {formatDate(realEstate.created_at)}
                            </div>
                          </td>
                          <td style={{ padding: '16px', fontSize: '14px', color: theme.textPrimary }}>
                            <span style={{
                              padding: '4px 8px',
                              backgroundColor: realEstate.status === 'approved' ? theme.success + '20' : realEstate.status === 'rejected' ? theme.danger + '20' : theme.warning + '20',
                              color: realEstate.status === 'approved' ? theme.success : realEstate.status === 'rejected' ? theme.danger : theme.warning,
                              borderRadius: '12px',
                              fontSize: '11px',
                              fontWeight: '600'
                            }}>
                              {realEstate.status.charAt(0).toUpperCase() + realEstate.status.slice(1)}
                            </span>
                          </td>
                          <td style={{ padding: '16px' }}>
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                              <button
                                onClick={() => handleViewRealEstate(realEstate)}
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
                                title="View Real Estate Details"
                              >
                                <Icon name="eye" size="xs" style={{ color: '#fff' }} />
                                View
                              </button>
                              <button
                                onClick={() => handleEditRealEstate(realEstate)}
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
                                title="Edit Real Estate"
                              >
                                <Icon name="pencil" size="xs" style={{ color: '#fff' }} />
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteRealEstate(realEstate)}
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
                                title="Delete Real Estate"
                              >
                                <Icon name="trash" size="xs" style={{ color: '#fff' }} />
                                Delete
                              </button>
                              {realEstate.status === 'pending' && (
                                <>
                                  <button
                                    onClick={() => handleApproveRealEstate(realEstate)}
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
                                    title="Approve Real Estate"
                                  >
                                    <Icon name="check" size="xs" style={{ color: '#fff' }} />
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => handleRejectRealEstate(realEstate)}
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
                                    title="Reject Real Estate"
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

      {/* Real Estate Detail Modal */}
      {selectedRealEstate && (
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
        }} onClick={() => setSelectedRealEstate(null)}>
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
                Real Estate Details
              </h2>
              <button onClick={() => setSelectedRealEstate(null)} style={{ background: 'transparent', border: 'none', fontSize: '24px', cursor: 'pointer' }}>
                ×
              </button>
            </div>

            <div style={{ display: 'grid', gap: '16px' }}>
              {/* Basic Information */}
              <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px' }}>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', fontWeight: '700', color: theme.textPrimary }}>Basic Information</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                  <div><strong>Title:</strong> {selectedRealEstate.title}</div>
                  <div><strong>Location:</strong> {selectedRealEstate.location || 'Not specified'}</div>
                  <div><strong>Property Type:</strong> {selectedRealEstate.property_type || 'Not specified'}</div>
                  <div><strong>Price:</strong> {selectedRealEstate.price ? `$${selectedRealEstate.price.toLocaleString()}` : 'Not specified'}</div>
                  <div><strong>Bedrooms:</strong> {selectedRealEstate.bedrooms || 'Not specified'}</div>
                  <div><strong>Bathrooms:</strong> {selectedRealEstate.bathrooms || 'Not specified'}</div>
                  <div><strong>Area:</strong> {selectedRealEstate.area_sqft ? `${selectedRealEstate.area_sqft} sq ft` : 'Not specified'}</div>
                </div>
              </div>

              {/* Description */}
              <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px' }}>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', fontWeight: '700', color: theme.textPrimary }}>Description</h3>
                <div>{selectedRealEstate.description || 'No description provided'}</div>
              </div>

              {/* Status Information */}
              <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px' }}>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', fontWeight: '700', color: theme.textPrimary }}>Status Information</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                  <div><strong>Status:</strong> <span style={{
                    padding: '4px 8px',
                    backgroundColor: selectedRealEstate.status === 'approved' ? theme.success + '20' : selectedRealEstate.status === 'rejected' ? theme.danger + '20' : theme.warning + '20',
                    color: selectedRealEstate.status === 'approved' ? theme.success : selectedRealEstate.status === 'rejected' ? theme.danger : theme.warning,
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: '600'
                  }}>{selectedRealEstate.status.charAt(0).toUpperCase() + selectedRealEstate.status.slice(1)}</span></div>
                  <div><strong>Submitted:</strong> {formatDate(selectedRealEstate.created_at)}</div>
                  <div><strong>Last Updated:</strong> {formatDate(selectedRealEstate.updated_at)}</div>
                  {selectedRealEstate.approved_at && <div><strong>Approved:</strong> {formatDate(selectedRealEstate.approved_at)}</div>}
                  {selectedRealEstate.rejected_at && <div><strong>Rejected:</strong> {formatDate(selectedRealEstate.rejected_at)}</div>}
                  {selectedRealEstate.rejection_reason && (
                    <div style={{ gridColumn: '1 / -1' }}>
                      <strong>Rejection Reason:</strong>
                      <div style={{ backgroundColor: '#fee2e2', padding: '8px', borderRadius: '4px', marginTop: '4px', color: theme.danger }}>
                        {selectedRealEstate.rejection_reason}
                      </div>
                    </div>
                  )}
                  {selectedRealEstate.admin_comments && (
                    <div style={{ gridColumn: '1 / -1' }}>
                      <strong>Admin Comments:</strong>
                      <div style={{ backgroundColor: '#e0f2fe', padding: '8px', borderRadius: '4px', marginTop: '4px', color: theme.info }}>
                        {selectedRealEstate.admin_comments}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px' }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                {selectedRealEstate.status === 'pending' && (
                  <>
                    <button
                      onClick={() => {
                        setSelectedRealEstate(null);
                        handleApproveRealEstate(selectedRealEstate);
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
                      Approve Listing
                    </button>
                    <button
                      onClick={() => {
                        setSelectedRealEstate(null);
                        handleRejectRealEstate(selectedRealEstate);
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
                      Reject Listing
                    </button>
                  </>
                )}
              </div>
              <button
                onClick={() => setSelectedRealEstate(null)}
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

      {/* Create/Edit Real Estate Modal */}
      {showCreateModal && (
        <RealEstateFormModal
          realEstate={editingRealEstate}
          onClose={() => {
            setShowCreateModal(false);
            setEditingRealEstate(null);
          }}
          onSuccess={(newRealEstate) => {
            if (editingRealEstate) {
              // Update existing real estate
              setRealEstates(prev => prev.map(r => r.id === newRealEstate.id ? newRealEstate : r));
            } else {
              // Add new real estate
              setRealEstates(prev => [newRealEstate, ...prev]);
            }
            setShowCreateModal(false);
            setEditingRealEstate(null);
          }}
        />
      )}
    </div>
  );
};

// Real Estate Form Modal Component
const RealEstateFormModal = ({ realEstate, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: realEstate?.title || '',
    description: realEstate?.description || '',
    price: realEstate?.price || '',
    location: realEstate?.location || '',
    property_type: realEstate?.property_type || '',
    bedrooms: realEstate?.bedrooms || '',
    bathrooms: realEstate?.bathrooms || '',
    area_sqft: realEstate?.area_sqft || '',
    status: realEstate?.status || 'approved' // Default to approved for admin-created listings
  });

  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState(realEstate?.images || []);
  const [imagesToDelete, setImagesToDelete] = useState([]);
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
    setImages(Array.from(e.target.files));
  };

  const handleRemoveExistingImage = (imageName) => {
    setExistingImages(prev => prev.filter(img => img !== imageName));
    setImagesToDelete(prev => [...prev, imageName]);
  };

  const handleRemoveNewImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
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
      images.forEach(image => {
        submitData.append('images', image);
      });

      // Add images to delete
      imagesToDelete.forEach(imageName => {
        submitData.append('imagesToDelete', imageName);
      });

      let response;
      if (realEstate) {
        // Update existing
        response = await api.put(`/real-estates/admin/${realEstate.id}`, submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        // Create new
        response = await api.post('/real-estates/admin', submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      onSuccess(response.data.realEstate || response.data);
    } catch (error) {
      console.error('Error saving real estate:', error);
      alert('Failed to save real estate. Please try again.');
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
      paddingTop: '20px',
      paddingBottom: '20px',
      paddingLeft: '20px',
      paddingRight: '20px'
    }} onClick={onClose}>
      <div style={{
        background: '#fff',
        borderRadius: '12px',
        paddingTop: '24px',
        paddingBottom: '24px',
        paddingLeft: '24px',
        paddingRight: '24px',
        maxWidth: '800px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
        margin: 'auto'
      }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '800' }}>
            {realEstate ? 'Edit Real Estate' : 'Create New Real Estate Listing'}
          </h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', fontSize: '24px', cursor: 'pointer' }}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.textPrimary, marginBottom: '6px' }}>
                Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: `1px solid ${errors.title ? '#f44336' : theme.borderLight}`,
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
                required
              />
              {errors.title && <div style={{ color: '#f44336', fontSize: '12px', marginTop: '4px' }}>{errors.title}</div>}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.textPrimary, marginBottom: '6px' }}>
                Location
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
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
                Property Type
              </label>
              <input
                type="text"
                name="property_type"
                value={formData.property_type}
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
                Price
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
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
                Bedrooms
              </label>
              <input
                type="number"
                name="bedrooms"
                value={formData.bedrooms}
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
                Bathrooms
              </label>
              <input
                type="number"
                name="bathrooms"
                value={formData.bathrooms}
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
                Area (sq ft)
              </label>
              <input
                type="number"
                name="area_sqft"
                value={formData.area_sqft}
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
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="4"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: `1px solid ${errors.description ? '#f44336' : theme.borderLight}`,
                  borderRadius: '8px',
                  fontSize: '14px',
                  resize: 'vertical'
                }}
                required
              />
              {errors.description && <div style={{ color: '#f44336', fontSize: '12px', marginTop: '4px' }}>{errors.description}</div>}
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

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.textPrimary, marginBottom: '6px' }}>
                Images
              </label>

              {/* Existing Images */}
              {existingImages.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '600', color: theme.textPrimary, marginBottom: '8px' }}>
                    Current Images ({existingImages.length})
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '12px' }}>
                    {existingImages.map((imageName, index) => (
                      <div key={index} style={{ position: 'relative' }}>
                        <img
                          src={`/api/uploads/real-estates/${imageName}`}
                          alt={`Existing ${index + 1}`}
                          style={{
                            width: '100%',
                            height: '100px',
                            objectFit: 'cover',
                            borderRadius: '8px',
                            border: `1px solid ${theme.borderLight}`
                          }}
                          onError={(e) => {
                            console.error('Image failed to load:', `/api/uploads/real-estates/${imageName}`);
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                          onLoad={() => {
                            console.log('Image loaded successfully:', `/api/uploads/real-estates/${imageName}`);
                          }}
                        />
                        <div
                          style={{
                            display: 'none',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: '#f5f5f5',
                            borderRadius: '8px',
                            border: `1px solid ${theme.borderLight}`,
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#666',
                            fontSize: '12px',
                            textAlign: 'center',
                            padding: '8px'
                          }}
                        >
                          Image not found<br/>
                          <small>{imageName}</small>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveExistingImage(imageName)}
                          style={{
                            position: 'absolute',
                            top: '4px',
                            right: '4px',
                            backgroundColor: '#f44336',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '50%',
                            width: '24px',
                            height: '24px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '12px'
                          }}
                          title="Remove image"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* New Images Preview */}
              {images.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '600', color: theme.textPrimary, marginBottom: '8px' }}>
                    New Images ({images.length})
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '12px' }}>
                    {images.map((image, index) => (
                      <div key={index} style={{ position: 'relative' }}>
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`New ${index + 1}`}
                          style={{
                            width: '100%',
                            height: '100px',
                            objectFit: 'cover',
                            borderRadius: '8px',
                            border: `1px solid ${theme.borderLight}`
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveNewImage(index)}
                          style={{
                            position: 'absolute',
                            top: '4px',
                            right: '4px',
                            backgroundColor: '#f44336',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '50%',
                            width: '24px',
                            height: '24px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '12px'
                          }}
                          title="Remove image"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* File Input */}
              <input
                type="file"
                multiple
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
              <small style={{ color: theme.textSecondary, fontSize: '12px', marginTop: '4px', display: 'block' }}>
                You can upload multiple images. Supported formats: JPG, PNG, GIF
              </small>
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
              {loading ? 'Saving...' : (realEstate ? 'Update Listing' : 'Create Listing')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RealEstateManagementView;