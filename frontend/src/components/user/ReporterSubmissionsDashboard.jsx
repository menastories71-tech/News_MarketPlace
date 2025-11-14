import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Icon from '../common/Icon';
import api from '../../services/api';

// Reporter Submissions Dashboard Component
const ReporterSubmissionsDashboard = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalSubmissions, setTotalSubmissions] = useState(0);
  const itemsPerPage = 10;

  // Filters
  const [filters, setFilters] = useState({
    status: '',
    publication_name: '',
    date_from: '',
    date_to: ''
  });

  // Modals
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [editLoading, setEditLoading] = useState(false);
  const [editErrors, setEditErrors] = useState({});

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
  }, [isAuthenticated, navigate]);

  // Fetch submissions
  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: currentPage,
        limit: itemsPerPage
      });

      // Add filters to params
      if (filters.status) params.append('status', filters.status);
      if (filters.publication_name) params.append('publication_name', filters.publication_name);
      if (filters.date_from) params.append('date_from', filters.date_from);
      if (filters.date_to) params.append('date_to', filters.date_to);

      const response = await api.get(`/reporters/my?${params}`);
      setSubmissions(response.data.reporters);
      setTotalPages(Math.ceil((response.data.pagination?.total || 0) / itemsPerPage));
      setTotalSubmissions(response.data.pagination?.total || 0);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      setError('Failed to load submissions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Initial load and when filters/page change
  useEffect(() => {
    if (isAuthenticated) {
      fetchSubmissions();
    }
  }, [isAuthenticated, currentPage, filters]);

  // Handle filter changes
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setCurrentPage(1); // Reset to first page when filtering
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      status: '',
      publication_name: '',
      date_from: '',
      date_to: ''
    });
    setCurrentPage(1);
  };

  // View details
  const handleViewDetails = (submission) => {
    setSelectedSubmission(submission);
    setShowDetailsModal(true);
  };

  // Edit submission
  const handleEdit = (submission) => {
    if (submission.status !== 'pending') {
      alert('Only pending submissions can be edited.');
      return;
    }
    setSelectedSubmission(submission);
    setEditFormData({ ...submission });
    setShowEditModal(true);
    setEditErrors({});
  };

  // Handle edit form changes
  const handleEditChange = (field, value) => {
    setEditFormData(prev => ({ ...prev, [field]: value }));
    if (editErrors[field]) {
      setEditErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Submit edit
  const handleEditSubmit = async (e) => {
    e.preventDefault();

    if (!validateEditForm()) return;

    try {
      setEditLoading(true);
      await api.put(`/reporters/${selectedSubmission.id}`, editFormData);
      setShowEditModal(false);
      fetchSubmissions(); // Refresh list
      alert('Submission updated successfully!');
    } catch (error) {
      console.error('Error updating submission:', error);
      if (error.response?.status === 400 && error.response.data.details) {
        const validationErrors = {};
        error.response.data.details.forEach(detail => {
          validationErrors[detail.path] = detail.msg;
        });
        setEditErrors(validationErrors);
      } else {
        alert('Failed to update submission. Please try again.');
      }
    } finally {
      setEditLoading(false);
    }
  };

  // Validate edit form
  const validateEditForm = () => {
    const errors = {};

    const requiredFields = [
      'function_department', 'position', 'name', 'gender', 'email',
      'publication_name', 'publication_industry', 'publication_location',
      'niche_industry', 'how_heard_about_us'
    ];

    requiredFields.forEach(field => {
      if (!editFormData[field] || editFormData[field].toString().trim() === '') {
        errors[field] = 'This field is required';
      }
    });

    // URL validations
    if (editFormData.website_url && !editFormData.website_url.match(/^https?:\/\/.+/)) {
      errors.website_url = 'Please enter a valid URL starting with http:// or https://';
    }
    if (editFormData.linkedin && !editFormData.linkedin.match(/^https?:\/\/.+/)) {
      errors.linkedin = 'Please enter a valid LinkedIn URL';
    }
    if (editFormData.instagram && !editFormData.instagram.match(/^https?:\/\/.+/)) {
      errors.instagram = 'Please enter a valid Instagram URL';
    }
    if (editFormData.facebook && !editFormData.facebook.match(/^https?:\/\/.+/)) {
      errors.facebook = 'Please enter a valid Facebook URL';
    }
    if (editFormData.sample_url && !editFormData.sample_url.match(/^https?:\/\/.+/)) {
      errors.sample_url = 'Please enter a valid sample URL';
    }

    // Email validation
    if (editFormData.email && !editFormData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      errors.email = 'Please enter a valid email address';
    }

    // WhatsApp validation
    if (editFormData.whatsapp && !editFormData.whatsapp.match(/^\+?[\d\s\-()]+$/)) {
      errors.whatsapp = 'Invalid WhatsApp number format';
    }

    // Numeric validations
    if (editFormData.minimum_expectation_usd && isNaN(editFormData.minimum_expectation_usd)) {
      errors.minimum_expectation_usd = 'Please enter a valid number';
    }
    if (editFormData.articles_per_month && (isNaN(editFormData.articles_per_month) || editFormData.articles_per_month < 0)) {
      errors.articles_per_month = 'Please enter a valid non-negative number';
    }

    setEditErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Pagination
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Status badge
  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: '#FF9800', bg: '#FFF3E0', text: 'Pending Review' },
      approved: { color: '#4CAF50', bg: '#E8F5E8', text: 'Approved' },
      rejected: { color: '#F44336', bg: '#FFEBEE', text: 'Rejected' }
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <span style={{
        padding: '4px 8px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: '600',
        color: config.color,
        backgroundColor: config.bg
      }}>
        {config.text}
      </span>
    );
  };

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

  const containerStyle = {
    padding: '24px',
    maxWidth: '1200px',
    margin: '0 auto'
  };

  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px'
  };

  const filtersStyle = {
    backgroundColor: theme.backgroundAlt,
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '24px',
    border: `1px solid ${theme.borderLight}`
  };

  const filterGridStyle = {
    display: 'grid',
    gridTemplateColumns: window.innerWidth < 768 ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginBottom: '16px'
  };

  const inputStyle = {
    width: '100%',
    padding: '8px 12px',
    border: `1px solid ${theme.borderLight}`,
    borderRadius: '6px',
    fontSize: '14px'
  };

  const selectStyle = {
    ...inputStyle,
    cursor: 'pointer'
  };

  const buttonStyle = {
    padding: '8px 16px',
    borderRadius: '6px',
    fontWeight: '500',
    cursor: 'pointer',
    border: 'none',
    fontSize: '14px'
  };

  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    backgroundColor: theme.background,
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  };

  const thStyle = {
    padding: '12px 16px',
    textAlign: 'left',
    backgroundColor: theme.backgroundSoft,
    fontWeight: '600',
    fontSize: '14px',
    color: theme.textPrimary,
    borderBottom: `1px solid ${theme.borderLight}`
  };

  const tdStyle = {
    padding: '12px 16px',
    borderBottom: `1px solid ${theme.borderLight}`,
    fontSize: '14px'
  };

  const actionButtonStyle = {
    padding: '6px 12px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '500',
    cursor: 'pointer',
    border: 'none',
    marginRight: '8px'
  };

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

  const modalContentStyle = {
    background: theme.background,
    borderRadius: '12px',
    padding: '24px',
    maxWidth: '800px',
    width: '100%',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
  };

  const paginationStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '24px',
    gap: '8px'
  };

  const pageButtonStyle = (isActive) => ({
    padding: '8px 12px',
    border: `1px solid ${theme.borderLight}`,
    borderRadius: '4px',
    backgroundColor: isActive ? theme.primary : theme.background,
    color: isActive ? 'white' : theme.textPrimary,
    cursor: 'pointer',
    fontSize: '14px'
  });

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <div>
          <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '800', color: theme.textPrimary }}>
            My Reporter Submissions
          </h1>
          <p style={{ margin: '8px 0 0 0', color: theme.textSecondary }}>
            Manage and track your reporter profile submissions
          </p>
        </div>
      </div>

      {/* Filters */}
      <div style={filtersStyle}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600' }}>Filters</h3>
        <div style={filterGridStyle}>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              style={selectStyle}
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
              Publication Name
            </label>
            <input
              type="text"
              value={filters.publication_name}
              onChange={(e) => handleFilterChange('publication_name', e.target.value)}
              placeholder="Search by publication..."
              style={inputStyle}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
              From Date
            </label>
            <input
              type="date"
              value={filters.date_from}
              onChange={(e) => handleFilterChange('date_from', e.target.value)}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
              To Date
            </label>
            <input
              type="date"
              value={filters.date_to}
              onChange={(e) => handleFilterChange('date_to', e.target.value)}
              style={inputStyle}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={clearFilters}
            style={{ ...buttonStyle, backgroundColor: theme.backgroundSoft, color: theme.textSecondary }}
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Icon name="spinner" size="lg" style={{ color: theme.primary }} />
          <p style={{ marginTop: '16px', color: theme.textSecondary }}>Loading submissions...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div style={{
          padding: '16px',
          backgroundColor: '#FFEBEE',
          border: `1px solid ${theme.danger}`,
          borderRadius: '8px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <Icon name="exclamation-triangle" size="lg" style={{ color: theme.danger }} />
          <div>
            <div style={{ fontWeight: '600', color: theme.danger }}>Error</div>
            <div style={{ fontSize: '14px', color: theme.textSecondary }}>{error}</div>
          </div>
        </div>
      )}

      {/* Submissions Table */}
      {!loading && !error && (
        <>
          <div style={{ marginBottom: '16px' }}>
            <p style={{ color: theme.textSecondary }}>
              Showing {submissions.length} of {totalSubmissions} submissions
            </p>
          </div>

          {submissions.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '40px',
              backgroundColor: theme.backgroundAlt,
              borderRadius: '8px'
            }}>
              <Icon name="file-alt" size="3x" style={{ color: theme.textDisabled, marginBottom: '16px' }} />
              <h3 style={{ color: theme.textSecondary, margin: '0 0 8px 0' }}>No submissions found</h3>
              <p style={{ color: theme.textDisabled, margin: 0 }}>
                {Object.values(filters).some(v => v) ? 'Try adjusting your filters.' : 'You haven\'t submitted any reporter profiles yet.'}
              </p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thStyle}>Reporter</th>
                    <th style={thStyle}>Publication</th>
                    <th style={thStyle}>Status</th>
                    <th style={thStyle}>Submitted</th>
                    <th style={thStyle}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((submission) => (
                    <tr key={submission.id}>
                      <td style={tdStyle}>
                        <div>
                          <div style={{ fontWeight: '600', color: theme.textPrimary }}>{submission.name}</div>
                          <div style={{ fontSize: '12px', color: theme.textSecondary }}>{submission.email}</div>
                        </div>
                      </td>
                      <td style={tdStyle}>
                        <div>
                          <div style={{ fontWeight: '500' }}>{submission.publication_name}</div>
                          <div style={{ fontSize: '12px', color: theme.textSecondary }}>{submission.position}</div>
                        </div>
                      </td>
                      <td style={tdStyle}>
                        {getStatusBadge(submission.status)}
                      </td>
                      <td style={tdStyle}>
                        {new Date(submission.created_at).toLocaleDateString()}
                      </td>
                      <td style={tdStyle}>
                        <button
                          onClick={() => handleViewDetails(submission)}
                          style={{ ...actionButtonStyle, backgroundColor: theme.primaryLight, color: theme.primary }}
                        >
                          View
                        </button>
                        {submission.status === 'pending' && (
                          <button
                            onClick={() => handleEdit(submission)}
                            style={{ ...actionButtonStyle, backgroundColor: theme.secondaryLight, color: theme.secondary }}
                          >
                            Edit
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={paginationStyle}>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                style={{
                  ...pageButtonStyle(false),
                  opacity: currentPage === 1 ? 0.5 : 1,
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                }}
              >
                Previous
              </button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                if (page > totalPages) return null;
                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    style={pageButtonStyle(page === currentPage)}
                  >
                    {page}
                  </button>
                );
              })}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                style={{
                  ...pageButtonStyle(false),
                  opacity: currentPage === totalPages ? 0.5 : 1,
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
                }}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedSubmission && (
        <div style={modalStyle} onClick={() => setShowDetailsModal(false)}>
          <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '800' }}>
                Submission Details
              </h2>
              <button onClick={() => setShowDetailsModal(false)} style={{ background: 'transparent', border: 'none', fontSize: '24px', cursor: 'pointer' }}>
                ×
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Personal Information</h3>
                <div style={{ display: 'grid', gap: '12px' }}>
                  <div><strong>Name:</strong> {selectedSubmission.name}</div>
                  <div><strong>Email:</strong> {selectedSubmission.email}</div>
                  <div><strong>WhatsApp:</strong> {selectedSubmission.whatsapp || 'N/A'}</div>
                  <div><strong>Gender:</strong> {selectedSubmission.gender}</div>
                  <div><strong>Position:</strong> {selectedSubmission.position}</div>
                  <div><strong>Department:</strong> {selectedSubmission.function_department}</div>
                </div>
              </div>

              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Publication Details</h3>
                <div style={{ display: 'grid', gap: '12px' }}>
                  <div><strong>Publication Name:</strong> {selectedSubmission.publication_name}</div>
                  <div><strong>Website:</strong> {selectedSubmission.website_url ? <a href={selectedSubmission.website_url} target="_blank" rel="noopener noreferrer">{selectedSubmission.website_url}</a> : 'N/A'}</div>
                  <div><strong>Industry:</strong> {selectedSubmission.publication_industry}</div>
                  <div><strong>Location:</strong> {selectedSubmission.publication_location}</div>
                  <div><strong>Niche:</strong> {selectedSubmission.niche_industry}</div>
                </div>
              </div>

              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Status & Dates</h3>
                <div style={{ display: 'grid', gap: '12px' }}>
                  <div><strong>Status:</strong> {getStatusBadge(selectedSubmission.status)}</div>
                  <div><strong>Submitted:</strong> {new Date(selectedSubmission.created_at).toLocaleString()}</div>
                  {selectedSubmission.approved_at && (
                    <div><strong>Approved:</strong> {new Date(selectedSubmission.approved_at).toLocaleString()}</div>
                  )}
                  {selectedSubmission.rejected_at && (
                    <div><strong>Rejected:</strong> {new Date(selectedSubmission.rejected_at).toLocaleString()}</div>
                  )}
                  {selectedSubmission.rejection_reason && (
                    <div><strong>Rejection Reason:</strong> {selectedSubmission.rejection_reason}</div>
                  )}
                </div>
              </div>
            </div>

            <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: `1px solid ${theme.borderLight}` }}>
              <button
                onClick={() => setShowDetailsModal(false)}
                style={{ ...buttonStyle, backgroundColor: theme.primary, color: 'white', padding: '10px 20px' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedSubmission && (
        <div style={modalStyle} onClick={() => setShowEditModal(false)}>
          <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '800' }}>
                Edit Submission
              </h2>
              <button onClick={() => setShowEditModal(false)} style={{ background: 'transparent', border: 'none', fontSize: '24px', cursor: 'pointer' }}>
                ×
              </button>
            </div>

            <form onSubmit={handleEditSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px' }}>
                    Function Department *
                  </label>
                  <select
                    value={editFormData.function_department || ''}
                    onChange={(e) => handleEditChange('function_department', e.target.value)}
                    style={{ ...inputStyle, borderColor: editErrors.function_department ? theme.danger : theme.borderLight }}
                    required
                  >
                    <option value="">Select department</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Procurement">Procurement</option>
                    <option value="Publishing">Publishing</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Accounts and Finance">Accounts and Finance</option>
                  </select>
                  {editErrors.function_department && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{editErrors.function_department}</div>}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px' }}>
                    Position *
                  </label>
                  <select
                    value={editFormData.position || ''}
                    onChange={(e) => handleEditChange('position', e.target.value)}
                    style={{ ...inputStyle, borderColor: editErrors.position ? theme.danger : theme.borderLight }}
                    required
                  >
                    <option value="">Select position</option>
                    <option value="Journalist">Journalist</option>
                    <option value="Reporter">Reporter</option>
                    <option value="Contributor">Contributor</option>
                    <option value="Staff">Staff</option>
                  </select>
                  {editErrors.position && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{editErrors.position}</div>}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px' }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={editFormData.name || ''}
                    onChange={(e) => handleEditChange('name', e.target.value)}
                    style={{ ...inputStyle, borderColor: editErrors.name ? theme.danger : theme.borderLight }}
                    required
                  />
                  {editErrors.name && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{editErrors.name}</div>}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px' }}>
                    Email *
                  </label>
                  <input
                    type="email"
                    value={editFormData.email || ''}
                    onChange={(e) => handleEditChange('email', e.target.value)}
                    style={{ ...inputStyle, borderColor: editErrors.email ? theme.danger : theme.borderLight }}
                    required
                  />
                  {editErrors.email && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{editErrors.email}</div>}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px' }}>
                    Publication Name *
                  </label>
                  <input
                    type="text"
                    value={editFormData.publication_name || ''}
                    onChange={(e) => handleEditChange('publication_name', e.target.value)}
                    style={{ ...inputStyle, borderColor: editErrors.publication_name ? theme.danger : theme.borderLight }}
                    required
                  />
                  {editErrors.publication_name && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{editErrors.publication_name}</div>}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px' }}>
                    Publication Industry *
                  </label>
                  <input
                    type="text"
                    value={editFormData.publication_industry || ''}
                    onChange={(e) => handleEditChange('publication_industry', e.target.value)}
                    style={{ ...inputStyle, borderColor: editErrors.publication_industry ? theme.danger : theme.borderLight }}
                    required
                  />
                  {editErrors.publication_industry && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{editErrors.publication_industry}</div>}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  style={{ ...buttonStyle, backgroundColor: theme.backgroundSoft, color: theme.textSecondary }}
                  disabled={editLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ ...buttonStyle, backgroundColor: theme.primary, color: 'white' }}
                  disabled={editLoading}
                >
                  {editLoading ? 'Updating...' : 'Update Submission'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReporterSubmissionsDashboard;