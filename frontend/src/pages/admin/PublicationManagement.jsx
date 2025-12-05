import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import Icon from '../../components/common/Icon';
import Sidebar from '../../components/admin/Sidebar';
import api from '../../services/api';

// Publication Management Form Modal Component
const PublicationManagementFormModal = ({ isOpen, onClose, record, onSave }) => {
  const [formData, setFormData] = useState({
    region: '',
    publication_name: '',
    publication_url: '',
    da: '',
    article_reference_link: '',
    committed_tat: '',
    language: '',
    publication_primary_focus: '',
    practical_tat: '',
    price_usd: '',
    do_follow: false,
    dr: '',
    word_limit: '',
    needs_images: false,
    image_count: '1',
    remarks: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (record) {
      setFormData({
        region: record.region || '',
        publication_name: record.publication_name || '',
        publication_url: record.publication_url || '',
        da: record.da || '',
        article_reference_link: record.article_reference_link || '',
        committed_tat: record.committed_tat || '',
        language: record.language || '',
        publication_primary_focus: record.publication_primary_focus || '',
        practical_tat: record.practical_tat || '',
        price_usd: record.price_usd || '',
        do_follow: record.do_follow || false,
        dr: record.dr || '',
        word_limit: record.word_limit || '',
        needs_images: record.needs_images || false,
        image_count: record.image_count || '',
        remarks: record.remarks || ''
      });
    } else {
      setFormData({
        region: '',
        publication_name: '',
        publication_url: '',
        da: '',
        article_reference_link: '',
        committed_tat: '',
        language: '',
        publication_primary_focus: '',
        practical_tat: '',
        price_usd: '',
        do_follow: false,
        dr: '',
        word_limit: '',
        needs_images: false,
        image_count: '1',
        remarks: ''
      });
    }
  }, [record, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const dataToSend = {
        ...formData,
        da: parseInt(formData.da) || 0,
        committed_tat: parseInt(formData.committed_tat) || 0,
        practical_tat: parseInt(formData.practical_tat) || 0,
        price_usd: parseFloat(formData.price_usd) || 0,
        dr: parseInt(formData.dr) || 0,
        word_limit: parseInt(formData.word_limit) || 0,
        image_count: formData.needs_images ? parseInt(formData.image_count) || 0 : 0
      };

      if (record) {
        await api.put(`/admin/publication-management/${record.id}`, dataToSend);
      } else {
        await api.post('/admin/publication-management', dataToSend);
      }

      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving record:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Error saving record. Please try again.';
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
            {record ? 'Edit Publication Management Record' : 'Create Publication Management Record'}
          </h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', fontSize: '24px', cursor: 'pointer' }}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
            <div style={formGroupStyle}>
              <label style={labelStyle}>Region *</label>
              <input
                type="text"
                value={formData.region}
                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
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
              <label style={labelStyle}>Publication URL</label>
              <input
                type="url"
                value={formData.publication_url}
                onChange={(e) => setFormData({ ...formData, publication_url: e.target.value })}
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
              <label style={labelStyle}>Article Reference Link</label>
              <input
                type="url"
                value={formData.article_reference_link}
                onChange={(e) => setFormData({ ...formData, article_reference_link: e.target.value })}
                style={inputStyle}
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Committed TAT (days)</label>
              <input
                type="number"
                min="0"
                value={formData.committed_tat}
                onChange={(e) => setFormData({ ...formData, committed_tat: e.target.value })}
                style={inputStyle}
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Language</label>
              <input
                type="text"
                value={formData.language}
                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                style={inputStyle}
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Primary Focus</label>
              <input
                type="text"
                value={formData.publication_primary_focus}
                onChange={(e) => setFormData({ ...formData, publication_primary_focus: e.target.value })}
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
              <label style={labelStyle}>Price (USD)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.price_usd}
                onChange={(e) => setFormData({ ...formData, price_usd: e.target.value })}
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
              <label style={labelStyle}>Word Limit</label>
              <input
                type="number"
                min="0"
                value={formData.word_limit}
                onChange={(e) => setFormData({ ...formData, word_limit: e.target.value })}
                style={inputStyle}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginTop: '16px' }}>
            <div style={formGroupStyle}>
              <label style={labelStyle}>Needs Images</label>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <input
                  type="checkbox"
                  id="needs_images"
                  checked={formData.needs_images}
                  onChange={(e) => setFormData({ ...formData, needs_images: e.target.checked })}
                  style={{ marginRight: '8px' }}
                />
                <label htmlFor="needs_images" style={{ fontSize: '14px', color: '#212121' }}>Publication needs images</label>
              </div>
            </div>
          </div>

          {formData.needs_images && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginTop: '16px' }}>
              <div style={formGroupStyle}>
                <label style={labelStyle}>Image Count</label>
                <select
                  value={formData.image_count}
                  onChange={(e) => setFormData({ ...formData, image_count: e.target.value })}
                  style={inputStyle}
                >
                  <option value="1">1</option>
                  <option value="2">2</option>
                </select>
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginTop: '16px' }}>
            <div style={formGroupStyle}>
              <label style={labelStyle}>Remarks</label>
              <textarea
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                style={{ ...inputStyle, minHeight: '60px', resize: 'vertical' }}
                placeholder="Additional remarks"
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', marginTop: '24px' }}>
            <input
              type="checkbox"
              id="dofollow"
              checked={formData.do_follow}
              onChange={(e) => setFormData({ ...formData, do_follow: e.target.checked })}
              style={{ marginRight: '8px' }}
            />
            <label htmlFor="dofollow" style={{ fontSize: '14px', color: '#212121' }}>Do-follow Link</label>
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
              {loading ? 'Saving...' : (record ? 'Update Record' : 'Create Record')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Brand colors from Color palette
const theme = {
  primary: '#1976D2',
  primaryDark: '#0D47A1',
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

const PublicationManagementPage = () => {
  const { admin, logout, hasRole } = useAdminAuth();

  // Check if user has permission to manage publication management records
  if (!hasRole('super_admin')) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: theme.backgroundSoft }}>
        <div style={{ textAlign: 'center' }}>
          <Icon name="shield-exclamation" size="lg" style={{ color: theme.danger, marginBottom: '16px' }} />
          <h2 style={{ color: theme.textPrimary, marginBottom: '8px' }}>Access Denied</h2>
          <p style={{ color: theme.textSecondary }}>You don't have permission to access publication management.</p>
          <p style={{ color: theme.textSecondary, fontSize: '14px', marginTop: '8px' }}>
            Required role: Super Admin
          </p>
        </div>
      </div>
    );
  }

  const [records, setRecords] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [message, setMessage] = useState(null);

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
    fetchRecords();
  }, [currentPage, pageSize]);

  const fetchRecords = async () => {
    try {
      const params = new URLSearchParams();
      params.append('page', currentPage.toString());
      params.append('limit', pageSize.toString());
      const response = await api.get(`/admin/publication-management?${params.toString()}`);
      setRecords(response.data.publications || []);
      setTotalRecords(response.data.pagination?.total || 0);
    } catch (error) {
      console.error('Error fetching records:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('adminAccessToken');
        window.location.href = '/admin/login';
      } else {
        alert('Failed to load records. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFormSave = () => {
    fetchRecords();
    setMessage({ type: 'success', text: 'Record saved successfully!' });
  };

  const handleCreateRecord = () => {
    setEditingRecord(null);
    setShowFormModal(true);
  };

  const handleEditRecord = (record) => {
    setEditingRecord(record);
    setShowFormModal(true);
  };

  const handleDeleteRecord = async (recordId) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;

    try {
      setLoading(true);
      await api.delete(`/admin/publication-management/${recordId}`);
      fetchRecords();
      setMessage({ type: 'success', text: 'Record deleted successfully!' });
    } catch (error) {
      console.error('Error deleting record:', error);
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Error deleting record. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const totalPages = Math.ceil(totalRecords / pageSize);

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
                  Loading publication management records...
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 3 }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="mr-3 md:hidden"
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
                    <Icon name="document-text" size="sm" style={{ color: '#1976D2' }} />
                  </div>
                  <h1 style={{ margin: 0, fontSize: 34, fontWeight: 800 }}>Publication Management</h1>
                </div>
                <p style={{ marginTop: 8, color: '#757575' }}>Manage publication management records</p>
              </div>

              <button
                onClick={handleCreateRecord}
                style={btnPrimary}
              >
                <Icon name="plus-circle" size="sm" style={{ color: '#fff' }} />
                Add Record
              </button>
            </div>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
              <div style={{ background: '#fff', borderRadius: 12, padding: 18, boxShadow: '0 8px 20px rgba(2,6,23,0.06)', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 48, height: 48, borderRadius: 10, background: '#e6f0ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="document-text" size="lg" style={{ color: '#1976D2' }} />
                </div>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 800 }}>{totalRecords}</div>
                  <div style={{ fontSize: 12, color: '#757575' }}>Total Records</div>
                </div>
              </div>
            </div>

            {/* Message */}
            {message && (
              <div style={{
                padding: '12px 16px',
                borderRadius: '8px',
                marginBottom: '16px',
                backgroundColor: message.type === 'success' ? '#dcfce7' : '#fee2e2',
                border: `1px solid ${message.type === 'success' ? '#10b981' : '#ef4444'}`,
                color: message.type === 'success' ? '#065f46' : '#991b1b'
              }}>
                {message.text}
                <button
                  onClick={() => setMessage(null)}
                  style={{ float: 'right', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '16px' }}
                >
                  ×
                </button>
              </div>
            )}

            {/* Table */}
            <div style={{ backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 8px 20px rgba(2,6,23,0.06)', overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb', backgroundColor: '#f8fafc' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: theme.textPrimary }}>
                    Publication Management Records
                  </span>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      const newPageSize = parseInt(e.target.value);
                      setPageSize(newPageSize);
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

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                      <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', fontSize: '12px', color: theme.textPrimary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Region
                      </th>
                      <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', fontSize: '12px', color: theme.textPrimary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Publication Name
                      </th>
                      <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', fontSize: '12px', color: theme.textPrimary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        URL
                      </th>
                      <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', fontSize: '12px', color: theme.textPrimary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        DA/DR
                      </th>
                      <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', fontSize: '12px', color: theme.textPrimary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Price
                      </th>
                      <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', fontSize: '12px', color: theme.textPrimary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        TAT
                      </th>
                      <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', fontSize: '12px', color: theme.textPrimary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((record, index) => (
                      <tr key={record.id} style={{
                        borderBottom: '1px solid #f1f5f9',
                        backgroundColor: index % 2 === 0 ? '#ffffff' : '#fafbfc'
                      }}>
                        <td style={{ padding: '16px' }}>
                          <div style={{ fontSize: '14px', color: theme.textPrimary, fontWeight: '500' }}>
                            {record.region}
                          </div>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <div style={{ fontSize: '14px', color: theme.textPrimary, fontWeight: '500' }}>
                            {record.publication_name}
                          </div>
                          <div style={{ fontSize: '12px', color: theme.textSecondary }}>
                            {record.language}
                          </div>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <div style={{ fontSize: '12px', color: theme.primary }}>
                            <a href={record.publication_url} target="_blank" rel="noopener noreferrer" style={{ color: theme.primary, textDecoration: 'none' }}>
                              {record.publication_url ? record.publication_url.substring(0, 30) + '...' : 'N/A'}
                            </a>
                          </div>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <span style={{
                              padding: '4px 8px',
                              backgroundColor: '#e0f2fd',
                              color: theme.primary,
                              borderRadius: '12px',
                              fontSize: '11px',
                              fontWeight: '600'
                            }}>
                              DA: {record.da}
                            </span>
                            <span style={{
                              padding: '4px 8px',
                              backgroundColor: '#f3e5f5',
                              color: '#9C27B0',
                              borderRadius: '12px',
                              fontSize: '11px',
                              fontWeight: '600'
                            }}>
                              DR: {record.dr}
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <div style={{ fontSize: '14px', fontWeight: '600', color: theme.success }}>
                            ${record.price_usd}
                          </div>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <div style={{ fontSize: '12px', color: theme.textPrimary }}>
                            Comm: {record.committed_tat}d
                          </div>
                          <div style={{ fontSize: '12px', color: theme.textSecondary }}>
                            Prac: {record.practical_tat}d
                          </div>
                          <div style={{ fontSize: '12px', color: theme.textSecondary }}>
                            Words: {record.word_limit || 'N/A'}
                          </div>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              onClick={() => handleEditRecord(record)}
                              style={{
                                padding: '6px 10px',
                                backgroundColor: theme.primary,
                                color: '#fff',
                                border: 'none',
                                borderRadius: '4px',
                                fontSize: '12px',
                                cursor: 'pointer',
                                fontWeight: '600'
                              }}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteRecord(record.id)}
                              style={{
                                padding: '6px 10px',
                                backgroundColor: '#dc2626',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '4px',
                                fontSize: '12px',
                                cursor: 'pointer',
                                fontWeight: '600'
                              }}
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
                    Page {currentPage} of {totalPages} ({totalRecords} total records)
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

              {records.length === 0 && (
                <div style={{ padding: '80px', textAlign: 'center', color: theme.textSecondary }}>
                  <div style={{ fontSize: '64px', marginBottom: '16px' }}>
                    📭
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>
                    No records found
                  </div>
                  <div style={{ fontSize: '16px' }}>
                    Try adjusting your search criteria or add a new record.
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* Form Modal */}
      <PublicationManagementFormModal
        isOpen={showFormModal}
        onClose={() => setShowFormModal(false)}
        record={editingRecord}
        onSave={handleFormSave}
      />
    </div>
  );
};

export default PublicationManagementPage;