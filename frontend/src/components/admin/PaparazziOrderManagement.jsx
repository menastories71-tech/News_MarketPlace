import React, { useState, useEffect, useMemo, useCallback } from 'react';
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

const PaparazziOrderManagement = () => {
  const { admin, logout, hasRole, hasAnyRole } = useAdminAuth();

  // Check if user has permission to manage orders
  if (!hasAnyRole(['super_admin', 'content_manager'])) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: theme.backgroundSoft }}>
        <div style={{ textAlign: 'center' }}>
          <Icon name="shield-exclamation" size="lg" style={{ color: theme.danger, marginBottom: '16px' }} />
          <h2 style={{ color: theme.textPrimary, marginBottom: '8px' }}>Access Denied</h2>
          <p style={{ color: theme.textSecondary }}>You don't have permission to access paparazzi order management.</p>
          <p style={{ color: theme.textSecondary, fontSize: '14px', marginTop: '8px' }}>
            Required roles: Super Admin or Content Manager
          </p>
        </div>
      </div>
    );
  }

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [sortField, setSortField] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

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

  const statusOptions = [
    { value: 'pending', label: 'Pending', color: theme.warning },
    { value: 'accepted', label: 'Accepted', color: theme.success },
    { value: 'rejected', label: 'Rejected', color: theme.danger },
    { value: 'completed', label: 'Completed', color: theme.info }
  ];

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    onResize();
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
    const fetchData = async () => {
      try {
        await fetchOrders();
      } catch (error) {
        console.error('Error fetching data:', error);
        // If unauthorized, the API interceptor will handle redirect
      }
    };

    fetchData();
  }, []);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: pageSize.toString()
      });

      if (debouncedSearchTerm && debouncedSearchTerm.trim()) {
        params.append('search', debouncedSearchTerm.trim());
      }

      if (statusFilter) {
        params.append('status', statusFilter);
      }

      console.log('Fetching orders with params:', params.toString());

      const response = await api.get(`/paparazzi-orders?${params}`);
      console.log('Orders response:', response.data);

      const data = response.data;

      if (data.success === false) {
        throw new Error(data.message || 'Failed to fetch orders');
      }

      setOrders(data.orders || []);
      setTotalCount(data.pagination?.total || 0);
      setTotalPages(data.pagination?.pages || 1);
    } catch (error) {
      console.error('Error fetching paparazzi orders:', error);

      if (error.response?.status === 401) {
        // Token expired or invalid, redirect to login
        localStorage.removeItem('adminAccessToken');
        window.location.href = '/admin/login';
        return;
      }

      // Set empty state on error
      setOrders([]);
      setTotalCount(0);
      setTotalPages(1);

      // Show user-friendly error message
      const errorMessage = error.response?.data?.message || error.message || 'Failed to load orders';
      console.error('Fetch orders error:', errorMessage);

      // You might want to show a toast notification instead of alert
      // For now, we'll just log the error and show empty state
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, debouncedSearchTerm, statusFilter]);

  // Add formatDate helper function
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, statusFilter]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch data when filters change
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);


  const handleDownloadCSV = async () => {
    try {
      const params = new URLSearchParams();
      if (debouncedSearchTerm) params.append('search', debouncedSearchTerm);
      if (statusFilter) params.append('status', statusFilter);

      const response = await api.get(`/paparazzi-orders/export-csv?${params.toString()}`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'paparazzi_orders.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading CSV:', error);
      alert('Failed to download CSV');
    }
  };


  const handleAcceptOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to accept this paparazzi order?')) return;

    try {
      await api.put(`/paparazzi-orders/${orderId}/accept`);
      fetchOrders();
    } catch (error) {
      console.error('Error accepting paparazzi order:', error);
      alert('Error accepting paparazzi order. Please try again.');
    }
  };

  const handleRejectOrder = async (orderId) => {
    const reason = prompt('Please provide a reason for rejecting this order:');
    if (!reason) return;

    try {
      await api.put(`/paparazzi-orders/${orderId}/reject`, { admin_notes: reason });
      fetchOrders();
    } catch (error) {
      console.error('Error rejecting paparazzi order:', error);
      alert('Error rejecting paparazzi order. Please try again.');
    }
  };

  const handleCompleteOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to mark this paparazzi order as completed?')) return;

    try {
      await api.put(`/paparazzi-orders/${orderId}/complete`);
      fetchOrders();
    } catch (error) {
      console.error('Error completing paparazzi order:', error);
      alert('Error completing paparazzi order. Please try again.');
    }
  };

  const getStatusStyle = (status) => {
    const statusColors = {
      pending: { bg: `${theme.warning}20`, color: theme.warning },
      accepted: { bg: `${theme.success}20`, color: theme.success },
      rejected: { bg: `${theme.danger}20`, color: theme.danger },
      completed: { bg: `${theme.info}20`, color: theme.info }
    };

    const colors = statusColors[status] || { bg: '#BDBDBD20', color: '#BDBDBD' };

    return {
      backgroundColor: colors.bg,
      color: colors.color,
      padding: '0.25rem 0.75rem',
      borderRadius: '9999px',
      fontSize: '0.75rem',
      fontWeight: 600,
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.25rem'
    };
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
                      <div style={{ display: 'grid', gridTemplateColumns: '50px 2fr 1fr 1fr 1fr 1fr', gap: '16px', alignItems: 'center' }}>
                        <div style={{ width: '20px', height: '20px', background: '#f3f4f6', borderRadius: '50%' }}></div>
                        <div>
                          <div style={{ height: '14px', background: '#f3f4f6', borderRadius: 4, width: '120px', marginBottom: '4px' }}></div>
                          <div style={{ height: '12px', background: '#f3f4f6', borderRadius: 4, width: '80px' }}></div>
                        </div>
                        <div style={{ height: '14px', background: '#f3f4f6', borderRadius: 4, width: '60px' }}></div>
                        <div style={{ height: '14px', background: '#f3f4f6', borderRadius: 4, width: '80px' }}></div>
                        <div style={{ height: '14px', background: '#f3f4f6', borderRadius: 4, width: '70px' }}></div>
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
              <button aria-label="Toggle theme" style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={theme.text} strokeWidth="2"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" /></svg>
              </button>

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
                    <Icon name="camera" size="sm" style={{ color: theme.primary }} />
                  </div>
                  <h1 style={{ margin: 0, fontSize: 34, fontWeight: 800 }}>Paparazzi Order Management</h1>
                </div>
                <p style={{ marginTop: 8, color: '#757575' }}>Manage paparazzi call booking orders</p>
              </div>
              <button
                onClick={handleDownloadCSV}
                style={{
                  backgroundColor: theme.success,
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
                  boxShadow: '0 4px 14px rgba(76, 175, 80, 0.3)'
                }}
              >
                <Icon name="arrow-down-tray" size="sm" style={{ color: '#fff' }} />
                Download CSV
              </button>
            </div>

            {/* Search and Filters Bar */}
            <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', marginBottom: '16px', boxShadow: '0 8px 20px rgba(2,6,23,0.06)' }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '300px' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={theme.textSecondary} strokeWidth="2" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}>
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.35-4.35"></path>
                  </svg>
                  <input
                    type="text"
                    placeholder="Search orders by paparazzi name, customer name, or email..."
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

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{ padding: '12px', border: '2px solid #e0e0e0', borderRadius: '8px', fontSize: '14px', minWidth: '120px' }}
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              {/* Search Results Summary */}
              <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div style={{ fontSize: '14px', color: theme.textSecondary }}>
                  {debouncedSearchTerm || statusFilter ? (
                    <>
                      <span style={{ color: theme.primary, fontWeight: '600' }}>Filtered:</span> Found <strong>{totalCount}</strong> orders
                    </>
                  ) : (
                    <>
                      Showing <strong>{orders.length}</strong> of <strong>{totalCount}</strong> orders
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Orders Table */}
            <div style={{ backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 8px 20px rgba(2,6,23,0.06)', overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto', maxHeight: orders.length > 50 ? '600px' : 'auto', overflowY: orders.length > 50 ? 'auto' : 'visible' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                      <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', fontSize: '12px', color: theme.textPrimary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Order ID
                      </th>
                      <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', fontSize: '12px', color: theme.textPrimary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Paparazzi
                      </th>
                      <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', fontSize: '12px', color: theme.textPrimary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Customer
                      </th>
                      <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', fontSize: '12px', color: theme.textPrimary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Price
                      </th>
                      <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', fontSize: '12px', color: theme.textPrimary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Status
                      </th>
                      <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', fontSize: '12px', color: theme.textPrimary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Date
                      </th>
                      <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', fontSize: '12px', color: theme.textPrimary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.length === 0 ? (
                      <tr>
                        <td colSpan="7" style={{ padding: '80px', textAlign: 'center', color: theme.textSecondary }}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                            <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: theme.backgroundSoft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Icon name="clipboard-document-list" size="lg" style={{ color: theme.textDisabled }} />
                            </div>
                            <div>
                              <div style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>
                                {debouncedSearchTerm || statusFilter ? 'No orders found' : 'No paparazzi orders available'}
                              </div>
                              <div style={{ fontSize: '16px' }}>
                                {debouncedSearchTerm || statusFilter ? (
                                  <>
                                    No orders match your search criteria.
                                    <br />
                                    Try different keywords or adjust your filters.
                                  </>
                                ) : (
                                  'Orders will appear here when users book paparazzi calls.'
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      orders.map((order, index) => (
                        <tr key={order.id} style={{
                          borderBottom: '1px solid #f1f5f9',
                          backgroundColor: index % 2 === 0 ? '#ffffff' : '#fafbfc',
                          transition: 'all 0.2s'
                        }}
                          onMouseEnter={(e) => {
                            e.target.closest('tr').style.backgroundColor = '#f1f5f9';
                          }}
                          onMouseLeave={(e) => {
                            e.target.closest('tr').style.backgroundColor = index % 2 === 0 ? '#ffffff' : '#fafbfc';
                          }}
                        >
                          <td style={{ padding: '16px', fontSize: '14px', color: theme.textPrimary }}>
                            #{order.id}
                          </td>
                          <td style={{ padding: '16px' }}>
                            <div style={{ fontSize: '14px', fontWeight: '600', color: theme.textPrimary, marginBottom: '4px' }}>
                              {order.paparazzi_name}
                            </div>
                          </td>
                          <td style={{ padding: '16px' }}>
                            <div style={{ fontSize: '14px', fontWeight: '600', color: theme.textPrimary, marginBottom: '4px' }}>
                              {order.customer_name}
                            </div>
                            <div style={{ fontSize: '12px', color: theme.textSecondary }}>
                              {order.customer_email}
                            </div>
                          </td>
                          <td style={{ padding: '16px', fontSize: '14px', color: theme.textPrimary }}>
                            ${order.price}
                          </td>
                          <td style={{ padding: '16px' }}>
                            <span style={getStatusStyle(order.status)}>
                              {statusOptions.find(opt => opt.value === order.status)?.label || order.status}
                            </span>
                          </td>
                          <td style={{ padding: '16px', fontSize: '14px', color: theme.textPrimary }}>
                            {formatDate(order.created_at)}
                          </td>
                          <td style={{ padding: '16px' }}>
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                              {order.status === 'pending' && (
                                <>
                                  <button
                                    onClick={() => handleAcceptOrder(order.id)}
                                    style={{
                                      padding: '6px 10px',
                                      backgroundColor: theme.success,
                                      color: '#fff',
                                      border: 'none',
                                      borderRadius: '4px',
                                      fontSize: '12px',
                                      cursor: 'pointer',
                                      fontWeight: '600',
                                      transition: 'background-color 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.target.style.backgroundColor = '#388e3c'}
                                    onMouseLeave={(e) => e.target.style.backgroundColor = theme.success}
                                  >
                                    <Icon name="check" size="xs" style={{ color: '#fff', marginRight: '4px' }} />
                                    Accept
                                  </button>
                                  <button
                                    onClick={() => handleRejectOrder(order.id)}
                                    style={{
                                      padding: '6px 10px',
                                      backgroundColor: theme.danger,
                                      color: '#fff',
                                      border: 'none',
                                      borderRadius: '4px',
                                      fontSize: '12px',
                                      cursor: 'pointer',
                                      fontWeight: '600',
                                      transition: 'background-color 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.target.style.backgroundColor = '#b91c1c'}
                                    onMouseLeave={(e) => e.target.style.backgroundColor = theme.danger}
                                  >
                                    <Icon name="x-mark" size="xs" style={{ color: '#fff', marginRight: '4px' }} />
                                    Reject
                                  </button>
                                </>
                              )}
                              {order.status === 'accepted' && (
                                <button
                                  onClick={() => handleCompleteOrder(order.id)}
                                  style={{
                                    padding: '6px 10px',
                                    backgroundColor: theme.info,
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '4px',
                                    fontSize: '12px',
                                    cursor: 'pointer',
                                    fontWeight: '600',
                                    transition: 'background-color 0.2s'
                                  }}
                                  onMouseEnter={(e) => e.target.style.backgroundColor = '#7c3aed'}
                                  onMouseLeave={(e) => e.target.style.backgroundColor = theme.info}
                                >
                                  <Icon name="check-circle" size="xs" style={{ color: '#fff', marginRight: '4px' }} />
                                  Complete
                                </button>
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
                <div style={{ padding: '16px 20px', borderTop: '1px solid #e5e7eb', backgroundColor: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '14px', color: theme.textSecondary }}>
                    Page {currentPage} of {totalPages} ({totalCount} total orders)
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
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
                        cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                      }}
                    >
                      ← Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      style={{
                        padding: '8px 12px',
                        backgroundColor: currentPage === totalPages ? '#e5e7eb' : theme.primary,
                        color: currentPage === totalPages ? theme.textSecondary : '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '14px',
                        cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
                      }}
                    >
                      Next →
                    </button>
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default PaparazziOrderManagement;
