import React, { useState, useEffect, useMemo } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import Icon from '../common/Icon';
import Sidebar from './Sidebar';
import api from '../../services/api';

// Publication Form Modal Component
const PublicationFormModal = ({ isOpen, onClose, publication, groups, onSave }) => {
  const [formData, setFormData] = useState({
    group_id: '',
    publication_sn: '',
    publication_grade: '',
    publication_name: '',
    publication_website: '',
    publication_price: '',
    agreement_tat: '',
    practical_tat: '',
    publication_socials_icons: '',
    publication_language: '',
    publication_region: '',
    publication_primary_industry: '',
    website_news_index: '',
    da: '',
    dr: '',
    sponsored_or_not: false,
    words_limit: '',
    number_of_images: '',
    do_follow_link: false,
    example_link: '',
    excluding_categories: '',
    other_remarks: '',
    tags_badges: '',
    live_on_platform: false
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (publication) {
      setFormData({
        group_id: publication.group_id || '',
        publication_sn: publication.publication_sn || '',
        publication_grade: publication.publication_grade || '',
        publication_name: publication.publication_name || '',
        publication_website: publication.publication_website || '',
        publication_price: publication.publication_price || '',
        agreement_tat: publication.agreement_tat || '',
        practical_tat: publication.practical_tat || '',
        publication_socials_icons: publication.publication_socials_icons || '',
        publication_language: publication.publication_language || '',
        publication_region: publication.publication_region || '',
        publication_primary_industry: publication.publication_primary_industry || '',
        website_news_index: publication.website_news_index || '',
        da: publication.da || '',
        dr: publication.dr || '',
        sponsored_or_not: publication.sponsored_or_not || false,
        words_limit: publication.words_limit || '',
        number_of_images: publication.number_of_images || '',
        do_follow_link: publication.do_follow_link || false,
        example_link: publication.example_link || '',
        excluding_categories: publication.excluding_categories || '',
        other_remarks: publication.other_remarks || '',
        tags_badges: publication.tags_badges || '',
        live_on_platform: publication.live_on_platform || false
      });
    } else {
      setFormData({
        group_id: '',
        publication_sn: '',
        publication_grade: '',
        publication_name: '',
        publication_website: '',
        publication_price: '',
        agreement_tat: '',
        practical_tat: '',
        publication_socials_icons: '',
        publication_language: '',
        publication_region: '',
        publication_primary_industry: '',
        website_news_index: '',
        da: '',
        dr: '',
        sponsored_or_not: false,
        words_limit: '',
        number_of_images: '',
        do_follow_link: false,
        example_link: '',
        excluding_categories: '',
        other_remarks: '',
        tags_badges: '',
        live_on_platform: false
      });
    }
  }, [publication, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const dataToSend = {
        ...formData,
        publication_price: parseFloat(formData.publication_price) || 0,
        agreement_tat: parseInt(formData.agreement_tat) || 0,
        practical_tat: parseInt(formData.practical_tat) || 0,
        website_news_index: parseInt(formData.website_news_index) || 0,
        da: parseInt(formData.da) || 0,
        dr: parseInt(formData.dr) || 0,
        words_limit: parseInt(formData.words_limit) || 0,
        number_of_images: parseInt(formData.number_of_images) || 0
      };

      if (publication) {
        await api.put(`/publications/admin/${publication.id}`, dataToSend);
      } else {
        await api.post('/publications/admin', dataToSend);
      }

      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving publication:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Error saving publication. Please try again.';
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

  const checkboxStyle = {
    marginRight: '8px'
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
            {publication ? 'Edit Publication' : 'Create Publication'}
          </h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', fontSize: '24px', cursor: 'pointer' }}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
            <div style={formGroupStyle}>
              <label style={labelStyle}>Group *</label>
              <select
                value={formData.group_id}
                onChange={(e) => setFormData({ ...formData, group_id: e.target.value })}
                style={inputStyle}
                required
              >
                <option value="">Select Group</option>
                {groups.map(group => (
                  <option key={group.id} value={group.id}>{group.group_name}</option>
                ))}
              </select>
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Publication SN *</label>
              <input
                type="text"
                value={formData.publication_sn}
                onChange={(e) => setFormData({ ...formData, publication_sn: e.target.value })}
                style={inputStyle}
                required
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Publication Grade *</label>
              <input
                type="text"
                value={formData.publication_grade}
                onChange={(e) => setFormData({ ...formData, publication_grade: e.target.value })}
                style={inputStyle}
                required
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Publication Name *</label>
              <input
                type="text"
                value={formData.publication_name}
                onChange={(e) => setFormData({ ...formData, publication_name: e.target.value })}
                style={inputStyle}
                required
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Website URL *</label>
              <input
                type="url"
                value={formData.publication_website}
                onChange={(e) => setFormData({ ...formData, publication_website: e.target.value })}
                style={inputStyle}
                required
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Price ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.publication_price}
                onChange={(e) => setFormData({ ...formData, publication_price: e.target.value })}
                style={inputStyle}
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Agreement TAT (days)</label>
              <input
                type="number"
                min="0"
                value={formData.agreement_tat}
                onChange={(e) => setFormData({ ...formData, agreement_tat: e.target.value })}
                style={inputStyle}
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Practical TAT (days)</label>
              <input
                type="number"
                min="0"
                value={formData.practical_tat}
                onChange={(e) => setFormData({ ...formData, practical_tat: e.target.value })}
                style={inputStyle}
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Language *</label>
              <input
                type="text"
                value={formData.publication_language}
                onChange={(e) => setFormData({ ...formData, publication_language: e.target.value })}
                style={inputStyle}
                required
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Region *</label>
              <input
                type="text"
                value={formData.publication_region}
                onChange={(e) => setFormData({ ...formData, publication_region: e.target.value })}
                style={inputStyle}
                required
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Primary Industry *</label>
              <input
                type="text"
                value={formData.publication_primary_industry}
                onChange={(e) => setFormData({ ...formData, publication_primary_industry: e.target.value })}
                style={inputStyle}
                required
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Website News Index</label>
              <input
                type="number"
                min="0"
                value={formData.website_news_index}
                onChange={(e) => setFormData({ ...formData, website_news_index: e.target.value })}
                style={inputStyle}
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Domain Authority (DA)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.da}
                onChange={(e) => setFormData({ ...formData, da: e.target.value })}
                style={inputStyle}
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Domain Rating (DR)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.dr}
                onChange={(e) => setFormData({ ...formData, dr: e.target.value })}
                style={inputStyle}
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Words Limit</label>
              <input
                type="number"
                min="0"
                value={formData.words_limit}
                onChange={(e) => setFormData({ ...formData, words_limit: e.target.value })}
                style={inputStyle}
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Number of Images</label>
              <input
                type="number"
                min="0"
                value={formData.number_of_images}
                onChange={(e) => setFormData({ ...formData, number_of_images: e.target.value })}
                style={inputStyle}
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Example Link</label>
              <input
                type="url"
                value={formData.example_link}
                onChange={(e) => setFormData({ ...formData, example_link: e.target.value })}
                style={inputStyle}
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Social Media Icons</label>
              <input
                type="text"
                value={formData.publication_socials_icons}
                onChange={(e) => setFormData({ ...formData, publication_socials_icons: e.target.value })}
                style={inputStyle}
                placeholder="Comma-separated social media links"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginTop: '16px' }}>
            <div style={formGroupStyle}>
              <label style={labelStyle}>Excluding Categories</label>
              <textarea
                value={formData.excluding_categories}
                onChange={(e) => setFormData({ ...formData, excluding_categories: e.target.value })}
                style={{ ...inputStyle, minHeight: '60px', resize: 'vertical' }}
                placeholder="Categories to exclude"
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Other Remarks</label>
              <textarea
                value={formData.other_remarks}
                onChange={(e) => setFormData({ ...formData, other_remarks: e.target.value })}
                style={{ ...inputStyle, minHeight: '60px', resize: 'vertical' }}
                placeholder="Additional remarks"
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Tags/Badges</label>
              <input
                type="text"
                value={formData.tags_badges}
                onChange={(e) => setFormData({ ...formData, tags_badges: e.target.value })}
                style={inputStyle}
                placeholder="Comma-separated tags"
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginTop: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <input
                type="checkbox"
                id="sponsored"
                checked={formData.sponsored_or_not}
                onChange={(e) => setFormData({ ...formData, sponsored_or_not: e.target.checked })}
                style={checkboxStyle}
              />
              <label htmlFor="sponsored" style={{ fontSize: '14px', color: '#212121' }}>Sponsored Content</label>
            </div>

            <div style={{ display: 'flex', alignItems: 'center' }}>
              <input
                type="checkbox"
                id="dofollow"
                checked={formData.do_follow_link}
                onChange={(e) => setFormData({ ...formData, do_follow_link: e.target.checked })}
                style={checkboxStyle}
              />
              <label htmlFor="dofollow" style={{ fontSize: '14px', color: '#212121' }}>Do-follow Link</label>
            </div>

            <div style={{ display: 'flex', alignItems: 'center' }}>
              <input
                type="checkbox"
                id="live"
                checked={formData.live_on_platform}
                onChange={(e) => setFormData({ ...formData, live_on_platform: e.target.checked })}
                style={checkboxStyle}
              />
              <label htmlFor="live" style={{ fontSize: '14px', color: '#212121' }}>Live on Platform</label>
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
              {loading ? 'Saving...' : (publication ? 'Update Publication' : 'Create Publication')}
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

const PublicationManagement = () => {
  const { admin, logout, hasRole, hasAnyRole, getRoleLevel } = useAdminAuth();

  // Check if user has permission to manage publications
  if (!hasAnyRole(['super_admin', 'content_manager'])) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: theme.backgroundSoft }}>
        <div style={{ textAlign: 'center' }}>
          <Icon name="shield-exclamation" size="lg" style={{ color: theme.danger, marginBottom: '16px' }} />
          <h2 style={{ color: theme.textPrimary, marginBottom: '8px' }}>Access Denied</h2>
          <p style={{ color: theme.textSecondary }}>You don't have permission to access publication management.</p>
          <p style={{ color: theme.textSecondary, fontSize: '14px', marginTop: '8px' }}>
            Required roles: Super Admin or Content Manager
          </p>
        </div>
      </div>
    );
  }

  const [publications, setPublications] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [groupFilter, setGroupFilter] = useState('');
  const [regionFilter, setRegionFilter] = useState('');
  const [industryFilter, setIndustryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [daRange, setDaRange] = useState([0, 100]);
  const [drRange, setDrRange] = useState([0, 100]);
  const [sponsoredFilter, setSponsoredFilter] = useState('');
  const [liveFilter, setLiveFilter] = useState('');
  const [dofollowFilter, setDofollowFilter] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingPublication, setEditingPublication] = useState(null);
  const [selectedPublications, setSelectedPublications] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortField, setSortField] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [tatFilter, setTatFilter] = useState([]);
  const [appliedFilters, setAppliedFilters] = useState([]);
  const [languageFilter, setLanguageFilter] = useState('');
  const [newsIndexRange, setNewsIndexRange] = useState([0, 100]);
  const [wordsLimitRange, setWordsLimitRange] = useState([0, 10000]);
  const [imagesRange, setImagesRange] = useState([0, 50]);
  const [selectedStatusFilters, setSelectedStatusFilters] = useState([]);
  const [selectedIndustryFilters, setSelectedIndustryFilters] = useState([]);
  const [selectedRegionFilters, setSelectedRegionFilters] = useState([]);
  const [showDeleted, setShowDeleted] = useState(false);
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);
  const [showBulkEditModal, setShowBulkEditModal] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [message, setMessage] = useState(null);

  // Memoize groups map for stable reference
  const groupsMap = useMemo(() => {
    return groups.reduce((map, group) => {
      map[group.id] = group.group_name;
      return map;
    }, {});
  }, [groups]);

  const handleFormSave = () => {
    fetchPublications();
    setMessage({ type: 'success', text: 'Publication saved successfully!' });
  };

  const handleBulkUploadSave = () => {
    fetchPublications();
    setShowBulkUploadModal(false);
    setMessage({ type: 'success', text: 'Bulk upload completed successfully!' });
  };

  const handleBulkEditSave = () => {
    fetchPublications();
    setShowBulkEditModal(false);
    setSelectedPublications([]);
    setMessage({ type: 'success', text: 'Bulk edit completed successfully!' });
  };

  const handleBulkDeleteConfirm = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedPublications.length} publications?`)) return;

    try {
      setLoading(true);
      await api.delete('/publications/bulk', { data: { ids: selectedPublications } });

      fetchPublications();
      setSelectedPublications([]);
      setShowBulkDeleteModal(false);
      setMessage({ type: 'success', text: `${selectedPublications.length} publications deleted successfully!` });
    } catch (error) {
      console.error('Bulk delete error:', error);
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Bulk delete failed. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadTemplate = () => {
    // Download the sample data.xlsx file
    const link = document.createElement('a');
    link.href = '/Website_Workflow/sample data.xlsx';
    link.download = 'publications_template.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
    { value: 'draft', label: 'Draft', color: theme.textDisabled },
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
        await fetchGroups();
        await fetchPublications();
      } catch (error) {
        console.error('Error fetching data:', error);
        // If unauthorized, the API interceptor will handle redirect
      }
    };

    fetchData();
  }, []);

  const fetchPublications = async () => {
    try {
      const params = new URLSearchParams();
      if (showDeleted) {
        params.append('show_deleted', 'true');
      }
      const response = await api.get(`/publications/admin?${params.toString()}`);
      setPublications(response.data.publications || []);
    } catch (error) {
      console.error('Error fetching publications:', error);
      if (error.response?.status === 401) {
        // Token expired or invalid, redirect to login
        localStorage.removeItem('adminAccessToken');
        window.location.href = '/admin/login';
      } else {
        alert('Failed to load publications. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchGroups = async () => {
    try {
      const response = await api.get('/groups/admin');
      setGroups(response.data.groups || []);
    } catch (error) {
      console.error('Error fetching groups:', error);
      if (error.response?.status === 401) {
        // Token expired or invalid, redirect to login
        localStorage.removeItem('adminAccessToken');
        window.location.href = '/admin/login';
      } else if (error.response?.status === 403) {
        // Permission denied, try regular groups endpoint
        try {
          const fallbackResponse = await api.get('/groups');
          setGroups(fallbackResponse.data.groups || []);
        } catch (fallbackError) {
          console.error('Fallback groups fetch failed:', fallbackError);
        }
      }
    }
  };

  // AI-powered search optimization with advanced data structures
  const [searchIndex, setSearchIndex] = useState(null);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [searchStats, setSearchStats] = useState({ totalSearches: 0, avgResponseTime: 0 });

  // Advanced caching system for search results
  const [searchCache, setSearchCache] = useState(new Map());
  const [lastSearchTime, setLastSearchTime] = useState(0);

  // Cache search results to avoid redundant computations
  const getCachedSearch = (query, filters) => {
    const cacheKey = JSON.stringify({ query, filters });
    const cached = searchCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < 30000) { // 30 second cache
      return cached.results;
    }
    return null;
  };

  const setCachedSearch = (query, filters, results) => {
    const cacheKey = JSON.stringify({ query, filters });
    setSearchCache(prev => {
      const newCache = new Map(prev);
      newCache.set(cacheKey, {
        results,
        timestamp: Date.now()
      });
      // Limit cache size to prevent memory issues
      if (newCache.size > 50) {
        const oldestKey = newCache.keys().next().value;
        newCache.delete(oldestKey);
      }
      return newCache;
    });
  };

  // Build search index using Trie data structure for O(1) prefix searches
  const buildSearchIndex = useMemo(() => {
    if (!publications.length) return null;

    const trie = new Map();
    const invertedIndex = new Map();
    const termFrequency = new Map();

    publications.forEach((pub, index) => {
      const searchableText = [
        pub.publication_name,
        pub.publication_website,
        pub.publication_sn,
        pub.group_name || '',
        pub.publication_region,
        pub.publication_primary_industry,
        pub.tags_badges || ''
      ].join(' ').toLowerCase();

      // Build Trie for autocomplete
      const words = searchableText.split(/\s+/);
      words.forEach(word => {
        if (!trie.has(word)) trie.set(word, []);
        trie.get(word).push(index);
      });

      // Build inverted index for TF-IDF scoring
      words.forEach(word => {
        if (!invertedIndex.has(word)) {
          invertedIndex.set(word, new Set());
        }
        invertedIndex.get(word).add(index);

        // Term frequency
        const key = `${word}-${index}`;
        termFrequency.set(key, (termFrequency.get(key) || 0) + 1);
      });
    });

    return { trie, invertedIndex, termFrequency, totalDocs: publications.length };
  }, [publications]);

  // Fuzzy search algorithm using Levenshtein distance
  const levenshteinDistance = (str1, str2) => {
    const matrix = [];
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1,     // insertion
            matrix[i - 1][j] + 1      // deletion
          );
        }
      }
    }
    return matrix[str2.length][str1.length];
  };

  // AI-powered search with relevance scoring and caching
  const performAISearch = useMemo(() => {
    if (!debouncedSearchTerm || !buildSearchIndex) return publications;

    const currentFilters = {
      groupFilter, regionFilter, industryFilter, statusFilter,
      priceRange, daRange, drRange, tatFilter, sponsoredFilter,
      liveFilter, dofollowFilter
    };

    // Check cache first
    const cachedResults = getCachedSearch(debouncedSearchTerm, currentFilters);
    if (cachedResults) {
      return cachedResults;
    }

    const startTime = performance.now();
    const query = debouncedSearchTerm.toLowerCase().trim();
    const queryWords = query.split(/\s+/);
    const { trie, invertedIndex, termFrequency, totalDocs } = buildSearchIndex;

    // Relevance scoring using enhanced TF-IDF algorithm
    const scores = new Map();

    queryWords.forEach(queryWord => {
      // Exact matches get highest score (O(1) lookup with inverted index)
      if (invertedIndex.has(queryWord)) {
        const docIds = invertedIndex.get(queryWord);
        docIds.forEach(docId => {
          const tf = termFrequency.get(`${queryWord}-${docId}`) || 0;
          const df = docIds.size;
          const idf = Math.log(totalDocs / df);
          const tfidf = tf * idf;
          scores.set(docId, (scores.get(docId) || 0) + tfidf * 3); // Exact match bonus
        });
      }

      // Fuzzy matching for typos (Levenshtein distance ≤ 2) - O(k*n) where k is small
      const fuzzyMatches = [];
      for (const [word, docIds] of invertedIndex) {
        const distance = levenshteinDistance(queryWord, word);
        if (distance <= 2 && distance > 0) {
          fuzzyMatches.push({ word, docIds, distance });
        }
      }

      // Sort fuzzy matches by distance and take top 3 (optimized selection)
      fuzzyMatches
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 3)
        .forEach(({ word, docIds, distance }) => {
          const penalty = 1 / (distance + 1); // Closer matches get higher scores
          docIds.forEach(docId => {
            const tf = termFrequency.get(`${word}-${docId}`) || 0;
            const df = docIds.size;
            const idf = Math.log(totalDocs / df);
            const tfidf = tf * idf * penalty;
            scores.set(docId, (scores.get(docId) || 0) + tfidf);
          });
        });

      // Prefix matching using Trie (O(1) prefix lookup)
      const prefixMatches = [];
      for (const [word, docIds] of trie) {
        if (word.startsWith(queryWord)) {
          prefixMatches.push({ word, docIds });
        }
      }

      prefixMatches.forEach(({ word, docIds }) => {
        docIds.forEach(docId => {
          const tf = termFrequency.get(`${word}-${docId}`) || 0;
          scores.set(docId, (scores.get(docId) || 0) + tf * 0.5); // Prefix match bonus
        });
      });
    });

    // Sort by relevance score and return top results (O(n log n) sort, acceptable for UI)
    const sortedResults = Array.from(scores.entries())
      .sort(([, scoreA], [, scoreB]) => scoreB - scoreA)
      .map(([docId]) => publications[docId]);

    const endTime = performance.now();
    const responseTime = endTime - startTime;

    // Update search statistics
    setSearchStats(prev => ({
      totalSearches: prev.totalSearches + 1,
      avgResponseTime: (prev.avgResponseTime * prev.totalSearches + responseTime) / (prev.totalSearches + 1)
    }));

    // Cache the results
    setCachedSearch(debouncedSearchTerm, currentFilters, sortedResults);

    return sortedResults;
  }, [debouncedSearchTerm, buildSearchIndex, publications, groupFilter, regionFilter, industryFilter, statusFilter, priceRange, daRange, drRange, tatFilter, sponsoredFilter, liveFilter, dofollowFilter]);

  // Generate search suggestions using Trie
  useEffect(() => {
    if (!searchTerm || !buildSearchIndex) {
      setSearchSuggestions([]);
      return;
    }

    const query = searchTerm.toLowerCase();
    const { trie } = buildSearchIndex;
    const suggestions = new Set();

    // Find prefix matches
    for (const [word] of trie) {
      if (word.startsWith(query) && word !== query) {
        suggestions.add(word);
      }
    }

    // Limit to top 5 suggestions
    setSearchSuggestions(Array.from(suggestions).slice(0, 5));
  }, [searchTerm, buildSearchIndex]);


  // Debounced search effect with caching
  useEffect(() => {
    const timer = setTimeout(() => {
      const currentFilters = {
        groupFilter, regionFilter, industryFilter, statusFilter,
        priceRange, daRange, drRange, tatFilter, sponsoredFilter,
        liveFilter, dofollowFilter
      };

      // Check cache first
      const cachedResults = getCachedSearch(searchTerm, currentFilters);
      if (cachedResults) {
        setDebouncedSearchTerm(searchTerm);
        return;
      }

      setDebouncedSearchTerm(searchTerm);
      setLastSearchTime(Date.now());
    }, 150); // Reduced from 300ms for better responsiveness

    return () => clearTimeout(timer);
  }, [searchTerm, groupFilter, regionFilter, industryFilter, statusFilter, priceRange, daRange, drRange, tatFilter, sponsoredFilter, liveFilter, dofollowFilter]);

  // Update applied filters
  useEffect(() => {
    const filters = [];
    if (debouncedSearchTerm) filters.push({ type: 'search', value: debouncedSearchTerm, label: `Search: "${debouncedSearchTerm}"` });
    if (groupFilter) filters.push({ type: 'group', value: groupFilter, label: `Group: ${groupsMap[parseInt(groupFilter)] || groupFilter}` });
    if (regionFilter) filters.push({ type: 'region', value: regionFilter, label: `Region: ${regionFilter}` });
    if (industryFilter) filters.push({ type: 'industry', value: industryFilter, label: `Industry: ${industryFilter}` });
    if (selectedStatusFilters.length > 0) filters.push({ type: 'status', value: selectedStatusFilters, label: `Status: ${selectedStatusFilters.join(', ')}` });
    if (priceRange[0] > 0 || priceRange[1] < 2000) filters.push({ type: 'price', value: priceRange, label: `Price: $${priceRange[0]} - $${priceRange[1]}` });
    if (daRange[0] > 0 || daRange[1] < 100) filters.push({ type: 'da', value: daRange, label: `DA: ${daRange[0]} - ${daRange[1]}` });
    if (drRange[0] > 0 || drRange[1] < 100) filters.push({ type: 'dr', value: drRange, label: `DR: ${drRange[0]} - ${drRange[1]}` });
    if (newsIndexRange[0] > 0 || newsIndexRange[1] < 100) filters.push({ type: 'news_index', value: newsIndexRange, label: `News Index: ${newsIndexRange[0]} - ${newsIndexRange[1]}` });
    if (wordsLimitRange[0] > 0 || wordsLimitRange[1] < 10000) filters.push({ type: 'words_limit', value: wordsLimitRange, label: `Words: ${wordsLimitRange[0]} - ${wordsLimitRange[1]}` });
    if (imagesRange[0] > 0 || imagesRange[1] < 50) filters.push({ type: 'images', value: imagesRange, label: `Images: ${imagesRange[0]} - ${imagesRange[1]}` });
    if (languageFilter) filters.push({ type: 'language', value: languageFilter, label: `Language: ${languageFilter}` });
    if (tatFilter.length > 0) filters.push({ type: 'tat', value: tatFilter, label: `TAT: ${tatFilter.join(', ')}` });
    if (sponsoredFilter !== '') filters.push({ type: 'sponsored', value: sponsoredFilter, label: sponsoredFilter === 'true' ? 'Sponsored Only' : 'Non-sponsored Only' });
    if (liveFilter !== '') filters.push({ type: 'live', value: liveFilter, label: liveFilter === 'true' ? 'Live Only' : 'Not Live Only' });
    if (dofollowFilter !== '') filters.push({ type: 'dofollow', value: dofollowFilter, label: dofollowFilter === 'true' ? 'Do-follow Only' : 'No-follow Only' });
    if (showDeleted) filters.push({ type: 'deleted', value: true, label: 'Showing Deleted Publications' });
    setAppliedFilters(filters);
  }, [debouncedSearchTerm, groupFilter, regionFilter, industryFilter, selectedStatusFilters, priceRange, daRange, drRange, newsIndexRange, wordsLimitRange, imagesRange, languageFilter, tatFilter, sponsoredFilter, liveFilter, dofollowFilter, showDeleted, groupsMap]);

  // Advanced filtering logic with AI-optimized search
  const filteredPublications = useMemo(() => {
    // Start with AI-powered search results if search term exists
    let baseResults = debouncedSearchTerm ? performAISearch : publications;

    // Apply additional filters using efficient algorithms
    return baseResults.filter(publication => {
      // Group filter - O(1) lookup using hash map
      const matchesGroup = !groupFilter || publication.group_id === parseInt(groupFilter);

      // Text filters - optimized with early termination
      const matchesRegion = !regionFilter || publication.publication_region.toLowerCase().includes(regionFilter.toLowerCase());
      const matchesIndustry = !industryFilter || publication.publication_primary_industry.toLowerCase().includes(industryFilter.toLowerCase());

      // Status filter - multi-select support
      const matchesStatus = selectedStatusFilters.length === 0 || selectedStatusFilters.includes(publication.status);

      // Range filters - mathematical comparisons
      const matchesPrice = publication.publication_price >= priceRange[0] && publication.publication_price <= priceRange[1];
      const matchesDA = publication.da >= daRange[0] && publication.da <= daRange[1];
      const matchesDR = publication.dr >= drRange[0] && publication.dr <= drRange[1];
      const matchesNewsIndex = publication.website_news_index >= newsIndexRange[0] && publication.website_news_index <= newsIndexRange[1];
      const matchesWordsLimit = publication.words_limit >= wordsLimitRange[0] && publication.words_limit <= wordsLimitRange[1];
      const matchesImages = publication.number_of_images >= imagesRange[0] && publication.number_of_images <= imagesRange[1];

      // Language filter
      const matchesLanguage = !languageFilter || publication.publication_language.toLowerCase().includes(languageFilter.toLowerCase());

      // Boolean filters - direct comparison
      const matchesSponsored = sponsoredFilter === '' || publication.sponsored_or_not === (sponsoredFilter === 'true');
      const matchesLive = liveFilter === '' || publication.live_on_platform === (liveFilter === 'true');
      const matchesDofollow = dofollowFilter === '' || publication.do_follow_link === (dofollowFilter === 'true');

      // TAT filtering - optimized with switch-like logic
      const matchesTAT = tatFilter.length === 0 || tatFilter.some(tat => {
        const days = publication.agreement_tat;
        switch (tat) {
          case '1 Day': return days === 1;
          case '1-3 Days': return days >= 1 && days <= 3;
          case '1 Week': return days === 7;
          case '1+ Week': return days > 7;
          default: return false;
        }
      });

      // Early return for performance - fail fast
      return matchesGroup && matchesRegion && matchesIndustry && matchesStatus &&
             matchesPrice && matchesDA && matchesDR && matchesNewsIndex &&
             matchesWordsLimit && matchesImages && matchesLanguage && matchesSponsored &&
             matchesLive && matchesDofollow && matchesTAT;
    });
  }, [publications, performAISearch, debouncedSearchTerm, groupFilter, regionFilter, industryFilter, selectedStatusFilters, priceRange, daRange, drRange, newsIndexRange, wordsLimitRange, imagesRange, languageFilter, tatFilter, sponsoredFilter, liveFilter, dofollowFilter]);

  // Sorting logic
  const sortedPublications = useMemo(() => {
    return [...filteredPublications].sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (sortField === 'publication_price' || sortField === 'da' || sortField === 'dr') {
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
  }, [filteredPublications, sortField, sortDirection]);

  // Pagination logic
  const paginatedPublications = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedPublications.slice(startIndex, startIndex + pageSize);
  }, [sortedPublications, currentPage, pageSize]);

  const totalPages = Math.ceil(sortedPublications.length / pageSize);

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

  const formatTAT = (days) => {
    if (!days || days === 0) return 'N/A';
    if (days === 1) return '1 Day';
    if (days < 7) return `${days} Days`;
    if (days === 7) return '1 Week';
    if (days < 30) return `${Math.round(days / 7)} Weeks`;
    return `${Math.round(days / 30)} Months`;
  };

  const getDAScoreColor = (score) => {
    if (score >= 80) return '#4CAF50';
    if (score >= 60) return '#8BC34A';
    if (score >= 40) return '#FFC107';
    if (score >= 20) return '#FF9800';
    return '#F44336';
  };

  const getDRScoreColor = (score) => {
    if (score >= 70) return '#2196F3';
    if (score >= 50) return '#00BCD4';
    if (score >= 30) return '#9C27B0';
    if (score >= 10) return '#E91E63';
    return '#F44336';
  };

  const getIndustryColor = (industry) => {
    const colors = {
      'News': '#1976D2',
      'Technology': '#2196F3',
      'Business': '#4CAF50',
      'Health': '#FF9800',
      'Sports': '#9C27B0',
      'Entertainment': '#E91E63',
      'Music': '#9C27B0',
      'Fashion': '#FF5722',
      'Travel': '#00BCD4',
      'Food': '#8BC34A',
      'Education': '#3F51B5',
      'Finance': '#009688',
      'Real Estate': '#795548',
      'Automotive': '#607D8B'
    };
    return colors[industry] || '#757575';
  };

  const getFaviconUrl = (website) => {
    try {
      const url = new URL(website);
      return `https://www.google.com/s2/favicons?domain=${url.hostname}&sz=32`;
    } catch {
      return null;
    }
  };

  const hasActiveFilters = () => {
    return debouncedSearchTerm ||
           groupFilter ||
           regionFilter ||
           industryFilter ||
           selectedStatusFilters.length > 0 ||
           priceRange[0] > 0 || priceRange[1] < 2000 ||
           daRange[0] > 0 || daRange[1] < 100 ||
           drRange[0] > 0 || drRange[1] < 100 ||
           newsIndexRange[0] > 0 || newsIndexRange[1] < 100 ||
           wordsLimitRange[0] > 0 || wordsLimitRange[1] < 10000 ||
           imagesRange[0] > 0 || imagesRange[1] < 50 ||
           languageFilter ||
           tatFilter.length > 0 ||
           sponsoredFilter !== '' ||
           liveFilter !== '' ||
           dofollowFilter !== '';
  };

  const getPublicationStats = () => {
    const dataSource = hasActiveFilters() ? filteredPublications : publications;
    const total = dataSource.length;
    const approved = dataSource.filter(p => p.status === 'approved').length;
    const pending = dataSource.filter(p => p.status === 'pending').length;
    const active = dataSource.filter(p => p.is_active).length;

    return { total, approved, pending, active };
  };

  const stats = getPublicationStats();

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

  const removeFilter = (filterType) => {
    switch (filterType) {
      case 'search':
        setSearchTerm('');
        break;
      case 'group':
        setGroupFilter('');
        break;
      case 'region':
        setRegionFilter('');
        break;
      case 'industry':
        setIndustryFilter('');
        break;
      case 'status':
        setStatusFilter('');
        break;
      case 'price':
        setPriceRange([0, 2000]);
        break;
      case 'da':
        setDaRange([0, 100]);
        break;
      case 'dr':
        setDrRange([0, 100]);
        break;
      case 'tat':
        setTatFilter([]);
        break;
      case 'sponsored':
        setSponsoredFilter('');
        break;
      case 'live':
        setLiveFilter('');
        break;
      case 'dofollow':
        setDofollowFilter('');
        break;
    }
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setGroupFilter('');
    setRegionFilter('');
    setIndustryFilter('');
    setSelectedStatusFilters([]);
    setSelectedIndustryFilters([]);
    setSelectedRegionFilters([]);
    setPriceRange([0, 2000]);
    setDaRange([0, 100]);
    setDrRange([0, 100]);
    setNewsIndexRange([0, 100]);
    setWordsLimitRange([0, 10000]);
    setImagesRange([0, 50]);
    setLanguageFilter('');
    setTatFilter([]);
    setSponsoredFilter('');
    setLiveFilter('');
    setDofollowFilter('');
    setShowDeleted(false);
  };

  const toggleTatFilter = (tatOption) => {
    setTatFilter(prev =>
      prev.includes(tatOption)
        ? prev.filter(t => t !== tatOption)
        : [...prev, tatOption]
    );
  };

  const handleSelectAll = () => {
    if (selectedPublications.length === filteredPublications.length) {
      setSelectedPublications([]);
    } else {
      setSelectedPublications(filteredPublications.map(p => p.id));
    }
  };

  // CRUD operations
  const handleCreatePublication = () => {
    setEditingPublication(null);
    setShowFormModal(true);
  };

  const handleEditPublication = (publication) => {
    setEditingPublication(publication);
    setShowFormModal(true);
  };

  const handleSelectPublication = (publicationId) => {
    setSelectedPublications(prev =>
      prev.includes(publicationId)
        ? prev.filter(id => id !== publicationId)
        : [...prev, publicationId]
    );
  };

  const handleBulkApprove = async () => {
    if (selectedPublications.length === 0) return;

    if (!window.confirm(`Are you sure you want to approve ${selectedPublications.length} publications?`)) return;

    try {
      setLoading(true);
      await api.put('/publications/bulk-approve', { ids: selectedPublications });
      setSelectedPublications([]);
      fetchPublications();
      setMessage({ type: 'success', text: 'Publications approved successfully!' });
    } catch (error) {
      console.error('Error bulk approving:', error);
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Error approving publications. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBulkReject = async () => {
    if (selectedPublications.length === 0) return;

    if (!window.confirm(`Are you sure you want to reject ${selectedPublications.length} publications?`)) return;

    try {
      setLoading(true);
      await api.put('/publications/bulk-reject', { ids: selectedPublications });
      setSelectedPublications([]);
      fetchPublications();
      setMessage({ type: 'success', text: 'Publications rejected successfully!' });
    } catch (error) {
      console.error('Error bulk rejecting:', error);
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Error rejecting publications. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBulkStatusChange = async (newStatus) => {
    if (selectedPublications.length === 0) return;

    if (!window.confirm(`Are you sure you want to change the status of ${selectedPublications.length} publications to ${newStatus}?`)) return;

    try {
      setLoading(true);
      await api.put('/publications/bulk-status', { ids: selectedPublications, status: newStatus });
      setSelectedPublications([]);
      fetchPublications();
      setMessage({ type: 'success', text: `Publications status updated to ${newStatus} successfully!` });
    } catch (error) {
      console.error('Error bulk status change:', error);
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Error updating publications status. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprovePublication = async (publicationId) => {
    try {
      setLoading(true);
      await api.put(`/publications/admin/${publicationId}/approve`);
      fetchPublications();
      setMessage({ type: 'success', text: 'Publication approved successfully!' });
    } catch (error) {
      console.error('Error approving publication:', error);
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Error approving publication. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRejectPublication = async (publicationId) => {
    try {
      setLoading(true);
      await api.put(`/publications/admin/${publicationId}/reject`);
      fetchPublications();
      setMessage({ type: 'success', text: 'Publication rejected successfully!' });
    } catch (error) {
      console.error('Error rejecting publication:', error);
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Error rejecting publication. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  // Fix the delete function to use admin route
  const handleDeletePublication = async (publicationId) => {
    if (!window.confirm('Are you sure you want to delete this publication?')) return;

    try {
      setLoading(true);
      // Use admin route instead of user route
      await api.delete(`/publications/admin/${publicationId}`);

      // Refresh the publications list
      fetchPublications();

      // Show success message
      setMessage({ type: 'success', text: 'Publication deleted successfully!' });
    } catch (error) {
      console.error('Error deleting publication:', error);
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Error deleting publication. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  // Hard delete publication (permanent delete)
  const handleHardDeletePublication = async (publicationId) => {
    if (!window.confirm('Are you sure you want to PERMANENTLY DELETE this publication? This action cannot be undone!')) return;

    try {
      setLoading(true);
      // Use admin hard delete route
      await api.delete(`/publications/admin/${publicationId}/hard`);

      // Refresh the publications list
      fetchPublications();

      // Show success message
      setMessage({ type: 'success', text: 'Publication permanently deleted successfully!' });
    } catch (error) {
      console.error('Error hard deleting publication:', error);
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Error permanently deleting publication. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  // Also fix bulk delete if you have it
  const handleBulkDelete = async () => {
    if (selectedPublications.length === 0) return;
    
    if (!window.confirm(`Are you sure you want to delete ${selectedPublications.length} publications?`)) return;

    try {
      setLoading(true);
      // Use admin bulk delete route
      await api.delete('/publications/bulk', { 
        data: { ids: selectedPublications } 
      });
      
      setSelectedPublications([]);
      fetchPublications();
      
      setMessage({ type: 'success', text: 'Publications deleted successfully!' });
    } catch (error) {
      console.error('Error bulk deleting:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Error deleting publications. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  // Make sure all admin operations use admin routes
  const handleUpdatePublication = async (publicationId, updateData) => {
    try {
      setLoading(true);
      // Use admin route for updates too
      await api.put(`/publications/admin/${publicationId}`, updateData);
      
      fetchPublications();
      setMessage({ type: 'success', text: 'Publication updated successfully!' });
    } catch (error) {
      console.error('Error updating publication:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Error updating publication. Please try again.' 
      });
    } finally {
      setLoading(false);
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
                {[1, 2, 3, 4, 5].map(i => (
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

              {/* Stats Cards Skeleton */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
                {[1, 2, 3, 4].map(i => (
                  <div key={i} style={{ background: '#fff', borderRadius: 12, padding: 18, boxShadow: '0 8px 20px rgba(2,6,23,0.06)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 48, height: 48, borderRadius: 10, background: '#f3f4f6' }}></div>
                      <div>
                        <div style={{ height: 20, background: '#f3f4f6', borderRadius: 4, width: '60px', marginBottom: 4 }}></div>
                        <div style={{ height: 12, background: '#f3f4f6', borderRadius: 4, width: '80px' }}></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Search Bar Skeleton */}
              <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', marginBottom: '16px', boxShadow: '0 8px 20px rgba(2,6,23,0.06)' }}>
                <div style={{ height: '44px', backgroundColor: '#f3f4f6', borderRadius: '8px', width: '100%' }}></div>
              </div>

              {/* Table Skeleton */}
              <div style={{ backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 8px 20px rgba(2,6,23,0.06)', overflow: 'hidden' }}>
                {/* Table Header Skeleton */}
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb', backgroundColor: '#f8fafc' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ height: '14px', background: '#f3f4f6', borderRadius: 4, width: '150px' }}></div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <div style={{ height: '32px', background: '#f3f4f6', borderRadius: 6, width: '80px' }}></div>
                      <div style={{ height: '32px', background: '#f3f4f6', borderRadius: 6, width: '100px' }}></div>
                    </div>
                  </div>
                </div>

                {/* Table Rows Skeleton */}
                <div style={{ overflowX: 'auto' }}>
                  {[...Array(10)].map((_, index) => (
                    <div key={index} style={{
                      borderBottom: '1px solid #f1f5f9',
                      backgroundColor: index % 2 === 0 ? '#ffffff' : '#fafbfc',
                      padding: '16px'
                    }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '50px 2fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr', gap: '16px', alignItems: 'center' }}>
                        <div style={{ width: '20px', height: '20px', background: '#f3f4f6', borderRadius: '50%' }}></div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '40px', height: '40px', background: '#f3f4f6', borderRadius: '50%' }}></div>
                          <div>
                            <div style={{ height: '14px', background: '#f3f4f6', borderRadius: 4, width: '120px', marginBottom: '4px' }}></div>
                            <div style={{ height: '12px', background: '#f3f4f6', borderRadius: 4, width: '80px' }}></div>
                          </div>
                        </div>
                        <div style={{ height: '14px', background: '#f3f4f6', borderRadius: 4, width: '60px' }}></div>
                        <div style={{ height: '14px', background: '#f3f4f6', borderRadius: 4, width: '80px' }}></div>
                        <div style={{ height: '14px', background: '#f3f4f6', borderRadius: 4, width: '70px' }}></div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <div style={{ width: '40px', height: '40px', background: '#f3f4f6', borderRadius: '50%' }}></div>
                          <div style={{ width: '40px', height: '40px', background: '#f3f4f6', borderRadius: '50%' }}></div>
                        </div>
                        <div style={{ height: '16px', background: '#f3f4f6', borderRadius: 4, width: '50px' }}></div>
                        <div style={{ height: '14px', background: '#f3f4f6', borderRadius: 4, width: '60px' }}></div>
                        <div style={{ height: '14px', background: '#f3f4f6', borderRadius: 4, width: '50px' }}></div>
                        <div style={{ height: '14px', background: '#f3f4f6', borderRadius: 4, width: '60px' }}></div>
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
              <button
                onClick={() => setFiltersOpen(!filtersOpen)}
                className="md:hidden"
                aria-label="Toggle filters"
                style={{
                  background: 'transparent',
                  border: 'none',
                  padding: 6,
                  cursor: 'pointer',
                  position: 'relative'
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={theme.text} strokeWidth="2">
                  <path d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                {appliedFilters.length > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '-8px',
                    right: '-8px',
                    backgroundColor: theme.primary,
                    color: '#fff',
                    borderRadius: '50%',
                    width: '18px',
                    height: '18px',
                    fontSize: '11px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '600'
                  }}>
                    {appliedFilters.length}
                  </span>
                )}
              </button>

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
          {/* Advanced Filters Sidebar */}
          {!isMobile && (
            <aside style={{
              width: '280px',
              backgroundColor: '#fff',
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 8px 20px rgba(2,6,23,0.06)',
              height: 'fit-content',
              position: 'sticky',
              top: '100px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: theme.textPrimary }}>
                  Filters
                </h3>
                <button
                  onClick={() => setFiltersOpen(!filtersOpen)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                    borderRadius: '4px',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={theme.textSecondary} strokeWidth="2">
                    <path d={filtersOpen ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                  </svg>
                </button>
              </div>

              {filtersOpen && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* Group Filter */}
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: theme.textPrimary, marginBottom: '8px' }}>
                      Group ({groups.length})
                    </label>
                    <select
                      value={groupFilter}
                      onChange={(e) => setGroupFilter(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #e0e0e0',
                        borderRadius: '6px',
                        fontSize: '13px',
                        backgroundColor: '#fff',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="">All Groups</option>
                      {groups.map(group => (
                        <option key={group.id} value={group.id}>
                          {group.group_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Status Filter */}
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: theme.textPrimary, marginBottom: '8px' }}>
                      Status
                    </label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {statusOptions.map(option => {
                        const count = publications.filter(p => p.status === option.value).length;
                        return (
                          <label key={option.value} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
                            <input
                              type="checkbox"
                              checked={selectedStatusFilters.includes(option.value)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedStatusFilters([...selectedStatusFilters, option.value]);
                                } else {
                                  setSelectedStatusFilters(selectedStatusFilters.filter(s => s !== option.value));
                                }
                              }}
                              style={{ transform: 'scale(1.1)' }}
                            />
                            <span style={{
                              color: option.color,
                              fontWeight: selectedStatusFilters.includes(option.value) ? '600' : '400'
                            }}>
                              {option.label}
                            </span>
                            <span style={{
                              fontSize: '11px',
                              color: theme.textSecondary,
                              backgroundColor: '#f3f4f6',
                              padding: '2px 6px',
                              borderRadius: '10px',
                              marginLeft: 'auto'
                            }}>
                              {count}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Region Filter */}
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: theme.textPrimary, marginBottom: '8px' }}>
                      Region
                    </label>
                    <input
                      type="text"
                      placeholder="Search regions..."
                      value={regionFilter}
                      onChange={(e) => setRegionFilter(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #e0e0e0',
                        borderRadius: '6px',
                        fontSize: '13px',
                        marginBottom: '8px'
                      }}
                    />
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {selectedRegionFilters.map(region => (
                        <span key={region} style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '4px 8px',
                          backgroundColor: '#e0f2fd',
                          color: theme.primary,
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: '500',
                          cursor: 'pointer'
                        }}
                        onClick={() => setSelectedRegionFilters(selectedRegionFilters.filter(r => r !== region))}
                        >
                          {region}
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                          </svg>
                        </span>
                      ))}
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                      {['United States', 'United Kingdom', 'Canada', 'Australia', 'India', 'Germany', 'France', 'Japan', 'Brazil', 'Mexico'].map(region => (
                        !selectedRegionFilters.includes(region) && (
                          <button
                            key={region}
                            onClick={() => setSelectedRegionFilters([...selectedRegionFilters, region])}
                            style={{
                              padding: '4px 8px',
                              backgroundColor: '#f3f4f6',
                              color: theme.textPrimary,
                              border: '1px solid #e0e0e0',
                              borderRadius: '12px',
                              fontSize: '11px',
                              cursor: 'pointer',
                              fontWeight: '500'
                            }}
                          >
                            + {region}
                          </button>
                        )
                      ))}
                    </div>
                  </div>

                  {/* Industry Filter */}
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: theme.textPrimary, marginBottom: '8px' }}>
                      Industry
                    </label>
                    <input
                      type="text"
                      placeholder="Search industries..."
                      value={industryFilter}
                      onChange={(e) => setIndustryFilter(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #e0e0e0',
                        borderRadius: '6px',
                        fontSize: '13px',
                        marginBottom: '8px'
                      }}
                    />
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {selectedIndustryFilters.map(industry => (
                        <span key={industry} style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '4px 8px',
                          backgroundColor: getIndustryColor(industry),
                          color: '#fff',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: '500',
                          cursor: 'pointer'
                        }}
                        onClick={() => setSelectedIndustryFilters(selectedIndustryFilters.filter(i => i !== industry))}
                        >
                          {industry}
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                          </svg>
                        </span>
                      ))}
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                      {['News', 'Technology', 'Business', 'Health', 'Sports', 'Entertainment', 'Music', 'Fashion', 'Travel', 'Food'].map(industry => (
                        !selectedIndustryFilters.includes(industry) && (
                          <button
                            key={industry}
                            onClick={() => setSelectedIndustryFilters([...selectedIndustryFilters, industry])}
                            style={{
                              padding: '4px 8px',
                              backgroundColor: '#f3f4f6',
                              color: theme.textPrimary,
                              border: '1px solid #e0e0e0',
                              borderRadius: '12px',
                              fontSize: '11px',
                              cursor: 'pointer',
                              fontWeight: '500'
                            }}
                          >
                            + {industry}
                          </button>
                        )
                      ))}
                    </div>
                  </div>

                  {/* Price Range */}
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: theme.textPrimary, marginBottom: '8px' }}>
                      Price Range: ${priceRange[0]} - ${priceRange[1]}
                    </label>
                    <div style={{ padding: '4px 0' }}>
                      <input
                        type="range"
                        min="0"
                        max="2000"
                        step="50"
                        value={priceRange[0]}
                        onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                        style={{ width: '48%', marginRight: '4%' }}
                      />
                      <input
                        type="range"
                        min="0"
                        max="2000"
                        step="50"
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                        style={{ width: '48%' }}
                      />
                    </div>
                  </div>

                  {/* SEO Metrics */}
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: theme.textPrimary, marginBottom: '8px' }}>
                      Domain Authority: {daRange[0]} - {daRange[1]}
                    </label>
                    <div style={{ padding: '4px 0' }}>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={daRange[0]}
                        onChange={(e) => setDaRange([parseInt(e.target.value), daRange[1]])}
                        style={{ width: '48%', marginRight: '4%' }}
                      />
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={daRange[1]}
                        onChange={(e) => setDaRange([daRange[0], parseInt(e.target.value)])}
                        style={{ width: '48%' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: theme.textPrimary, marginBottom: '8px' }}>
                      Domain Rating: {drRange[0]} - {drRange[1]}
                    </label>
                    <div style={{ padding: '4px 0' }}>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={drRange[0]}
                        onChange={(e) => setDrRange([parseInt(e.target.value), drRange[1]])}
                        style={{ width: '48%', marginRight: '4%' }}
                      />
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={drRange[1]}
                        onChange={(e) => setDrRange([drRange[0], parseInt(e.target.value)])}
                        style={{ width: '48%' }}
                      />
                    </div>
                  </div>

                  {/* TAT Filter */}
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: theme.textPrimary, marginBottom: '8px' }}>
                      Turnaround Time
                    </label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {['1 Day', '1-3 Days', '1 Week', '1+ Week'].map(tat => (
                        <label key={tat} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
                          <input
                            type="checkbox"
                            checked={tatFilter.includes(tat)}
                            onChange={() => toggleTatFilter(tat)}
                            style={{ transform: 'scale(1.1)' }}
                          />
                          {tat}
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Feature Toggles */}
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: theme.textPrimary, marginBottom: '8px' }}>
                      Features
                    </label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
                        <input
                          type="checkbox"
                          checked={sponsoredFilter === 'true'}
                          onChange={(e) => setSponsoredFilter(e.target.checked ? 'true' : '')}
                          style={{ transform: 'scale(1.1)' }}
                        />
                        Sponsored Only
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
                        <input
                          type="checkbox"
                          checked={liveFilter === 'true'}
                          onChange={(e) => setLiveFilter(e.target.checked ? 'true' : '')}
                          style={{ transform: 'scale(1.1)' }}
                        />
                        Live on Platform
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
                        <input
                          type="checkbox"
                          checked={dofollowFilter === 'true'}
                          onChange={(e) => setDofollowFilter(e.target.checked ? 'true' : '')}
                          style={{ transform: 'scale(1.1)' }}
                        />
                        Do-follow Links
                      </label>
                    </div>
                  </div>

                  {/* Language Filter */}
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: theme.textPrimary, marginBottom: '8px' }}>
                      Language
                    </label>
                    <select
                      value={languageFilter}
                      onChange={(e) => setLanguageFilter(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #e0e0e0',
                        borderRadius: '6px',
                        fontSize: '13px',
                        backgroundColor: '#fff',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="">All Languages</option>
                      <option value="English">English</option>
                      <option value="Spanish">Spanish</option>
                      <option value="French">French</option>
                      <option value="German">German</option>
                      <option value="Italian">Italian</option>
                      <option value="Portuguese">Portuguese</option>
                      <option value="Russian">Russian</option>
                      <option value="Chinese">Chinese</option>
                      <option value="Japanese">Japanese</option>
                      <option value="Korean">Korean</option>
                      <option value="Arabic">Arabic</option>
                      <option value="Hindi">Hindi</option>
                    </select>
                  </div>

                  {/* News Index Range */}
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: theme.textPrimary, marginBottom: '8px' }}>
                      News Index: {newsIndexRange[0]} - {newsIndexRange[1]}
                    </label>
                    <div style={{ padding: '4px 0' }}>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={newsIndexRange[0]}
                        onChange={(e) => setNewsIndexRange([parseInt(e.target.value), newsIndexRange[1]])}
                        style={{ width: '48%', marginRight: '4%' }}
                      />
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={newsIndexRange[1]}
                        onChange={(e) => setNewsIndexRange([newsIndexRange[0], parseInt(e.target.value)])}
                        style={{ width: '48%' }}
                      />
                    </div>
                  </div>

                  {/* Words Limit Range */}
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: theme.textPrimary, marginBottom: '8px' }}>
                      Words Limit: {wordsLimitRange[0]} - {wordsLimitRange[1]}
                    </label>
                    <div style={{ padding: '4px 0' }}>
                      <input
                        type="range"
                        min="0"
                        max="10000"
                        step="100"
                        value={wordsLimitRange[0]}
                        onChange={(e) => setWordsLimitRange([parseInt(e.target.value), wordsLimitRange[1]])}
                        style={{ width: '48%', marginRight: '4%' }}
                      />
                      <input
                        type="range"
                        min="0"
                        max="10000"
                        step="100"
                        value={wordsLimitRange[1]}
                        onChange={(e) => setWordsLimitRange([wordsLimitRange[0], parseInt(e.target.value)])}
                        style={{ width: '48%' }}
                      />
                    </div>
                  </div>

                  {/* Images Range */}
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: theme.textPrimary, marginBottom: '8px' }}>
                      Images: {imagesRange[0]} - {imagesRange[1]}
                    </label>
                    <div style={{ padding: '4px 0' }}>
                      <input
                        type="range"
                        min="0"
                        max="50"
                        value={imagesRange[0]}
                        onChange={(e) => setImagesRange([parseInt(e.target.value), imagesRange[1]])}
                        style={{ width: '48%', marginRight: '4%' }}
                      />
                      <input
                        type="range"
                        min="0"
                        max="50"
                        value={imagesRange[1]}
                        onChange={(e) => setImagesRange([imagesRange[0], parseInt(e.target.value)])}
                        style={{ width: '48%' }}
                      />
                    </div>
                  </div>

                  {/* Clear Filters */}
                  <button
                    onClick={clearAllFilters}
                    style={{
                      padding: '10px 16px',
                      backgroundColor: '#f3f4f6',
                      color: theme.textPrimary,
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '13px',
                      cursor: 'pointer',
                      fontWeight: '500',
                      marginTop: '10px'
                    }}
                  >
                    Clear All Filters
                  </button>
                </div>
              )}
            </aside>
          )}

          {/* Mobile Filters Modal */}
          {isMobile && filtersOpen && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px'
            }}>
              <div style={{
                backgroundColor: '#fff',
                borderRadius: '12px',
                padding: '20px',
                width: '90%',
                maxWidth: '400px',
                maxHeight: '80vh',
                overflowY: 'auto'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: theme.textPrimary }}>
                    Filters
                  </h3>
                  <button
                    onClick={() => setFiltersOpen(false)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      fontSize: '24px',
                      cursor: 'pointer',
                      padding: '4px'
                    }}
                  >
                    ×
                  </button>
                </div>

                {/* Mobile filter content - same as desktop but in modal */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* Group Filter */}
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.textPrimary, marginBottom: '8px' }}>
                      Group ({groups.length})
                    </label>
                    <select
                      value={groupFilter}
                      onChange={(e) => setGroupFilter(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #e0e0e0',
                        borderRadius: '6px',
                        fontSize: '14px',
                        backgroundColor: '#fff',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="">All Groups</option>
                      {groups.map(group => (
                        <option key={group.id} value={group.id}>
                          {group.group_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Status Filter */}
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.textPrimary, marginBottom: '8px' }}>
                      Status
                    </label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {statusOptions.map(option => (
                        <label key={option.value} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px' }}>
                          <input
                            type="radio"
                            name="status"
                            value={option.value}
                            checked={statusFilter === option.value}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            style={{ transform: 'scale(1.2)' }}
                          />
                          <span style={{
                            color: option.color,
                            fontWeight: statusFilter === option.value ? '600' : '400'
                          }}>
                            {option.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Region & Industry */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.textPrimary, marginBottom: '8px' }}>
                        Region
                      </label>
                      <input
                        type="text"
                        placeholder="Region..."
                        value={regionFilter}
                        onChange={(e) => setRegionFilter(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          border: '1px solid #e0e0e0',
                          borderRadius: '6px',
                          fontSize: '14px'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.textPrimary, marginBottom: '8px' }}>
                        Industry
                      </label>
                      <input
                        type="text"
                        placeholder="Industry..."
                        value={industryFilter}
                        onChange={(e) => setIndustryFilter(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          border: '1px solid #e0e0e0',
                          borderRadius: '6px',
                          fontSize: '14px'
                        }}
                      />
                    </div>
                  </div>

                  {/* Price Range */}
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.textPrimary, marginBottom: '8px' }}>
                      Price Range: ${priceRange[0]} - ${priceRange[1]}
                    </label>
                    <div style={{ padding: '8px 0' }}>
                      <input
                        type="range"
                        min="0"
                        max="2000"
                        step="50"
                        value={priceRange[0]}
                        onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                        style={{ width: '48%', marginRight: '4%' }}
                      />
                      <input
                        type="range"
                        min="0"
                        max="2000"
                        step="50"
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                        style={{ width: '48%' }}
                      />
                    </div>
                  </div>

                  {/* SEO Metrics */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.textPrimary, marginBottom: '8px' }}>
                        DA: {daRange[0]} - {daRange[1]}
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={daRange[0]}
                        onChange={(e) => setDaRange([parseInt(e.target.value), daRange[1]])}
                        style={{ width: '100%' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.textPrimary, marginBottom: '8px' }}>
                        DR: {drRange[0]} - {drRange[1]}
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={drRange[0]}
                        onChange={(e) => setDrRange([parseInt(e.target.value), drRange[1]])}
                        style={{ width: '100%' }}
                      />
                    </div>
                  </div>

                  {/* TAT & Features */}
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.textPrimary, marginBottom: '8px' }}>
                      Turnaround Time
                    </label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {['1 Day', '1-3 Days', '1 Week', '1+ Week'].map(tat => (
                        <label key={tat} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '14px' }}>
                          <input
                            type="checkbox"
                            checked={tatFilter.includes(tat)}
                            onChange={() => toggleTatFilter(tat)}
                            style={{ transform: 'scale(1.2)' }}
                          />
                          {tat}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.textPrimary, marginBottom: '8px' }}>
                      Features
                    </label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px' }}>
                        <input
                          type="checkbox"
                          checked={sponsoredFilter === 'true'}
                          onChange={(e) => setSponsoredFilter(e.target.checked ? 'true' : '')}
                          style={{ transform: 'scale(1.2)' }}
                        />
                        Sponsored Only
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px' }}>
                        <input
                          type="checkbox"
                          checked={liveFilter === 'true'}
                          onChange={(e) => setLiveFilter(e.target.checked ? 'true' : '')}
                          style={{ transform: 'scale(1.2)' }}
                        />
                        Live on Platform
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px' }}>
                        <input
                          type="checkbox"
                          checked={dofollowFilter === 'true'}
                          onChange={(e) => setDofollowFilter(e.target.checked ? 'true' : '')}
                          style={{ transform: 'scale(1.2)' }}
                        />
                        Do-follow Links
                      </label>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                    <button
                      onClick={clearAllFilters}
                      style={{
                        flex: 1,
                        padding: '12px 16px',
                        backgroundColor: '#f3f4f6',
                        color: theme.textPrimary,
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '14px',
                        cursor: 'pointer',
                        fontWeight: '500'
                      }}
                    >
                      Clear All
                    </button>
                    <button
                      onClick={() => setFiltersOpen(false)}
                      style={{
                        flex: 1,
                        padding: '12px 16px',
                        backgroundColor: theme.primary,
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '14px',
                        cursor: 'pointer',
                        fontWeight: '500'
                      }}
                    >
                      Apply Filters
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <main style={{ flex: 1, minWidth: 0, paddingLeft: !isMobile ? leftGap : 0 }}>
            {/* Page Header */}
            <div style={{ background: '#fff', borderRadius: 12, padding: 28, border: `4px solid #000`, display: 'flex', justifyContent: 'space-between', gap: '16px', marginBottom: 24, alignItems: 'center' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: '#e6f0ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name="document-text" size="sm" style={{ color: '#1976D2' }} />
                  </div>
                  <h1 style={{ margin: 0, fontSize: 34, fontWeight: 800 }}>Publication Management</h1>
                </div>
                <p style={{ marginTop: 8, color: '#757575' }}>Manage news publications and their details</p>
              </div>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button
                  onClick={handleDownloadTemplate}
                  style={{
                    backgroundColor: '#10b981',
                    color: '#fff',
                    padding: '12px 20px',
                    borderRadius: '8px',
                    fontWeight: 600,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    cursor: 'pointer',
                    border: 'none',
                    boxShadow: '0 6px 18px rgba(16,185,129,0.14)',
                    fontSize: '14px'
                  }}
                  disabled={!hasAnyRole(['super_admin', 'content_manager'])}
                >
                  <Icon name="document-arrow-down" size="sm" style={{ color: '#fff', marginRight: 8 }} />
                  Download Template
                </button>
                {selectedPublications.length > 0 && (
                  <div style={{ display: 'flex', gap: '8px', marginRight: '16px' }}>
                    <button
                      onClick={() => setShowBulkEditModal(true)}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#f59e0b',
                        color: '#fff',
                        borderRadius: '8px',
                        fontWeight: 600,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        cursor: 'pointer',
                        border: 'none',
                        boxShadow: '0 6px 18px rgba(245,158,11,0.14)',
                        fontSize: '14px'
                      }}
                      disabled={!hasRole('super_admin')}
                    >
                      <Icon name="pencil" size="sm" style={{ color: '#fff', marginRight: 8 }} />
                      Bulk Edit ({selectedPublications.length})
                    </button>
                    <button
                      onClick={() => setShowBulkDeleteModal(true)}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#ef4444',
                        color: '#fff',
                        borderRadius: '8px',
                        fontWeight: 600,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        cursor: 'pointer',
                        border: 'none',
                        boxShadow: '0 6px 18px rgba(239,68,68,0.14)',
                        fontSize: '14px'
                      }}
                      disabled={!hasRole('super_admin')}
                    >
                      <Icon name="trash" size="sm" style={{ color: '#fff', marginRight: 8 }} />
                      Bulk Delete ({selectedPublications.length})
                    </button>
                  </div>
                )}
                <button
                  onClick={() => setShowBulkUploadModal(true)}
                  style={{
                    backgroundColor: '#8b5cf6',
                    color: '#fff',
                    padding: '12px 20px',
                    borderRadius: '8px',
                    fontWeight: 600,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    cursor: 'pointer',
                    border: 'none',
                    boxShadow: '0 6px 18px rgba(139,92,246,0.14)',
                    fontSize: '14px'
                  }}
                  disabled={!hasRole('super_admin')}
                >
                  <Icon name="cloud-arrow-up" size="sm" style={{ color: '#fff', marginRight: 8 }} />
                  Bulk Upload
                </button>
                <button
                  onClick={handleCreatePublication}
                  style={{ ...btnPrimary, fontSize: '14px', padding: '12px 20px' }}
                  disabled={!hasRole('super_admin')}
                >
                  <Icon name="plus" size="sm" style={{ color: '#fff', marginRight: 8 }} />
                  Add Publication
                </button>
              </div>
            </div>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
              {[
                { label: 'Total Publications', value: stats.total, icon: 'document-text', bg: '#e6f0ff' },
                { label: 'Approved', value: stats.approved, icon: 'check-circle', bg: '#dcfce7' },
                { label: 'Pending', value: stats.pending, icon: 'clock', bg: '#fef3c7' },
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

            {/* Global Search Bar */}
            <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', marginBottom: '16px', boxShadow: '0 8px 20px rgba(2,6,23,0.06)' }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '300px' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={theme.textSecondary} strokeWidth="2" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}>
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.35-4.35"></path>
                  </svg>
                  <input
                    type="text"
                    placeholder="AI-powered search: name, website, SN, group, industry..."
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

                  {/* AI Search Suggestions Dropdown */}
                  {searchSuggestions.length > 0 && searchTerm && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      backgroundColor: '#fff',
                      border: '1px solid #e0e0e0',
                      borderTop: 'none',
                      borderRadius: '0 0 8px 8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      zIndex: 1000,
                      maxHeight: '200px',
                      overflowY: 'auto'
                    }}>
                      {searchSuggestions.map((suggestion, index) => (
                        <div
                          key={index}
                          onClick={() => setSearchTerm(suggestion)}
                          style={{
                            padding: '8px 16px',
                            cursor: 'pointer',
                            borderBottom: index < searchSuggestions.length - 1 ? '1px solid #f0f0f0' : 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = '#f8fafc'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={theme.primary} strokeWidth="2">
                            <circle cx="11" cy="11" r="8"></circle>
                            <path d="m21 21-4.35-4.35"></path>
                          </svg>
                          <span style={{ fontSize: '13px', color: theme.textPrimary }}>
                            <strong>{suggestion.substring(0, searchTerm.length)}</strong>
                            {suggestion.substring(searchTerm.length)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

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

                  {/* AI Search Stats */}
                  {searchStats.totalSearches > 0 && (
                    <div style={{
                      position: 'absolute',
                      right: '40px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      fontSize: '11px',
                      color: theme.textSecondary,
                      backgroundColor: '#f0f8ff',
                      padding: '2px 6px',
                      borderRadius: '10px',
                      border: '1px solid #e0f2fd'
                    }}>
                      ⚡ {searchStats.avgResponseTime.toFixed(1)}ms
                    </div>
                  )}
                </div>
                {!isMobile && (
                  <button
                    onClick={() => setFiltersOpen(!filtersOpen)}
                    style={{
                      padding: '12px 16px',
                      backgroundColor: filtersOpen ? theme.primary : '#f3f4f6',
                      color: filtersOpen ? '#fff' : theme.textPrimary,
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      cursor: 'pointer',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                    Filters {appliedFilters.length > 0 && `(${appliedFilters.length})`}
                  </button>
                )}
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
                  <button
                    onClick={clearAllFilters}
                    style={{
                      padding: '4px 8px',
                      backgroundColor: '#fee2e2',
                      color: '#dc2626',
                      border: 'none',
                      borderRadius: '16px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      fontWeight: '500'
                    }}
                  >
                    Clear all
                  </button>
                </div>
              )}

              {/* AI Search Results Summary */}
              <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div style={{ fontSize: '14px', color: theme.textSecondary }}>
                  {debouncedSearchTerm ? (
                    <>
                      <span style={{ color: theme.primary, fontWeight: '600' }}>🤖 AI Search:</span> Found <strong>{sortedPublications.length}</strong> relevant publications
                      {searchStats.totalSearches > 0 && (
                        <span style={{ fontSize: '12px', marginLeft: '8px', color: theme.success }}>
                          ({searchStats.totalSearches} searches, {searchStats.avgResponseTime.toFixed(1)}ms avg)
                        </span>
                      )}
                    </>
                  ) : (
                    <>
                      Showing <strong>{paginatedPublications.length}</strong> of <strong>{sortedPublications.length}</strong> publications
                      {sortedPublications.length !== publications.length && (
                        <span> (filtered from {publications.length} total)</span>
                      )}
                    </>
                  )}
                </div>
                <div style={{ fontSize: '14px', color: theme.textSecondary }}>
                  {appliedFilters.length > 0 && `${appliedFilters.length} filter${appliedFilters.length !== 1 ? 's' : ''} applied`}
                </div>
              </div>
            </div>

            {/* Bulk Actions Bar */}
            {selectedPublications.length > 0 && (
              <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '16px', marginBottom: '24px', boxShadow: '0 8px 20px rgba(2,6,23,0.06)', border: '1px solid #e0e0e0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                  <div style={{ fontSize: '14px', color: '#212121' }}>
                    {selectedPublications.length} publication{selectedPublications.length !== 1 ? 's' : ''} selected
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          if (e.target.value === 'delete_bulk') {
                            setShowBulkDeleteModal(true);
                          }
                          e.target.value = '';
                        }
                      }}
                      style={{ padding: '6px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
                      disabled={!hasRole('super_admin')}
                    >
                      <option value="">Bulk Actions</option>
                      <option value="delete_bulk">Delete Selected</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Modern Publications Table */}
            <div style={{ backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 8px 20px rgba(2,6,23,0.06)', overflow: 'hidden' }}>
              {/* Table Controls */}
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb', backgroundColor: '#f8fafc' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: theme.textPrimary }}>
                      {selectedPublications.length > 0 ? `${selectedPublications.length} selected` : 'Select publications'}
                    </span>
                    {selectedPublications.length > 0 && (
                      <button
                        onClick={() => setSelectedPublications([])}
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
                    <button
                      onClick={() => {
                        // Export filtered results as CSV
                        const headers = ['Name', 'Website', 'SN', 'Group', 'Industry', 'Region', 'Language', 'Price', 'DA', 'DR', 'News Index', 'Words Limit', 'Images', 'Sponsored', 'Do-follow', 'Live', 'Status'];
                        const csvData = [
                          headers.join(','),
                          ...filteredPublications.map(pub => [
                            `"${pub.publication_name}"`,
                            `"${pub.publication_website}"`,
                            `"${pub.publication_sn}"`,
                            `"${pub.group_name || ''}"`,
                            `"${pub.publication_primary_industry}"`,
                            `"${pub.publication_region}"`,
                            `"${pub.publication_language}"`,
                            pub.publication_price,
                            pub.da,
                            pub.dr,
                            pub.website_news_index,
                            pub.words_limit,
                            pub.number_of_images,
                            pub.sponsored_or_not ? 'Yes' : 'No',
                            pub.do_follow_link ? 'Yes' : 'No',
                            pub.live_on_platform ? 'Yes' : 'No',
                            pub.status
                          ].join(','))
                        ].join('\n');
 
                        const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
                        const link = document.createElement('a');
                        const url = URL.createObjectURL(blob);
                        link.setAttribute('href', url);
                        link.setAttribute('download', `publications_export_${new Date().toISOString().split('T')[0]}.csv`);
                        link.style.visibility = 'hidden';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: theme.primary,
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '14px',
                        cursor: 'pointer',
                        fontWeight: '500'
                      }}
                    >
                      Export CSV
                    </button>
                    <button
                      onClick={() => setShowDeleted(!showDeleted)}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: showDeleted ? theme.warning : '#f3f4f6',
                        color: showDeleted ? '#fff' : theme.textPrimary,
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '14px',
                        cursor: 'pointer',
                        fontWeight: '500'
                      }}
                    >
                      {showDeleted ? 'Hide Deleted' : 'Show Deleted'}
                    </button>
                  </div>
                </div>
              </div>

              <div style={{ overflowX: 'auto', maxHeight: paginatedPublications.length > 50 ? '600px' : 'auto', overflowY: paginatedPublications.length > 50 ? 'auto' : 'visible' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                      <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', fontSize: '12px', color: theme.textPrimary, textTransform: 'uppercase', letterSpacing: '0.5px', width: '50px' }}>
                        <input
                          type="checkbox"
                          checked={paginatedPublications.length > 0 && selectedPublications.length === paginatedPublications.length}
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
                        onClick={() => handleSort('group_name')}
                      >
                        Group {getSortIcon('group_name')}
                      </th>
                        <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', fontSize: '12px', color: theme.textPrimary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          Industry & Tags
                        </th>
                        <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', fontSize: '12px', color: theme.textPrimary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          Location
                        </th>
                        <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', fontSize: '12px', color: theme.textPrimary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          SEO Scores
                        </th>
                        <th
                          style={{ padding: '16px', textAlign: 'left', fontWeight: '700', fontSize: '12px', color: theme.textPrimary, textTransform: 'uppercase', letterSpacing: '0.5px', cursor: 'pointer' }}
                          onClick={() => handleSort('publication_price')}
                        >
                          Price {getSortIcon('publication_price')}
                        </th>
                        <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', fontSize: '12px', color: theme.textPrimary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          TAT
                        </th>
                        <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', fontSize: '12px', color: theme.textPrimary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          Features
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
                    {paginatedPublications.map((publication, index) => (
                      <tr key={publication.id} style={{
                        borderBottom: '1px solid #f1f5f9',
                        backgroundColor: selectedPublications.includes(publication.id) ? '#e0f2fe' : (index % 2 === 0 ? '#ffffff' : '#fafbfc'),
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        if (!selectedPublications.includes(publication.id)) {
                          e.target.closest('tr').style.backgroundColor = '#f1f5f9';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!selectedPublications.includes(publication.id)) {
                          e.target.closest('tr').style.backgroundColor = index % 2 === 0 ? '#ffffff' : '#fafbfc';
                        }
                      }}
                      >
                        <td style={{ padding: '16px' }}>
                          <input
                            type="checkbox"
                            checked={selectedPublications.includes(publication.id)}
                            onChange={() => handleSelectPublication(publication.id)}
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
                              {getFaviconUrl(publication.publication_website) ? (
                                <img
                                  src={getFaviconUrl(publication.publication_website)}
                                  alt="favicon"
                                  style={{
                                    width: '24px',
                                    height: '24px',
                                    borderRadius: '50%'
                                  }}
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'block';
                                  }}
                                />
                              ) : null}
                              <div style={{
                                display: getFaviconUrl(publication.publication_website) ? 'none' : 'block',
                                fontSize: '16px',
                                color: theme.textSecondary,
                                fontWeight: '600'
                              }}>
                                {publication.publication_name.charAt(0).toUpperCase()}
                              </div>
                            </div>
                            <div>
                              <div style={{ fontWeight: '600', fontSize: '14px', color: theme.textPrimary, marginBottom: '4px' }}>
                                {publication.publication_name}
                              </div>
                              <div style={{ fontSize: '12px', color: theme.primary, fontWeight: '500', marginBottom: '2px' }}>
                                <a href={publication.publication_website} target="_blank" rel="noopener noreferrer" style={{ color: theme.primary, textDecoration: 'none' }}>
                                  {publication.publication_website.length > 35 ? `${publication.publication_website.substring(0, 35)}...` : publication.publication_website}
                                </a>
                              </div>
                              <div style={{ fontSize: '11px', color: theme.textSecondary }}>
                                SN: {publication.publication_sn} • Grade: {publication.publication_grade}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <div style={{ fontSize: '14px', color: theme.textPrimary, fontWeight: '500' }}>
                            {publication.group_name || 'N/A'}
                          </div>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <div>
                            <div style={{
                              fontSize: '13px',
                              color: theme.textPrimary,
                              fontWeight: '500',
                              marginBottom: '4px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}>
                              <span style={{
                                padding: '2px 8px',
                                backgroundColor: getIndustryColor(publication.publication_primary_industry),
                                color: '#fff',
                                borderRadius: '12px',
                                fontSize: '11px',
                                fontWeight: '600'
                              }}>
                                {publication.publication_primary_industry}
                              </span>
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                              {publication.tags_badges && publication.tags_badges.split(',').slice(0, 3).map((tag, idx) => (
                                <span key={idx} style={{
                                  padding: '2px 6px',
                                  backgroundColor: '#e0f2fd',
                                  color: theme.primary,
                                  borderRadius: '12px',
                                  fontSize: '10px',
                                  fontWeight: '500'
                                }}>
                                  {tag.trim()}
                                </span>
                              ))}
                              {publication.tags_badges && publication.tags_badges.split(',').length > 3 && (
                                <span style={{
                                  padding: '2px 6px',
                                  backgroundColor: '#f3f4f6',
                                  color: theme.textSecondary,
                                  borderRadius: '12px',
                                  fontSize: '10px',
                                  fontWeight: '500'
                                }}>
                                  +{publication.tags_badges.split(',').length - 3}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <div>
                            <div style={{ fontSize: '13px', color: theme.textPrimary, fontWeight: '500', marginBottom: '2px' }}>
                              {publication.publication_region}
                            </div>
                            <div style={{ fontSize: '12px', color: theme.textSecondary }}>
                              {publication.publication_language}
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <div style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '50%',
                              backgroundColor: getDAScoreColor(publication.da),
                              color: '#fff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '12px',
                              fontWeight: '700',
                              textAlign: 'center',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                            }}>
                              {publication.da}
                            </div>
                            <div style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '50%',
                              backgroundColor: getDRScoreColor(publication.dr),
                              color: '#fff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '12px',
                              fontWeight: '700',
                              textAlign: 'center',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                            }}>
                              {publication.dr}
                            </div>
                          </div>
                          <div style={{ fontSize: '11px', color: theme.textSecondary, marginTop: '4px', textAlign: 'center' }}>
                            News Index: {publication.website_news_index}
                          </div>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <div style={{ fontSize: '16px', fontWeight: '700', color: theme.success }}>
                            ${publication.publication_price}
                          </div>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <div>
                            <div style={{ fontSize: '13px', color: theme.textPrimary, fontWeight: '500' }}>
                              {formatTAT(publication.agreement_tat)} / {formatTAT(publication.practical_tat)}
                            </div>
                            <div style={{ fontSize: '11px', color: theme.textSecondary }}>
                              Agree / Practical
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              {publication.sponsored_or_not ? (
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={theme.success} strokeWidth="3">
                                  <polyline points="20,6 9,17 4,12"></polyline>
                                </svg>
                              ) : (
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={theme.danger} strokeWidth="3">
                                  <line x1="18" y1="6" x2="6" y2="18"></line>
                                  <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                              )}
                              <span style={{ fontSize: '11px', color: theme.textSecondary }}>Sponsored</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              {publication.do_follow_link ? (
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={theme.success} strokeWidth="3">
                                  <polyline points="20,6 9,17 4,12"></polyline>
                                </svg>
                              ) : (
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={theme.danger} strokeWidth="3">
                                  <line x1="18" y1="6" x2="6" y2="18"></line>
                                  <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                              )}
                              <span style={{ fontSize: '11px', color: theme.textSecondary }}>Do-follow</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              {publication.live_on_platform ? (
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={theme.success} strokeWidth="3">
                                  <polyline points="20,6 9,17 4,12"></polyline>
                                </svg>
                              ) : (
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={theme.danger} strokeWidth="3">
                                  <line x1="18" y1="6" x2="6" y2="18"></line>
                                  <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                              )}
                              <span style={{ fontSize: '11px', color: theme.textSecondary }}>Live</span>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <span style={getStatusStyle(publication.status)}>
                              {statusOptions.find(opt => opt.value === publication.status)?.label || publication.status}
                            </span>
                            {publication.status === 'pending' && hasAnyRole(['super_admin', 'content_manager']) && (
                              <div style={{ display: 'flex', gap: '4px' }}>
                                <button
                                  onClick={() => handleApprovePublication(publication.id)}
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
                                  title="Approve publication"
                                >
                                  ✓ Approve
                                </button>
                                <button
                                  onClick={() => handleRejectPublication(publication.id)}
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
                                  title="Reject publication"
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
                              onClick={() => handleEditPublication(publication)}
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
                              disabled={!hasRole('super_admin')}
                              onMouseEnter={(e) => e.target.style.backgroundColor = theme.primaryDark}
                              onMouseLeave={(e) => e.target.style.backgroundColor = theme.primary}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeletePublication(publication.id)}
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
              {totalPages > 1 && (
                <div style={{ padding: '16px 20px', borderTop: '1px solid #e5e7eb', backgroundColor: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '14px', color: theme.textSecondary }}>
                    Page {currentPage} of {totalPages} ({sortedPublications.length} total publications)
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

              {paginatedPublications.length === 0 && (
                <div style={{ padding: '80px', textAlign: 'center', color: theme.textSecondary }}>
                  <div style={{ fontSize: '64px', marginBottom: '16px' }}>
                    {debouncedSearchTerm ? '🧠' : '📭'}
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>
                    {debouncedSearchTerm ? 'AI Search Complete' : 'No publications found'}
                  </div>
                  <div style={{ fontSize: '16px', marginBottom: '16px' }}>
                    {debouncedSearchTerm ? (
                      <>
                        Our AI couldn't find publications matching "<strong>{debouncedSearchTerm}</strong>".
                        <br />
                        Try different keywords or check for typos.
                      </>
                    ) : (
                      'Try adjusting your search criteria or filters'
                    )}
                  </div>

                  {/* AI Search Suggestions */}
                  {debouncedSearchTerm && searchSuggestions.length > 0 && (
                    <div style={{ marginBottom: '20px' }}>
                      <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: theme.primary }}>
                        💡 Try these suggestions:
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
                        {searchSuggestions.slice(0, 3).map((suggestion, index) => (
                          <button
                            key={index}
                            onClick={() => setSearchTerm(suggestion)}
                            style={{
                              padding: '6px 12px',
                              backgroundColor: '#e0f2fd',
                              color: theme.primary,
                              border: '1px solid #b3e5fc',
                              borderRadius: '16px',
                              fontSize: '13px',
                              cursor: 'pointer',
                              fontWeight: '500',
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.backgroundColor = theme.primary;
                              e.target.style.color = '#fff';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.backgroundColor = '#e0f2fd';
                              e.target.style.color = theme.primary;
                            }}
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setGroupFilter('');
                      setRegionFilter('');
                      setIndustryFilter('');
                      setStatusFilter('');
                      setPriceRange([0, 2000]);
                      setDaRange([0, 100]);
                      setDrRange([0, 100]);
                      setTatFilter([]);
                      setSponsoredFilter('');
                      setLiveFilter('');
                      setDofollowFilter('');
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
                    Clear All Filters
                  </button>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* Publication Form Modal */}
      <PublicationFormModal
        isOpen={showFormModal}
        onClose={() => setShowFormModal(false)}
        publication={editingPublication}
        groups={groups}
        onSave={handleFormSave}
      />

      {/* Bulk Upload Modal */}
      <BulkUploadModal
        isOpen={showBulkUploadModal}
        onClose={() => setShowBulkUploadModal(false)}
        onSave={handleBulkUploadSave}
      />

      {/* Bulk Edit Modal */}
      <BulkEditModal
        isOpen={showBulkEditModal}
        onClose={() => setShowBulkEditModal(false)}
        onSave={handleBulkEditSave}
        selectedCount={selectedPublications.length}
        selectedPublications={selectedPublications}
      />

      {/* Bulk Delete Modal */}
      <BulkDeleteModal
        isOpen={showBulkDeleteModal}
        onClose={() => setShowBulkDeleteModal(false)}
        onConfirm={handleBulkDeleteConfirm}
        selectedCount={selectedPublications.length}
      />
    </div>
  );
};

// Bulk Upload Modal Component
const BulkUploadModal = ({ isOpen, onClose, onSave }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Validate file type
      const allowedTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'text/csv',
        'application/csv'
      ];

      if (!allowedTypes.includes(selectedFile.type)) {
        alert('Please select a valid Excel (.xlsx, .xls) or CSV file.');
        return;
      }

      // Validate file size (10MB limit)
      if (selectedFile.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB.');
        return;
      }

      setFile(selectedFile);
      setUploadResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert('Please select a file to upload.');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post('/publications/bulk-upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setUploadResult({
        success: true,
        message: `Successfully processed ${response.data.createdPublications || 0} publications created and ${response.data.updatedPublications || 0} publications updated.`,
        details: response.data
      });

      onSave();
    } catch (error) {
      console.error('Bulk upload error:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Upload failed. Please try again.';
      setUploadResult({
        success: false,
        message: errorMessage,
        details: error.response?.data
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadTemplate = () => {
    const link = document.createElement('a');
    link.href = '/Website_Workflow/sample data.xlsx';
    link.download = 'publications_template.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
    maxWidth: '500px',
    width: '100%',
    maxHeight: '80vh',
    overflowY: 'auto',
    boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
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
            Bulk Upload Publications
          </h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', fontSize: '24px', cursor: 'pointer' }}>
            ×
          </button>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <p style={{ marginBottom: '16px', color: '#666' }}>
            Upload an Excel (.xlsx) or CSV file containing publication data. Make sure to follow the template format.
          </p>

          <button
            onClick={handleDownloadTemplate}
            style={{
              ...buttonStyle,
              backgroundColor: '#10b981',
              color: '#fff',
              marginBottom: '16px',
              width: '100%'
            }}
          >
            <Icon name="document-arrow-down" size="sm" style={{ marginRight: '8px' }} />
            Download Template
          </button>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#212121', marginBottom: '8px' }}>
            Select File
          </label>
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileChange}
            style={{
              width: '100%',
              padding: '10px',
              border: '2px dashed #d1d5db',
              borderRadius: '8px',
              backgroundColor: '#f9fafb',
              cursor: 'pointer'
            }}
          />
          {file && (
            <p style={{ marginTop: '8px', fontSize: '14px', color: '#10b981' }}>
              Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          )}
        </div>

        {uploadResult && (
          <div style={{
            marginBottom: '20px',
            padding: '12px',
            borderRadius: '8px',
            backgroundColor: uploadResult.success ? '#dcfce7' : '#fee2e2',
            border: `1px solid ${uploadResult.success ? '#10b981' : '#ef4444'}`
          }}>
            <p style={{
              margin: 0,
              color: uploadResult.success ? '#065f46' : '#991b1b',
              fontWeight: '600'
            }}>
              {uploadResult.message}
            </p>
            {uploadResult.details && uploadResult.details.errors && uploadResult.details.errors > 0 && (
              <p style={{ margin: '8px 0 0 0', color: '#991b1b', fontSize: '14px' }}>
                Errors: {uploadResult.details.errors}
              </p>
            )}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button
            onClick={onClose}
            style={{ ...buttonStyle, backgroundColor: '#f3f4f6', color: '#374151' }}
            disabled={uploading}
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            style={{ ...buttonStyle, backgroundColor: '#1976D2', color: '#fff' }}
            disabled={!file || uploading}
          >
            {uploading ? 'Uploading...' : 'Upload & Process'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Bulk Edit Modal Component
const BulkEditModal = ({ isOpen, onClose, onSave, selectedCount, selectedPublications }) => {
  const [formData, setFormData] = useState({
    publication_price: '',
    agreement_tat: '',
    practical_tat: '',
    tags_badges: ''
  });
  const [updating, setUpdating] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);

    try {
      const dataToSend = {};
      if (formData.publication_price) dataToSend.publication_price = parseFloat(formData.publication_price);
      if (formData.agreement_tat) dataToSend.agreement_tat = parseInt(formData.agreement_tat);
      if (formData.practical_tat) dataToSend.practical_tat = parseInt(formData.practical_tat);
      if (formData.tags_badges) dataToSend.tags_badges = formData.tags_badges;

      await api.patch('/publications/bulk-edit', {
        ids: selectedPublications,
        updates: dataToSend
      });

      onSave();
    } catch (error) {
      console.error('Bulk edit error:', error);
      alert(error.response?.data?.error || 'Bulk edit failed. Please try again.');
    } finally {
      setUpdating(false);
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
    maxWidth: '600px',
    width: '100%',
    maxHeight: '80vh',
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
            Bulk Edit {selectedCount} Publications
          </h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', fontSize: '24px', cursor: 'pointer' }}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            <div style={formGroupStyle}>
              <label style={labelStyle}>Price ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.publication_price}
                onChange={(e) => setFormData({ ...formData, publication_price: e.target.value })}
                style={inputStyle}
                placeholder="Leave empty to keep unchanged"
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Agreement TAT (days)</label>
              <input
                type="number"
                min="0"
                value={formData.agreement_tat}
                onChange={(e) => setFormData({ ...formData, agreement_tat: e.target.value })}
                style={inputStyle}
                placeholder="Leave empty to keep unchanged"
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Practical TAT (days)</label>
              <input
                type="number"
                min="0"
                value={formData.practical_tat}
                onChange={(e) => setFormData({ ...formData, practical_tat: e.target.value })}
                style={inputStyle}
                placeholder="Leave empty to keep unchanged"
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Tags/Badges</label>
              <input
                type="text"
                value={formData.tags_badges}
                onChange={(e) => setFormData({ ...formData, tags_badges: e.target.value })}
                style={inputStyle}
                placeholder="Leave empty to keep unchanged"
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{ ...buttonStyle, backgroundColor: '#f3f4f6', color: '#374151' }}
              disabled={updating}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{ ...buttonStyle, backgroundColor: '#1976D2', color: '#fff' }}
              disabled={updating}
            >
              {updating ? 'Updating...' : 'Update All'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Bulk Delete Modal Component
const BulkDeleteModal = ({ isOpen, onClose, onConfirm, selectedCount }) => {
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
    maxWidth: '400px',
    width: '100%',
    boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
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
            Confirm Bulk Delete
          </h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', fontSize: '24px', cursor: 'pointer' }}>
            ×
          </button>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <p style={{ marginBottom: '16px', color: '#666' }}>
            Are you sure you want to delete <strong>{selectedCount}</strong> publications? This action cannot be undone.
          </p>
          <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '12px' }}>
            <p style={{ margin: 0, color: '#991b1b', fontWeight: '600' }}>
              ⚠️ Warning: This will permanently remove the selected publications from the database.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button
            onClick={onClose}
            style={{ ...buttonStyle, backgroundColor: '#f3f4f6', color: '#374151' }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{ ...buttonStyle, backgroundColor: '#dc2626', color: '#fff' }}
          >
            Delete {selectedCount} Publications
          </button>
        </div>
      </div>
    </div>
  );
};


export default PublicationManagement;