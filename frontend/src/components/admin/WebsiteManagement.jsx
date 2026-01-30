
import React, { useState, useEffect, useMemo } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import Icon from '../common/Icon';
import Sidebar from './Sidebar';
import api from '../../services/api';
import { Download } from 'lucide-react';

// Website Details Modal Component
const WebsiteDetailsModal = ({ isOpen, onClose, website }) => {
  if (!isOpen || !website) return null;

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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const formatArray = (arr) => {
    return Array.isArray(arr) ? arr.join(', ') : arr || 'N/A';
  };

  const getDocumentUrl = (filename) => {
    return filename || null;
  };

  return (
    <div style={modalStyle} onClick={onClose}>
      <div style={contentStyle} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '800' }}>
            Website Details
          </h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', fontSize: '24px', cursor: 'pointer' }}>
            ×
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          {/* Media Details */}
          <div>
            <h3 style={{ marginBottom: '12px', color: '#1976D2', fontSize: '18px' }}>Media Details</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div><strong>Media Name:</strong> {website.media_name}</div>
              <div><strong>Website Address:</strong> <a href={website.media_website_address} target="_blank" rel="noopener noreferrer" style={{ color: '#1976D2' }}>{website.media_website_address}</a></div>
              <div><strong>Media Type:</strong> {website.news_media_type}</div>
              <div><strong>Languages:</strong> {formatArray(website.languages)}</div>
              <div><strong>Categories:</strong> {formatArray(website.categories)}</div>
              <div><strong>Location Type:</strong> {website.location_type}</div>
              {website.location_type === 'Regional' && (
                <>
                  {website.selected_continent && <div><strong>Continent:</strong> {website.selected_continent}</div>}
                  {website.selected_country && <div><strong>Country:</strong> {website.selected_country}</div>}
                  {website.selected_state && <div><strong>State/Province:</strong> {website.selected_state}</div>}
                </>
              )}
              {website.location_type === 'Specific' && <div><strong>Country:</strong> {website.country_name}</div>}
              <div><strong>Status:</strong> <span style={{
                backgroundColor: website.status === 'approved' ? '#4CAF5020' : website.status === 'rejected' ? '#F4433620' : '#FF980020',
                color: website.status === 'approved' ? '#4CAF50' : website.status === 'rejected' ? '#F44336' : '#FF9800',
                padding: '2px 8px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: '600'
              }}>{website.status}</span></div>
            </div>
          </div>

          {/* Social Media */}
          <div>
            <h3 style={{ marginBottom: '12px', color: '#1976D2', fontSize: '18px' }}>Social Media</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div><strong>Instagram:</strong> {website.ig ? <a href={website.ig} target="_blank" rel="noopener noreferrer" style={{ color: '#e4405f' }}>{website.ig}</a> : 'N/A'}</div>
              <div><strong>Facebook:</strong> {website.facebook ? <a href={website.facebook} target="_blank" rel="noopener noreferrer" style={{ color: '#1877f2' }}>{website.facebook}</a> : 'N/A'}</div>
              <div><strong>LinkedIn:</strong> {website.linkedin ? <a href={website.linkedin} target="_blank" rel="noopener noreferrer" style={{ color: '#0077b5' }}>{website.linkedin}</a> : 'N/A'}</div>
              <div><strong>TikTok:</strong> {website.tiktok ? <a href={website.tiktok} target="_blank" rel="noopener noreferrer" style={{ color: '#000' }}>{website.tiktok}</a> : 'N/A'}</div>
              <div><strong>YouTube:</strong> {website.youtube ? <a href={website.youtube} target="_blank" rel="noopener noreferrer" style={{ color: '#ff0000' }}>{website.youtube}</a> : 'N/A'}</div>
              <div><strong>Snapchat:</strong> {website.snapchat ? <a href={website.snapchat} target="_blank" rel="noopener noreferrer" style={{ color: '#fffc00' }}>{website.snapchat}</a> : 'N/A'}</div>
              <div><strong>X (Formerly known as Twitter):</strong> {website.twitter ? <a href={website.twitter} target="_blank" rel="noopener noreferrer" style={{ color: '#1da1f2' }}>{website.twitter}</a> : 'N/A'}</div>
            </div>
          </div>

          {/* Content Policies */}
          <div>
            <h3 style={{ marginBottom: '12px', color: '#1976D2', fontSize: '18px' }}>Content Policies</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div><strong>Social Media Embedded:</strong> {website.social_media_embedded_allowed ? 'Yes' : 'No'}</div>
              <div><strong>Social Media URL:</strong> {website.social_media_url_allowed ? 'Yes' : 'No'}</div>
              <div><strong>External Links:</strong> {website.external_website_link_allowed ? 'Yes' : 'No'}</div>
              <div><strong>Images Allowed:</strong> {website.images_allowed || 'N/A'}</div>
              <div><strong>Words Limit:</strong> {website.words_limit || 'N/A'}</div>
              <div><strong>Back Date Allowed:</strong> {website.back_date_allowed ? 'Yes' : 'No'}</div>
              <div><strong>DA Score:</strong> {website.da_score || 'N/A'}</div>
              <div><strong>DR Score:</strong> {website.dr_score || 'N/A'}</div>
              <div><strong>PA Score:</strong> {website.pa_score || 'N/A'}</div>
              <div><strong>Do Follow Links:</strong> {website.do_follow_links ? 'Yes' : 'No'}</div>
              <div><strong>Disclaimer Required:</strong> {website.disclaimer_required ? 'Yes' : 'No'}</div>
              <div><strong>Listicle Allowed:</strong> {website.listicle_allowed ? 'Yes' : 'No'}</div>
              <div><strong>Turnaround Time:</strong> {website.turnaround_time || 'N/A'}</div>
              <div><strong>Price:</strong> ${website.price || 'N/A'}</div>
            </div>
          </div>

          {/* Owner Info */}
          <div>
            <h3 style={{ marginBottom: '12px', color: '#1976D2', fontSize: '18px' }}>Owner Information</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div><strong>Owner Name:</strong> {website.owner_name}</div>
              <div><strong>Owner Email:</strong> {website.owner_email}</div>
              <div><strong>Owner Number:</strong> {website.owner_number ? <a href={`tel:${website.owner_number}`} style={{ color: '#1976D2' }}>{website.owner_number}</a> : 'N/A'}</div>
              <div><strong>WhatsApp:</strong> {website.owner_whatsapp ? <a href={`https://wa.me/${website.owner_whatsapp.replace('+', '')}`} target="_blank" rel="noopener noreferrer" style={{ color: '#25D366' }}>WhatsApp: {website.owner_whatsapp}</a> : 'N/A'}</div>
              <div><strong>Telegram:</strong> {website.owner_telegram || 'N/A'}</div>
              <div><strong>Nationality:</strong> {website.owner_nationality || 'N/A'}</div>
              <div><strong>Gender:</strong> {website.owner_gender || 'N/A'}</div>
              <div><strong>How did you hear:</strong> {website.how_did_you_hear || 'N/A'}</div>
              <div><strong>Comments:</strong> {website.comments || 'N/A'}</div>
            </div>
          </div>

          {/* Documents */}
          <div>
            <h3 style={{ marginBottom: '12px', color: '#1976D2', fontSize: '18px' }}>Documents</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div><strong>Company Registration Document/Business License Document:</strong> {website.registration_document ? <a href={getDocumentUrl(website.registration_document)} target="_blank" rel="noopener noreferrer" style={{ color: '#1976D2' }}>Download</a> : 'N/A'}</div>
              <div><strong>Tax Document:</strong> {website.tax_document ? <a href={getDocumentUrl(website.tax_document)} target="_blank" rel="noopener noreferrer" style={{ color: '#1976D2' }}>Download</a> : 'N/A'}</div>
              <div><strong>Bank Details:</strong> {website.bank_details_document ? <a href={getDocumentUrl(website.bank_details_document)} target="_blank" rel="noopener noreferrer" style={{ color: '#1976D2' }}>Download</a> : 'N/A'}</div>
              <div><strong>Passport:</strong> {website.passport_document ? <a href={getDocumentUrl(website.passport_document)} target="_blank" rel="noopener noreferrer" style={{ color: '#1976D2' }}>Download</a> : 'N/A'}</div>
              <div><strong>Contact Details:</strong> {website.contact_details_document ? <a href={getDocumentUrl(website.contact_details_document)} target="_blank" rel="noopener noreferrer" style={{ color: '#1976D2' }}>Download</a> : 'N/A'}</div>
            </div>
          </div>

          {/* Timestamps */}
          <div>
            <h3 style={{ marginBottom: '12px', color: '#1976D2', fontSize: '18px' }}>Timestamps</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div><strong>Created At:</strong> {formatDate(website.created_at)}</div>
              <div><strong>Updated At:</strong> {formatDate(website.updated_at)}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Status Update Modal Component
const StatusUpdateModal = ({ isOpen, onClose, website, onConfirm }) => {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleConfirm = async (newStatus) => {
    setLoading(true);
    try {
      await onConfirm(website.id, newStatus, reason);
      onClose();
      setReason('');
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !website) return null;

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
    maxWidth: '500px',
    width: '100%',
    boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
  };

  return (
    <div style={modalStyle} onClick={onClose}>
      <div style={contentStyle} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '800' }}>
            Update Website Status
          </h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', fontSize: '24px', cursor: 'pointer' }}>
            ×
          </button>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <p style={{ marginBottom: '16px', color: '#666' }}>
            Update status for <strong>{website.media_name}</strong>
          </p>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#212121', marginBottom: '6px' }}>
              Reason (Optional)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Provide a reason for this status change..."
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                minHeight: '80px',
                resize: 'vertical',
                boxSizing: 'border-box'
              }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 20px',
              backgroundColor: '#f3f4f6',
              color: '#374151',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={() => handleConfirm('approved')}
            style={{
              padding: '10px 20px',
              backgroundColor: '#4CAF50',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Approve'}
          </button>
          <button
            onClick={() => handleConfirm('rejected')}
            style={{
              padding: '10px 20px',
              backgroundColor: '#F44336',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Reject'}
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
  roleColors: {
    super_admin: { bg: '#E0F2F1', color: '#004D40' }, // Using secondary colors
    content_manager: { bg: '#E3F2FD', color: '#0D47A1' }, // Using primary colors
    editor: { bg: '#FAFAFA', color: '#212121' }, // Using neutral colors
    registered_user: { bg: '#F5F5F5', color: '#757575' }, // Using neutral colors
    agency: { bg: '#E0F2F1', color: '#00796B' }, // Using secondary colors
    other: { bg: '#FAFAFA', color: '#757575' } // Using neutral colors
  }
};

const WebsiteManagement = () => {
  const { admin, logout, hasRole, hasAnyRole, getRoleLevel, isAuthenticated, loading: authLoading } = useAdminAuth();

  // Show loading if admin data is not yet available
  if (authLoading || !admin) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: theme.backgroundSoft }}>
        <div style={{ textAlign: 'center' }}>
          <Icon name="arrow-path" size="lg" className="animate-spin text-primary mx-auto mb-4" />
          <p className="body-regular">Loading website management...</p>
        </div>
      </div>
    );
  }

  // Debug: Check admin data and roles
  console.log('Admin data:', admin);
  console.log('Admin role:', admin?.role);
  console.log('Has super_admin role:', hasRole('super_admin'));
  console.log('Has content_manager role:', hasRole('content_manager'));
  console.log('Has any required role:', hasAnyRole(['super_admin', 'content_manager']));

  // Check if user has permission to manage websites
  if (!hasAnyRole(['super_admin', 'content_manager'])) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: theme.backgroundSoft }}>
        <div style={{ textAlign: 'center' }}>
          <Icon name="shield-exclamation" size="lg" style={{ color: theme.danger, marginBottom: '16px' }} />
          <h2 style={{ color: theme.textPrimary, marginBottom: '8px' }}>Access Denied</h2>
          <p style={{ color: theme.textSecondary }}>You don't have permission to access website management.</p>
          <p style={{ color: theme.textSecondary, fontSize: '14px', marginTop: '8px' }}>
            Required roles: Super Admin or Content Manager
          </p>
          <p style={{ color: theme.textSecondary, fontSize: '12px', marginTop: '8px' }}>
            Current role: {admin?.role || 'None'} | Authenticated: {isAuthenticated ? 'Yes' : 'No'}
          </p>
        </div>
      </div>
    );
  }

  const [websites, setWebsites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedWebsites, setSelectedWebsites] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortField, setSortField] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedWebsite, setSelectedWebsite] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusUpdateWebsite, setStatusUpdateWebsite] = useState(null);
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
        await fetchWebsites();
      } catch (error) {
        console.error('Error fetching data:', error);
        // If unauthorized, the API interceptor will handle redirect
      }
    };

    fetchData();
  }, []);

  const fetchWebsites = async () => {
    try {
      const response = await api.get('/websites');
      setWebsites(response.data.websites || []);
    } catch (error) {
      console.error('Error fetching websites:', error);
      if (error.response?.status === 401) {
        // Token expired or invalid, redirect to login
        localStorage.removeItem('adminAccessToken');
        window.location.href = '/admin/login';
        return;
      }
      alert('Failed to load websites. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Filtered websites
  const filteredWebsites = useMemo(() => {
    let filtered = websites;

    if (debouncedSearchTerm) {
      filtered = filtered.filter(website =>
        website.media_name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        website.owner_name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        website.owner_email.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      );
    }

    if (statusFilter) {
      filtered = filtered.filter(website => website.status === statusFilter);
    }

    return filtered;
  }, [websites, debouncedSearchTerm, statusFilter]);

  // Update filtered websites when filters change
  useEffect(() => {
    setCurrentPage(1); // Reset to first page when filters change
  }, [debouncedSearchTerm, statusFilter]);

  // Sorting logic
  const sortedWebsites = useMemo(() => {
    return [...filteredWebsites].sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (sortField === 'created_at' || sortField === 'updated_at') {
        aValue = aValue ? new Date(aValue) : new Date(0);
        bValue = bValue ? new Date(bValue) : new Date(0);
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
  }, [filteredWebsites, sortField, sortDirection]);

  // Pagination logic
  const paginatedWebsites = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedWebsites.slice(startIndex, startIndex + pageSize);
  }, [sortedWebsites, currentPage, pageSize]);

  const totalPages = Math.ceil(sortedWebsites.length / pageSize);

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

  const handleViewDetails = (website) => {
    setSelectedWebsite(website);
    setShowDetailsModal(true);
  };

  const handleStatusUpdate = async (websiteId, newStatus, reason) => {
    try {
      await api.put(`/websites/${websiteId}/status`, { status: newStatus, reason });
      fetchWebsites();
      setMessage({ type: 'success', text: `Website ${newStatus} successfully!` });
    } catch (error) {
      console.error('Error updating status:', error);
      setMessage({ type: 'error', text: 'Error updating status. Please try again.' });
    }
  };

  const handleDeleteWebsite = async (websiteId) => {
    if (!window.confirm('Are you sure you want to delete this website?')) return;

    try {
      await api.delete(`/websites/${websiteId}`);
      fetchWebsites();
      setMessage({ type: 'success', text: 'Website deleted successfully!' });
    } catch (error) {
      console.error('Error deleting website:', error);
      setMessage({ type: 'error', text: 'Error deleting website. Please try again.' });
    }
  };

  const handleSelectWebsite = (websiteId) => {
    setSelectedWebsites(prev =>
      prev.includes(websiteId)
        ? prev.filter(id => id !== websiteId)
        : [...prev, websiteId]
    );
  };

  const handleSelectAll = () => {
    if (selectedWebsites.length === filteredWebsites.length) {
      setSelectedWebsites([]);
    } else {
      setSelectedWebsites(filteredWebsites.map(w => w.id));
    }
  };

  const handleBulkStatusChange = async (newStatus) => {
    if (selectedWebsites.length === 0) return;

    if (!window.confirm(`Are you sure you want to ${newStatus} ${selectedWebsites.length} websites?`)) return;

    try {
      const response = await api.post('/websites/bulk/status', { ids: selectedWebsites, status: newStatus });
      setSelectedWebsites([]);
      fetchWebsites();

      if (response.data.message) {
        setMessage({ type: 'success', text: response.data.message });
      } else {
        setMessage({ type: 'success', text: `Websites ${newStatus} successfully!` });
      }
    } catch (error) {
      console.error('Error bulk updating status:', error);
      setMessage({ type: 'error', text: 'Error updating websites. Please try again.' });
    }
  };

  const handleBulkDelete = async () => {
    if (selectedWebsites.length === 0) return;

    if (!window.confirm(`Are you sure you want to delete ${selectedWebsites.length} websites?`)) return;

    try {
      const response = await api.post('/websites/bulk/delete', { ids: selectedWebsites });
      setSelectedWebsites([]);
      fetchWebsites();

      if (response.data.message) {
        setMessage({ type: 'success', text: response.data.message });
      } else {
        setMessage({ type: 'success', text: 'Websites deleted successfully!' });
      }
    } catch (error) {
      console.error('Error bulk deleting:', error);
      setMessage({ type: 'error', text: 'Error deleting websites. Please try again.' });
    }
  };

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleDownloadCSV = async () => {
    try {
      const params = new URLSearchParams();
      if (debouncedSearchTerm) params.append('search', debouncedSearchTerm);
      if (statusFilter) params.append('status', statusFilter);

      const response = await api.get(`/websites/admin/download-csv?${params.toString()}`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'websites_export.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Download CSV error:', error);
      alert('Failed to download CSV');
    }
  };

  // Auto-hide messages
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

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
                      <div style={{ display: 'grid', gridTemplateColumns: '50px 2fr 1fr 1fr 1fr 1fr 1fr', gap: '16px', alignItems: 'center' }}>
                        <div style={{ width: '20px', height: '20px', background: '#f3f4f6', borderRadius: '50%' }}></div>
                        <div>
                          <div style={{ height: '14px', background: '#f3f4f6', borderRadius: 4, width: '120px', marginBottom: '4px' }}></div>
                          <div style={{ height: '12px', background: '#f3f4f6', borderRadius: 4, width: '80px' }}></div>
                        </div>
                        <div style={{ height: '14px', background: '#f3f4f6', borderRadius: 4, width: '80px' }}></div>
                        <div style={{ height: '14px', background: '#f3f4f6', borderRadius: 4, width: '100px' }}></div>
                        <div style={{ height: '14px', background: '#f3f4f6', borderRadius: 4, width: '60px' }}></div>
                        <div style={{ height: '14px', background: '#f3f4f6', borderRadius: 4, width: '80px' }}></div>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <div style={{ width: '60px', height: '24px', background: '#f3f4f6', borderRadius: 4 }}></div>
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
            {/* Groups Table (Wait, this is inside loop or below?) */}
            {/* Checking skeleton above... Wait, I need to find the place where "Websites Table" is or should be. */}
            {/* There is no table rendered in the view I got in step 1244. */}
            {/* Searching for "Main Content" in previous view. */}
            {/* Line 728 starts Main Content. */}
            {/* Line 800 ends the view. I need to see more lines. But based on GroupManagement, I can guess where buttons go. */}
            {/* I'll add the button in the header area. */}
            {/* Wait, I should view the lines where the real content is, below skeleton. */}
            {/* Can I assume line 800+ has the real content? Yes. */}
            {/* I'll wait to view line 800+ before injecting. */}
            <div style={{ background: '#fff', borderRadius: 12, padding: 28, border: `4px solid #000`, display: 'flex', justifyContent: 'space-between', gap: 16, marginBottom: 24, alignItems: 'center' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: '#e6f0ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name="globe-alt" size="sm" style={{ color: '#1976D2' }} />
                  </div>
                  <h1 style={{ margin: 0, fontSize: 34, fontWeight: 800 }}>Website Management</h1>
                </div>
                <p style={{ marginTop: 8, color: '#757575' }}>Manage website submissions</p>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  onClick={handleDownloadCSV}
                  style={{ ...btnPrimary, fontSize: '14px', padding: '12px 20px' }}
                  disabled={!hasAnyRole(['super_admin', 'content_manager'])}
                >
                  <Download size={16} style={{ marginRight: '8px' }} />
                  Download CSV
                </button>
              </div>
            </div>

            {/* Message Toast */}
            {message && (
              <div style={{
                backgroundColor: message.type === 'success' ? '#dcfce7' : '#fee2e2',
                color: message.type === 'success' ? '#065f46' : '#991b1b',
                padding: '12px 16px',
                borderRadius: '8px',
                marginBottom: '16px',
                border: `1px solid ${message.type === 'success' ? '#10b981' : '#ef4444'}`,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Icon name={message.type === 'success' ? 'check-circle' : 'exclamation-circle'} size="sm" />
                {message.text}
              </div>
            )}

            {/* Bulk Actions Bar */}
            {selectedWebsites.length > 0 && (
              <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '16px', marginBottom: '24px', boxShadow: '0 8px 20px rgba(2,6,23,0.06)', border: '1px solid #e0e0e0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                  <div style={{ fontSize: '14px', color: '#212121' }}>
                    {selectedWebsites.length} website{selectedWebsites.length !== 1 ? 's' : ''} selected
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => handleBulkStatusChange('approved')}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: theme.success,
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '14px',
                        cursor: 'pointer',
                        fontWeight: '600'
                      }}
                      disabled={!hasAnyRole(['super_admin', 'content_manager'])}
                    >
                      Bulk Approve
                    </button>
                    <button
                      onClick={() => handleBulkStatusChange('rejected')}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: theme.danger,
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '14px',
                        cursor: 'pointer',
                        fontWeight: '600'
                      }}
                      disabled={!hasAnyRole(['super_admin', 'content_manager'])}
                    >
                      Bulk Reject
                    </button>
                    <button
                      onClick={handleBulkDelete}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#dc2626',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '14px',
                        cursor: 'pointer',
                        fontWeight: '600'
                      }}
                      disabled={!hasRole('super_admin')}
                    >
                      Bulk Delete
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Search and Filter Bar */}
            <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', marginBottom: '16px', boxShadow: '0 8px 20px rgba(2,6,23,0.06)' }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '300px' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={theme.textSecondary} strokeWidth="2" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}>
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.35-4.35"></path>
                  </svg>
                  <input
                    type="text"
                    placeholder="Search websites by name, owner, or email..."
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
                  style={{
                    padding: '12px 16px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '14px',
                    minWidth: '150px',
                    transition: 'border-color 0.2s',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.borderColor = theme.primary}
                  onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                >
                  <option value="">All Statuses</option>
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              {/* Search Results Summary */}
              <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div style={{ fontSize: '14px', color: theme.textSecondary }}>
                  {debouncedSearchTerm || statusFilter ? (
                    <>
                      <span style={{ color: theme.primary, fontWeight: '600' }}>Filtered:</span> Found <strong>{sortedWebsites.length}</strong> website{sortedWebsites.length !== 1 ? 's' : ''}
                    </>
                  ) : (
                    <>
                      Showing <strong>{paginatedWebsites.length}</strong> of <strong>{sortedWebsites.length}</strong> website{sortedWebsites.length !== 1 ? 's' : ''}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Websites Table */}
            <div style={{ backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 8px 20px rgba(2,6,23,0.06)', overflow: 'hidden' }}>
              {/* Table Controls */}
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb', backgroundColor: '#f8fafc' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: theme.textPrimary }}>
                      {selectedWebsites.length > 0 ? `${selectedWebsites.length} selected` : 'Select websites'}
                    </span>
                    {selectedWebsites.length > 0 && (
                      <button
                        onClick={() => setSelectedWebsites([])}
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

              <div style={{ overflowX: 'auto', maxHeight: paginatedWebsites.length > 50 ? '600px' : 'auto', overflowY: paginatedWebsites.length > 50 ? 'auto' : 'visible' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                      <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', fontSize: '12px', color: theme.textPrimary, textTransform: 'uppercase', letterSpacing: '0.5px', width: '50px' }}>
                        <input
                          type="checkbox"
                          checked={paginatedWebsites.length > 0 && selectedWebsites.length === paginatedWebsites.length}
                          onChange={handleSelectAll}
                          style={{ transform: 'scale(1.2)', cursor: 'pointer' }}
                        />
                      </th>
                      <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', fontSize: '12px', color: theme.textPrimary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        ID
                      </th>
                      <th
                        style={{ padding: '16px', textAlign: 'left', fontWeight: '700', fontSize: '12px', color: theme.textPrimary, textTransform: 'uppercase', letterSpacing: '0.5px', cursor: 'pointer' }}
                        onClick={() => handleSort('media_name')}
                      >
                        Media Name {getSortIcon('media_name')}
                      </th>
                      <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', fontSize: '12px', color: theme.textPrimary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Website Address
                      </th>
                      <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', fontSize: '12px', color: theme.textPrimary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Media Type
                      </th>
                      <th
                        style={{ padding: '16px', textAlign: 'left', fontWeight: '700', fontSize: '12px', color: theme.textPrimary, textTransform: 'uppercase', letterSpacing: '0.5px', cursor: 'pointer' }}
                        onClick={() => handleSort('owner_name')}
                      >
                        Owner Name {getSortIcon('owner_name')}
                      </th>
                      <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', fontSize: '12px', color: theme.textPrimary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Owner Email
                      </th>
                      <th
                        style={{ padding: '16px', textAlign: 'left', fontWeight: '700', fontSize: '12px', color: theme.textPrimary, textTransform: 'uppercase', letterSpacing: '0.5px', cursor: 'pointer' }}
                        onClick={() => handleSort('status')}
                      >
                        Status {getSortIcon('status')}
                      </th>
                      <th
                        style={{ padding: '16px', textAlign: 'left', fontWeight: '700', fontSize: '12px', color: theme.textPrimary, textTransform: 'uppercase', letterSpacing: '0.5px', cursor: 'pointer' }}
                        onClick={() => handleSort('created_at')}
                      >
                        Submitted Date {getSortIcon('created_at')}
                      </th>
                      <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', fontSize: '12px', color: theme.textPrimary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedWebsites.map((website, index) => (
                      <tr key={website.id} style={{
                        borderBottom: '1px solid #f1f5f9',
                        backgroundColor: selectedWebsites.includes(website.id) ? '#e0f2fe' : (index % 2 === 0 ? '#ffffff' : '#fafbfc'),
                        transition: 'all 0.2s'
                      }}
                        onMouseEnter={(e) => {
                          if (!selectedWebsites.includes(website.id)) {
                            e.target.closest('tr').style.backgroundColor = '#f1f5f9';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!selectedWebsites.includes(website.id)) {
                            e.target.closest('tr').style.backgroundColor = index % 2 === 0 ? '#ffffff' : '#fafbfc';
                          }
                        }}
                      >
                        <td style={{ padding: '16px' }}>
                          <input
                            type="checkbox"
                            checked={selectedWebsites.includes(website.id)}
                            onChange={() => handleSelectWebsite(website.id)}
                            style={{ transform: 'scale(1.1)', cursor: 'pointer' }}
                          />
                        </td>
                        <td style={{ padding: '16px' }}>
                          <div style={{ fontSize: '12px', color: theme.primary, fontWeight: '500' }}>
                            #{website.id}
                          </div>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <div style={{ fontWeight: '600', fontSize: '14px', color: theme.textPrimary }}>
                            {website.media_name}
                          </div>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <div style={{ fontSize: '12px', color: theme.primary }}>
                            <a href={website.media_website_address} target="_blank" rel="noopener noreferrer" style={{ color: theme.primary, textDecoration: 'none' }}>
                              {website.media_website_address.length > 30 ? `${website.media_website_address.substring(0, 30)}...` : website.media_website_address}
                            </a>
                          </div>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <div style={{ fontSize: '12px', color: theme.textSecondary }}>
                            {website.news_media_type}
                          </div>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <div style={{ fontSize: '14px', color: theme.textPrimary, fontWeight: '500' }}>
                            {website.owner_name}
                          </div>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <div style={{ fontSize: '12px', color: theme.textSecondary }}>
                            {website.owner_email}
                          </div>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <span style={getStatusStyle(website.status)}>
                            {statusOptions.find(opt => opt.value === website.status)?.label || website.status}
                          </span>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <div style={{ fontSize: '12px', color: theme.textSecondary }}>
                            {formatDate(website.created_at)}
                          </div>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <button
                              onClick={() => handleViewDetails(website)}
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
                              onMouseEnter={(e) => e.target.style.backgroundColor = '#673ab7'}
                              onMouseLeave={(e) => e.target.style.backgroundColor = theme.info}
                            >
                              View Details
                            </button>
                            {website.status !== 'approved' && (
                              <button
                                onClick={() => {
                                  setStatusUpdateWebsite(website);
                                  setShowStatusModal(true);
                                }}
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
                                disabled={!hasAnyRole(['super_admin', 'content_manager'])}
                                onMouseEnter={(e) => e.target.style.backgroundColor = '#388e3c'}
                                onMouseLeave={(e) => e.target.style.backgroundColor = theme.success}
                              >
                                Approve
                              </button>
                            )}
                            {website.status !== 'rejected' && (
                              <button
                                onClick={() => {
                                  setStatusUpdateWebsite(website);
                                  setShowStatusModal(true);
                                }}
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
                                disabled={!hasAnyRole(['super_admin', 'content_manager'])}
                                onMouseEnter={(e) => e.target.style.backgroundColor = '#b91c1c'}
                                onMouseLeave={(e) => e.target.style.backgroundColor = theme.danger}
                              >
                                Reject
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteWebsite(website.id)}
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
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div style={{ padding: '16px 20px', borderTop: '1px solid #e5e7eb', backgroundColor: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ fontSize: '14px', color: theme.textSecondary }}>
                  Showing {sortedWebsites.length > 0 ? ((currentPage - 1) * pageSize) + 1 : 0}-{Math.min(currentPage * pageSize, sortedWebsites.length)} of {sortedWebsites.length} websites
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

              {paginatedWebsites.length === 0 && (
                <div style={{ padding: '80px', textAlign: 'center', color: theme.textSecondary }}>
                  <div style={{ fontSize: '64px', marginBottom: '16px' }}>
                    {debouncedSearchTerm || statusFilter ? '🔍' : '🌐'}
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>
                    {debouncedSearchTerm || statusFilter ? 'No websites found' : 'No websites available'}
                  </div>
                  <div style={{ fontSize: '16px', marginBottom: '16px' }}>
                    {debouncedSearchTerm || statusFilter ? (
                      <>
                        No websites match your search or filter criteria.
                        <br />
                        Try different keywords or adjust your filters.
                      </>
                    ) : (
                      'No websites have been submitted yet.'
                    )}
                  </div>

                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('');
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
                    Clear Filters
                  </button>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* Website Details Modal */}
      <WebsiteDetailsModal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        website={selectedWebsite}
      />

      {/* Status Update Modal */}
      <StatusUpdateModal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        website={statusUpdateWebsite}
        onConfirm={handleStatusUpdate}
      />
    </div>
  );
};

export default WebsiteManagement;