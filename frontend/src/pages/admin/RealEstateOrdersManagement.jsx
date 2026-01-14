import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/common/Icon';
import Sidebar from '../../components/admin/Sidebar';
import api from '../../services/api';
import {
  Search, Filter, Eye, Edit, CheckCircle, XCircle, Clock,
  TrendingUp, DollarSign, Users, BarChart3, Calendar,
  ArrowUpDown, ArrowUp, ArrowDown, ChevronDown, FileText,
  User, Building, Crown, MessageCircle, Mail, Phone
} from 'lucide-react';

// Enhanced theme colors
const theme = {
  primary: '#1976D2',
  primaryDark: '#1565C0',
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

const RealEstateOrdersManagement = () => {
  const { admin, logout, isAuthenticated, hasRole, hasAnyRole } = useAdminAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Layout states
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Filter states
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  // Sorting state
  const [sortField, setSortField] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');

  // Modal states
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateFormData, setUpdateFormData] = useState({
    status: '',
    admin_comments: '',
    rejection_reason: ''
  });

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
    if (!isAuthenticated || !hasAnyRole(['super_admin', 'content_manager'])) {
      navigate('/admin/login');
      return;
    }
    fetchOrders();
  }, [isAuthenticated, hasAnyRole, navigate]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchOrders();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, statusFilter, dateFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (statusFilter) params.append('status', statusFilter);
      if (searchTerm.trim()) {
        params.append('customer_email', searchTerm.trim());
      }

      const response = await api.get(`/real-estate-orders?${params.toString()}`);
      setOrders(response.data.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCSV = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (searchTerm.trim()) params.append('customer_email', searchTerm.trim());

      const response = await api.get('/real-estate-orders/export-csv', {
        params: params,
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `real_estate_orders_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading CSV:', error);
      alert('Failed to download CSV. Please try again.');
    }
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
    if (sortField !== field) return <ArrowUpDown size={14} />;
    return sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return theme.warning;
      case 'approved': return theme.success;
      case 'rejected': return theme.danger;
      case 'completed': return theme.info;
      default: return theme.textSecondary;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock size={16} />;
      case 'approved': return <CheckCircle size={16} />;
      case 'rejected': return <XCircle size={16} />;
      case 'completed': return <CheckCircle size={16} />;
      default: return <Clock size={16} />;
    }
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  const handleUpdateOrder = (order) => {
    setSelectedOrder(order);
    setUpdateFormData({
      status: order.status,
      admin_comments: order.admin_comments || '',
      rejection_reason: order.rejection_reason || ''
    });
    setShowUpdateModal(true);
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await api.put(`/real-estate-orders/${selectedOrder.id}`, updateFormData);

      if (response.data.success !== false) {
        alert('Order updated successfully!');
        setShowUpdateModal(false);
        fetchOrders(); // Refresh the list
      } else {
        throw new Error(response.data.message || 'Failed to update order');
      }
    } catch (error) {
      console.error('Error updating order:', error);
      alert(error.response?.data?.message || error.message || 'Error updating order');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const clearFilters = () => {
    setStatusFilter('');
    setDateFilter('');
    setSearchTerm('');
  };

  const filteredOrders = orders.filter(order => {
    if (dateFilter) {
      const orderDate = new Date(order.created_at).toDateString();
      const filterDate = new Date(dateFilter).toDateString();
      if (orderDate !== filterDate) return false;
    }
    return true;
  });

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];

    if (sortField === 'created_at' || sortField === 'approved_at' || sortField === 'rejected_at') {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    } else if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }

    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: theme.backgroundSoft, color: theme.textPrimary, paddingBottom: '3rem' }}>
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
                  Loading real estate orders...
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: theme.backgroundSoft, color: theme.textPrimary, paddingBottom: '3rem' }}>
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '64px' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="mr-3 md:hidden"
                aria-label="Toggle sidebar"
                style={{ background: 'transparent', border: 'none', padding: 6, cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              >
                <Icon name="bars-3" size="sm" />
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Icon name="shopping-bag" size="lg" style={{ color: '#1976D2' }} />
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
            position: 'fixed',
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
                    <Icon name="shopping-bag" size="sm" style={{ color: '#1976D2' }} />
                  </div>
                  <h1 style={{ margin: 0, fontSize: 34, fontWeight: 800 }}>Real Estate Orders Management</h1>
                </div>
                <p style={{ marginTop: 8, color: '#757575' }}>Manage and process real estate influencer orders</p>
              </div>

              <div className="flex items-center gap-4">
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
                <div className="text-right">
                  <div className="text-2xl font-bold" style={{ color: theme.primary }}>
                    {sortedOrders.length}
                  </div>
                  <div className="text-sm" style={{ color: theme.textSecondary }}>
                    Total Orders
                  </div>
                </div>
              </div>
            </div>

            {/* Filters and Search */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="bg-white rounded-lg shadow-sm border p-6 mb-6" style={{ borderColor: theme.borderLight }}>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  {/* Search */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: theme.textPrimary }}>
                      Search by Email
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="customer@example.com"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        style={{ borderColor: theme.borderLight }}
                      />
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2" size={16} style={{ color: theme.textSecondary }} />
                    </div>
                  </div>

                  {/* Status Filter */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: theme.textPrimary }}>
                      Status
                    </label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      style={{ borderColor: theme.borderLight }}
                    >
                      <option value="">All Statuses</option>
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>

                  {/* Date Filter */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: theme.textPrimary }}>
                      Date
                    </label>
                    <input
                      type="date"
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      style={{ borderColor: theme.borderLight }}
                    />
                  </div>

                  {/* Clear Filters */}
                  <div className="flex items-end">
                    <button
                      onClick={clearFilters}
                      className="w-full px-4 py-2 text-white rounded-lg font-medium transition-colors"
                      style={{ backgroundColor: theme.secondary }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = theme.secondaryDark}
                      onMouseLeave={(e) => e.target.style.backgroundColor = theme.secondary}
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>
              </div>

              {/* Orders Table */}
              <div className="bg-white rounded-lg shadow-sm border overflow-hidden" style={{ borderColor: theme.borderLight }}>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead style={{ backgroundColor: theme.backgroundSoft }}>
                      <tr>
                        <th
                          className="px-6 py-4 text-left text-sm font-semibold cursor-pointer hover:bg-gray-50 transition-colors"
                          style={{ color: theme.textPrimary }}
                          onClick={() => handleSort('customer_name')}
                        >
                          <div className="flex items-center gap-2">
                            Customer {getSortIcon('customer_name')}
                          </div>
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: theme.textPrimary }}>
                          Professional
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: theme.textPrimary }}>
                          Requirements
                        </th>
                        <th
                          className="px-6 py-4 text-left text-sm font-semibold cursor-pointer hover:bg-gray-50 transition-colors"
                          style={{ color: theme.textPrimary }}
                          onClick={() => handleSort('status')}
                        >
                          <div className="flex items-center gap-2">
                            Status {getSortIcon('status')}
                          </div>
                        </th>
                        <th
                          className="px-6 py-4 text-left text-sm font-semibold cursor-pointer hover:bg-gray-50 transition-colors"
                          style={{ color: theme.textPrimary }}
                          onClick={() => handleSort('created_at')}
                        >
                          <div className="flex items-center gap-2">
                            Date {getSortIcon('created_at')}
                          </div>
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: theme.textPrimary }}>
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedOrders.map((order, index) => (
                        <tr
                          key={order.id}
                          className="border-t hover:bg-gray-50 cursor-pointer transition-colors"
                          style={{ borderColor: theme.borderLight }}
                        >
                          <td className="px-6 py-4">
                            <div>
                              <div className="font-semibold" style={{ color: theme.textPrimary }}>
                                {order.customer_name}
                              </div>
                              <div className="text-sm" style={{ color: theme.textSecondary }}>
                                {order.customer_email}
                              </div>
                              <div className="text-sm" style={{ color: theme.textSecondary }}>
                                {order.customer_whatsapp_country_code} {order.customer_whatsapp_number}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm" style={{ color: theme.textPrimary }}>
                              Professional #{order.professional_id}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm" style={{ color: theme.textPrimary }}>
                              <div>Budget: {order.budget_range}</div>
                              <div>Influencers: {order.influencers_required}</div>
                              <div>Gender: {order.gender_required}</div>
                              {order.min_followers && <div>Min Followers: {order.min_followers.toLocaleString()}</div>}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <span style={{ color: getStatusColor(order.status) }}>
                                {getStatusIcon(order.status)}
                              </span>
                              <span
                                className="px-2 py-1 rounded-full text-xs font-medium capitalize"
                                style={{
                                  backgroundColor: getStatusColor(order.status) + '20',
                                  color: getStatusColor(order.status)
                                }}
                              >
                                {order.status}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm" style={{ color: theme.textPrimary }}>
                              {formatDate(order.created_at)}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewOrder(order);
                                }}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="View Details"
                              >
                                <Eye size={16} />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUpdateOrder(order);
                                }}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                title="Update Status"
                              >
                                <Edit size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {sortedOrders.length === 0 && (
                  <div className="text-center py-20">
                    <div
                      className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
                      style={{ backgroundColor: theme.backgroundSoft }}
                    >
                      <FileText size={48} style={{ color: theme.textDisabled }} />
                    </div>
                    <h3 className="text-2xl font-semibold mb-3" style={{ color: theme.textPrimary }}>
                      No orders found
                    </h3>
                    <p className="mb-6 max-w-md mx-auto" style={{ color: theme.textSecondary }}>
                      No orders match your current filters. Try adjusting your search criteria.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Order Details Modal */}
      {showOrderModal && selectedOrder && (
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
          padding: '20px',
          overflow: 'auto'
        }} onClick={() => setShowOrderModal(false)}>
          <div style={{
            backgroundColor: theme.background,
            borderRadius: '12px',
            maxWidth: '800px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
            display: 'flex',
            flexDirection: 'column'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '24px 24px 16px 24px',
              borderBottom: `1px solid ${theme.borderLight}`,
              flexShrink: 0
            }}>
              <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '800', color: theme.textPrimary }}>
                Order Details #{selectedOrder.id}
              </h2>
              <button
                onClick={() => setShowOrderModal(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: theme.textSecondary,
                  padding: '4px',
                  borderRadius: '4px'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = theme.backgroundSoft}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                ×
              </button>
            </div>

            <div style={{
              padding: '24px',
              overflowY: 'auto',
              flex: 1
            }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Customer Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-4" style={{ color: theme.textPrimary }}>
                    Customer Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium" style={{ color: theme.textSecondary }}>Name</label>
                      <p style={{ color: theme.textPrimary }}>{selectedOrder.customer_name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium" style={{ color: theme.textSecondary }}>Email</label>
                      <p style={{ color: theme.textPrimary }}>{selectedOrder.customer_email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium" style={{ color: theme.textSecondary }}>WhatsApp</label>
                      <p style={{ color: theme.textPrimary }}>
                        {selectedOrder.customer_whatsapp_country_code} {selectedOrder.customer_whatsapp_number}
                      </p>
                    </div>
                    {selectedOrder.customer_calling_number && (
                      <div>
                        <label className="text-sm font-medium" style={{ color: theme.textSecondary }}>Calling Number</label>
                        <p style={{ color: theme.textPrimary }}>
                          {selectedOrder.customer_calling_country_code} {selectedOrder.customer_calling_number}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Order Requirements */}
                <div>
                  <h3 className="text-lg font-semibold mb-4" style={{ color: theme.textPrimary }}>
                    Order Requirements
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium" style={{ color: theme.textSecondary }}>Budget Range</label>
                      <p style={{ color: theme.textPrimary }}>{selectedOrder.budget_range}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium" style={{ color: theme.textSecondary }}>Influencers Required</label>
                      <p style={{ color: theme.textPrimary }}>{selectedOrder.influencers_required}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium" style={{ color: theme.textSecondary }}>Gender Required</label>
                      <p style={{ color: theme.textPrimary }}>{selectedOrder.gender_required}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium" style={{ color: theme.textSecondary }}>Languages</label>
                      <p style={{ color: theme.textPrimary }}>
                        {selectedOrder.languages_required?.join(', ') || 'Not specified'}
                      </p>
                    </div>
                    {selectedOrder.min_followers && (
                      <div>
                        <label className="text-sm font-medium" style={{ color: theme.textSecondary }}>Min Followers</label>
                        <p style={{ color: theme.textPrimary }}>{selectedOrder.min_followers.toLocaleString()}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Message */}
              {selectedOrder.message && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-4" style={{ color: theme.textPrimary }}>
                    Additional Message
                  </h3>
                  <div style={{
                    backgroundColor: theme.backgroundSoft,
                    padding: '16px',
                    borderRadius: '8px',
                    color: theme.textPrimary
                  }}>
                    {selectedOrder.message}
                  </div>
                </div>
              )}

              {/* Admin Comments */}
              {(selectedOrder.admin_comments || selectedOrder.rejection_reason) && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-4" style={{ color: theme.textPrimary }}>
                    Admin Notes
                  </h3>
                  <div className="space-y-3">
                    {selectedOrder.admin_comments && (
                      <div>
                        <label className="text-sm font-medium" style={{ color: theme.textSecondary }}>Comments</label>
                        <p style={{ color: theme.textPrimary }}>{selectedOrder.admin_comments}</p>
                      </div>
                    )}
                    {selectedOrder.rejection_reason && (
                      <div>
                        <label className="text-sm font-medium" style={{ color: theme.textSecondary }}>Rejection Reason</label>
                        <p style={{ color: theme.danger }}>{selectedOrder.rejection_reason}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Order Status */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4" style={{ color: theme.textPrimary }}>
                  Order Status
                </h3>
                <div className="flex items-center gap-2">
                  <span style={{ color: getStatusColor(selectedOrder.status) }}>
                    {getStatusIcon(selectedOrder.status)}
                  </span>
                  <span
                    className="px-3 py-1 rounded-full text-sm font-medium capitalize"
                    style={{
                      backgroundColor: getStatusColor(selectedOrder.status) + '20',
                      color: getStatusColor(selectedOrder.status)
                    }}
                  >
                    {selectedOrder.status}
                  </span>
                  <span className="text-sm" style={{ color: theme.textSecondary }}>
                    Created: {formatDate(selectedOrder.created_at)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Update Order Modal */}
      {showUpdateModal && selectedOrder && (
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
          padding: '20px',
          overflow: 'auto'
        }} onClick={() => setShowUpdateModal(false)}>
          <div style={{
            backgroundColor: theme.background,
            borderRadius: '12px',
            maxWidth: '600px',
            width: '100%',
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
            display: 'flex',
            flexDirection: 'column'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '24px 24px 16px 24px',
              borderBottom: `1px solid ${theme.borderLight}`,
              flexShrink: 0
            }}>
              <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '800', color: theme.textPrimary }}>
                Update Order Status
              </h2>
              <button
                onClick={() => setShowUpdateModal(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: theme.textSecondary,
                  padding: '4px',
                  borderRadius: '4px'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = theme.backgroundSoft}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleUpdateSubmit} style={{ padding: '24px', flex: 1 }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: theme.textPrimary }}>
                    Status *
                  </label>
                  <select
                    value={updateFormData.status}
                    onChange={(e) => setUpdateFormData({ ...updateFormData, status: e.target.value })}
                    required
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    style={{ borderColor: theme.borderLight }}
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: theme.textPrimary }}>
                    Admin Comments
                  </label>
                  <textarea
                    value={updateFormData.admin_comments}
                    onChange={(e) => setUpdateFormData({ ...updateFormData, admin_comments: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    style={{ borderColor: theme.borderLight }}
                    placeholder="Add any comments for this order..."
                  />
                </div>

                {updateFormData.status === 'rejected' && (
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: theme.textPrimary }}>
                      Rejection Reason *
                    </label>
                    <textarea
                      value={updateFormData.rejection_reason}
                      onChange={(e) => setUpdateFormData({ ...updateFormData, rejection_reason: e.target.value })}
                      rows={2}
                      required
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      style={{ borderColor: theme.borderLight }}
                      placeholder="Please provide a reason for rejection..."
                    />
                  </div>
                )}
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '12px',
                paddingTop: '24px',
                borderTop: `1px solid ${theme.borderLight}`,
                marginTop: '24px'
              }}>
                <button
                  type="button"
                  onClick={() => setShowUpdateModal(false)}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: theme.backgroundSoft,
                    color: theme.textPrimary,
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '12px 24px',
                    backgroundColor: theme.primary,
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = theme.primaryDark}
                  onMouseLeave={(e) => e.target.style.backgroundColor = theme.primary}
                >
                  Update Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RealEstateOrdersManagement;