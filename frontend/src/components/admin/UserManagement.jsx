import React, { useState, useEffect, useMemo } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import Icon from '../common/Icon';
import Sidebar from './Sidebar';
import { adminAPI } from '../../services/api';

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

const UserManagement = () => {
  const { admin, logout, hasRole, hasAnyRole, getRoleLevel } = useAdminAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

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

  const roleOptions = [
    { value: 'super_admin', label: 'Super Administrator' },
    { value: 'content_manager', label: 'Content Manager' },
    { value: 'editor', label: 'Editor' },
    { value: 'registered_user', label: 'Registered User' },
    { value: 'agency', label: 'Agency' },
    { value: 'other', label: 'Other' }
  ];

  const statusOptions = [
    { value: 'active', label: 'Active', color: theme.success },
    { value: 'inactive', label: 'Inactive', color: theme.textDisabled }
  ];

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
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
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await adminAPI.getUsers();
      setUsers(response.data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
      if (error.response?.status === 401) {
        // Token expired or invalid, redirect to login
        localStorage.removeItem('adminAccessToken');
        window.location.href = '/admin/login';
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCSV = async () => {
    try {
      const response = await adminAPI.downloadUsersCSV();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `users_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading CSV:', error);
      alert('Error downloading CSV');
    }
  };

  // Filter to show only users who have logged in successfully (have last_login)
  const loggedInUsers = users.filter(user => user.last_login !== null);

  const filteredUsers = loggedInUsers.filter(user => {
    const matchesSearch = user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !roleFilter || user.role === roleFilter;
    const matchesStatus = !statusFilter || (user.is_active ? 'active' : 'inactive') === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Pagination logic
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredUsers.slice(startIndex, startIndex + pageSize);
  }, [filteredUsers, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredUsers.length / pageSize);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, roleFilter, statusFilter]);

  const getStatusStyle = (isActive) => {
    const statusOption = statusOptions.find(opt => opt.value === (isActive ? 'active' : 'inactive'));
    return {
      backgroundColor: `${statusOption?.color}20`,
      color: statusOption?.color || theme.text,
      padding: '0.25rem 0.75rem',
      borderRadius: '9999px',
      fontSize: '0.75rem',
      fontWeight: 600,
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.25rem'
    };
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getUserStats = () => {
    const loggedInUsers = users.filter(u => u.last_login !== null);
    const total = loggedInUsers.length;
    const active = loggedInUsers.filter(u => u.is_active).length;
    const verified = loggedInUsers.filter(u => u.is_verified).length;
    const today = loggedInUsers.filter(u => new Date(u.last_login).toDateString() === new Date().toDateString()).length;

    return { total, active, verified, today };
  };

  const stats = getUserStats();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: theme.muted }}>
        <Icon name="arrow-path" size="lg" className="animate-spin" style={{ color: theme.primary }} />
        <span style={{ marginLeft: '10px', color: theme.text }}>Loading users...</span>
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
        <div style={{ background: '#fff', borderRadius: 12, padding: 28, border: `4px solid #000`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: '#e6f0ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="users" size="sm" style={{ color: '#1976D2' }} />
              </div>
              <h1 style={{ margin: 0, fontSize: 34, fontWeight: 800 }}>User Management</h1>
            </div>
            <p style={{ marginTop: 8, color: '#757575' }}>View all users who have successfully logged in</p>
          </div>
          <button
            onClick={handleDownloadCSV}
            style={{
              backgroundColor: '#fff',
              color: theme.success,
              border: `1px solid ${theme.success}`,
              padding: '0.625rem 1rem',
              borderRadius: '0.5rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <Icon name="arrow-down-tray" size="sm" />
            Download CSV
          </button>
        </div>

        {/* Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
          {[
            { label: 'Logged In Users', value: stats.total, icon: 'users', bg: '#e6f0ff' },
            { label: 'Active', value: stats.active, icon: 'check-circle', bg: '#dcfce7' },
            { label: 'Verified', value: stats.verified, icon: 'shield-check', bg: '#e0f2fe' },
            { label: 'Logged In Today', value: stats.today, icon: 'calendar', bg: '#f3e8ff' }
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

        {/* Filters */}
        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', marginBottom: '24px', boxShadow: '0 8px 20px rgba(2,6,23,0.06)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#212121', marginBottom: '8px' }}>
                Search
              </label>
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.text, marginBottom: '8px' }}>
                Role
              </label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              >
                <option value="">All Roles</option>
                {roleOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.text, marginBottom: '8px' }}>
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              >
                <option value="">All Status</option>
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div style={{ backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 8px 20px rgba(2,6,23,0.06)', overflow: 'hidden' }}>
          {/* Table Controls */}
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb', backgroundColor: '#f8fafc' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '14px', fontWeight: '600', color: theme.textPrimary }}>
                  Users
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

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: theme.muted }}>
                  <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', fontSize: '14px', color: theme.text }}>USER</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', fontSize: '14px', color: theme.text }}>ROLE</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', fontSize: '14px', color: theme.text }}>STATUS</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', fontSize: '14px', color: theme.text }}>VERIFIED</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', fontSize: '14px', color: theme.text }}>REGISTERED</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', fontSize: '14px', color: theme.text }}>LAST LOGIN</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.map((user) => (
                  <tr key={user.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '16px' }}>
                      <div>
                        <div style={{ fontWeight: '600', fontSize: '14px', color: '#212121' }}>{user.first_name} {user.last_name}</div>
                        <div style={{ fontSize: '12px', color: '#757575' }}>{user.email}</div>
                      </div>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span style={getRoleStyle(user.role)}>
                        {roleDisplayNames[user.role] || 'Other'}
                      </span>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span style={getStatusStyle(user.is_active)}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <Icon name={user.is_verified ? 'check-circle' : 'x-circle'} size="sm" style={{ color: user.is_verified ? theme.success : theme.danger }} />
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ fontSize: '12px', color: '#757575' }}>
                        {formatDate(user.created_at)}
                      </div>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ fontSize: '12px', color: '#757575' }}>
                        {user.last_login ? formatDate(user.last_login) : 'Never'}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div style={{ padding: '40px', textAlign: 'center', color: '#757575' }}>
              No users found matching your criteria.
            </div>
          )}

          {/* Pagination */}
          <div style={{ padding: '16px 20px', borderTop: '1px solid #e5e7eb', backgroundColor: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ fontSize: '14px', color: theme.textSecondary }}>
              Showing {filteredUsers.length > 0 ? ((currentPage - 1) * pageSize) + 1 : 0}-{Math.min(currentPage * pageSize, filteredUsers.length)} of {filteredUsers.length} users
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
  );
};

export default UserManagement;