import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import Icon from '../common/Icon';
import Sidebar from './Sidebar';
import api from '../../services/api';
import { Download } from 'lucide-react';

// Award Submission Details Modal Component
const AwardSubmissionDetailsModal = ({ isOpen, onClose, submission }) => {
  if (!isOpen || !submission) return null;

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

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleString();
  };

  const interestedFields = [
    { key: 'interested_receive_award', label: 'Receive Award' },
    { key: 'interested_sponsor_award', label: 'Sponsor Award' },
    { key: 'interested_speak_award', label: 'Speak at Award' },
    { key: 'interested_exhibit_award', label: 'Exhibit at Award' },
    { key: 'interested_attend_award', label: 'Attend Award' }
  ];

  return (
    <div style={modalStyle} onClick={onClose}>
      <div style={contentStyle} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '800' }}>
            Award Submission Details
          </h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', fontSize: '24px', cursor: 'pointer' }}>
            ×
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', color: '#1976D2' }}>Basic Information</h3>
            <div style={{ marginBottom: '8px' }}><strong>Name:</strong> {submission.name}</div>
            <div style={{ marginBottom: '8px' }}><strong>Email:</strong> {submission.email}</div>
            <div style={{ marginBottom: '8px' }}><strong>Gender:</strong> {submission.gender || '—'}</div>
            <div style={{ marginBottom: '8px' }}><strong>Date of Birth:</strong> {submission.dob ? new Date(submission.dob).toLocaleDateString() : '—'}</div>
            <div style={{ marginBottom: '8px' }}><strong>Award:</strong> {submission.award_name}</div>
          </div>

          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', color: '#1976D2' }}>Contact Information</h3>
            <div style={{ marginBottom: '8px' }}><strong>WhatsApp:</strong> {submission.whatsapp || '—'}</div>
            <div style={{ marginBottom: '8px' }}><strong>Calling Number:</strong> {submission.calling_number || '—'}</div>
            <div style={{ marginBottom: '8px' }}><strong>Telegram:</strong> {submission.telegram_username || '—'}</div>
            <div style={{ marginBottom: '8px' }}><strong>Direct Number:</strong> {submission.direct_number || '—'}</div>
          </div>

          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', color: '#1976D2' }}>Professional Information</h3>
            <div style={{ marginBottom: '8px' }}><strong>Current Company:</strong> {submission.current_company || '—'}</div>
            <div style={{ marginBottom: '8px' }}><strong>Position:</strong> {submission.position || '—'}</div>
            <div style={{ marginBottom: '8px' }}><strong>Industry:</strong> {submission.company_industry || '—'}</div>
          </div>

          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', color: '#1976D2' }}>Interests</h3>
            {interestedFields.map(field => (
              <div key={field.key} style={{ marginBottom: '4px' }}>
                <strong>{field.label}:</strong> {submission[field.key] ? 'Yes' : 'No'}
              </div>
            ))}
          </div>

          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', color: '#1976D2' }}>Passport & Residence</h3>
            <div style={{ marginBottom: '8px' }}><strong>Dual Passport:</strong> {submission.dual_passport ? 'Yes' : 'No'}</div>
            {submission.dual_passport && (
              <>
                <div style={{ marginBottom: '8px' }}><strong>Passport 1:</strong> {submission.passport_1 || '—'}</div>
                <div style={{ marginBottom: '8px' }}><strong>Passport 2:</strong> {submission.passport_2 || '—'}</div>
              </>
            )}
            <div style={{ marginBottom: '8px' }}><strong>UAE Residence:</strong> {submission.residence_uae ? 'Yes' : 'No'}</div>
            <div style={{ marginBottom: '8px' }}><strong>Other Residence:</strong> {submission.other_residence ? 'Yes' : 'No'}</div>
            {submission.other_residence && (
              <div style={{ marginBottom: '8px' }}><strong>Other Residence Name:</strong> {submission.other_residence_name || '—'}</div>
            )}
          </div>

          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', color: '#1976D2' }}>Social Media & Websites</h3>
            <div style={{ marginBottom: '8px' }}><strong>LinkedIn:</strong> {submission.linkedin ? <a href={submission.linkedin} target="_blank" rel="noopener noreferrer">{submission.linkedin}</a> : '—'}</div>
            <div style={{ marginBottom: '8px' }}><strong>Instagram:</strong> {submission.instagram ? <a href={submission.instagram} target="_blank" rel="noopener noreferrer">{submission.instagram}</a> : '—'}</div>
            <div style={{ marginBottom: '8px' }}><strong>Facebook:</strong> {submission.facebook ? <a href={submission.facebook} target="_blank" rel="noopener noreferrer">{submission.facebook}</a> : '—'}</div>
            <div style={{ marginBottom: '8px' }}><strong>Personal Website:</strong> {submission.personal_website ? <a href={submission.personal_website} target="_blank" rel="noopener noreferrer">{submission.personal_website}</a> : '—'}</div>
            <div style={{ marginBottom: '8px' }}><strong>Company Website:</strong> {submission.company_website ? <a href={submission.company_website} target="_blank" rel="noopener noreferrer">{submission.company_website}</a> : '—'}</div>
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', color: '#1976D2' }}>Additional Information</h3>
            <div style={{ marginBottom: '8px' }}><strong>Earlier News Features:</strong> {submission.earlier_news_features || '—'}</div>
            <div style={{ marginBottom: '8px' }}><strong>Filling for Other:</strong> {submission.filling_for_other ? 'Yes' : 'No'}</div>
            {submission.filling_for_other && (
              <div style={{ marginBottom: '8px' }}><strong>Other Person Details:</strong> {submission.other_person_details || '—'}</div>
            )}
            <div style={{ marginBottom: '8px' }}><strong>Message:</strong> {submission.message || '—'}</div>
            <div style={{ marginBottom: '8px' }}><strong>Terms Agreed:</strong> {submission.terms_agreed ? 'Yes' : 'No'}</div>
            <div style={{ marginBottom: '8px' }}><strong>Captcha Validated:</strong> {submission.captcha_validated ? 'Yes' : 'No'}</div>
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', color: '#1976D2' }}>Timestamps</h3>
            <div style={{ marginBottom: '8px' }}><strong>Created At:</strong> {formatDate(submission.created_at)}</div>
            <div style={{ marginBottom: '8px' }}><strong>Updated At:</strong> {formatDate(submission.updated_at)}</div>
          </div>
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

const AwardSubmissionManagement = () => {
  const { admin, logout, hasAnyRole } = useAdminAuth();

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleString();
  };

  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortField, setSortField] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [awardFilter, setAwardFilter] = useState('');
  const [receiveFilter, setReceiveFilter] = useState('');
  const [sponsorFilter, setSponsorFilter] = useState('');
  const [speakFilter, setSpeakFilter] = useState('');
  const [exhibitFilter, setExhibitFilter] = useState('');
  const [attendFilter, setAttendFilter] = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  const [industryFilter, setIndustryFilter] = useState('');
  const [awards, setAwards] = useState([]);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // Check if user has permission to manage award submissions
  if (!hasAnyRole(['super_admin', 'content_manager'])) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: theme.backgroundSoft }}>
        <div style={{ textAlign: 'center' }}>
          <Icon name="shield-exclamation" size="lg" style={{ color: theme.danger, marginBottom: '16px' }} />
          <h2 style={{ color: theme.textPrimary, marginBottom: '8px' }}>Access Denied</h2>
          <p style={{ color: theme.textSecondary }}>You don't have permission to access award submission management.</p>
          <p style={{ color: theme.textSecondary, fontSize: '14px', marginTop: '8px' }}>
            Required roles: Super Admin or Content Manager
          </p>
        </div>
      </div>
    );
  }

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
        await fetchAwards();
        await fetchSubmissions();
      } catch (error) {
        console.error('Error fetching data:', error);
        // If unauthorized, the API interceptor will handle redirect
      }
    };

    fetchData();
  }, []);

  const fetchAwards = useCallback(async () => {
    try {
      const response = await api.get('/awards');
      setAwards(response.data.awards || []);
    } catch (error) {
      console.error('Error fetching awards:', error);
    }
  }, []);

  const fetchSubmissions = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: pageSize,
        ...(debouncedSearchTerm && { name: debouncedSearchTerm, email: debouncedSearchTerm, current_company: debouncedSearchTerm }),
        ...(awardFilter && { award_id: awardFilter }),
        ...(receiveFilter && { interested_receive_award: receiveFilter }),
        ...(sponsorFilter && { interested_sponsor_award: sponsorFilter }),
        ...(speakFilter && { interested_speak_award: speakFilter }),
        ...(exhibitFilter && { interested_exhibit_award: exhibitFilter }),
        ...(attendFilter && { interested_attend_award: attendFilter }),
        ...(genderFilter && { gender: genderFilter }),
        ...(industryFilter && { company_industry: industryFilter })
      });

      const response = await api.get(`/award-submissions?${params}`);
      setSubmissions(response.data.submissions || []);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      if (error.response?.status === 401) {
        // Token expired or invalid, redirect to login
        localStorage.removeItem('adminAccessToken');
        window.location.href = '/admin/login';
        return;
      }
      alert('Failed to load award submissions. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, debouncedSearchTerm, awardFilter, receiveFilter, sponsorFilter, speakFilter, exhibitFilter, attendFilter, genderFilter, industryFilter]);

  // Simple search for submissions
  const filteredSubmissions = useMemo(() => {
    return submissions.filter(submission => submission.is_active !== false);
  }, [submissions]);

  // Update filtered submissions when filters change
  useEffect(() => {
    setCurrentPage(1); // Reset to first page when filters change
  }, [debouncedSearchTerm, awardFilter, receiveFilter, sponsorFilter, speakFilter, exhibitFilter, attendFilter, genderFilter, industryFilter]);

  // Sorting logic
  const sortedSubmissions = useMemo(() => {
    return [...filteredSubmissions].sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (sortField === 'created_at' || sortField === 'updated_at' || sortField === 'dob') {
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
  }, [filteredSubmissions, sortField, sortDirection]);

  // Pagination logic
  const paginatedSubmissions = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedSubmissions.slice(startIndex, startIndex + pageSize);
  }, [sortedSubmissions, currentPage, pageSize]);

  const totalPages = Math.ceil(sortedSubmissions.length / pageSize);


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

  const handleViewDetails = (submission) => {
    setSelectedSubmission(submission);
    setShowDetailsModal(true);
  };

  const handleDownloadCSV = async (downloadAll = false) => {
    try {
      setDownloading(true);
      const params = new URLSearchParams();

      if (!downloadAll) {
        if (debouncedSearchTerm) {
          params.append('name', debouncedSearchTerm);
          params.append('email', debouncedSearchTerm);
          params.append('current_company', debouncedSearchTerm);
        }
        if (awardFilter) params.append('award_id', awardFilter);
        if (receiveFilter) params.append('interested_receive_award', receiveFilter);
        if (sponsorFilter) params.append('interested_sponsor_award', sponsorFilter);
        if (speakFilter) params.append('interested_speak_award', speakFilter);
        if (exhibitFilter) params.append('interested_exhibit_award', exhibitFilter);
        if (attendFilter) params.append('interested_attend_award', attendFilter);
        if (genderFilter) params.append('gender', genderFilter);
        if (industryFilter) params.append('company_industry', industryFilter);
      }

      const response = await api.get(`/award-submissions/download-csv?${params.toString()}`, {
        responseType: 'blob'
      });

      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `award_submissions_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      setShowDownloadModal(false);
    } catch (error) {
      console.error('Error downloading CSV:', error);
      alert('Failed to download CSV. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch data when filters change
  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

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
                {[1, 2, 3, 4, 5, 6].map(i => (
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
                      <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr 1fr', gap: '16px', alignItems: 'center' }}>
                        <div>
                          <div style={{ height: '14px', background: '#f3f4f6', borderRadius: 4, width: '120px', marginBottom: '4px' }}></div>
                          <div style={{ height: '12px', background: '#f3f4f6', borderRadius: 4, width: '80px' }}></div>
                        </div>
                        <div style={{ height: '14px', background: '#f3f4f6', borderRadius: 4, width: '100px' }}></div>
                        <div style={{ height: '14px', background: '#f3f4f6', borderRadius: 4, width: '80px' }}></div>
                        <div style={{ height: '14px', background: '#f3f4f6', borderRadius: 4, width: '70px' }}></div>
                        <div style={{ height: '14px', background: '#f3f4f6', borderRadius: 4, width: '60px' }}></div>
                        <div style={{ display: 'flex', gap: '6px' }}>
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
                  <h1 style={{ margin: 0, fontSize: 34, fontWeight: 800 }}>Award Submission Management</h1>
                </div>
                <p style={{ marginTop: 8, color: '#757575' }}>Manage award submissions and applications</p>
              </div>
            </div>

            {/* Search and Filters Bar */}
            <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', marginBottom: '16px', boxShadow: '0 8px 20px rgba(2,6,23,0.06)' }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '300px' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={theme.textSecondary} strokeWidth="2" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}>
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.35-4.35"></path>
                  </svg>
                  <input
                    type="text"
                    placeholder="Search by name, email, or company..."
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
                  value={awardFilter}
                  onChange={(e) => setAwardFilter(e.target.value)}
                  style={{ padding: '12px', border: '2px solid #e0e0e0', borderRadius: '8px', fontSize: '14px', minWidth: '150px' }}
                >
                  <option value="">All Awards</option>
                  {awards.map(award => (
                    <option key={award.id} value={award.id}>{award.award_name}</option>
                  ))}
                </select>

                <select
                  value={receiveFilter}
                  onChange={(e) => setReceiveFilter(e.target.value)}
                  style={{ padding: '12px', border: '2px solid #e0e0e0', borderRadius: '8px', fontSize: '14px', minWidth: '120px' }}
                >
                  <option value="">Receive Award</option>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>

                <select
                  value={sponsorFilter}
                  onChange={(e) => setSponsorFilter(e.target.value)}
                  style={{ padding: '12px', border: '2px solid #e0e0e0', borderRadius: '8px', fontSize: '14px', minWidth: '120px' }}
                >
                  <option value="">Sponsor Award</option>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap', marginTop: '16px' }}>
                <select
                  value={speakFilter}
                  onChange={(e) => setSpeakFilter(e.target.value)}
                  style={{ padding: '12px', border: '2px solid #e0e0e0', borderRadius: '8px', fontSize: '14px', minWidth: '120px' }}
                >
                  <option value="">Speak at Award</option>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>

                <select
                  value={exhibitFilter}
                  onChange={(e) => setExhibitFilter(e.target.value)}
                  style={{ padding: '12px', border: '2px solid #e0e0e0', borderRadius: '8px', fontSize: '14px', minWidth: '120px' }}
                >
                  <option value="">Exhibit at Award</option>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>

                <select
                  value={attendFilter}
                  onChange={(e) => setAttendFilter(e.target.value)}
                  style={{ padding: '12px', border: '2px solid #e0e0e0', borderRadius: '8px', fontSize: '14px', minWidth: '120px' }}
                >
                  <option value="">Attend Award</option>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>

                <select
                  value={genderFilter}
                  onChange={(e) => setGenderFilter(e.target.value)}
                  style={{ padding: '12px', border: '2px solid #e0e0e0', borderRadius: '8px', fontSize: '14px', minWidth: '120px' }}
                >
                  <option value="">All Genders</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>

                <select
                  value={industryFilter}
                  onChange={(e) => setIndustryFilter(e.target.value)}
                  style={{ padding: '12px', border: '2px solid #e0e0e0', borderRadius: '8px', fontSize: '14px', minWidth: '120px' }}
                >
                  <option value="">All Industries</option>
                  <option value="Technology">Technology</option>
                  <option value="Finance">Finance</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Media">Media</option>
                  <option value="Education">Education</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Search Results Summary */}
              <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div style={{ fontSize: '14px', color: theme.textSecondary }}>
                  {debouncedSearchTerm || awardFilter || receiveFilter || sponsorFilter || speakFilter || exhibitFilter || attendFilter || genderFilter || industryFilter ? (
                    <>
                      <span style={{ color: theme.primary, fontWeight: '600' }}>Filtered:</span> Found <strong>{sortedSubmissions.length}</strong> submissions
                    </>
                  ) : (
                    <>
                      Showing <strong>{paginatedSubmissions.length}</strong> of <strong>{sortedSubmissions.length}</strong> submissions
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Submissions Table */}
            <div style={{ backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 8px 20px rgba(2,6,23,0.06)', overflow: 'hidden' }}>
              {/* Table Controls */}
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb', backgroundColor: '#f8fafc' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: theme.textPrimary }}>
                      Submissions
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
                    <button
                      onClick={() => setShowDownloadModal(true)}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: theme.secondary,
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '14px',
                        cursor: 'pointer',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <Download size={16} />
                      Download CSV
                    </button>
                  </div>
                </div>
              </div>

              <div style={{ overflowX: 'auto', maxHeight: paginatedSubmissions.length > 50 ? '600px' : 'auto', overflowY: paginatedSubmissions.length > 50 ? 'auto' : 'visible' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                      <th
                        style={{ padding: '16px', textAlign: 'left', fontWeight: '700', fontSize: '12px', color: theme.textPrimary, textTransform: 'uppercase', letterSpacing: '0.5px', cursor: 'pointer' }}
                        onClick={() => handleSort('name')}
                      >
                        Name {getSortIcon('name')}
                      </th>
                      <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', fontSize: '12px', color: theme.textPrimary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Contact & Award
                      </th>
                      <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', fontSize: '12px', color: theme.textPrimary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Interests
                      </th>
                      <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', fontSize: '12px', color: theme.textPrimary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Company
                      </th>
                      <th
                        style={{ padding: '16px', textAlign: 'left', fontWeight: '700', fontSize: '12px', color: theme.textPrimary, textTransform: 'uppercase', letterSpacing: '0.5px', cursor: 'pointer' }}
                        onClick={() => handleSort('created_at')}
                      >
                        Created {getSortIcon('created_at')}
                      </th>
                      <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', fontSize: '12px', color: theme.textPrimary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedSubmissions.map((submission, index) => (
                      <tr key={submission.id} style={{
                        borderBottom: '1px solid #f1f5f9',
                        backgroundColor: index % 2 === 0 ? '#ffffff' : '#fafbfc',
                        transition: 'all 0.2s'
                      }}
                        onMouseEnter={(e) => {
                          e.target.closest('tr').style.backgroundColor = '#f1f5f9';
                        }}
                        onMouseLeave={(e) => {
                          e.target.closest('tr').style.backgroundColor = index % 2 === 0 ? '#ffffff' : '#fafbfc';
                        }}
                      >
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
                                {submission.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <div style={{ fontWeight: '600', fontSize: '14px', color: theme.textPrimary, marginBottom: '4px' }}>
                                {submission.name}
                              </div>
                              <div style={{ fontSize: '12px', color: theme.primary, fontWeight: '500' }}>
                                {submission.gender && `${submission.gender.charAt(0).toUpperCase() + submission.gender.slice(1)} • `}
                                {submission.dob && `Born ${new Date(submission.dob).getFullYear()}`}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <div>
                            <div style={{ fontSize: '13px', color: theme.textPrimary, fontWeight: '500', marginBottom: '4px' }}>
                              📧 {submission.email}
                            </div>
                            <div style={{ fontSize: '13px', color: theme.textSecondary, marginBottom: '4px' }}>
                              🏆 {submission.award_name}
                            </div>
                            {submission.whatsapp && (
                              <div style={{ fontSize: '12px', color: theme.textSecondary }}>
                                📱 {submission.whatsapp}
                              </div>
                            )}
                          </div>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                            {submission.interested_receive_award && (
                              <span style={{ fontSize: '11px', backgroundColor: '#e3f2fd', color: '#1976d2', padding: '2px 6px', borderRadius: '4px', fontWeight: '500' }}>
                                Receive
                              </span>
                            )}
                            {submission.interested_sponsor_award && (
                              <span style={{ fontSize: '11px', backgroundColor: '#e8f5e8', color: '#4caf50', padding: '2px 6px', borderRadius: '4px', fontWeight: '500' }}>
                                Sponsor
                              </span>
                            )}
                            {submission.interested_speak_award && (
                              <span style={{ fontSize: '11px', backgroundColor: '#fff3e0', color: '#ff9800', padding: '2px 6px', borderRadius: '4px', fontWeight: '500' }}>
                                Speak
                              </span>
                            )}
                            {submission.interested_exhibit_award && (
                              <span style={{ fontSize: '11px', backgroundColor: '#fce4ec', color: '#e91e63', padding: '2px 6px', borderRadius: '4px', fontWeight: '500' }}>
                                Exhibit
                              </span>
                            )}
                            {submission.interested_attend_award && (
                              <span style={{ fontSize: '11px', backgroundColor: '#f3e5f5', color: '#9c27b0', padding: '2px 6px', borderRadius: '4px', fontWeight: '500' }}>
                                Attend
                              </span>
                            )}
                          </div>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <div>
                            {submission.current_company && (
                              <div style={{ fontSize: '13px', color: theme.textPrimary, fontWeight: '500', marginBottom: '4px' }}>
                                {submission.current_company}
                              </div>
                            )}
                            {submission.position && (
                              <div style={{ fontSize: '12px', color: theme.textSecondary, marginBottom: '4px' }}>
                                {submission.position}
                              </div>
                            )}
                            {submission.company_industry && (
                              <div style={{ fontSize: '11px', color: theme.info, fontWeight: '500' }}>
                                {submission.company_industry}
                              </div>
                            )}
                          </div>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <div style={{ fontSize: '12px', color: theme.textSecondary }}>
                            {formatDate(submission.created_at)}
                          </div>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <button
                            onClick={() => handleViewDetails(submission)}
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
                            onMouseEnter={(e) => e.target.style.backgroundColor = theme.primaryDark}
                            onMouseLeave={(e) => e.target.style.backgroundColor = theme.primary}
                          >
                            View Details
                          </button>
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
                    Page {currentPage} of {totalPages} ({sortedSubmissions.length} total submissions)
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

              {paginatedSubmissions.length === 0 && (
                <div style={{ padding: '80px', textAlign: 'center', color: theme.textSecondary }}>
                  <div style={{ fontSize: '64px', marginBottom: '16px' }}>
                    {debouncedSearchTerm || awardFilter || receiveFilter || sponsorFilter || speakFilter || exhibitFilter || attendFilter || genderFilter || industryFilter ? '🔍' : '📭'}
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>
                    {debouncedSearchTerm || awardFilter || receiveFilter || sponsorFilter || speakFilter || exhibitFilter || attendFilter || genderFilter || industryFilter ? 'No submissions found' : 'No award submissions available'}
                  </div>
                  <div style={{ fontSize: '16px', marginBottom: '16px' }}>
                    {debouncedSearchTerm || awardFilter || receiveFilter || sponsorFilter || speakFilter || exhibitFilter || attendFilter || genderFilter || industryFilter ? (
                      <>
                        No submissions match your search criteria.
                        <br />
                        Try different keywords or adjust your filters.
                      </>
                    ) : (
                      'Award submissions will appear here when users submit their interest.'
                    )}
                  </div>

                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setAwardFilter('');
                      setReceiveFilter('');
                      setSponsorFilter('');
                      setSpeakFilter('');
                      setExhibitFilter('');
                      setAttendFilter('');
                      setGenderFilter('');
                      setIndustryFilter('');
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

      {/* Award Submission Details Modal */}
      <AwardSubmissionDetailsModal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        submission={selectedSubmission}
      />

      {/* Download Options Modal */}
      {showDownloadModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '20px'
        }}>
          <div style={{
            background: '#fff', borderRadius: '12px', padding: '24px', maxWidth: '450px', width: '100%', boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '700' }}>Download CSV</h3>
              <button onClick={() => setShowDownloadModal(false)} style={{ background: 'transparent', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#9ca3af' }}>×</button>
            </div>

            <p style={{ color: '#4b5563', marginBottom: '24px' }}>Choose how you want to download award submissions data:</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <button
                onClick={() => handleDownloadCSV(false)}
                disabled={downloading}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px',
                  border: '2px solid #e5e7eb', borderRadius: '8px', background: '#fff', cursor: 'pointer', textAlign: 'left',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = theme.secondary; e.currentTarget.style.backgroundColor = theme.secondaryLight; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.backgroundColor = '#fff'; }}
              >
                <div>
                  <div style={{ fontWeight: '600', color: '#111827' }}>Download Filtered Data</div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>
                    Export based on current search & filters
                  </div>
                </div>
                <Download size={20} style={{ color: theme.secondary }} />
              </button>

              <button
                onClick={() => handleDownloadCSV(true)}
                disabled={downloading}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px',
                  border: '2px solid #e5e7eb', borderRadius: '8px', background: '#fff', cursor: 'pointer', textAlign: 'left',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = theme.primary; e.currentTarget.style.backgroundColor = theme.primaryLight; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.backgroundColor = '#fff'; }}
              >
                <div>
                  <div style={{ fontWeight: '600', color: '#111827' }}>Download All Data</div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>Export all submissions from database</div>
                </div>
                <Download size={20} style={{ color: theme.primary }} />
              </button>
            </div>

            {downloading && (
              <div style={{ marginTop: '20px', textAlign: 'center', color: theme.textSecondary }}>
                Preparing download...
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AwardSubmissionManagement;
