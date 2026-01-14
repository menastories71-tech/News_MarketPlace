import React, { useState, useEffect, useMemo } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import Icon from '../common/Icon';
import Sidebar from './Sidebar';
import ThemeFormModal from './ThemeFormModal';
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

const ThemeManagement = () => {
  const { admin, logout, hasRole, hasAnyRole, getRoleLevel } = useAdminAuth();

  // Check if user has permission to manage themes
  if (!hasAnyRole(['super_admin', 'content_manager'])) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: theme.backgroundSoft }}>
        <div style={{ textAlign: 'center' }}>
          <Icon name="shield-exclamation" size="lg" style={{ color: theme.danger, marginBottom: '16px' }} />
          <h2 style={{ color: theme.textPrimary, marginBottom: '8px' }}>Access Denied</h2>
          <p style={{ color: theme.textSecondary }}>You don't have permission to access theme management.</p>
          <p style={{ color: theme.textSecondary, fontSize: '14px', marginTop: '8px' }}>
            Required roles: Super Admin or Content Manager
          </p>
        </div>
      </div>
    );
  }

  const [themes, setThemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [platformFilter, setPlatformFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingTheme, setEditingTheme] = useState(null);
  const [selectedThemes, setSelectedThemes] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortField, setSortField] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [appliedFilters, setAppliedFilters] = useState([]);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectingTheme, setRejectingTheme] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState(null);

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
    { value: 'approved', label: 'Approved', color: theme.success },
    { value: 'rejected', label: 'Rejected', color: theme.danger }
  ];

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
    const fetchThemes = async () => {
      try {
        const response = await api.get('/themes/admin');
        setThemes(response.data.themes || []);
      } catch (error) {
        console.error('Error fetching themes:', error);
        if (error.response?.status === 401) {
          // Token expired or invalid, redirect to login
          localStorage.removeItem('adminAccessToken');
          window.location.href = '/admin/login';
        } else {
          alert('Failed to load themes. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchThemes();
  }, []);

  const handleFormSave = () => {
    fetchThemes();
  };

  const fetchThemes = async () => {
    try {
      const response = await api.get('/themes/admin');
      setThemes(response.data.themes || []);
    } catch (error) {
      console.error('Error fetching themes:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('adminAccessToken');
        window.location.href = '/admin/login';
      } else {
        alert('Failed to load themes. Please try again.');
      }
    }
  };

  // Filtered themes based on search and filters
  const filteredThemes = useMemo(() => {
    let filtered = themes;

    if (debouncedSearchTerm) {
      filtered = filtered.filter(theme =>
        theme.page_name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        theme.username.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        theme.platform.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      );
    }

    if (platformFilter) {
      filtered = filtered.filter(theme => theme.platform === platformFilter);
    }

    if (categoryFilter) {
      filtered = filtered.filter(theme => theme.category.toLowerCase().includes(categoryFilter.toLowerCase()));
    }

    if (locationFilter) {
      filtered = filtered.filter(theme => theme.location.toLowerCase().includes(locationFilter.toLowerCase()));
    }

    if (statusFilter) {
      filtered = filtered.filter(theme => theme.status === statusFilter);
    }

    return filtered;
  }, [themes, debouncedSearchTerm, platformFilter, categoryFilter, locationFilter, statusFilter]);

  // Update filtered themes when filters change
  useEffect(() => {
    setCurrentPage(1); // Reset to first page when filters change
  }, [debouncedSearchTerm, platformFilter, categoryFilter, locationFilter, statusFilter]);

  // Sorting logic
  const sortedThemes = useMemo(() => {
    return [...filteredThemes].sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (sortField === 'no_of_followers' || sortField === 'price_reel_without_tagging_collaboration') {
        aValue = parseFloat(aValue) || 0;
        bValue = parseFloat(bValue) || 0;
      } else if (sortField === 'created_at' || sortField === 'updated_at') {
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
  }, [filteredThemes, sortField, sortDirection]);

  // Pagination logic
  const paginatedThemes = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedThemes.slice(startIndex, startIndex + pageSize);
  }, [sortedThemes, currentPage, pageSize]);

  const totalPages = Math.ceil(sortedThemes.length / pageSize);

  const getStatusStyle = (status) => {
    const statusOption = statusOptions.find(opt => opt.value === status);
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

  const formatFollowers = (count) => {
    if (!count || count === 0) return 'N/A';
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
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
  const handleCreateTheme = () => {
    setEditingTheme(null);
    setShowFormModal(true);
  };

  const handleEditTheme = (theme) => {
    setEditingTheme(theme);
    setShowFormModal(true);
  };

  const handleSelectTheme = (themeId) => {
    setSelectedThemes(prev =>
      prev.includes(themeId)
        ? prev.filter(id => id !== themeId)
        : [...prev, themeId]
    );
  };

  const handleSelectAll = () => {
    if (selectedThemes.length === filteredThemes.length) {
      setSelectedThemes([]);
    } else {
      setSelectedThemes(filteredThemes.map(t => t.id));
    }
  };

  const handleBulkApprove = async () => {
    if (selectedThemes.length === 0) return;

    if (!window.confirm(`Are you sure you want to approve ${selectedThemes.length} themes?`)) return;

    try {
      setLoading(true);
      const response = await api.post('/themes/bulk/status', { ids: selectedThemes, status: 'approved' });

      if (response.data.message) {
        alert(response.data.message);
      } else {
        alert(`Approved ${selectedThemes.length} themes successfully`);
      }

      setSelectedThemes([]);
      fetchThemes();
    } catch (error) {
      console.error('Error bulk approving:', error);
      const errorMsg = error.response?.data?.error || error.response?.data?.message || 'Error approving themes';
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkReject = async () => {
    if (selectedThemes.length === 0) return;

    if (!window.confirm(`Are you sure you want to reject ${selectedThemes.length} themes?`)) return;

    try {
      setLoading(true);
      const response = await api.post('/themes/bulk/status', { ids: selectedThemes, status: 'rejected' });

      if (response.data.message) {
        alert(response.data.message);
      } else {
        alert(`Rejected ${selectedThemes.length} themes successfully`);
      }

      setSelectedThemes([]);
      fetchThemes();
    } catch (error) {
      console.error('Error bulk rejecting:', error);
      const errorMsg = error.response?.data?.error || error.response?.data?.message || 'Error rejecting themes';
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedThemes.length === 0) return;

    if (!window.confirm(`Are you sure you want to delete ${selectedThemes.length} themes?`)) return;

    try {
      setLoading(true);
      await api.delete('/themes/bulk', { data: { ids: selectedThemes } });
      setSelectedThemes([]);
      fetchThemes();
    } catch (error) {
      console.error('Error bulk deleting:', error);
      alert(error.response?.data?.message || 'Error deleting themes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await api.get('/themes/template', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'themes_template.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading template:', error);
      alert('Error downloading template');
    }
  };

  const handleBulkUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile) {
      alert('Please select a file');
      return;
    }

    const formData = new FormData();
    formData.append('file', uploadFile);

    try {
      setIsUploading(true);
      setUploadStatus(null);
      const response = await api.post('/themes/bulk-upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setUploadStatus({
        type: 'success',
        message: response.data.message,
        errors: response.data.errors
      });

      fetchThemes();

      if (!response.data.errors) {
        setTimeout(() => {
          setIsUploadModalOpen(false);
          setUploadFile(null);
          setUploadStatus(null);
        }, 2000);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setUploadStatus({
        type: 'error',
        message: error.response?.data?.error || 'Error uploading file'
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownloadCSV = async () => {
    try {
      const params = new URLSearchParams();
      if (debouncedSearchTerm) params.append('search', debouncedSearchTerm);
      if (platformFilter) params.append('platform', platformFilter);
      if (categoryFilter) params.append('category', categoryFilter);
      if (locationFilter) params.append('location', locationFilter);
      if (statusFilter) params.append('status', statusFilter);

      const response = await api.get(`/themes/export?${params.toString()}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `themes_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setIsDownloadModalOpen(false);
    } catch (error) {
      console.error('Error downloading CSV:', error);
      alert('Error downloading CSV');
    }
  };

  const handleApproveTheme = async (themeId) => {
    try {
      setLoading(true);
      await api.put(`/themes/admin/${themeId}/approve`);
      fetchThemes();
    } catch (error) {
      console.error('Error approving theme:', error);
      alert(error.response?.data?.message || 'Error approving theme. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRejectTheme = (theme) => {
    setRejectingTheme(theme);
    setRejectionReason('');
    setShowRejectModal(true);
  };

  const handleConfirmReject = async () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason.');
      return;
    }

    try {
      setLoading(true);
      await api.put(`/themes/admin/${rejectingTheme.id}/reject`, {
        rejection_reason: rejectionReason.trim()
      });
      setShowRejectModal(false);
      setRejectingTheme(null);
      setRejectionReason('');
      fetchThemes();
    } catch (error) {
      console.error('Error rejecting theme:', error);
      alert(error.response?.data?.message || 'Error rejecting theme. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTheme = async (themeId) => {
    if (!window.confirm('Are you sure you want to delete this theme?')) return;

    try {
      setLoading(true);
      await api.delete(`/themes/admin/${themeId}`);
      fetchThemes();
    } catch (error) {
      console.error('Error deleting theme:', error);
      alert('Error deleting theme. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Update applied filters
  useEffect(() => {
    const filters = [];
    if (debouncedSearchTerm) filters.push({ type: 'search', value: debouncedSearchTerm, label: `Search: "${debouncedSearchTerm}"` });
    if (platformFilter) filters.push({ type: 'platform', value: platformFilter, label: `Platform: ${platformFilter}` });
    if (categoryFilter) filters.push({ type: 'category', value: categoryFilter, label: `Category: ${categoryFilter}` });
    if (locationFilter) filters.push({ type: 'location', value: locationFilter, label: `Location: ${locationFilter}` });
    if (statusFilter) filters.push({ type: 'status', value: statusFilter, label: `Status: ${statusOptions.find(s => s.value === statusFilter)?.label || statusFilter}` });
    setAppliedFilters(filters);
  }, [debouncedSearchTerm, platformFilter, categoryFilter, locationFilter, statusFilter]);

  const removeFilter = (filterType) => {
    switch (filterType) {
      case 'search':
        setSearchTerm('');
        break;
      case 'platform':
        setPlatformFilter('');
        break;
      case 'category':
        setCategoryFilter('');
        break;
      case 'location':
        setLocationFilter('');
        break;
      case 'status':
        setStatusFilter('');
        break;
    }
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setPlatformFilter('');
    setCategoryFilter('');
    setLocationFilter('');
    setStatusFilter('');
  };

  const getThemeStats = () => {
    const total = themes.length;
    const approved = themes.filter(t => t.status === 'approved').length;
    const pending = themes.filter(t => t.status === 'pending').length;
    const rejected = themes.filter(t => t.status === 'rejected').length;
    const active = themes.filter(t => t.is_active).length;

    return { total, approved, pending, rejected, active };
  };

  const stats = getThemeStats();

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
                      <div style={{ display: 'grid', gridTemplateColumns: '50px 2fr 1fr 1fr 1fr 1fr 1fr', gap: '16px', alignItems: 'center' }}>
                        <div style={{ width: '20px', height: '20px', background: '#f3f4f6', borderRadius: '50%' }}></div>
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
                    <Icon name="sparkles" size="sm" style={{ color: '#1976D2' }} />
                  </div>
                  <h1 style={{ margin: 0, fontSize: 34, fontWeight: 800 }}>Theme Management</h1>
                </div>
                <p style={{ marginTop: 8, color: '#757575' }}>Manage social media themes and influencer profiles</p>
              </div>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setIsUploadModalOpen(true)}
                  style={{
                    backgroundColor: '#fff',
                    color: theme.primary,
                    border: `1px solid ${theme.primary}`,
                    padding: '0.625rem 1rem',
                    borderRadius: '0.5rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                  disabled={!hasAnyRole(['super_admin', 'content_manager'])}
                >
                  <Icon name="arrow-up-tray" size="sm" />
                  Bulk Upload
                </button>
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
                  Export CSV
                </button>
                <button
                  onClick={handleCreateTheme}
                  style={{ ...btnPrimary, fontSize: '14px', padding: '12px 20px' }}
                  disabled={!hasAnyRole(['super_admin', 'content_manager'])}
                >
                  <Icon name="plus" size="sm" style={{ color: '#fff', marginRight: 8 }} />
                  Add Theme
                </button>
              </div>
            </div>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
              {[
                { label: 'Total Themes', value: stats.total, icon: 'sparkles', bg: '#e6f0ff' },
                { label: 'Approved', value: stats.approved, icon: 'check-circle', bg: '#dcfce7' },
                { label: 'Pending', value: stats.pending, icon: 'clock', bg: '#fef3c7' },
                { label: 'Rejected', value: stats.rejected, icon: 'x-circle', bg: '#fee2e2' },
                { label: 'Active', value: stats.active, icon: 'eye', bg: '#e0f2fe' }
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
                    placeholder="Search themes by name, username, platform..."
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
                  value={platformFilter}
                  onChange={(e) => setPlatformFilter(e.target.value)}
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
                  <option value="">All Platforms</option>
                  <option value="Instagram">Instagram</option>
                  <option value="Facebook">Facebook</option>
                  <option value="Twitter">Twitter</option>
                  <option value="TikTok">TikTok</option>
                  <option value="YouTube">YouTube</option>
                  <option value="LinkedIn">LinkedIn</option>
                  <option value="Other">Other</option>
                </select>

                <input
                  type="text"
                  placeholder="Filter by category"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '6px',
                    fontSize: '14px',
                    minWidth: '150px'
                  }}
                />

                <input
                  type="text"
                  placeholder="Filter by location"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '6px',
                    fontSize: '14px',
                    minWidth: '150px'
                  }}
                />

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
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>

                <button
                  onClick={clearAllFilters}
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

              {/* Applied Filters Tags */}
              {appliedFilters.length > 0 && (
                <div style={{ marginTop: '16px', display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: theme.textSecondary, fontWeight: '500' }}>
                    Active filters:
                  </span>
                  {appliedFilters.map((filter, index) => (
                    <span key={index} style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '4px 8px',
                      backgroundColor: '#e0f2fd',
                      color: theme.primary,
                      borderRadius: '16px',
                      fontSize: '12px',
                      fontWeight: '500',
                      cursor: 'pointer'
                    }}
                      onClick={() => removeFilter(filter.type)}
                    >
                      {filter.label}
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </span>
                  ))}
                </div>
              )}

              {/* Search Results Summary */}
              <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div style={{ fontSize: '14px', color: theme.textSecondary }}>
                  {debouncedSearchTerm ? (
                    <>
                      <span style={{ color: theme.primary, fontWeight: '600' }}>Search:</span> Found <strong>{sortedThemes.length}</strong> themes
                    </>
                  ) : (
                    <>
                      Showing <strong>{paginatedThemes.length}</strong> of <strong>{sortedThemes.length}</strong> themes
                      {sortedThemes.length !== themes.length && (
                        <span> (filtered from {themes.length} total)</span>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Bulk Actions Bar */}
            {selectedThemes.length > 0 && (
              <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '16px', marginBottom: '24px', boxShadow: '0 8px 20px rgba(2,6,23,0.06)', border: '1px solid #e0e0e0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                  <div style={{ fontSize: '14px', color: '#212121' }}>
                    {selectedThemes.length} theme{selectedThemes.length !== 1 ? 's' : ''} selected
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    <button
                      onClick={handleBulkApprove}
                      style={{
                        padding: '8px 12px',
                        backgroundColor: theme.success,
                        color: '#fff',
                        borderRadius: '6px',
                        fontWeight: 600,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.25rem',
                        cursor: 'pointer',
                        border: 'none',
                        boxShadow: '0 4px 12px rgba(76,175,80,0.14)',
                        fontSize: '13px',
                        whiteSpace: 'nowrap',
                        flexShrink: 0
                      }}
                      disabled={!hasRole('super_admin')}
                    >
                      <Icon name="check" size="sm" style={{ color: '#fff' }} />
                      Approve ({selectedThemes.length})
                    </button>
                    <button
                      onClick={handleBulkReject}
                      style={{
                        padding: '8px 12px',
                        backgroundColor: theme.warning,
                        color: '#fff',
                        borderRadius: '6px',
                        fontWeight: 600,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.25rem',
                        cursor: 'pointer',
                        border: 'none',
                        boxShadow: '0 4px 12px rgba(255,152,0,0.14)',
                        fontSize: '13px',
                        whiteSpace: 'nowrap',
                        flexShrink: 0
                      }}
                      disabled={!hasRole('super_admin')}
                    >
                      <Icon name="x" size="sm" style={{ color: '#fff' }} />
                      Reject ({selectedThemes.length})
                    </button>
                    <button
                      onClick={handleBulkDelete}
                      style={{
                        padding: '8px 12px',
                        backgroundColor: theme.danger,
                        color: '#fff',
                        borderRadius: '6px',
                        fontWeight: 600,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.25rem',
                        cursor: 'pointer',
                        border: 'none',
                        boxShadow: '0 4px 12px rgba(244,67,54,0.14)',
                        fontSize: '13px',
                        whiteSpace: 'nowrap',
                        flexShrink: 0
                      }}
                      disabled={!hasRole('super_admin')}
                    >
                      <Icon name="trash" size="sm" style={{ color: '#fff' }} />
                      Delete ({selectedThemes.length})
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Themes Table */}
            <div style={{ backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 8px 20px rgba(2,6,23,0.06)', overflow: 'hidden' }}>
              {/* Table Controls */}
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb', backgroundColor: '#f8fafc' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: theme.textPrimary }}>
                      {selectedThemes.length > 0 ? `${selectedThemes.length} selected` : 'Select themes'}
                    </span>
                    {selectedThemes.length > 0 && (
                      <button
                        onClick={() => setSelectedThemes([])}
                        style={{
                          padding: '4px 8px',
                          backgroundColor: '#e5e7eb',
                          color: theme.textPrimary,
                          border: 'none',
                          borderRadius: '4px',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        Clear
                      </button>
                    )}
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

              <div style={{ overflowX: 'auto', maxHeight: paginatedThemes.length > 50 ? '600px' : 'auto', overflowY: paginatedThemes.length > 50 ? 'auto' : 'visible' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                      <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', fontSize: '12px', color: theme.textPrimary, textTransform: 'uppercase', letterSpacing: '0.5px', width: '50px' }}>
                        <input
                          type="checkbox"
                          checked={paginatedThemes.length > 0 && selectedThemes.length === paginatedThemes.length}
                          onChange={handleSelectAll}
                          style={{ transform: 'scale(1.2)', cursor: 'pointer' }}
                        />
                      </th>
                      <th
                        style={{ padding: '16px', textAlign: 'left', fontWeight: '700', fontSize: '12px', color: theme.textPrimary, textTransform: 'uppercase', letterSpacing: '0.5px', cursor: 'pointer' }}
                        onClick={() => handleSort('page_name')}
                      >
                        Theme {getSortIcon('page_name')}
                      </th>
                      <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', fontSize: '12px', color: theme.textPrimary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Platform
                      </th>
                      <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', fontSize: '12px', color: theme.textPrimary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Followers
                      </th>
                      <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', fontSize: '12px', color: theme.textPrimary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Category & Location
                      </th>
                      <th
                        style={{ padding: '16px', textAlign: 'left', fontWeight: '700', fontSize: '12px', color: theme.textPrimary, textTransform: 'uppercase', letterSpacing: '0.5px', cursor: 'pointer' }}
                        onClick={() => handleSort('price_reel_without_tagging_collaboration')}
                      >
                        Base Price {getSortIcon('price_reel_without_tagging_collaboration')}
                      </th>
                      <th
                        style={{ padding: '16px', textAlign: 'left', fontWeight: '700', fontSize: '12px', color: theme.textPrimary, textTransform: 'uppercase', letterSpacing: '0.5px', cursor: 'pointer' }}
                        onClick={() => handleSort('status')}
                      >
                        Status {getSortIcon('status')}
                      </th>
                      <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', fontSize: '12px', color: theme.textPrimary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedThemes.length === 0 ? (
                      <tr>
                        <td colSpan="8" style={{ padding: '40px', textAlign: 'center', color: theme.textSecondary }}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                            <Icon name="sparkles" size="lg" style={{ color: theme.textDisabled }} />
                            <div>No themes found matching your criteria.</div>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      paginatedThemes.map((theme, index) => (
                        <tr key={theme.id} style={{
                          borderBottom: '1px solid #f1f5f9',
                          backgroundColor: selectedThemes.includes(theme.id) ? '#e0f2fe' : (index % 2 === 0 ? '#ffffff' : '#fafbfc'),
                          transition: 'all 0.2s'
                        }}
                          onMouseEnter={(e) => {
                            if (!selectedThemes.includes(theme.id)) {
                              e.target.closest('tr').style.backgroundColor = '#f1f5f9';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!selectedThemes.includes(theme.id)) {
                              e.target.closest('tr').style.backgroundColor = index % 2 === 0 ? '#ffffff' : '#fafbfc';
                            }
                          }}
                        >
                          <td style={{ padding: '16px' }}>
                            <input
                              type="checkbox"
                              checked={selectedThemes.includes(theme.id)}
                              onChange={() => handleSelectTheme(theme.id)}
                              style={{ transform: 'scale(1.1)', cursor: 'pointer' }}
                            />
                          </td>
                          <td style={{ padding: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                backgroundColor: '#f3f4f6',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                border: '2px solid #e5e7eb'
                              }}>
                                <span style={{ fontSize: '16px', color: theme.textSecondary, fontWeight: '600' }}>
                                  {theme.page_name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <div style={{ fontWeight: '600', fontSize: '14px', color: theme.textPrimary, marginBottom: '4px' }}>
                                  {theme.page_name}
                                </div>
                                <div style={{ fontSize: '12px', color: theme.primary, fontWeight: '500', marginBottom: '2px' }}>
                                  @{theme.username}
                                </div>
                                <div style={{ fontSize: '11px', color: theme.textSecondary }}>
                                  ID: {theme.id}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '16px', fontSize: '14px', color: theme.textPrimary }}>
                            <span style={{
                              padding: '4px 8px',
                              backgroundColor: theme.primaryLight,
                              color: theme.primary,
                              borderRadius: '12px',
                              fontSize: '11px',
                              fontWeight: '600'
                            }}>
                              {theme.platform}
                            </span>
                          </td>
                          <td style={{ padding: '16px', fontSize: '14px', color: theme.textPrimary }}>
                            {formatFollowers(theme.no_of_followers)}
                          </td>
                          <td style={{ padding: '16px' }}>
                            <div>
                              <div style={{ fontSize: '13px', color: theme.textPrimary, fontWeight: '500', marginBottom: '2px' }}>
                                {theme.category || 'N/A'}
                              </div>
                              <div style={{ fontSize: '12px', color: theme.textSecondary }}>
                                {theme.location || 'N/A'}
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '16px' }}>
                            <div style={{ fontSize: '16px', fontWeight: '700', color: theme.success }}>
                              ${theme.price_reel_without_tagging_collaboration || 0}
                            </div>
                          </td>
                          <td style={{ padding: '16px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              <span style={getStatusStyle(theme.status)}>
                                {statusOptions.find(opt => opt.value === theme.status)?.label || theme.status}
                              </span>
                              {theme.status === 'pending' && hasAnyRole(['super_admin', 'content_manager']) && (
                                <div style={{ display: 'flex', gap: '4px' }}>
                                  <button
                                    onClick={() => handleApproveTheme(theme.id)}
                                    style={{
                                      padding: '4px 8px',
                                      backgroundColor: '#4CAF50',
                                      color: '#fff',
                                      border: 'none',
                                      borderRadius: '4px',
                                      fontSize: '11px',
                                      cursor: 'pointer',
                                      fontWeight: '600'
                                    }}
                                    title="Approve theme"
                                  >
                                    ✓ Approve
                                  </button>
                                  <button
                                    onClick={() => handleRejectTheme(theme)}
                                    style={{
                                      padding: '4px 8px',
                                      backgroundColor: '#F44336',
                                      color: '#fff',
                                      border: 'none',
                                      borderRadius: '4px',
                                      fontSize: '11px',
                                      cursor: 'pointer',
                                      fontWeight: '600'
                                    }}
                                    title="Reject theme"
                                  >
                                    ✗ Reject
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                          <td style={{ padding: '16px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              <button
                                onClick={() => handleEditTheme(theme)}
                                style={{
                                  padding: '6px 10px',
                                  backgroundColor: theme.primary,
                                  color: '#fff',
                                  border: 'none',
                                  borderRadius: '4px',
                                  fontSize: '12px',
                                  cursor: hasRole('super_admin') ? 'pointer' : 'not-allowed',
                                  fontWeight: '600',
                                  opacity: hasRole('super_admin') ? 1 : 0.5,
                                  transition: 'all 0.2s'
                                }}
                                disabled={!hasRole('super_admin')}
                                onMouseEnter={(e) => {
                                  if (hasRole('super_admin')) {
                                    e.target.style.backgroundColor = theme.primaryDark;
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (hasRole('super_admin')) {
                                    e.target.style.backgroundColor = theme.primary;
                                  }
                                }}
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteTheme(theme.id)}
                                style={{
                                  padding: '6px 10px',
                                  backgroundColor: '#dc2626',
                                  color: '#fff',
                                  border: 'none',
                                  borderRadius: '4px',
                                  fontSize: '12px',
                                  cursor: 'pointer',
                                  fontWeight: '600',
                                  transition: 'background-color 0.2s'
                                }}
                                disabled={!hasRole('super_admin')}
                                onMouseEnter={(e) => e.target.style.backgroundColor = '#b91c1c'}
                                onMouseLeave={(e) => e.target.style.backgroundColor = '#dc2626'}
                              >
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

      {/* Theme Form Modal */}
      <ThemeFormModal
        isOpen={showFormModal}
        onClose={() => setShowFormModal(false)}
        theme={editingTheme}
        onSave={handleFormSave}
      />

      {/* Rejection Reason Modal */}
      {showRejectModal && rejectingTheme && (
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
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '500px',
            width: '100%',
            boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
          }}>
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '600', color: theme.textPrimary }}>
                Reject Theme
              </h3>
              <p style={{ margin: 0, color: theme.textSecondary, fontSize: '14px' }}>
                Please provide a reason for rejecting "{rejectingTheme.page_name}".
              </p>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: theme.textPrimary,
                marginBottom: '8px'
              }}>
                Rejection Reason *
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Please explain why this theme is being rejected..."
                style={{
                  width: '100%',
                  minHeight: '100px',
                  padding: '12px',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = theme.primary}
                onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectingTheme(null);
                  setRejectionReason('');
                }}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#f3f4f6',
                  color: theme.textPrimary,
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                disabled={!rejectionReason.trim() || loading}
                style={{
                  padding: '10px 20px',
                  backgroundColor: theme.danger,
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  cursor: rejectionReason.trim() && !loading ? 'pointer' : 'not-allowed',
                  fontWeight: '500',
                  opacity: rejectionReason.trim() && !loading ? 1 : 0.5
                }}
              >
                {loading ? 'Rejecting...' : 'Reject Theme'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeManagement;