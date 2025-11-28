import React, { useState, useEffect, useMemo } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import Icon from '../common/Icon';
import Sidebar from './Sidebar';
import { adminAPI } from '../../services/api';
import RoleFormModal from './RoleFormModal';
import PermissionFormModal from './PermissionFormModal';

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

const RolePermissionManagement = () => {
  const { admin, logout, hasRole, hasAnyRole, getRoleLevel } = useAdminAuth();
  const [activeTab, setActiveTab] = useState('roles');
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [permissionFilter, setPermissionFilter] = useState('');

  // Pagination states
  const [rolesCurrentPage, setRolesCurrentPage] = useState(1);
  const [rolesPageSize, setRolesPageSize] = useState(10);
  const [permissionsCurrentPage, setPermissionsCurrentPage] = useState(1);
  const [permissionsPageSize, setPermissionsPageSize] = useState(10);

  // Modal states
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [editingPermission, setEditingPermission] = useState(null);

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

  const btnSecondary = {
    ...btnPrimary,
    backgroundColor: theme.secondary,
    boxShadow: `0 6px 18px rgba(0,121,107,0.14)`
  };

  const btnDanger = {
    ...btnPrimary,
    backgroundColor: theme.danger,
    boxShadow: `0 6px 18px rgba(244,67,54,0.14)`
  };

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
    fetchData();
  }, [searchTerm, permissionFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [rolesResponse, permissionsResponse] = await Promise.all([
        adminAPI.getRoles({ search: searchTerm }),
        adminAPI.getPermissions({ search: permissionFilter })
      ]);
      setRoles(rolesResponse.data.roles);
      setPermissions(permissionsResponse.data.permissions);
    } catch (error) {
      console.error('Error fetching data:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('adminAccessToken');
        window.location.href = '/admin/login';
      }
    } finally {
      setLoading(false);
    }
  };

  // Pagination logic
  const paginatedRoles = useMemo(() => {
    const startIndex = (rolesCurrentPage - 1) * rolesPageSize;
    return roles.slice(startIndex, startIndex + rolesPageSize);
  }, [roles, rolesCurrentPage, rolesPageSize]);

  const rolesTotalPages = Math.ceil(roles.length / rolesPageSize);

  const paginatedPermissions = useMemo(() => {
    const startIndex = (permissionsCurrentPage - 1) * permissionsPageSize;
    return permissions.slice(startIndex, startIndex + permissionsPageSize);
  }, [permissions, permissionsCurrentPage, permissionsPageSize]);

  const permissionsTotalPages = Math.ceil(permissions.length / permissionsPageSize);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  // CRUD Handlers
  const handleCreateRole = () => {
    setEditingRole(null);
    setShowRoleModal(true);
  };

  const handleEditRole = (role) => {
    setEditingRole(role);
    setShowRoleModal(true);
  };

  const handleDeleteRole = async (role) => {
    if (window.confirm(`Are you sure you want to delete the role "${role.name}"? This action cannot be undone.`)) {
      try {
        await adminAPI.deleteRole(role.id);
        fetchData();
      } catch (error) {
        console.error('Error deleting role:', error);
        alert('Error deleting role. Please try again.');
      }
    }
  };

  const handleCreatePermission = () => {
    setEditingPermission(null);
    setShowPermissionModal(true);
  };

  const handleEditPermission = (permission) => {
    setEditingPermission(permission);
    setShowPermissionModal(true);
  };

  const handleDeletePermission = async (permission) => {
    if (window.confirm(`Are you sure you want to delete the permission "${permission.name}"? This action cannot be undone.`)) {
      try {
        await adminAPI.deletePermission(permission.id);
        fetchData();
      } catch (error) {
        console.error('Error deleting permission:', error);
        alert('Error deleting permission. Please try again.');
      }
    }
  };

  const handleModalSave = () => {
    fetchData();
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: theme.backgroundSoft }}>
        <Icon name="arrow-path" size="lg" className="animate-spin" style={{ color: theme.primary }} />
        <span style={{ marginLeft: '10px', color: theme.textPrimary }}>Loading...</span>
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
          <div className="flex justify-between items-center py-3">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="mr-3 md:hidden"
                aria-label="Toggle sidebar"
                style={{ background: 'transparent', border: 'none', padding: 6, cursor: 'pointer' }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={theme.textPrimary} strokeWidth="2"><path d="M3 6h18M3 12h18M3 18h18" /></svg>
              </button>

              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="mr-3 hidden md:block"
                aria-label="Toggle sidebar"
                style={{ background: 'transparent', border: 'none', padding: 6, cursor: 'pointer' }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={theme.textPrimary} strokeWidth="2"><path d="M3 6h18M3 12h18M3 18h18" /></svg>
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Icon name="shield-check" size="lg" style={{ color: '#1976D2' }} />
                <span style={{ fontWeight: 700, fontSize: 18 }}>News Marketplace Admin</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <button aria-label="Toggle theme" style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={theme.textPrimary} strokeWidth="2"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" /></svg>
              </button>

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
                  }}>
                    {roleDisplayNames[admin?.role] || '—'}
                  </span>
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
            <div style={{ background: '#fff', borderRadius: 12, padding: 28, border: `4px solid #000`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, marginBottom: 24 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: '#e6f0ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name="user-group" size="sm" style={{ color: '#1976D2' }} />
                  </div>
                  <h1 style={{ margin: 0, fontSize: 34, fontWeight: 800 }}>Roles & Permissions</h1>
                </div>
                <p style={{ marginTop: 8, color: '#757575' }}>Manage roles and permissions for the system</p>
              </div>
            </div>

            {/* Tabs */}
            <div style={{ backgroundColor: '#fff', borderRadius: '12px', marginBottom: '24px', boxShadow: '0 8px 20px rgba(2,6,23,0.06)' }}>
              <div style={{ display: 'flex', borderBottom: `1px solid ${theme.borderLight}` }}>
                <button
                  onClick={() => setActiveTab('roles')}
                  style={{
                    flex: 1,
                    padding: '16px 24px',
                    backgroundColor: activeTab === 'roles' ? theme.primaryLight : 'transparent',
                    color: activeTab === 'roles' ? theme.primary : theme.textPrimary,
                    border: 'none',
                    borderBottom: activeTab === 'roles' ? `2px solid ${theme.primary}` : 'none',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  Roles ({roles.length})
                </button>
                <button
                  onClick={() => setActiveTab('permissions')}
                  style={{
                    flex: 1,
                    padding: '16px 24px',
                    backgroundColor: activeTab === 'permissions' ? theme.primaryLight : 'transparent',
                    color: activeTab === 'permissions' ? theme.primary : theme.textPrimary,
                    border: 'none',
                    borderBottom: activeTab === 'permissions' ? `2px solid ${theme.primary}` : 'none',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  Permissions ({permissions.length})
                </button>
              </div>
            </div>

            {/* Content based on active tab */}
            {activeTab === 'roles' && (
              <div style={{ backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 8px 20px rgba(2,6,23,0.06)', overflow: 'hidden' }}>
                <div style={{ padding: '20px', borderBottom: `1px solid ${theme.borderLight}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Roles</h2>
                  <button style={btnPrimary} onClick={handleCreateRole}>
                    <Icon name="plus" size="sm" />
                    Add Role
                  </button>
                </div>

                {/* Filters */}
                <div style={{ padding: '20px', borderBottom: `1px solid ${theme.borderLight}` }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.textPrimary, marginBottom: '8px' }}>
                        Search
                      </label>
                      <input
                        type="text"
                        placeholder="Search roles..."
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
                  </div>
                </div>

                {/* Table Controls */}
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb', backgroundColor: '#f8fafc' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '14px', fontWeight: '600', color: theme.textPrimary }}>
                        Roles
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <select
                        value={rolesPageSize}
                        onChange={(e) => {
                          setRolesPageSize(parseInt(e.target.value));
                          setRolesCurrentPage(1);
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
                      <tr style={{ backgroundColor: theme.backgroundSoft }}>
                        <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', fontSize: '14px', color: theme.textPrimary }}>NAME</th>
                        <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', fontSize: '14px', color: theme.textPrimary }}>DESCRIPTION</th>
                        <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', fontSize: '14px', color: theme.textPrimary }}>LEVEL</th>
                        <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', fontSize: '14px', color: theme.textPrimary }}>PERMISSIONS</th>
                        <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', fontSize: '14px', color: theme.textPrimary }}>CREATED</th>
                        <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', fontSize: '14px', color: theme.textPrimary }}>ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedRoles.map((role) => (
                        <tr key={role.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                          <td style={{ padding: '16px' }}>
                            <div style={{ fontWeight: '600', fontSize: '14px', color: theme.textPrimary }}>{role.name}</div>
                          </td>
                          <td style={{ padding: '16px' }}>
                            <div style={{ fontSize: '14px', color: theme.textSecondary }}>{role.description || '—'}</div>
                          </td>
                          <td style={{ padding: '16px' }}>
                            <span style={{
                              backgroundColor: theme.secondaryLight,
                              color: theme.secondaryDark,
                              padding: '0.25rem 0.75rem',
                              borderRadius: '9999px',
                              fontSize: '0.75rem',
                              fontWeight: 600
                            }}>
                              {role.level}
                            </span>
                          </td>
                          <td style={{ padding: '16px' }}>
                            <div style={{ fontSize: '14px', color: theme.textSecondary }}>
                              {role.permissions?.length || 0} permissions
                            </div>
                          </td>
                          <td style={{ padding: '16px' }}>
                            <div style={{ fontSize: '12px', color: theme.textSecondary }}>
                              {formatDate(role.created_at)}
                            </div>
                          </td>
                          <td style={{ padding: '16px' }}>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button
                                style={{ ...btnSecondary, padding: '0.375rem 0.75rem', fontSize: '12px' }}
                                onClick={() => handleEditRole(role)}
                              >
                                <Icon name="pencil" size="xs" />
                                Edit
                              </button>
                              {role.name !== 'super_admin' && (
                                <button
                                  style={{ ...btnDanger, padding: '0.375rem 0.75rem', fontSize: '12px' }}
                                  onClick={() => handleDeleteRole(role)}
                                >
                                  <Icon name="trash" size="xs" />
                                  Delete
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {roles.length === 0 && (
                  <div style={{ padding: '40px', textAlign: 'center', color: theme.textSecondary }}>
                    No roles found.
                  </div>
                )}

                {/* Pagination */}
                {rolesTotalPages > 1 && (
                  <div style={{ padding: '16px 20px', borderTop: '1px solid #e5e7eb', backgroundColor: '#f8fafc', display: 'flex', justifyContent: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        onClick={() => setRolesCurrentPage(Math.max(1, rolesCurrentPage - 1))}
                        disabled={rolesCurrentPage === 1}
                        style={{
                          padding: '8px 12px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          backgroundColor: rolesCurrentPage === 1 ? '#f3f4f6' : '#fff',
                          color: rolesCurrentPage === 1 ? '#9ca3af' : theme.textPrimary,
                          cursor: rolesCurrentPage === 1 ? 'not-allowed' : 'pointer',
                          fontSize: '14px'
                        }}
                      >
                        Previous
                      </button>

                      <span style={{ fontSize: '14px', color: theme.textSecondary }}>
                        Page {rolesCurrentPage} of {rolesTotalPages}
                      </span>

                      <button
                        onClick={() => setRolesCurrentPage(Math.min(rolesTotalPages, rolesCurrentPage + 1))}
                        disabled={rolesCurrentPage === rolesTotalPages}
                        style={{
                          padding: '8px 12px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          backgroundColor: rolesCurrentPage === rolesTotalPages ? '#f3f4f6' : '#fff',
                          color: rolesCurrentPage === rolesTotalPages ? '#9ca3af' : theme.textPrimary,
                          cursor: rolesCurrentPage === rolesTotalPages ? 'not-allowed' : 'pointer',
                          fontSize: '14px'
                        }}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'permissions' && (
              <div style={{ backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 8px 20px rgba(2,6,23,0.06)', overflow: 'hidden' }}>
                <div style={{ padding: '20px', borderBottom: `1px solid ${theme.borderLight}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Permissions</h2>
                  <button style={btnPrimary} onClick={handleCreatePermission}>
                    <Icon name="plus" size="sm" />
                    Add Permission
                  </button>
                </div>

                {/* Filters */}
                <div style={{ padding: '20px', borderBottom: `1px solid ${theme.borderLight}` }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.textPrimary, marginBottom: '8px' }}>
                        Search
                      </label>
                      <input
                        type="text"
                        placeholder="Search permissions..."
                        value={permissionFilter}
                        onChange={(e) => setPermissionFilter(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          border: '1px solid #d1d5db',
                          borderRadius: '8px',
                          fontSize: '14px'
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Table Controls */}
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb', backgroundColor: '#f8fafc' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '14px', fontWeight: '600', color: theme.textPrimary }}>
                        Permissions
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <select
                        value={permissionsPageSize}
                        onChange={(e) => {
                          setPermissionsPageSize(parseInt(e.target.value));
                          setPermissionsCurrentPage(1);
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
                      <tr style={{ backgroundColor: theme.backgroundSoft }}>
                        <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', fontSize: '14px', color: theme.textPrimary }}>NAME</th>
                        <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', fontSize: '14px', color: theme.textPrimary }}>DESCRIPTION</th>
                        <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', fontSize: '14px', color: theme.textPrimary }}>RESOURCE</th>
                        <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', fontSize: '14px', color: theme.textPrimary }}>ACTION</th>
                        <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', fontSize: '14px', color: theme.textPrimary }}>CREATED</th>
                        <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', fontSize: '14px', color: theme.textPrimary }}>ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedPermissions.map((permission) => (
                        <tr key={permission.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                          <td style={{ padding: '16px' }}>
                            <div style={{ fontWeight: '600', fontSize: '14px', color: theme.textPrimary }}>{permission.name}</div>
                          </td>
                          <td style={{ padding: '16px' }}>
                            <div style={{ fontSize: '14px', color: theme.textSecondary }}>{permission.description || '—'}</div>
                          </td>
                          <td style={{ padding: '16px' }}>
                            <span style={{
                              backgroundColor: theme.info,
                              color: '#fff',
                              padding: '0.25rem 0.75rem',
                              borderRadius: '9999px',
                              fontSize: '0.75rem',
                              fontWeight: 600
                            }}>
                              {permission.resource}
                            </span>
                          </td>
                          <td style={{ padding: '16px' }}>
                            <span style={{
                              backgroundColor: theme.warning,
                              color: '#fff',
                              padding: '0.25rem 0.75rem',
                              borderRadius: '9999px',
                              fontSize: '0.75rem',
                              fontWeight: 600
                            }}>
                              {permission.action}
                            </span>
                          </td>
                          <td style={{ padding: '16px' }}>
                            <div style={{ fontSize: '12px', color: theme.textSecondary }}>
                              {formatDate(permission.created_at)}
                            </div>
                          </td>
                          <td style={{ padding: '16px' }}>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button
                                style={{ ...btnSecondary, padding: '0.375rem 0.75rem', fontSize: '12px' }}
                                onClick={() => handleEditPermission(permission)}
                              >
                                <Icon name="pencil" size="xs" />
                                Edit
                              </button>
                              <button
                                style={{ ...btnDanger, padding: '0.375rem 0.75rem', fontSize: '12px' }}
                                onClick={() => handleDeletePermission(permission)}
                              >
                                <Icon name="trash" size="xs" />
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {permissions.length === 0 && (
                  <div style={{ padding: '40px', textAlign: 'center', color: theme.textSecondary }}>
                    No permissions found.
                  </div>
                )}

                {/* Pagination */}
                {permissionsTotalPages > 1 && (
                  <div style={{ padding: '16px 20px', borderTop: '1px solid #e5e7eb', backgroundColor: '#f8fafc', display: 'flex', justifyContent: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        onClick={() => setPermissionsCurrentPage(Math.max(1, permissionsCurrentPage - 1))}
                        disabled={permissionsCurrentPage === 1}
                        style={{
                          padding: '8px 12px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          backgroundColor: permissionsCurrentPage === 1 ? '#f3f4f6' : '#fff',
                          color: permissionsCurrentPage === 1 ? '#9ca3af' : theme.textPrimary,
                          cursor: permissionsCurrentPage === 1 ? 'not-allowed' : 'pointer',
                          fontSize: '14px'
                        }}
                      >
                        Previous
                      </button>

                      <span style={{ fontSize: '14px', color: theme.textSecondary }}>
                        Page {permissionsCurrentPage} of {permissionsTotalPages}
                      </span>

                      <button
                        onClick={() => setPermissionsCurrentPage(Math.min(permissionsTotalPages, permissionsCurrentPage + 1))}
                        disabled={permissionsCurrentPage === permissionsTotalPages}
                        style={{
                          padding: '8px 12px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          backgroundColor: permissionsCurrentPage === permissionsTotalPages ? '#f3f4f6' : '#fff',
                          color: permissionsCurrentPage === permissionsTotalPages ? '#9ca3af' : theme.textPrimary,
                          cursor: permissionsCurrentPage === permissionsTotalPages ? 'not-allowed' : 'pointer',
                          fontSize: '14px'
                        }}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Modals */}
      <RoleFormModal
        isOpen={showRoleModal}
        onClose={() => setShowRoleModal(false)}
        role={editingRole}
        permissions={permissions}
        onSave={handleModalSave}
      />

      <PermissionFormModal
        isOpen={showPermissionModal}
        onClose={() => setShowPermissionModal(false)}
        permission={editingPermission}
        onSave={handleModalSave}
      />
    </div>
  );
};

export default RolePermissionManagement;