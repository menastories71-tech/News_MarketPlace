import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import Icon from '../../components/common/Icon';
import Sidebar from '../../components/admin/Sidebar';
import api from '../../services/api';

// Order Detail Modal Component
const OrderDetailModal = ({ isOpen, onClose, order, onStatusUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(order?.status || 'pending');
  const [adminNotes, setAdminNotes] = useState(order?.admin_notes || '');

  useEffect(() => {
    if (order) {
      setStatus(order.status || 'pending');
      setAdminNotes(order.admin_notes || '');
    }
  }, [order]);

  const handleStatusUpdate = async (newStatus) => {
    setLoading(true);
    try {
      await api.put(`/admin/press-pack-orders/${order.id}`, {
        status: newStatus,
        admin_notes: adminNotes
      });
      
      onStatusUpdate();
      onClose();
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Error updating order status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !order) return null;

  const modalStyle = {
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
  };

  const contentStyle = {
    background: '#fff',
    borderRadius: '12px',
    padding: '24px',
    maxWidth: '800px',
    width: '100%',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
  };

  const labelStyle = {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: '#212121',
    marginBottom: '6px'
  };

  const valueStyle = {
    fontSize: '14px',
    color: '#757575',
    marginBottom: '16px'
  };

  const buttonStyle = {
    padding: '10px 20px',
    borderRadius: '8px',
    fontWeight: '600',
    cursor: 'pointer',
    border: 'none',
    marginRight: '12px'
  };

  return (
    <div style={modalStyle} onClick={onClose}>
      <div style={contentStyle} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '800' }}>
            Order Details
          </h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', fontSize: '24px', cursor: 'pointer' }}>
            ×
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#212121' }}>
              Customer Information
            </h3>
            
            <div style={{ marginBottom: '12px' }}>
              <label style={labelStyle}>Name</label>
              <div style={valueStyle}>{order.name}</div>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={labelStyle}>Email</label>
              <div style={valueStyle}>{order.email}</div>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={labelStyle}>WhatsApp Number</label>
              <div style={valueStyle}>{order.whatsapp_country_code} {order.whatsapp_number}</div>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={labelStyle}>Calling Number</label>
              <div style={valueStyle}>{order.calling_country_code} {order.calling_number}</div>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={labelStyle}>Company/Project Type</label>
              <div style={valueStyle}>{order.company_project_type}</div>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={labelStyle}>Submitted By</label>
              <div style={valueStyle}>{order.submitted_by}</div>
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#212121' }}>
              Order Information
            </h3>

            <div style={{ marginBottom: '12px' }}>
              <label style={labelStyle}>Selected Press Release</label>
              <div style={valueStyle}>{order.press_release_name}</div>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={labelStyle}>Package Selection</label>
              <div style={valueStyle}>{order.press_release_package}</div>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={labelStyle}>Content Writing Assistance</label>
              <div style={valueStyle}>{order.content_writing_assistance}</div>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={labelStyle}>Order Date</label>
              <div style={valueStyle}>{new Date(order.created_at).toLocaleString()}</div>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={labelStyle}>Status</label>
              <div style={{ 
                display: 'inline-block', 
                padding: '4px 12px', 
                borderRadius: '20px', 
                fontSize: '12px', 
                fontWeight: '600',
                backgroundColor: status === 'approved' ? '#dcfce7' : 
                                status === 'rejected' ? '#fee2e2' : '#fef3c7',
                color: status === 'approved' ? '#166534' : 
                       status === 'rejected' ? '#991b1b' : '#92400e'
              }}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </div>
            </div>
          </div>
        </div>

        {order.message && (
          <div style={{ marginTop: '24px' }}>
            <label style={labelStyle}>Message</label>
            <div style={{
              backgroundColor: '#f9fafb',
              padding: '16px',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              fontSize: '14px',
              color: '#374151',
              whiteSpace: 'pre-wrap'
            }}>
              {order.message}
            </div>
          </div>
        )}

        {/* Admin Notes Section */}
        <div style={{ marginTop: '24px' }}>
          <label style={labelStyle}>Admin Notes</label>
          <textarea
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            rows={3}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '14px',
              boxSizing: 'border-box',
              resize: 'vertical'
            }}
            placeholder="Add notes about this order..."
          />
        </div>

        {/* Status Management */}
        <div style={{ marginTop: '24px', padding: '20px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
          <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600', color: '#212121' }}>
            Update Order Status
          </h4>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={() => handleStatusUpdate('pending')}
              disabled={loading || status === 'pending'}
              style={{
                ...buttonStyle,
                backgroundColor: status === 'pending' ? '#d1d5db' : '#f59e0b',
                color: status === 'pending' ? '#6b7280' : '#fff'
              }}
            >
              Mark as Pending
            </button>
            <button
              onClick={() => handleStatusUpdate('approved')}
              disabled={loading || status === 'approved'}
              style={{
                ...buttonStyle,
                backgroundColor: status === 'approved' ? '#d1d5db' : '#10b981',
                color: status === 'approved' ? '#6b7280' : '#fff'
              }}
            >
              Approve Order
            </button>
            <button
              onClick={() => handleStatusUpdate('rejected')}
              disabled={loading || status === 'rejected'}
              style={{
                ...buttonStyle,
                backgroundColor: status === 'rejected' ? '#d1d5db' : '#ef4444',
                color: status === 'rejected' ? '#6b7280' : '#fff'
              }}
            >
              Reject Order
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '32px' }}>
          <button
            onClick={onClose}
            style={{ ...buttonStyle, backgroundColor: '#f3f4f6', color: '#374151' }}
            disabled={loading}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// Brand colors from Color palette
const theme = {
  primary: '#1976D2',
  primaryDark: '#0D47A1',
  primaryLight: '#E3F2FD',
  secondary: '#00796B',
  secondaryDark: '#004D40',
  secondaryLight: '#E0F2F1',
  success: '#4CAF50',
  warning: '#FF9800',
  danger: '#F44336',
  info: '#9C27B0',
  textPrimary: '#212121',
  textSecondary: '#757575',
  textDisabled: '#BDBDBD',
  background: '#FFFFFF',
  backgroundAlt: '#FAFAFA',
  backgroundSoft: '#F5F5F5',
  borderLight: '#E0E0E0',
  borderMedium: '#BDBDBD',
  borderDark: '#757575'
};

const PressPackOrderManagement = () => {
  const { admin, logout, hasRole } = useAdminAuth();

  // Redirect to login if not authenticated
  if (!admin) {
    window.location.href = '/admin/login';
    return null;
  }

  // Check if user has permission to manage press pack orders
  if (!hasRole('super_admin')) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: theme.backgroundSoft }}>
        <div style={{ textAlign: 'center' }}>
          <Icon name="shield-exclamation" size="lg" style={{ color: theme.danger, marginBottom: '16px' }} />
          <h2 style={{ color: theme.textPrimary, marginBottom: '8px' }}>Access Denied</h2>
          <p style={{ color: theme.textSecondary }}>You don't have permission to access press pack order management.</p>
          <p style={{ color: theme.textSecondary, fontSize: '14px', marginTop: '8px' }}>
            Required role: Super Admin
          </p>
        </div>
      </div>
    );
  }

  const [orders, setOrders] = useState([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [message, setMessage] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  // Layout constants
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
    fetchOrders();
  }, [currentPage, pageSize, statusFilter, dateFilter]);

  const fetchOrders = async () => {
    try {
      const params = new URLSearchParams();
      params.append('page', currentPage.toString());
      params.append('limit', pageSize.toString());
      
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      
      if (dateFilter !== 'all') {
        params.append('dateFilter', dateFilter);
      }

      const response = await api.get(`/admin/press-pack-orders?${params.toString()}`);
      setOrders(response.data.orders || []);
      setTotalOrders(response.data.pagination?.total || 0);
    } catch (error) {
      console.error('Error fetching orders:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('adminAccessToken');
        window.location.href = '/admin/login';
      } else {
        alert('Failed to load orders. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOrderUpdate = () => {
    fetchOrders();
    setMessage({ type: 'success', text: 'Order status updated successfully!' });
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadgeStyle = (status) => {
    const styles = {
      pending: { backgroundColor: '#fef3c7', color: '#92400e' },
      approved: { backgroundColor: '#dcfce7', color: '#166534' },
      rejected: { backgroundColor: '#fee2e2', color: '#991b1b' }
    };
    return styles[status] || styles.pending;
  };

  const totalPages = Math.ceil(totalOrders / pageSize);

  // Calculate stats
  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    approved: orders.filter(o => o.status === 'approved').length,
    rejected: orders.filter(o => o.status === 'rejected').length
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
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <span style={{ fontWeight: 700, fontSize: 18 }}>Loading...</span>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-10">
          <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
            <main style={{ flex: 1, minWidth: 0 }}>
              <div style={{ backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 8px 20px rgba(2,6,23,0.06)', overflow: 'hidden' }}>
                <div style={{ padding: '80px', textAlign: 'center', color: theme.textSecondary }}>
                  Loading press pack orders...
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 3 }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="mr-3 md:hidden"
                aria-label="Toggle sidebar"
                style={{ background: 'transparent', border: 'none', padding: 6, cursor: 'pointer' }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={theme.text} strokeWidth="2"><path d="M3 6h18M3 12h18M3 18h18" /></svg>
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Icon name="shopping-cart" size="lg" style={{ color: '#1976D2' }} />
                <span style={{ fontWeight: 700, fontSize: 18 }}>News Marketplace Admin</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 700 }}>{admin?.first_name ? `${admin.first_name} ${admin.last_name}` : 'Master Admin'}</div>
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
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-10" style={{
        paddingTop: mainPaddingTop,
        marginLeft: !isMobile && sidebarOpen ? (sidebarWidth + leftGap) : 0,
        transition: 'margin-left 0.28s ease-in-out'
      }}>
        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
          <main style={{ flex: 1, minWidth: 0 }}>
            {/* Page Header */}
            <div style={{ background: '#fff', borderRadius: 12, padding: 28, border: `4px solid #000`, display: 'flex', justifyContent: 'space-between', gap: '16px', marginBottom: 24, alignItems: 'center' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: '#e6f0ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name="shopping-cart" size="sm" style={{ color: '#1976D2' }} />
                  </div>
                  <h1 style={{ margin: 0, fontSize: 34, fontWeight: 800 }}>Press Pack Order Management</h1>
                </div>
                <p style={{ marginTop: 8, color: '#757575' }}>Manage press pack orders and submissions</p>
              </div>
            </div>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
              <div style={{ background: '#fff', borderRadius: 12, padding: 18, boxShadow: '0 8px 20px rgba(2,6,23,0.06)', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 48, height: 48, borderRadius: 10, background: '#e6f0ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="document-text" size="lg" style={{ color: '#1976D2' }} />
                </div>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 800 }}>{totalOrders}</div>
                  <div style={{ fontSize: 12, color: '#757575' }}>Total Orders</div>
                </div>
              </div>
              
              <div style={{ background: '#fff', borderRadius: 12, padding: 18, boxShadow: '0 8px 20px rgba(2,6,23,0.06)', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 48, height: 48, borderRadius: 10, background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="clock" size="lg" style={{ color: '#f59e0b' }} />
                </div>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 800 }}>{stats.pending}</div>
                  <div style={{ fontSize: 12, color: '#757575' }}>Pending</div>
                </div>
              </div>

              <div style={{ background: '#fff', borderRadius: 12, padding: 18, boxShadow: '0 8px 20px rgba(2,6,23,0.06)', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 48, height: 48, borderRadius: 10, background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="check-circle" size="lg" style={{ color: '#10b981' }} />
                </div>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 800 }}>{stats.approved}</div>
                  <div style={{ fontSize: 12, color: '#757575' }}>Approved</div>
                </div>
              </div>

              <div style={{ background: '#fff', borderRadius: 12, padding: 18, boxShadow: '0 8px 20px rgba(2,6,23,0.06)', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 48, height: 48, borderRadius: 10, background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="x-circle" size="lg" style={{ color: '#ef4444' }} />
                </div>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 800 }}>{stats.rejected}</div>
                  <div style={{ fontSize: 12, color: '#757575' }}>Rejected</div>
                </div>
              </div>
            </div>

            {/* Message */}
            {message && (
              <div style={{
                padding: '12px 16px',
                borderRadius: '8px',
                marginBottom: '16px',
                backgroundColor: message.type === 'success' ? '#dcfce7' : '#fee2e2',
                border: `1px solid ${message.type === 'success' ? '#10b981' : '#ef4444'}`,
                color: message.type === 'success' ? '#065f46' : '#991b1b'
              }}>
                {message.text}
                <button
                  onClick={() => setMessage(null)}
                  style={{ float: 'right', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '16px' }}
                >
                  ×
                </button>
              </div>
            )}

            {/* Filters */}
            <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 8px 20px rgba(2,6,23,0.06)', padding: '16px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
                <div>
                  <label style={{ fontSize: '14px', fontWeight: '600', color: theme.textPrimary, marginBottom: '4px', display: 'block' }}>
                    Status Filter
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    style={{
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      backgroundColor: '#fff'
                    }}
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '14px', fontWeight: '600', color: theme.textPrimary, marginBottom: '4px', display: 'block' }}>
                    Date Filter
                  </label>
                  <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    style={{
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      backgroundColor: '#fff'
                    }}
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                  </select>
                </div>

                <button
                  onClick={() => {
                    setStatusFilter('all');
                    setDateFilter('all');
                  }}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#f3f4f6',
                    color: '#374151',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  Clear Filters
                </button>
              </div>
            </div>

            {/* Table */}
            <div style={{ backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 8px 20px rgba(2,6,23,0.06)', overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb', backgroundColor: '#f8fafc' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: theme.textPrimary }}>
                    Press Pack Orders
                  </span>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      const newPageSize = parseInt(e.target.value);
                      setPageSize(newPageSize);
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

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                      <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', fontSize: '12px', color: theme.textPrimary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Customer
                      </th>
                      <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', fontSize: '12px', color: theme.textPrimary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Press Release
                      </th>
                      <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', fontSize: '12px', color: theme.textPrimary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Package
                      </th>
                      <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', fontSize: '12px', color: theme.textPrimary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Contact
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
                    {orders.map((order, index) => (
                      <tr key={order.id} style={{
                        borderBottom: '1px solid #f1f5f9',
                        backgroundColor: index % 2 === 0 ? '#ffffff' : '#fafbfc'
                      }}>
                        <td style={{ padding: '16px' }}>
                          <div>
                            <div style={{ fontSize: '14px', color: theme.textPrimary, fontWeight: '500' }}>
                              {order.name}
                            </div>
                            <div style={{ fontSize: '12px', color: theme.textSecondary }}>
                              {order.email}
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <div style={{ fontSize: '14px', color: theme.textPrimary }}>
                            {order.press_release_name}
                          </div>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <div style={{ fontSize: '14px', color: theme.textPrimary }}>
                            {order.press_release_package}
                          </div>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <div style={{ fontSize: '12px', color: theme.textSecondary }}>
                            📱 {order.whatsapp_country_code} {order.whatsapp_number}
                          </div>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <span style={{
                            display: 'inline-block',
                            padding: '4px 12px',
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: '600',
                            ...getStatusBadgeStyle(order.status)
                          }}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <div style={{ fontSize: '12px', color: theme.textSecondary }}>
                            {formatDate(order.created_at)}
                          </div>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              onClick={() => handleViewOrder(order)}
                              style={{
                                padding: '6px 10px',
                                backgroundColor: theme.primary,
                                color: '#fff',
                                border: 'none',
                                borderRadius: '4px',
                                fontSize: '12px',
                                cursor: 'pointer',
                                fontWeight: '600'
                              }}
                            >
                              View
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
                <div style={{ padding: '16px 20px', borderTop: '1px solid #e5e7eb', backgroundColor: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '14px', color: theme.textSecondary }}>
                    Page {currentPage} of {totalPages} ({totalOrders} total orders)
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

              {orders.length === 0 && (
                <div style={{ padding: '80px', textAlign: 'center', color: theme.textSecondary }}>
                  <div style={{ fontSize: '64px', marginBottom: '16px' }}>
                    🛒
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>
                    No orders found
                  </div>
                  <div style={{ fontSize: '16px' }}>
                    Try adjusting your filters or check back later.
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* Order Detail Modal */}
      <OrderDetailModal
        isOpen={showOrderModal}
        onClose={() => setShowOrderModal(false)}
        order={selectedOrder}
        onStatusUpdate={handleOrderUpdate}
      />
    </div>
  );
};

export default PressPackOrderManagement;