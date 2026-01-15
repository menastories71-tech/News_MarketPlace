import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import Icon from '../common/Icon';
import Sidebar from './Sidebar';
import api from '../../services/api';

// Powerlist Nomination Form Modal Component
const PowerlistNominationFormModal = ({ isOpen, onClose, nomination, onSave }) => {
  const [formData, setFormData] = useState({
    publication_name: '',
    website_url: '',
    power_list_name: '',
    industry: '',
    company_or_individual: '',
    tentative_month: '',
    location_region: '',
    last_power_list_url: '',
    image: null,
    status: 'pending',
    is_active: true
  });

  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  // Industry options
  const industryOptions = [
    'Technology', 'Healthcare', 'Finance', 'Education', 'Media & Entertainment',
    'Retail & E-commerce', 'Manufacturing', 'Real Estate', 'Legal', 'Consulting',
    'Non-profit', 'Government', 'Energy', 'Transportation', 'Food & Beverage',
    'Fashion', 'Sports', 'Travel & Tourism', 'Agriculture', 'Other'
  ];

  // Company or Individual options
  const companyOrIndividualOptions = [
    'Company',
    'Individual',
    'Organization',
    'Institution',
    'Other'
  ];

  // Tentative Month options
  const monthOptions = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Status options
  const statusOptions = [
    { value: 'pending', label: 'Pending', color: '#FF9800' },
    { value: 'approved', label: 'Approved', color: '#4CAF50' },
    { value: 'rejected', label: 'Rejected', color: '#F44336' }
  ];

  useEffect(() => {
    if (nomination) {
      setFormData({
        publication_name: nomination.publication_name || '',
        website_url: nomination.website_url || '',
        power_list_name: nomination.power_list_name || '',
        industry: nomination.industry || '',
        company_or_individual: nomination.company_or_individual || '',
        tentative_month: nomination.tentative_month || '',
        location_region: nomination.location_region || '',
        last_power_list_url: nomination.last_power_list_url || '',
        image: nomination.image || null,
        status: nomination.status || 'pending',
        is_active: nomination.is_active !== undefined ? nomination.is_active : true
      });
      setImagePreview(nomination.image || null);
    } else {
      setFormData({
        publication_name: '',
        website_url: '',
        power_list_name: '',
        industry: '',
        company_or_individual: '',
        tentative_month: '',
        location_region: '',
        last_power_list_url: '',
        image: null,
        status: 'pending',
        is_active: true
      });
      setImagePreview(null);
    }
  }, [nomination, isOpen]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });

      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submissionData = new FormData();

      // Add all form fields to FormData (excluding image first)
      Object.keys(formData).forEach(key => {
        if (key !== 'image' && formData[key] !== null && formData[key] !== '') {
          submissionData.append(key, formData[key]);
        }
      });

      // Add image if provided
      if (formData.image instanceof File) {
        submissionData.append('image', formData.image);
      }

      if (nomination) {
        await api.put(`/powerlist-nominations/${nomination.id}`, submissionData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      } else {
        await api.post('/powerlist-nominations', submissionData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      }

      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving powerlist nomination:', error);

      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Error saving powerlist nomination. Please try again.';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

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
    maxWidth: '900px',
    width: '100%',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
  };

  const formGroupStyle = {
    marginBottom: '16px'
  };

  const labelStyle = {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: '#212121',
    marginBottom: '6px'
  };

  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    boxSizing: 'border-box'
  };

  const selectStyle = {
    ...inputStyle,
    backgroundColor: '#fff'
  };

  const textareaStyle = {
    ...inputStyle,
    minHeight: '80px',
    resize: 'vertical'
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
            {nomination ? 'Edit Powerlist Nomination' : 'Create Powerlist Nomination'}
          </h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', fontSize: '24px', cursor: 'pointer' }}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
            {/* Required Fields */}
            <div style={formGroupStyle}>
              <label style={labelStyle}>Publication Name *</label>
              <input
                type="text"
                value={formData.publication_name}
                onChange={(e) => setFormData({ ...formData, publication_name: e.target.value })}
                style={inputStyle}
                required
                placeholder="Enter publication name"
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Power List Name *</label>
              <input
                type="text"
                value={formData.power_list_name}
                onChange={(e) => setFormData({ ...formData, power_list_name: e.target.value })}
                style={inputStyle}
                required
                placeholder="Enter power list name"
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Industry *</label>
              <select
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                style={selectStyle}
                required
              >
                <option value="">Select Industry</option>
                {industryOptions.map(industry => (
                  <option key={industry} value={industry}>{industry}</option>
                ))}
              </select>
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Company or Individual *</label>
              <select
                value={formData.company_or_individual}
                onChange={(e) => setFormData({ ...formData, company_or_individual: e.target.value })}
                style={selectStyle}
                required
              >
                <option value="">Select Type</option>
                {companyOrIndividualOptions.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Optional Fields */}
            <div style={formGroupStyle}>
              <label style={labelStyle}>Website URL</label>
              <input
                type="url"
                value={formData.website_url}
                onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                style={inputStyle}
                placeholder="https://example.com"
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Tentative Month</label>
              <select
                value={formData.tentative_month}
                onChange={(e) => setFormData({ ...formData, tentative_month: e.target.value })}
                style={selectStyle}
              >
                <option value="">Select Month</option>
                {monthOptions.map(month => (
                  <option key={month} value={month}>{month}</option>
                ))}
              </select>
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Location Region</label>
              <input
                type="text"
                value={formData.location_region}
                onChange={(e) => setFormData({ ...formData, location_region: e.target.value })}
                style={inputStyle}
                placeholder="Enter location or region"
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Last Power List URL</label>
              <input
                type="url"
                value={formData.last_power_list_url}
                onChange={(e) => setFormData({ ...formData, last_power_list_url: e.target.value })}
                style={inputStyle}
                placeholder="https://example.com/powerlist"
              />
            </div>

            {/* Status Field */}
            <div style={formGroupStyle}>
              <label style={labelStyle}>Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                style={selectStyle}
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            {/* Active Status */}
            <div style={formGroupStyle}>
              <label style={labelStyle}>Is Active</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  style={{ transform: 'scale(1.2)' }}
                />
                <span style={{ fontSize: '14px', color: '#212121' }}>
                  Active (visible in listings)
                </span>
              </div>
            </div>
          </div>

          {/* Image Upload */}
          <div style={formGroupStyle}>
            <label style={labelStyle}>Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ ...inputStyle, padding: '8px' }}
            />
            {imagePreview && (
              <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <img
                  src={imagePreview}
                  alt="Preview"
                  style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e0e0e0' }}
                />
                <span style={{ fontSize: '12px', color: '#666' }}>Image preview</span>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '32px', gap: '12px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{ ...buttonStyle, backgroundColor: '#f3f4f6', color: '#374151' }}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{ ...buttonStyle, backgroundColor: '#1976D2', color: '#fff' }}
              disabled={loading}
            >
              {loading ? 'Saving...' : (nomination ? 'Update Nomination' : 'Create Nomination')}
            </button>
          </div>
        </form>
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
  roleColors: {
    super_admin: { bg: '#E0F2F1', color: '#004D40' }, // Using secondary colors
    content_manager: { bg: '#E3F2FD', color: '#0D47A1' }, // Using primary colors
    editor: { bg: '#FAFAFA', color: '#212121' }, // Using neutral colors
    registered_user: { bg: '#F5F5F5', color: '#757575' }, // Using neutral colors
    agency: { bg: '#E0F2F1', color: '#00796B' }, // Using secondary colors
    other: { bg: '#FAFAFA', color: '#757575' } // Using neutral colors
  }
};

const PowerlistManagement = () => {
  const { admin, logout, hasRole, hasAnyRole } = useAdminAuth();

  // Check if user has permission to manage powerlist nominations
  if (!hasAnyRole(['super_admin', 'content_manager'])) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: theme.backgroundSoft }}>
        <div style={{ textAlign: 'center' }}>
          <Icon name="shield-exclamation" size="lg" style={{ color: theme.danger, marginBottom: '16px' }} />
          <h2 style={{ color: theme.textPrimary, marginBottom: '8px' }}>Access Denied</h2>
          <p style={{ color: theme.textSecondary }}>You don't have permission to access powerlist nomination management.</p>
          <p style={{ color: theme.textSecondary, fontSize: '14px', marginTop: '8px' }}>
            Required roles: Super Admin or Content Manager
          </p>
        </div>
      </div>
    );
  }

  const [nominations, setNominations] = useState([]);
  const [totalNominations, setTotalNominations] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingNomination, setEditingNomination] = useState(null);
  const [selectedNominations, setSelectedNominations] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [sortField, setSortField] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    industry: '',
    company_or_individual: '',
    location_region: '',
    is_active: ''
  });
  const fileInputRef = React.useRef(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState(null);

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
    const fetchData = async () => {
      try {
        await fetchNominations();
      } catch (error) {
        console.error('Error fetching data:', error);
        // If unauthorized, the API interceptor will handle redirect
      }
    };

    fetchData();
  }, [currentPage, pageSize, debouncedSearchTerm, sortField, sortDirection, filters]);

  const fetchNominations = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: pageSize.toString(),
        ...(debouncedSearchTerm && { publication_name: debouncedSearchTerm, power_list_name: debouncedSearchTerm }),
        ...(filters.status && { status: filters.status }),
        ...(filters.industry && { industry: filters.industry }),
        ...(filters.company_or_individual && { company_or_individual: filters.company_or_individual }),
        ...(filters.location_region && { location_region: filters.location_region }),
        ...(filters.is_active !== '' && { is_active: filters.is_active })
      });

      const response = await api.get(`/powerlist-nominations?${params}`);

      if (response.data.nominations && response.data.pagination) {
        setNominations(response.data.nominations);
        setTotalNominations(response.data.pagination.total);
      } else if (Array.isArray(response.data.nominations)) {
        setNominations(response.data.nominations);
        setTotalNominations(response.data.nominations.length);
      } else if (Array.isArray(response.data)) {
        setNominations(response.data);
        setTotalNominations(response.data.length);
      } else {
        setNominations([]);
        setTotalNominations(0);
      }
    } catch (error) {
      console.error('Error fetching nominations:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('adminAccessToken');
        window.location.href = '/admin/login';
        return;
      }
      alert('Failed to load nominations. Please try again.');
      setNominations([]);
      setTotalNominations(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, debouncedSearchTerm, filters]);

  const totalPages = Math.ceil(totalNominations / pageSize);

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
  const handleCreateNomination = () => {
    setEditingNomination(null);
    setShowFormModal(true);
  };

  const handleEditNomination = (nomination) => {
    setEditingNomination(nomination);
    setShowFormModal(true);
  };

  const handleDeleteNomination = async (nominationId) => {
    if (!window.confirm('Are you sure you want to delete this nomination?')) return;

    try {
      await api.delete(`/powerlist-nominations/${nominationId}`);
      fetchNominations();
    } catch (error) {
      console.error('Error deleting nomination:', error);
      alert('Error deleting nomination. Please try again.');
    }
  };

  const handleStatusChange = async (nominationId, newStatus) => {
    try {
      await api.put(`/powerlist-nominations/${nominationId}/status`, { status: newStatus });
      fetchNominations();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Error updating status. Please try again.');
    }
  };

  const handleFormSave = () => {
    fetchNominations();
  };

  // Bulk operations
  const handleSelectNomination = (nominationId) => {
    setSelectedNominations(prev =>
      prev.includes(nominationId)
        ? prev.filter(id => id !== nominationId)
        : [...prev, nominationId]
    );
  };

  const handleSelectAll = () => {
    if (selectedNominations.length === nominations.length && nominations.length > 0) {
      setSelectedNominations([]);
    } else {
      setSelectedNominations(nominations.map(n => n.id));
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedNominations.length} nominations?`)) return;

    try {
      for (const nominationId of selectedNominations) {
        await api.delete(`/powerlist-nominations/${nominationId}`);
      }
      setSelectedNominations([]);
      fetchNominations();
    } catch (error) {
      console.error('Error bulk deleting:', error);
      alert('Error deleting nominations. Please try again.');
    }
  };

  const handleBulkStatusChange = async (newStatus) => {
    try {
      for (const nominationId of selectedNominations) {
        await api.put(`/powerlist-nominations/${nominationId}/status`, { status: newStatus });
      }
      setSelectedNominations([]);
      fetchNominations();
    } catch (error) {
      console.error('Error bulk updating status:', error);
      alert('Error updating nominations. Please try again.');
    }
  };

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Handler functions for bulk operations
  const handleDownloadTemplate = async () => {
    try {
      const response = await api.get('/powerlist-nominations/template', {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'powerlist_nominations_template.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading template:', error);
      alert('Failed to download template.');
    }
  };

  const handleDownloadCSV = async () => {
    try {
      const response = await api.get('/powerlist-nominations/export-csv', {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'powerlist_nominations_export.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading CSV:', error);
      alert('Failed to download CSV.');
    }
  };

  const handleBulkUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      const response = await api.post('/powerlist-nominations/bulk-upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setMessage({
        type: 'success',
        text: response.data.message,
        errors: response.data.errors
      });
      fetchNominations();
    } catch (error) {
      console.error('Error uploading file:', error);
      setMessage({
        type: 'error',
        text: error.response?.data?.error || 'Failed to upload file.',
        errors: error.response?.data?.errors
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
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
                    <Icon name="trophy" size="sm" style={{ color: '#1976D2' }} />
                  </div>
                  <h1 style={{ margin: 0, fontSize: 34, fontWeight: 800 }}>Powerlist Nomination Management</h1>
                </div>
                <p style={{ marginTop: 8, color: '#757575' }}>Manage powerlist nominations and their approval status</p>
              </div>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleBulkUpload}
                  style={{ display: 'none' }}
                  accept=".csv"
                />

                <button
                  onClick={handleDownloadTemplate}
                  style={{ ...btnPrimary, backgroundColor: theme.secondary, fontSize: '14px', padding: '12px 20px' }}
                >
                  <Icon name="arrow-down-tray" size="sm" style={{ color: '#fff', marginRight: 8 }} />
                  Download Template
                </button>
                <button
                  onClick={handleDownloadCSV}
                  style={{ ...btnPrimary, backgroundColor: theme.secondaryDark, fontSize: '14px', padding: '12px 20px' }}
                >
                  <Icon name="document-arrow-down" size="sm" style={{ color: '#fff', marginRight: 8 }} />
                  Download CSV
                </button>
                <button
                  onClick={() => fileInputRef.current.click()}
                  style={{ ...btnPrimary, backgroundColor: theme.info, fontSize: '14px', padding: '12px 20px' }}
                  disabled={uploading}
                >
                  <Icon name="cloud-arrow-up" size="sm" style={{ color: '#fff', marginRight: 8 }} />
                  {uploading ? 'Uploading...' : 'Bulk Upload'}
                </button>
                <button
                  onClick={handleCreateNomination}
                  style={{ ...btnPrimary, fontSize: '14px', padding: '12px 20px' }}
                  disabled={!hasAnyRole(['super_admin', 'content_manager'])}
                >
                  <Icon name="plus" size="sm" style={{ color: '#fff', marginRight: 8 }} />
                  Add Nomination
                </button>
              </div>
            </div>

            {/* Bulk Actions Bar */}
            {selectedNominations.length > 0 && (
              <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '16px', marginBottom: '24px', boxShadow: '0 8px 20px rgba(2,6,23,0.06)', border: '1px solid #e0e0e0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                  <div style={{ fontSize: '14px', color: '#212121' }}>
                    {selectedNominations.length} nomination{selectedNominations.length !== 1 ? 's' : ''} selected
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          if (e.target.value === 'delete_bulk') {
                            handleBulkDelete();
                          } else {
                            handleBulkStatusChange(e.target.value);
                          }
                          e.target.value = '';
                        }
                      }}
                      style={{ padding: '6px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
                      disabled={!hasAnyRole(['super_admin', 'content_manager'])}
                    >
                      <option value="">Bulk Actions</option>
                      <option value="approved">Set Approved</option>
                      <option value="rejected">Set Rejected</option>
                      <option value="pending">Set Pending</option>
                      <option value="delete_bulk">Delete Selected</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Search Bar */}
            <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', marginBottom: '16px', boxShadow: '0 8px 20px rgba(2,6,23,0.06)' }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '300px' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={theme.textSecondary} strokeWidth="2" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}>
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.35-4.35"></path>
                  </svg>
                  <input
                    type="text"
                    placeholder="Search nominations by publication name, power list name..."
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

              {/* Search Results Summary */}
              <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div style={{ fontSize: '14px', color: theme.textSecondary }}>
                  {debouncedSearchTerm ? (
                    <>
                      <span style={{ color: theme.primary, fontWeight: '600' }}>Search:</span> Found <strong>{totalNominations}</strong> nominations matching "{debouncedSearchTerm}"
                    </>
                  ) : (
                    <>
                      Showing <strong>{nominations.length}</strong> of <strong>{totalNominations}</strong> nominations
                      {currentPage > 1 && (
                        <span> (Page {currentPage} of {totalPages})</span>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Nominations Table */}
            <div style={{ backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 8px 20px rgba(2,6,23,0.06)', overflow: 'hidden' }}>
              {/* Table Controls */}
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb', backgroundColor: '#f8fafc' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: theme.textPrimary }}>
                      {selectedNominations.length > 0 ? `${selectedNominations.length} selected` : 'Select nominations'}
                    </span>
                    {selectedNominations.length > 0 && (
                      <button
                        onClick={() => setSelectedNominations([])}
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

              <div style={{ overflowX: 'auto', maxHeight: nominations.length > 50 ? '600px' : 'auto', overflowY: nominations.length > 50 ? 'auto' : 'visible' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                      <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', fontSize: '12px', color: theme.textPrimary, textTransform: 'uppercase', letterSpacing: '0.5px', width: '50px' }}>
                        <input
                          type="checkbox"
                          checked={nominations.length > 0 && selectedNominations.length === nominations.length}
                          onChange={handleSelectAll}
                          style={{ transform: 'scale(1.2)', cursor: 'pointer' }}
                        />
                      </th>
                      <th
                        style={{ padding: '16px', textAlign: 'left', fontWeight: '700', fontSize: '12px', color: theme.textPrimary, textTransform: 'uppercase', letterSpacing: '0.5px', cursor: 'pointer' }}
                        onClick={() => handleSort('publication_name')}
                      >
                        Publication {getSortIcon('publication_name')}
                      </th>
                      <th
                        style={{ padding: '16px', textAlign: 'left', fontWeight: '700', fontSize: '12px', color: theme.textPrimary, textTransform: 'uppercase', letterSpacing: '0.5px', cursor: 'pointer' }}
                        onClick={() => handleSort('power_list_name')}
                      >
                        Power List {getSortIcon('power_list_name')}
                      </th>
                      <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', fontSize: '12px', color: theme.textPrimary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Industry
                      </th>
                      <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', fontSize: '12px', color: theme.textPrimary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Company/Individual
                      </th>
                      <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', fontSize: '12px', color: theme.textPrimary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Location
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
                    {nominations.map((nomination, index) => (
                      <tr key={nomination.id} style={{
                        borderBottom: '1px solid #f1f5f9',
                        backgroundColor: selectedNominations.includes(nomination.id) ? '#e0f2fe' : (index % 2 === 0 ? '#ffffff' : '#fafbfc'),
                        transition: 'all 0.2s'
                      }}
                        onMouseEnter={(e) => {
                          if (!selectedNominations.includes(nomination.id)) {
                            e.target.closest('tr').style.backgroundColor = '#f1f5f9';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!selectedNominations.includes(nomination.id)) {
                            e.target.closest('tr').style.backgroundColor = index % 2 === 0 ? '#ffffff' : '#fafbfc';
                          }
                        }}
                      >
                        <td style={{ padding: '16px' }}>
                          <input
                            type="checkbox"
                            checked={selectedNominations.includes(nomination.id)}
                            onChange={() => handleSelectNomination(nomination.id)}
                            style={{ transform: 'scale(1.1)', cursor: 'pointer' }}
                          />
                        </td>
                        <td style={{ padding: '16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '50%',
                              backgroundColor: nomination.image ? 'transparent' : '#f3f4f6',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                              border: '2px solid #e5e7eb',
                              overflow: 'hidden'
                            }}>
                              {nomination.image ? (
                                <img
                                  src={nomination.image}
                                  alt={nomination.publication_name}
                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                              ) : (
                                <span style={{ fontSize: '16px', color: theme.textSecondary, fontWeight: '600' }}>
                                  {nomination.publication_name.charAt(0).toUpperCase()}
                                </span>
                              )}
                            </div>
                            <div>
                              <div style={{ fontWeight: '600', fontSize: '14px', color: theme.textPrimary, marginBottom: '4px' }}>
                                {nomination.publication_name}
                              </div>
                              {nomination.website_url && (
                                <a
                                  href={nomination.website_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{ color: theme.primary, textDecoration: 'none', fontSize: '12px' }}
                                >
                                  🌐 Website
                                </a>
                              )}
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <div style={{ fontSize: '14px', color: theme.textPrimary, fontWeight: '500' }}>
                            {nomination.power_list_name}
                          </div>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <div style={{ fontSize: '13px', color: theme.textPrimary, fontWeight: '500' }}>
                            {nomination.industry}
                          </div>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <div style={{ fontSize: '13px', color: theme.textPrimary, fontWeight: '500' }}>
                            {nomination.company_or_individual}
                          </div>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <div style={{ fontSize: '13px', color: theme.textPrimary, fontWeight: '500' }}>
                            {nomination.location_region || '-'}
                          </div>
                          {nomination.tentative_month && (
                            <div style={{ fontSize: '11px', color: theme.textSecondary }}>
                              {nomination.tentative_month}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '16px' }}>
                          <span style={getStatusStyle(nomination.status)}>
                            {statusOptions.find(opt => opt.value === nomination.status)?.label || nomination.status}
                          </span>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <button
                              onClick={() => handleEditNomination(nomination)}
                              style={{
                                padding: '6px 10px',
                                backgroundColor: theme.primary,
                                color: '#fff',
                                border: 'none',
                                borderRadius: '4px',
                                fontSize: '12px',
                                cursor: 'pointer',
                                fontWeight: '600',
                                transition: 'background-color 0.2s'
                              }}
                              disabled={!hasAnyRole(['super_admin', 'content_manager'])}
                              onMouseEnter={(e) => e.target.style.backgroundColor = theme.primaryDark}
                              onMouseLeave={(e) => e.target.style.backgroundColor = theme.primary}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleStatusChange(nomination.id, nomination.status === 'approved' ? 'pending' : 'approved')}
                              style={{
                                padding: '6px 10px',
                                backgroundColor: nomination.status === 'approved' ? '#ff9800' : '#4caf50',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '4px',
                                fontSize: '12px',
                                cursor: 'pointer',
                                fontWeight: '600',
                                transition: 'background-color 0.2s'
                              }}
                              disabled={!hasAnyRole(['super_admin', 'content_manager'])}
                              onMouseEnter={(e) => e.target.style.backgroundColor = nomination.status === 'approved' ? '#f57c00' : '#388e3c'}
                              onMouseLeave={(e) => e.target.style.backgroundColor = nomination.status === 'approved' ? '#ff9800' : '#4caf50'}
                            >
                              {nomination.status === 'approved' ? 'Deactivate' : 'Approve'}
                            </button>
                            <button
                              onClick={() => handleDeleteNomination(nomination.id)}
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
                              disabled={!hasAnyRole(['super_admin'])}
                              onMouseEnter={(e) => e.target.style.backgroundColor = '#b91c1c'}
                              onMouseLeave={(e) => e.target.style.backgroundColor = '#dc2626'}
                            >
                              Delete
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
                    Showing {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, totalNominations)} of {totalNominations} nominations
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
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
                        cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
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
                        cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                      }}
                    >
                      ← Previous
                    </button>

                    {/* Page numbers */}
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
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
                            fontWeight: currentPage === pageNum ? '600' : '500'
                          }}
                        >
                          {pageNum}
                        </button>
                      );
                    })}

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
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                      style={{
                        padding: '6px 10px',
                        backgroundColor: currentPage === totalPages ? '#e5e7eb' : theme.primary,
                        color: currentPage === totalPages ? theme.textSecondary : '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '12px',
                        cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
                      }}
                    >
                      Last
                    </button>
                  </div>
                </div>
              )}

              {nominations.length === 0 && !loading && (
                <div style={{ padding: '80px', textAlign: 'center', color: theme.textSecondary }}>
                  <div style={{ fontSize: '64px', marginBottom: '16px' }}>
                    {debouncedSearchTerm ? '🔍' : '📭'}
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>
                    {debouncedSearchTerm ? 'No nominations found' : 'No nominations available'}
                  </div>
                  <div style={{ fontSize: '16px', marginBottom: '16px' }}>
                    {debouncedSearchTerm ? (
                      <>
                        No nominations match your search for "<strong>{debouncedSearchTerm}</strong>".
                        <br />
                        Try different keywords or check your filters.
                      </>
                    ) : (
                      'Create your first nomination to get started.'
                    )}
                  </div>

                  {debouncedSearchTerm && (
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setDebouncedSearchTerm('');
                      }}
                      style={{
                        padding: '12px 24px',
                        backgroundColor: theme.primary,
                        color: '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '16px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        margin: '0 auto'
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                      </svg>
                      Clear Search
                    </button>
                  )}
                </div>
              )}
            </div>
          </main>
        </div>
      </div >

      {/* Powerlist Nomination Form Modal */}
      < PowerlistNominationFormModal
        isOpen={showFormModal}
        onClose={() => setShowFormModal(false)}
        nomination={editingNomination}
        onSave={handleFormSave}
      />

      {/* Message Display */}
      {
        message && (
          <div style={{
            position: 'fixed',
            top: '80px',
            right: '20px',
            zIndex: 10001,
            backgroundColor: message.type === 'success' ? '#4CAF50' : '#F44336',
            color: '#fff',
            padding: '16px 20px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            maxWidth: '400px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
              <div>
                <div style={{ fontWeight: '600', marginBottom: '4px' }}>{message.text}</div>
                {message.errors && message.errors.length > 0 && (
                  <div style={{ fontSize: '12px', marginTop: '8px' }}>
                    <div style={{ fontWeight: '600', marginBottom: '4px' }}>Errors:</div>
                    <ul style={{ margin: 0, paddingLeft: '20px' }}>
                      {message.errors.slice(0, 5).map((err, idx) => (
                        <li key={idx}>{err}</li>
                      ))}
                      {message.errors.length > 5 && <li>... and {message.errors.length - 5} more</li>}
                    </ul>
                  </div>
                )}
              </div>
              <button
                onClick={() => setMessage(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#fff',
                  fontSize: '20px',
                  cursor: 'pointer',
                  padding: '0',
                  lineHeight: '1'
                }}
              >
                ×
              </button>
            </div>
          </div>
        )
      }
    </div >
  );
};

export default PowerlistManagement;