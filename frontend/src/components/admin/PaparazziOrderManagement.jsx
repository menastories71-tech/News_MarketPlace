import React, { useState, useEffect, useMemo } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import Icon from '../common/Icon';
import Sidebar from './Sidebar';
import api from '../../services/api';

const PaparazziOrderManagement = () => {
  const { admin, logout, hasRole, hasAnyRole, getRoleLevel } = useAdminAuth();

  // Check if user has permission to manage orders
  if (!hasAnyRole(['super_admin', 'content_manager'])) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#F5F5F5' }}>
        <div style={{ textAlign: 'center' }}>
          <Icon name="shield-exclamation" size="lg" style={{ color: '#F44336', marginBottom: '16px' }} />
          <h2 style={{ color: '#212121', marginBottom: '8px' }}>Access Denied</h2>
          <p style={{ color: '#757575' }}>You don't have permission to access paparazzi order management.</p>
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

  const theme = {
    primary: '#1976D2',
    secondary: '#00796B',
    success: '#4CAF50',
    warning: '#FF9800',
    danger: '#F44336',
    info: '#9C27B0',
    textPrimary: '#212121',
    textSecondary: '#757575',
    background: '#FFFFFF',
    backgroundSoft: '#F5F5F5',
    borderLight: '#E0E0E0'
  };

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    onResize();
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: pageSize
      });

      if (statusFilter) params.append('status', statusFilter);

      const response = await api.get(`/paparazzi-orders?${params}`);
      setOrders(response.data.orders || []);
    } catch (error) {
      console.error('Error fetching paparazzi orders:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('adminAccessToken');
        window.location.href = '/admin/login';
        return;
      }
      alert('Failed to load paparazzi orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = useMemo(() => {
    let filtered = orders;

    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.paparazzi_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer_email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [orders, searchTerm]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
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
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: theme.backgroundSoft }}>
        <div style={{ textAlign: 'center' }}>
          <div className="animate-spin rounded-full h-16 w-16 mx-auto mb-4" style={{
            borderBottom: `2px solid ${theme.primary}`,
            borderRight: `2px solid transparent`
          }}></div>
          <p>Loading paparazzi orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: theme.backgroundSoft, paddingBottom: '3rem' }}>
      {/* Header */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        backgroundColor: theme.background,
        boxShadow: '0 6px 20px rgba(2,6,23,0.06)',
        borderBottom: `1px solid ${theme.borderLight}`,
        padding: '1rem 0'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                style={{ background: 'transparent', border: 'none', padding: '0.375rem', cursor: 'pointer' }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={theme.textPrimary} strokeWidth="2">
                  <path d="M3 6h18M3 12h18M3 18h18" />
                </svg>
              </button>
              <Icon name="shield-check" size="lg" style={{ color: theme.primary }} />
              <span style={{ fontWeight: 700, fontSize: '1.125rem' }}>News Marketplace Admin</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 700 }}>{admin?.first_name ? `${admin.first_name} ${admin.last_name}` : 'Master Admin'}</div>
              </div>
              <button
                onClick={logout}
                style={{
                  backgroundColor: theme.primary,
                  color: '#fff',
                  padding: '0.375rem 0.75rem',
                  borderRadius: '0.375rem',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <Sidebar
        admin={admin}
        theme={theme}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        isMobile={isMobile}
      />

      {/* Main Content */}
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '2.5rem 1.5rem',
        marginLeft: !isMobile && sidebarOpen ? '280px' : 0,
        transition: 'margin-left 0.28s ease-in-out'
      }}>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
          <main style={{ flex: 1, minWidth: 0 }}>
            {/* Page Header */}
            <div style={{
              background: '#fff',
              borderRadius: '0.75rem',
              padding: '1.75rem',
              border: '4px solid #000',
              marginBottom: '1.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  <div style={{
                    width: '2.25rem',
                    height: '2.25rem',
                    borderRadius: '0.625rem',
                    background: '#e6f0ff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Icon name="camera" size="sm" style={{ color: theme.primary }} />
                  </div>
                  <h1 style={{ margin: 0, fontSize: '2.125rem', fontWeight: 800 }}>Paparazzi Order Management</h1>
                </div>
                <p style={{ marginTop: '0.5rem', color: '#757575' }}>Manage paparazzi call booking orders</p>
              </div>
            </div>

            {/* Search and Filters */}
            <div style={{
              backgroundColor: '#fff',
              padding: '1.25rem',
              borderRadius: '0.75rem',
              marginBottom: '1rem',
              boxShadow: '0 8px 20px rgba(2,6,23,0.06)'
            }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '300px' }}>
                  <input
                    type="text"
                    placeholder="Search orders by paparazzi name, customer name, or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem 0.75rem 2.75rem',
                      border: '2px solid #e0e0e0',
                      borderRadius: '0.5rem',
                      fontSize: '0.875rem',
                      outline: 'none'
                    }}
                  />
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={theme.textSecondary} strokeWidth="2" style={{
                    position: 'absolute',
                    left: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)'
                  }}>
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.35-4.35"></path>
                  </svg>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap', marginTop: '1rem' }}>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{
                    padding: '0.5rem 0.75rem',
                    border: '1px solid #e0e0e0',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                    backgroundColor: '#fff',
                    cursor: 'pointer',
                    minWidth: '120px'
                  }}
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>

            {/* Orders Table */}
            <div style={{
              backgroundColor: '#fff',
              borderRadius: '0.75rem',
              boxShadow: '0 8px 20px rgba(2,6,23,0.06)',
              overflow: 'hidden'
            }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                      <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '700', fontSize: '0.75rem', color: theme.textPrimary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Order ID
                      </th>
                      <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '700', fontSize: '0.75rem', color: theme.textPrimary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Paparazzi
                      </th>
                      <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '700', fontSize: '0.75rem', color: theme.textPrimary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Customer
                      </th>
                      <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '700', fontSize: '0.75rem', color: theme.textPrimary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Price
                      </th>
                      <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '700', fontSize: '0.75rem', color: theme.textPrimary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Status
                      </th>
                      <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '700', fontSize: '0.75rem', color: theme.textPrimary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Date
                      </th>
                      <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '700', fontSize: '0.75rem', color: theme.textPrimary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan="7" style={{ padding: '2.5rem', textAlign: 'center', color: theme.textSecondary }}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                            <Icon name="clipboard-document-list" size="lg" style={{ color: '#BDBDBD' }} />
                            <div>No paparazzi orders found matching your criteria.</div>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((order, index) => (
                        <tr key={order.id} style={{ backgroundColor: index % 2 === 0 ? '#ffffff' : '#fafbfc', borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '1rem', fontSize: '0.875rem', color: theme.textPrimary }}>
                            #{order.id}
                          </td>
                          <td style={{ padding: '1rem' }}>
                            <div style={{ fontSize: '0.875rem', fontWeight: '600', color: theme.textPrimary, marginBottom: '0.25rem' }}>
                              {order.paparazzi_name}
                            </div>
                          </td>
                          <td style={{ padding: '1rem' }}>
                            <div style={{ fontSize: '0.875rem', fontWeight: '600', color: theme.textPrimary, marginBottom: '0.25rem' }}>
                              {order.customer_name}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: theme.textSecondary }}>
                              {order.customer_email}
                            </div>
                          </td>
                          <td style={{ padding: '1rem', fontSize: '0.875rem', color: theme.textPrimary }}>
                            ${order.price}
                          </td>
                          <td style={{ padding: '1rem' }}>
                            <span style={getStatusStyle(order.status)}>
                              {order.status}
                            </span>
                          </td>
                          <td style={{ padding: '1rem', fontSize: '0.875rem', color: theme.textPrimary }}>
                            {formatDate(order.created_at)}
                          </td>
                          <td style={{ padding: '1rem' }}>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                              {order.status === 'pending' && (
                                <>
                                  <button
                                    onClick={() => handleAcceptOrder(order.id)}
                                    style={{
                                      padding: '0.375rem 0.75rem',
                                      backgroundColor: theme.success,
                                      color: '#fff',
                                      border: 'none',
                                      borderRadius: '0.375rem',
                                      fontSize: '0.75rem',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '0.25rem'
                                    }}
                                  >
                                    <Icon name="check" size="xs" style={{ color: '#fff' }} />
                                    Accept
                                  </button>
                                  <button
                                    onClick={() => handleRejectOrder(order.id)}
                                    style={{
                                      padding: '0.375rem 0.75rem',
                                      backgroundColor: theme.danger,
                                      color: '#fff',
                                      border: 'none',
                                      borderRadius: '0.375rem',
                                      fontSize: '0.75rem',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '0.25rem'
                                    }}
                                  >
                                    <Icon name="x-mark" size="xs" style={{ color: '#fff' }} />
                                    Reject
                                  </button>
                                </>
                              )}
                              {order.status === 'accepted' && (
                                <button
                                  onClick={() => handleCompleteOrder(order.id)}
                                  style={{
                                    padding: '0.375rem 0.75rem',
                                    backgroundColor: theme.info,
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '0.375rem',
                                    fontSize: '0.75rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.25rem'
                                  }}
                                >
                                  <Icon name="check-circle" size="xs" style={{ color: '#fff' }} />
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
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default PaparazziOrderManagement;
