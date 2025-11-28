import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAdminAuth } from '../../context/AdminAuthContext';
import Icon from '../common/Icon';
import Sidebar from './Sidebar';
import api from '../../services/api';
import {
  Plus, Eye, Edit, Trash2, Search, Filter, BookOpen,
  Newspaper, Globe, Calendar, User, MapPin, Tag,
  CheckCircle2, XCircle, AlertCircle, Info
} from 'lucide-react';

// Published Work View Modal Component
const PublishedWorkViewModal = ({ isOpen, onClose, publishedWork }) => {
  if (!isOpen || !publishedWork) return null;

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
    maxWidth: '700px',
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
            Published Work Details
          </h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', fontSize: '24px', cursor: 'pointer' }}>
            ×
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
          <div>
            <strong>SN:</strong> {publishedWork.sn}
          </div>
          <div>
            <strong>Publication Name:</strong> {publishedWork.publication_name}
          </div>
          <div>
            <strong>Publication Website:</strong>
            <a href={publishedWork.publication_website} target="_blank" rel="noopener noreferrer" style={{ color: '#1976D2', textDecoration: 'none' }}>
              {publishedWork.publication_website}
            </a>
          </div>
          <div>
            <strong>Article Link:</strong>
            <a href={publishedWork.article_link} target="_blank" rel="noopener noreferrer" style={{ color: '#1976D2', textDecoration: 'none' }}>
              {publishedWork.article_link}
            </a>
          </div>
          <div>
            <strong>Article Year:</strong> {publishedWork.article_year || 'N/A'}
          </div>
          <div>
            <strong>Article Date:</strong> {formatDate(publishedWork.article_date)}
          </div>
          <div>
            <strong>Company Name:</strong> {publishedWork.company_name}
          </div>
          <div>
            <strong>Person Name:</strong> {publishedWork.person_name}
          </div>
          <div>
            <strong>Industry:</strong> {publishedWork.industry}
          </div>
          <div>
            <strong>Company Country:</strong> {publishedWork.company_country}
          </div>
          <div>
            <strong>Individual Country:</strong> {publishedWork.individual_country}
          </div>
          <div>
            <strong>Tags:</strong> {Array.isArray(publishedWork.tags) ? publishedWork.tags.join(', ') : (publishedWork.tags || 'N/A')}
          </div>
          <div>
            <strong>Featured:</strong> {publishedWork.is_featured ? 'Yes' : 'No'}
          </div>
        </div>

        {publishedWork.description && (
          <div style={{ marginTop: '24px' }}>
            <strong>Description:</strong>
            <p style={{ marginTop: '8px', whiteSpace: 'pre-wrap' }}>{publishedWork.description}</p>
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

// Published Work Form Modal Component
const PublishedWorkFormModal = ({ isOpen, onClose, publishedWork, onSave }) => {
  const [formData, setFormData] = useState({
    sn: '',
    publication_name: '',
    publication_website: '',
    article_link: '',
    article_year: '',
    article_date: '',
    company_name: '',
    person_name: '',
    industry: '',
    company_country: '',
    individual_country: '',
    description: '',
    tags: '',
    is_featured: false
  });
  const [loading, setLoading] = useState(false);
  const [fetchingPublication, setFetchingPublication] = useState(false);
  const [publications, setPublications] = useState([]);
  const [selectedPublicationId, setSelectedPublicationId] = useState('');

  useEffect(() => {
    if (publishedWork) {
      // Format date for input field (yyyy-MM-dd)
      const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
      };

      setFormData({
        sn: publishedWork.sn || '',
        publication_name: publishedWork.publication_name || '',
        publication_website: publishedWork.publication_website || '',
        article_link: publishedWork.article_link || '',
        article_year: publishedWork.article_year || '',
        article_date: formatDateForInput(publishedWork.article_date),
        company_name: publishedWork.company_name || '',
        person_name: publishedWork.person_name || '',
        industry: publishedWork.industry || '',
        company_country: publishedWork.company_country || '',
        individual_country: publishedWork.individual_country || '',
        description: publishedWork.description || '',
        tags: Array.isArray(publishedWork.tags) ? publishedWork.tags.join(', ') : (publishedWork.tags || ''),
        is_featured: publishedWork.is_featured || false
      });
      setSelectedPublicationId(''); // Reset selection when editing
    } else {
      setFormData({
        sn: '',
        publication_name: '',
        publication_website: '',
        article_link: '',
        article_year: '',
        article_date: '',
        company_name: '',
        person_name: '',
        industry: '',
        company_country: '',
        individual_country: '',
        description: '',
        tags: '',
        is_featured: false
      });
      setSelectedPublicationId('');
    }
  }, [publishedWork, isOpen]);

  useEffect(() => {
    if (isOpen) {
      fetchPublications();
    }
  }, [isOpen]);

  const fetchPublications = async () => {
    try {
      const params = new URLSearchParams({
        live_on_platform: 'true',
        limit: '1000' // Fetch more for admin selection
      });
      const response = await api.get(`/publications?${params.toString()}`);
      let pubs = response.data.publications || [];
      pubs = pubs.filter(pub => pub.status === 'approved' && pub.is_active === true && pub.live_on_platform === true);
      setPublications(pubs);
    } catch (error) {
      console.error('Error fetching publications:', error);
    }
  };

  const handlePublicationSelect = (publicationId) => {
    setSelectedPublicationId(publicationId);
    if (publicationId) {
      const selectedPub = publications.find(pub => pub.id === parseInt(publicationId));
      if (selectedPub) {
        setFormData(prev => ({
          ...prev,
          publication_name: selectedPub.publication_name || '',
          publication_website: selectedPub.publication_website || ''
        }));
      }
    } else {
      // Clear if deselected
      setFormData(prev => ({
        ...prev,
        publication_name: '',
        publication_website: ''
      }));
    }
  };

  const handleFetchPublicationInfo = async () => {
    if (!formData.article_link.trim()) {
      alert('Please enter an article link first.');
      return;
    }

    setFetchingPublication(true);
    try {
      const response = await api.post('/published-works/admin/extract-info', {
        articleUrl: formData.article_link.trim()
      });

      // Update form data with fetched information
      setFormData(prev => ({
        ...prev,
        publication_name: response.data.publication_name || prev.publication_name,
        publication_website: response.data.publication_website || prev.publication_website
      }));

      // Reset selection if auto-filled
      setSelectedPublicationId('');

      // Show success message
      alert('Publication information fetched successfully!');
    } catch (error) {
      console.error('Error fetching publication info:', error);
      const errorMessage = error.response?.data?.error || 'Failed to fetch publication information. Please try again.';
      alert(errorMessage);
    } finally {
      setFetchingPublication(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Prepare data, handling empty values appropriately
      const dataToSend = {};

      // Always include these fields if they have values
      if (formData.sn?.trim()) dataToSend.sn = formData.sn.trim();
      if (formData.publication_name?.trim()) dataToSend.publication_name = formData.publication_name.trim();
      if (formData.publication_website?.trim()) dataToSend.publication_website = formData.publication_website.trim();
      if (formData.article_link?.trim()) dataToSend.article_link = formData.article_link.trim();
      if (formData.article_year) {
        const year = parseInt(formData.article_year);
        if (!isNaN(year) && year >= 1900 && year <= new Date().getFullYear()) {
          dataToSend.article_year = year;
        }
      }
      if (formData.article_date) dataToSend.article_date = formData.article_date;
      if (formData.company_name?.trim()) dataToSend.company_name = formData.company_name.trim();
      if (formData.person_name?.trim()) dataToSend.person_name = formData.person_name.trim();
      if (formData.industry?.trim()) dataToSend.industry = formData.industry.trim();
      if (formData.company_country?.trim()) dataToSend.company_country = formData.company_country.trim();
      if (formData.individual_country?.trim()) dataToSend.individual_country = formData.individual_country.trim();
      if (formData.description?.trim()) dataToSend.description = formData.description.trim();
      if (formData.tags?.trim()) {
        // Convert comma-separated string to array
        dataToSend.tags = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
      }
      dataToSend.is_featured = formData.is_featured || false;

      if (publishedWork) {
        await api.put(`/published-works/admin/${publishedWork.id}`, dataToSend);
      } else {
        // For create, ensure required fields are present
        const requiredFields = ['sn', 'publication_name', 'publication_website', 'article_link', 'company_name', 'person_name', 'industry', 'company_country', 'individual_country', 'description'];
        const missingFields = requiredFields.filter(field => !dataToSend[field]);

        if (missingFields.length > 0) {
          alert(`Please fill in all required fields: ${missingFields.join(', ')}`);
          setLoading(false);
          return;
        }

        await api.post('/published-works/admin', dataToSend);
      }

      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving published work:', error);
      let errorMessage = 'Error saving published work. Please try again.';

      if (error.response?.data?.error === 'Validation failed' && error.response?.data?.details) {
        // Show specific validation errors
        const validationErrors = error.response.data.details.map(err => `${err.param}: ${err.msg}`).join('\n');
        errorMessage = `Validation failed:\n${validationErrors}`;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

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
    maxWidth: '800px',
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

  const buttonStyle = {
    paddingTop: '10px',
    paddingBottom: '10px',
    paddingLeft: '20px',
    paddingRight: '20px',
    borderRadius: '8px',
    fontWeight: '600',
    cursor: 'pointer',
    border: 'none',
    marginRight: '12px'
  };

  // Add CSS animation for spinning icon
  const spinAnimation = `
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `;

  // Inject the animation CSS
  if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = spinAnimation;
    document.head.appendChild(style);
  }

  return (
    <div style={modalStyle} onClick={onClose}>
      <div style={contentStyle} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '800' }}>
            {publishedWork ? 'Edit Published Work' : 'Create Published Work'}
          </h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', fontSize: '24px', cursor: 'pointer' }}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
            <div style={formGroupStyle}>
              <label style={labelStyle}>SN *</label>
              <input
                type="text"
                value={formData.sn}
                onChange={(e) => setFormData({ ...formData, sn: e.target.value })}
                style={inputStyle}
                required
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Select Publication (Optional)</label>
              <select
                value={selectedPublicationId}
                onChange={(e) => handlePublicationSelect(e.target.value)}
                style={inputStyle}
              >
                <option value="">Choose from existing publications...</option>
                {publications.map(pub => (
                  <option key={pub.id} value={pub.id}>
                    {pub.publication_name} - {pub.publication_region}
                  </option>
                ))}
              </select>
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Publication Name *</label>
              <input
                type="text"
                value={formData.publication_name}
                onChange={(e) => {
                  setFormData({ ...formData, publication_name: e.target.value });
                  setSelectedPublicationId(''); // Clear selection if manually editing
                }}
                style={inputStyle}
                required
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Publication Website *</label>
              <input
                type="url"
                value={formData.publication_website}
                onChange={(e) => {
                  setFormData({ ...formData, publication_website: e.target.value });
                  setSelectedPublicationId(''); // Clear selection if manually editing
                }}
                style={inputStyle}
                required
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Article Link *</label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'stretch' }}>
                <input
                  type="url"
                  value={formData.article_link}
                  onChange={(e) => setFormData({ ...formData, article_link: e.target.value })}
                  style={{ ...inputStyle, flex: 1 }}
                  required
                  placeholder="https://example.com/article"
                />
                <button
                  type="button"
                  onClick={handleFetchPublicationInfo}
                  disabled={fetchingPublication || !formData.article_link.trim()}
                  style={{
                    ...buttonStyle,
                    backgroundColor: fetchingPublication ? '#9E9E9E' : '#FF9800',
                    color: '#fff',
                    paddingTop: '10px',
                    paddingBottom: '10px',
                    paddingLeft: '16px',
                    paddingRight: '16px',
                    whiteSpace: 'nowrap',
                    minWidth: '120px'
                  }}
                >
                  {fetchingPublication ? (
                    <>
                      <span style={{
                        display: 'inline-block',
                        width: '16px',
                        height: '16px',
                        border: '2px solid #ffffff',
                        borderTop: '2px solid transparent',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        marginRight: '8px'
                      }}></span>
                      Fetching...
                    </>
                  ) : (
                    'Auto-Fill'
                  )}
                </button>
              </div>
              <div style={{ fontSize: '12px', color: '#757575', marginTop: '4px' }}>
                Click "Auto-Fill" to automatically fetch publication name and website from the article URL
              </div>
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Article Year</label>
              <input
                type="number"
                value={formData.article_year}
                onChange={(e) => setFormData({ ...formData, article_year: e.target.value })}
                style={inputStyle}
                min="1900"
                max={new Date().getFullYear()}
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Article Date</label>
              <input
                type="date"
                value={formData.article_date}
                onChange={(e) => setFormData({ ...formData, article_date: e.target.value })}
                style={inputStyle}
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Company Name *</label>
              <input
                type="text"
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                style={inputStyle}
                required
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Person Name *</label>
              <input
                type="text"
                value={formData.person_name}
                onChange={(e) => setFormData({ ...formData, person_name: e.target.value })}
                style={inputStyle}
                required
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Industry *</label>
              <input
                type="text"
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                style={inputStyle}
                required
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Company Country *</label>
              <input
                type="text"
                value={formData.company_country}
                onChange={(e) => setFormData({ ...formData, company_country: e.target.value })}
                style={inputStyle}
                required
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Individual Country *</label>
              <input
                type="text"
                value={formData.individual_country}
                onChange={(e) => setFormData({ ...formData, individual_country: e.target.value })}
                style={inputStyle}
                required
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Tags</label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                style={inputStyle}
                placeholder="Comma-separated tags"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginTop: '16px' }}>
            <div style={formGroupStyle}>
              <label style={labelStyle}>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                style={{ ...inputStyle, minHeight: '60px', resize: 'vertical' }}
                placeholder="Description of the published work"
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginTop: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <input
                type="checkbox"
                id="featured"
                checked={formData.is_featured}
                onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                style={{ marginRight: '8px' }}
              />
              <label htmlFor="featured" style={{ fontSize: '14px', color: '#212121' }}>Featured</label>
            </div>
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
              {loading ? 'Saving...' : (publishedWork ? 'Update Published Work' : 'Create Published Work')}
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
};

const PublishedWorkManagement = () => {
  const { admin, logout, hasRole } = useAdminAuth();

  // Check if user has permission to manage published works
  if (!hasRole('super_admin')) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: theme.backgroundSoft }}>
        <div style={{ textAlign: 'center' }}>
          <Icon name="shield-exclamation" size="lg" style={{ color: theme.danger, marginBottom: '16px' }} />
          <h2 style={{ color: theme.textPrimary, marginBottom: '8px' }}>Access Denied</h2>
          <p style={{ color: theme.textSecondary }}>You don't have permission to access published work management.</p>
          <p style={{ color: theme.textSecondary, fontSize: '14px', marginTop: '8px' }}>
            Required role: Super Admin
          </p>
        </div>
      </div>
    );
  }

  const [publishedWorks, setPublishedWorks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingPublishedWork, setEditingPublishedWork] = useState(null);
  const [viewingPublishedWork, setViewingPublishedWork] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

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
    paddingTop: '0.625rem',
    paddingBottom: '0.625rem',
    paddingLeft: '1rem',
    paddingRight: '1rem',
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

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    onResize();
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    fetchPublishedWorks();
  }, []);

  const fetchPublishedWorks = async () => {
    try {
      const response = await api.get('/published-works/admin');
      setPublishedWorks(response.data.publishedWorks || []);
    } catch (error) {
      console.error('Error fetching published works:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('adminAccessToken');
        window.location.href = '/admin/login';
      } else {
        alert('Failed to load published works. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFormSave = () => {
    fetchPublishedWorks();
    setShowFormModal(false);
    setEditingPublishedWork(null);
  };

  const handleCreatePublishedWork = () => {
    setEditingPublishedWork(null);
    setShowFormModal(true);
  };

  const handleEditPublishedWork = (publishedWork) => {
    setEditingPublishedWork(publishedWork);
    setShowFormModal(true);
  };

  const handleViewPublishedWork = (publishedWork) => {
    setViewingPublishedWork(publishedWork);
  };

  const handleDeletePublishedWork = async (publishedWorkId) => {
    if (!window.confirm('Are you sure you want to delete this published work?')) return;

    try {
      await api.delete(`/published-works/admin/${publishedWorkId}`);
      fetchPublishedWorks();
    } catch (error) {
      console.error('Error deleting published work:', error);
      alert('Error deleting published work. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const filteredPublishedWorks = publishedWorks.filter(work => {
    const matchesSearch = work.publication_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         work.person_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         work.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         work.industry.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Pagination logic
  const paginatedPublishedWorks = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredPublishedWorks.slice(startIndex, startIndex + pageSize);
  }, [filteredPublishedWorks, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredPublishedWorks.length / pageSize);

  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: theme.backgroundSoft, color: theme.text, paddingBottom: '3rem' }}>
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
          <div>Loading published works...</div>
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
                Published Work Management
              </h1>
              <p className="text-lg md:text-xl text-[#757575] max-w-3xl mx-auto leading-relaxed font-light">
                Manage and showcase published works and media testimonials from the News Marketplace platform.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Search and Filter Section */}
        <section className="py-8 px-4 sm:px-6 lg:px-8 bg-white border-b border-[#E0E0E0]">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              {/* Search Bar */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#757575] w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search published works..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976D2] focus:border-transparent text-[#212121] bg-white"
                />
              </div>
              <button
                onClick={handleCreatePublishedWork}
                className="bg-[#1976D2] hover:bg-[#0D47A1] text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 whitespace-nowrap"
              >
                <Plus className="w-5 h-5" />
                Add Published Work
              </button>
            </div>
          </div>
        </section>

        {/* Published Works Table */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-[#FAFAFA]">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm border border-[#E0E0E0] overflow-hidden">
              {/* Table Controls */}
              <div className="px-6 py-4 border-b border-[#E5E7EB] bg-[#F8FAFC]">
                <div className="flex justify-between items-center flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-semibold text-[#212121]">Published Works</span>
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
                      <th className="px-6 py-4 text-left font-bold text-xs text-[#212121] uppercase tracking-wider">SN</th>
                      <th className="px-6 py-4 text-left font-bold text-xs text-[#212121] uppercase tracking-wider">Publication Name</th>
                      <th className="px-6 py-4 text-left font-bold text-xs text-[#212121] uppercase tracking-wider">Publication Website</th>
                      <th className="px-6 py-4 text-left font-bold text-xs text-[#212121] uppercase tracking-wider">Article Link</th>
                      <th className="px-6 py-4 text-left font-bold text-xs text-[#212121] uppercase tracking-wider">Article Year</th>
                      <th className="px-6 py-4 text-left font-bold text-xs text-[#212121] uppercase tracking-wider">Article Date</th>
                      <th className="px-6 py-4 text-left font-bold text-xs text-[#212121] uppercase tracking-wider">Company Name</th>
                      <th className="px-6 py-4 text-left font-bold text-xs text-[#212121] uppercase tracking-wider">Person Name</th>
                      <th className="px-6 py-4 text-left font-bold text-xs text-[#212121] uppercase tracking-wider">Industry</th>
                      <th className="px-6 py-4 text-left font-bold text-xs text-[#212121] uppercase tracking-wider">Company Country</th>
                      <th className="px-6 py-4 text-left font-bold text-xs text-[#212121] uppercase tracking-wider">Individual Country</th>
                      <th className="px-6 py-4 text-left font-bold text-xs text-[#212121] uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedPublishedWorks.map((work, index) => (
                      <tr key={work.id} className={index % 2 === 0 ? 'bg-white' : 'bg-[#FAFBFC]'}>
                        <td className="px-6 py-4 text-sm text-[#212121]">{work.sn}</td>
                        <td className="px-6 py-4 text-sm text-[#212121]">{work.publication_name}</td>
                        <td className="px-6 py-4 text-sm text-[#1976D2]">
                          <a href={work.publication_website} target="_blank" rel="noopener noreferrer" className="text-[#1976D2] hover:text-[#0D47A1] underline">
                            {work.publication_website.length > 30 ? `${work.publication_website.substring(0, 30)}...` : work.publication_website}
                          </a>
                        </td>
                        <td className="px-6 py-4 text-sm text-[#1976D2]">
                          <a href={work.article_link} target="_blank" rel="noopener noreferrer" className="text-[#1976D2] hover:text-[#0D47A1] underline">
                            {work.article_link.length > 30 ? `${work.article_link.substring(0, 30)}...` : work.article_link}
                          </a>
                        </td>
                        <td className="px-6 py-4 text-sm text-[#212121]">{work.article_year || 'N/A'}</td>
                        <td className="px-6 py-4 text-sm text-[#212121]">{formatDate(work.article_date)}</td>
                        <td className="px-6 py-4 text-sm text-[#212121]">{work.company_name}</td>
                        <td className="px-6 py-4 text-sm text-[#212121]">{work.person_name}</td>
                        <td className="px-6 py-4 text-sm text-[#212121]">{work.industry}</td>
                        <td className="px-6 py-4 text-sm text-[#212121]">{work.company_country}</td>
                        <td className="px-6 py-4 text-sm text-[#212121]">{work.individual_country}</td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleViewPublishedWork(work)}
                              className="px-3 py-2 bg-[#9C27B0] hover:bg-[#7B1FA2] text-white rounded text-xs font-medium transition-colors flex items-center gap-1"
                            >
                              <Eye className="w-3 h-3" />
                              View
                            </button>
                            <button
                              onClick={() => handleEditPublishedWork(work)}
                              className="px-3 py-2 bg-[#1976D2] hover:bg-[#0D47A1] text-white rounded text-xs font-medium transition-colors flex items-center gap-1"
                            >
                              <Edit className="w-3 h-3" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeletePublishedWork(work.id)}
                              className="px-3 py-2 bg-[#F44336] hover:bg-[#D32F2F] text-white rounded text-xs font-medium transition-colors flex items-center gap-1"
                            >
                              <Trash2 className="w-3 h-3" />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredPublishedWorks.length === 0 && (
                <div className="px-6 py-20 text-center">
                  <div className="w-24 h-24 bg-[#F5F5F5] rounded-full flex items-center justify-center mx-auto mb-6">
                    <BookOpen className="w-12 h-12 text-[#BDBDBD]" />
                  </div>
                  <h3 className="text-2xl font-semibold text-[#212121] mb-3">No published works found</h3>
                  <p className="text-[#757575] mb-6 max-w-md mx-auto">
                    Get started by adding your first published work to showcase media coverage and testimonials.
                  </p>
                  <button
                    onClick={handleCreatePublishedWork}
                    className="bg-[#1976D2] hover:bg-[#0D47A1] text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 mx-auto"
                  >
                    <Plus className="w-5 h-5" />
                    Add First Published Work
                  </button>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-[#E5E7EB] bg-[#F8FAFC] flex justify-center items-center gap-4">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-[#E0E0E0] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#F5F5F5] transition-colors text-sm"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-[#757575]">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-[#E0E0E0] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#F5F5F5] transition-colors text-sm"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Statistics */}
        {publishedWorks.length > 0 && (
          <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-2xl font-semibold text-[#212121] mb-6">Management Statistics</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#E3F2FD] rounded-lg p-6 border border-[#E0E0E0]">
                  <div className="text-3xl font-bold text-[#1976D2] mb-2">{publishedWorks.length}</div>
                  <div className="text-[#757575]">Total Published Works</div>
                </div>
                <div className="bg-[#E0F2F1] rounded-lg p-6 border border-[#E0E0E0]">
                  <div className="text-3xl font-bold text-[#00796B] mb-2">
                    {publishedWorks.filter(work => work.is_featured).length}
                  </div>
                  <div className="text-[#757575]">Featured Works</div>
                </div>
                <div className="bg-[#FFF3E0] rounded-lg p-6 border border-[#E0E0E0]">
                  <div className="text-3xl font-bold text-[#FF9800] mb-2">
                    {new Set(publishedWorks.map(work => work.industry)).size}
                  </div>
                  <div className="text-[#757575]">Industries Covered</div>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Published Work Form Modal */}
      <PublishedWorkFormModal
        isOpen={showFormModal}
        onClose={() => setShowFormModal(false)}
        publishedWork={editingPublishedWork}
        onSave={handleFormSave}
      />

      {/* Published Work View Modal */}
      <PublishedWorkViewModal
        isOpen={!!viewingPublishedWork}
        onClose={() => setViewingPublishedWork(null)}
        publishedWork={viewingPublishedWork}
      />
    </div>
  );
};

export default PublishedWorkManagement;
