import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAdminAuth } from '../../context/AdminAuthContext';
import Icon from '../common/Icon';
import Sidebar from './Sidebar';
import api from '../../services/api';
import {
  Plus, Eye, Edit, CheckCircle2, XCircle,
  AlertCircle, Info, Phone, User, Calendar, DollarSign,
  TrendingUp, Clock, BarChart3, Target, Award, Zap
} from 'lucide-react';

// Order View Modal Component
const OrderViewModal = ({ isOpen, onClose, order }) => {
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
    maxWidth: '600px',
    width: '100%',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
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

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
          <div>
            <strong>ID:</strong> {order.id}
          </div>
          <div>
            <strong>Service:</strong> {order.order_type === 'paparazzi' ? order.paparazzi_name : order.publication_name}
          </div>
          <div>
            <strong>Type:</strong> {order.order_type === 'paparazzi' ? 'Paparazzi' : 'Publication'}
          </div>
          <div>
            <strong>Price:</strong> ${order.price}
          </div>
          <div>
            <strong>Customer Name:</strong> {order.customer_name}
          </div>
          <div>
            <strong>Customer Email:</strong> {order.customer_email}
          </div>
          <div>
            <strong>Customer Phone:</strong> {order.customer_phone || 'Not provided'}
          </div>
          <div>
            <strong>Status:</strong>
            <span style={{
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: 'bold',
              color: order.status === 'accepted' ? '#4CAF50' :
                    order.status === 'rejected' ? '#F44336' :
                    order.status === 'completed' ? '#9C27B0' : '#FF9800',
              backgroundColor: order.status === 'accepted' ? '#E8F5E8' :
                              order.status === 'rejected' ? '#FFEBEE' :
                              order.status === 'completed' ? '#F3E5F5' : '#FFF3E0'
            }}>
              {order.status.toUpperCase()}
            </span>
          </div>
          <div>
            <strong>Order Date:</strong> {formatDate(order.order_date)}
          </div>
          <div>
            <strong>Last Updated:</strong> {formatDate(order.updated_at)}
          </div>
        </div>

        {order.customer_message && (
          <div style={{ marginTop: '24px' }}>
            <strong>Customer Message:</strong>
            <p style={{ marginTop: '8px', whiteSpace: 'pre-wrap', backgroundColor: '#f9f9f9', padding: '12px', borderRadius: '4px' }}>
              {order.customer_message}
            </p>
          </div>
        )}

        {order.admin_notes && (
          <div style={{ marginTop: '24px' }}>
            <strong>Admin Notes:</strong>
            <p style={{ marginTop: '8px', whiteSpace: 'pre-wrap', backgroundColor: '#fff3cd', padding: '12px', borderRadius: '4px', border: '1px solid #ffeaa7' }}>
              {order.admin_notes}
            </p>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '32px' }}>
          <button
            onClick={onClose}
            style={{
              paddingTop: '10px',
              paddingBottom: '10px',
              paddingLeft: '20px',
              paddingRight: '20px',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer',
              border: '1px solid #d1d5db',
              backgroundColor: '#f3f4f6',
              color: '#374151'
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

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
};

const OrderManagement = () => {
  const { admin, logout, hasRole } = useAdminAuth();

  const roleDisplayNames = {
    'super_admin': 'Super Administrator',
    'content_manager': 'Content Manager',
    'editor': 'Editor',
    'registered_user': 'Registered User',
    'agency': 'Agency',
    'other': 'Other'
  };

  const getRoleStyle = (role) => {
    const roleColors = {
      super_admin: { bg: '#E0F2F1', color: '#004D40' },
      content_manager: { bg: '#E3F2FD', color: '#0D47A1' },
      editor: { bg: '#FFF3E0', color: '#E65100' },
      registered_user: { bg: '#F3E5F5', color: '#6A1B9A' },
      agency: { bg: '#E8F5E8', color: '#2E7D32' },
      other: { bg: '#FAFAFA', color: '#616161' }
    };

    const r = roleColors[role] || roleColors.other;
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

  // Check if user has permission to manage orders
  if (!hasRole('super_admin') && !hasRole('content_manager')) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: theme.backgroundSoft }}>
        <div style={{ textAlign: 'center' }}>
          <Icon name="shield-exclamation" size="lg" style={{ color: theme.danger, marginBottom: '16px' }} />
          <h2 style={{ color: theme.textPrimary, marginBottom: '8px' }}>Access Denied</h2>
          <p style={{ color: theme.textSecondary }}>You don't have permission to access order management.</p>
          <p style={{ color: theme.textSecondary, fontSize: '14px', marginTop: '8px' }}>
            Required role: Super Admin or Content Manager
          </p>
        </div>
      </div>
    );
  }

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);

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

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    onResize();
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [currentPage, pageSize, statusFilter]);

  const fetchOrders = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: pageSize
      });
      if (statusFilter) params.append('status', statusFilter);

      const response = await api.get(`/orders/admin?${params.toString()}`);
      setOrders(response.data.orders || []);
      setTotalPages(response.data.pagination?.pages || 1);
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

  const handleViewOrder = async (order) => {
    try {
      const response = await api.get(`/orders/admin/${order.id}`);
      setSelectedOrder(response.data.order);
      setShowViewModal(true);
    } catch (error) {
      console.error('Error fetching order details:', error);
      alert('Failed to load order details.');
    }
  };

  const handleAcceptOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to accept this order?')) return;

    try {
      await api.put(`/orders/admin/${orderId}/accept`);
      fetchOrders();
    } catch (error) {
      console.error('Error accepting order:', error);
      alert('Error accepting order. Please try again.');
    }
  };

  const handleRejectOrder = async (orderId) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason || reason.trim().length === 0) return;

    try {
      await api.put(`/orders/admin/${orderId}/reject`, { admin_notes: reason.trim() });
      fetchOrders();
    } catch (error) {
      console.error('Error rejecting order:', error);
      alert('Error rejecting order. Please try again.');
    }
  };

  const handleCompleteOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to mark this order as completed?')) return;

    try {
      await api.put(`/orders/admin/${orderId}/complete`);
      fetchOrders();
    } catch (error) {
      console.error('Error completing order:', error);
      alert('Error completing order. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted': return { color: '#4CAF50', bg: '#E8F5E8' };
      case 'rejected': return { color: '#F44336', bg: '#FFEBEE' };
      case 'completed': return { color: '#9C27B0', bg: '#F3E5F5' };
      case 'pending': return { color: '#FF9800', bg: '#FFF3E0' };
      default: return { color: '#757575', bg: '#F5F5F5' };
    }
  };

  if (loading) {
    return (
      <div style={{ backgroundColor: theme.backgroundSoft, minHeight: '100vh', color: theme.textPrimary, paddingBottom: '3rem' }}>
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

        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <div>Loading orders...</div>
        </div>
      </div>
    );
  }

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
        {/* Hero Section */}
        <section className="relative py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#E3F2FD] to-white border-b border-[#E0E0E0]">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-[#212121] mb-6 tracking-tight">
                Order Management
              </h1>
              <p className="text-lg md:text-xl text-[#757575] max-w-3xl mx-auto leading-relaxed font-light">
                Manage call booking requests for publications and paparazzi services from users across the platform.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Filter Section */}
        <section className="py-8 px-4 sm:px-6 lg:px-8 bg-white border-b border-[#E0E0E0]">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-4 py-3 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976D2] focus:border-transparent text-[#212121] bg-white"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        </section>

        {/* Orders Table */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-[#FAFAFA]">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm border border-[#E0E0E0] overflow-hidden">
              {/* Table Controls */}
              <div className="px-6 py-4 border-b border-[#E5E7EB] bg-[#F8FAFC]">
                <div className="flex justify-between items-center flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-semibold text-[#212121]">Service Orders</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <select
                      value={pageSize}
                      onChange={(e) => {
                        setPageSize(parseInt(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="px-3 py-2 border border-[#E0E0E0] rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1976D2] focus:border-transparent"
                    >
                      <option value="10">10 per page</option>
                      <option value="25">25 per page</option>
                      <option value="50">50 per page</option>
                      <option value="100">100 per page</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-[#F8FAFC] border-b-2 border-[#E2E8F0]">
                      <th className="px-6 py-4 text-left font-bold text-xs text-[#212121] uppercase tracking-wider">ID</th>
                      <th className="px-6 py-4 text-left font-bold text-xs text-[#212121] uppercase tracking-wider">Service</th>
                      <th className="px-6 py-4 text-left font-bold text-xs text-[#212121] uppercase tracking-wider">Type</th>
                      <th className="px-6 py-4 text-left font-bold text-xs text-[#212121] uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-4 text-left font-bold text-xs text-[#212121] uppercase tracking-wider">Price</th>
                      <th className="px-6 py-4 text-left font-bold text-xs text-[#212121] uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left font-bold text-xs text-[#212121] uppercase tracking-wider">Order Date</th>
                      <th className="px-6 py-4 text-left font-bold text-xs text-[#212121] uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order, index) => (
                      <tr key={order.id} className={index % 2 === 0 ? 'bg-white' : 'bg-[#FAFBFC]'}>
                        <td className="px-6 py-4 text-sm text-[#212121]">{order.id}</td>
                        <td className="px-6 py-4 text-sm text-[#212121] font-medium">
                          {order.order_type === 'paparazzi' ? order.paparazzi_name : order.publication_name}
                        </td>
                        <td className="px-6 py-4 text-sm text-[#212121]">
                          {order.order_type === 'paparazzi' ? 'Paparazzi' : 'Publication'}
                        </td>
                        <td className="px-6 py-4 text-sm text-[#212121]">
                          <div>
                            <div className="font-medium">{order.customer_name}</div>
                            <div className="text-xs text-[#757575]">{order.customer_email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-[#212121] font-semibold">${order.price}</td>
                        <td className="px-6 py-4">
                          <span style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            ...getStatusColor(order.status)
                          }}>
                            {order.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-[#212121]">{formatDate(order.order_date)}</td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2 flex-wrap">
                            <button
                              onClick={() => handleViewOrder(order)}
                              className="px-3 py-2 bg-[#9C27B0] hover:bg-[#7B1FA2] text-white rounded text-xs font-medium transition-colors flex items-center gap-1"
                            >
                              <Eye className="w-3 h-3" />
                              View
                            </button>
                            {order.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleAcceptOrder(order.id)}
                                  className="px-3 py-2 bg-[#4CAF50] hover:bg-[#388E3C] text-white rounded text-xs font-medium transition-colors flex items-center gap-1"
                                >
                                  <CheckCircle2 className="w-3 h-3" />
                                  Accept
                                </button>
                                <button
                                  onClick={() => handleRejectOrder(order.id)}
                                  className="px-3 py-2 bg-[#FF9800] hover:bg-[#F57C00] text-white rounded text-xs font-medium transition-colors flex items-center gap-1"
                                >
                                  <XCircle className="w-3 h-3" />
                                  Reject
                                </button>
                              </>
                            )}
                            {order.status === 'accepted' && (
                              <button
                                onClick={() => handleCompleteOrder(order.id)}
                                className="px-3 py-2 bg-[#9C27B0] hover:bg-[#7B1FA2] text-white rounded text-xs font-medium transition-colors flex items-center gap-1"
                              >
                                <CheckCircle2 className="w-3 h-3" />
                                Complete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {orders.length === 0 && (
                <div className="px-6 py-20 text-center">
                  <div className="w-24 h-24 bg-[#F5F5F5] rounded-full flex items-center justify-center mx-auto mb-6">
                    <Phone className="w-12 h-12 text-[#BDBDBD]" />
                  </div>
                  <h3 className="text-2xl font-semibold text-[#212121] mb-3">No orders found</h3>
                  <p className="text-[#757575] mb-6 max-w-md mx-auto">
                    {statusFilter ? 'Try adjusting your status filter.' : 'Call booking orders will appear here once users start submitting requests.'}
                  </p>
                </div>
              )}
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
                      color: currentPage === 1 ? '#9ca3af' : '#212121',
                      cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    Previous
                  </button>

                  <span style={{ fontSize: '14px', color: '#757575' }}>
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
                      color: currentPage === totalPages ? '#9ca3af' : '#212121',
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
        </section>

        {/* Statistics */}
        {orders.length > 0 && (
          <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-2xl font-semibold text-[#212121] mb-6">Order Statistics</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-[#E3F2FD] rounded-lg p-6 border border-[#E0E0E0]">
                  <div className="text-3xl font-bold text-[#1976D2] mb-2">{totalOrders}</div>
                  <div className="text-[#757575]">Total Orders</div>
                </div>
                <div className="bg-[#FFF3E0] rounded-lg p-6 border border-[#E0E0E0]">
                  <div className="text-3xl font-bold text-[#FF9800] mb-2">
                    {orders.filter(o => o.status === 'pending').length}
                  </div>
                  <div className="text-[#757575]">Pending Review</div>
                </div>
                <div className="bg-[#E8F5E8] rounded-lg p-6 border border-[#E0E0E0]">
                  <div className="text-3xl font-bold text-[#4CAF50] mb-2">
                    {orders.filter(o => o.status === 'accepted').length}
                  </div>
                  <div className="text-[#757575]">Accepted</div>
                </div>
                <div className="bg-[#F3E5F5] rounded-lg p-6 border border-[#E0E0E0]">
                  <div className="text-3xl font-bold text-[#9C27B0] mb-2">
                    {orders.filter(o => o.status === 'completed').length}
                  </div>
                  <div className="text-[#757575]">Completed</div>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* View Modal */}
      <OrderViewModal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        order={selectedOrder}
      />
    </div>
  );
};

export default OrderManagement;