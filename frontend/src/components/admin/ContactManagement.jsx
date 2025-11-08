import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import Icon from '../common/Icon';
import Sidebar from './Sidebar';

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

const ContactManagement = () => {
  const { admin, logout, hasRole, hasAnyRole, getRoleLevel } = useAdminAuth();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false);

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

  const queryOptions = [
    { value: 'current_customer', label: 'Current Customer' },
    { value: 'potential_customer', label: 'Potential Customer' },
    { value: 'current_vendor', label: 'Current Vendor' },
    { value: 'potential_vendor', label: 'Potential Vendor' },
    { value: 'suggestions_feedback', label: 'Suggestions/Feedback' },
    { value: 'journalist_reporter', label: 'Journalist/Reporter/Editor/Contributor/Publishing Staff' },
    { value: 'commercial_sales', label: 'Commercial/Sales/Key Accounts/Business Development/Brand Partnership/Event Partnership/Affiliate Programme/Media Partnership' }
  ];

  const statusOptions = [
    { value: 'unread', label: 'Unread', color: theme.warning },
    { value: 'pending', label: 'Pending', color: theme.accent },
    { value: 'resolved', label: 'Resolved', color: theme.success },
    { value: 'closed', label: 'Closed', color: '#6b7280' }
  ];

  const priorityOptions = [
    { value: 'low', label: 'Low', color: theme.success },
    { value: 'medium', label: 'Medium', color: theme.warning },
    { value: 'high', label: 'High', color: theme.danger },
    { value: 'urgent', label: 'Urgent', color: '#dc2626' }
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
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const response = await fetch('/api/contact', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include' // Include cookies for authentication
      });

      if (response.ok) {
        const data = await response.json();
        setContacts(data);
      } else if (response.status === 401) {
        // Token expired or invalid, redirect to login
        localStorage.removeItem('adminAccessToken');
        window.location.href = '/admin/login';
      } else {
        console.error('Failed to fetch contacts:', response.status, response.statusText);
        // Try to get error details
        try {
          const errorData = await response.json();
          console.error('Error details:', errorData);
        } catch (e) {
          console.error('Could not parse error response');
        }
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || contact.status === statusFilter;
    const matchesPriority = !priorityFilter || contact.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

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

  const getPriorityStyle = (priority) => {
    const priorityOption = priorityOptions.find(opt => opt.value === priority);
    return {
      backgroundColor: `${priorityOption?.color}20`,
      color: priorityOption?.color || theme.text,
      padding: '0.25rem 0.75rem',
      borderRadius: '9999px',
      fontSize: '0.75rem',
      fontWeight: 600,
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.25rem'
    };
  };

  const updateContactStatus = async (contactId, newStatus) => {
    try {
      setContacts(contacts.map(contact => 
        contact.id === contactId ? { ...contact, status: newStatus } : contact
      ));
    } catch (error) {
      console.error('Error updating contact status:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getQueryTypeLabel = (queryType) => {
    const option = queryOptions.find(opt => opt.value === queryType);
    return option ? option.label : queryType;
  };

  const getContactStats = () => {
    const total = contacts.length;
    const unread = contacts.filter(c => c.status === 'unread').length;
    const pending = contacts.filter(c => c.status === 'pending').length;
    const resolved = contacts.filter(c => c.status === 'resolved').length;
    const today = contacts.filter(c => new Date(c.created_at).toDateString() === new Date().toDateString()).length;
    
    return { total, unread, pending, resolved, today };
  };

  const stats = getContactStats();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: theme.muted }}>
        <Icon name="arrow-path" size="lg" className="animate-spin" style={{ color: theme.primary }} />
        <span style={{ marginLeft: '10px', color: theme.text }}>Loading contacts...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: theme.muted, color: theme.text, paddingBottom: '3rem' }}>
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
            <div style={{ background: '#fff', borderRadius: 12, padding: 28, border: `4px solid #000`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, marginBottom: 24 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: '#e6f0ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name="chat-bubble-left-ellipsis" size="sm" style={{ color: '#1976D2' }} />
                  </div>
                  <h1 style={{ margin: 0, fontSize: 34, fontWeight: 800 }}>Contact Management</h1>
                </div>
                <p style={{ marginTop: 8, color: '#757575' }}>Manage and respond to user inquiries and feedback</p>
              </div>
            </div>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
              {[
                { label: 'Total Contacts', value: stats.total, icon: 'users', bg: '#e6f0ff' },
                { label: 'Unread', value: stats.unread, icon: 'clock', bg: '#fff3cd' },
                { label: 'Pending', value: stats.pending, icon: 'arrow-path', bg: '#e0f2fe' },
                { label: 'Resolved', value: stats.resolved, icon: 'check-circle', bg: '#dcfce7' },
                { label: 'Today', value: stats.today, icon: 'calendar', bg: '#f3e8ff' }
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
                    placeholder="Search by name, email, or subject..."
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
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.text, marginBottom: '8px' }}>
                    Priority
                  </label>
                  <select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  >
                    <option value="">All Priority</option>
                    {priorityOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.text, marginBottom: '8px' }}>
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange(prev => ({...prev, start: e.target.value}))}
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
                    End Date
                  </label>
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange(prev => ({...prev, end: e.target.value}))}
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

            {/* Contacts Table */}
            <div style={{ backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 8px 20px rgba(2,6,23,0.06)', overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: theme.muted }}>
                      <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', fontSize: '14px', color: theme.text }}>CONTACT</th>
                      <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', fontSize: '14px', color: theme.text }}>SUBJECT</th>
                      <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', fontSize: '14px', color: theme.text }}>STATUS</th>
                      <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', fontSize: '14px', color: theme.text }}>PRIORITY</th>
                      <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', fontSize: '14px', color: theme.text }}>DATE</th>
                      <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', fontSize: '14px', color: theme.text }}>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredContacts.map((contact) => (
                      <tr key={contact.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                        <td style={{ padding: '16px' }}>
                          <div>
                            <div style={{ fontWeight: '600', fontSize: '14px', color: '#212121' }}>{contact.name}</div>
                            <div style={{ fontSize: '12px', color: '#757575' }}>{contact.email}</div>
                          </div>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <div style={{ fontSize: '14px', color: '#212121', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {getQueryTypeLabel(contact.query_type)}
                          </div>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <select
                            value={contact.status}
                            onChange={(e) => updateContactStatus(contact.id, e.target.value)}
                            style={{
                              ...getStatusStyle(contact.status),
                              border: 'none',
                              background: 'transparent',
                              cursor: 'pointer'
                            }}
                          >
                            {statusOptions.map(option => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <span style={getPriorityStyle(contact.priority)}>
                            {priorityOptions.find(p => p.value === contact.priority)?.label || 'Medium'}
                          </span>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <div style={{ fontSize: '12px', color: '#757575' }}>
                            {formatDate(contact.created_at)}
                          </div>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <button
                            onClick={() => setSelectedContact(selectedContact?.id === contact.id ? null : contact)}
                            style={{
                              padding: '6px 12px',
                              backgroundColor: theme.primary,
                              color: '#fff',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              fontWeight: '600'
                            }}
                          >
                            {selectedContact?.id === contact.id ? 'Hide' : 'View'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredContacts.length === 0 && (
                <div style={{ padding: '40px', textAlign: 'center', color: '#757575' }}>
                  No contacts found matching your criteria.
                </div>
              )}
            </div>

            {/* Contact Details Modal/Panel */}
            {selectedContact && (
              <div style={{ 
                position: 'fixed', 
                top: headerHeight, 
                right: 0, 
                width: '400px', 
                height: `calc(100vh - ${headerHeight}px)`, 
                backgroundColor: '#fff', 
                boxShadow: '-4px 0 20px rgba(0,0,0,0.1)', 
                zIndex: 600, 
                overflow: 'auto',
                padding: '24px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#212121' }}>Contact Details</h3>
                  <button
                    onClick={() => setSelectedContact(null)}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '8px' }}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ color: '#757575' }}>
                      <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#212121', marginBottom: '12px' }}>{selectedContact.name}</h4>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                    <span style={getStatusStyle(selectedContact.status)}>{statusOptions.find(s => s.value === selectedContact.status)?.label}</span>
                    <span style={getPriorityStyle(selectedContact.priority)}>{priorityOptions.find(p => p.value === selectedContact.priority)?.label}</span>
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: '#757575', marginBottom: '8px' }}>CONTACT INFO</div>
                  <div style={{ fontSize: '14px', color: '#212121', marginBottom: '4px' }}>📧 {selectedContact.email}</div>
                  <div style={{ fontSize: '14px', color: '#212121', marginBottom: '4px' }}>📱 {selectedContact.number}</div>
                  <div style={{ fontSize: '14px', color: '#212121', marginBottom: '4px' }}>💬 {selectedContact.whatsapp}</div>
                  <div style={{ fontSize: '14px', color: '#212121' }}>👤 {selectedContact.gender}</div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: '#757575', marginBottom: '8px' }}>QUERY TYPE</div>
                  <div style={{ fontSize: '14px', color: '#212121' }}>{getQueryTypeLabel(selectedContact.query_type)}</div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: '#757575', marginBottom: '8px' }}>MESSAGE</div>
                  <div style={{ fontSize: '14px', color: '#212121', lineHeight: '1.5' }}>{selectedContact.message}</div>
                </div>

                {selectedContact.company_name && (
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: '#757575', marginBottom: '8px' }}>COMPANY INFO</div>
                    <div style={{ fontSize: '14px', color: '#212121', marginBottom: '4px' }}><strong>Name:</strong> {selectedContact.company_name}</div>
                    {selectedContact.company_website && <div style={{ fontSize: '14px', color: '#212121', marginBottom: '4px' }}><strong>Website:</strong> <a href={selectedContact.company_website} target="_blank" rel="noopener noreferrer" style={{ color: '#1976D2' }}>{selectedContact.company_website}</a></div>}
                    {selectedContact.company_social_media && <div style={{ fontSize: '14px', color: '#212121' }}><strong>Social:</strong> {selectedContact.company_social_media}</div>}
                  </div>
                )}

                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: '#757575', marginBottom: '8px' }}>SUBMITTED</div>
                  <div style={{ fontSize: '14px', color: '#212121' }}>{formatDate(selectedContact.created_at)}</div>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '24px' }}>
                  <button
                    onClick={() => updateContactStatus(selectedContact.id, 'resolved')}
                    style={{
                      flex: 1,
                      padding: '10px',
                      backgroundColor: theme.success,
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    Mark Resolved
                  </button>
                  <button
                    onClick={() => updateContactStatus(selectedContact.id, 'closed')}
                    style={{
                      flex: 1,
                      padding: '10px',
                      backgroundColor: '#757575',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default ContactManagement;