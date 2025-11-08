import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import Icon from '../common/Icon';

// Theme configuration (same as AdminDashboard)
const theme = {
  primary: '#0D3B66',
  secondary: '#F95738',
  accent: '#2EC4B6',
  muted: '#F1F5F9',
  text: '#0F172A',
  success: '#16A34A',
  warning: '#F59E0B',
  danger: '#EF4444'
};

const ContactManagement = () => {
  const { admin } = useAdminAuth();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterQuery, setFilterQuery] = useState('');

  const queryOptions = [
    { value: 'current_customer', label: 'Current Customer' },
    { value: 'potential_customer', label: 'Potential Customer' },
    { value: 'current_vendor', label: 'Current Vendor' },
    { value: 'potential_vendor', label: 'Potential Vendor' },
    { value: 'suggestions_feedback', label: 'Suggestions/Feedback' },
    { value: 'journalist_reporter', label: 'Journalist/Reporter/Editor/Contributor/Publishing Staff' },
    { value: 'commercial_sales', label: 'Commercial/Sales/Key Accounts/Business Development/Brand Partnership/Event Partnership/Affiliate Programme/Media Partnership' }
  ];

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const response = await fetch('/api/contact');
      if (response.ok) {
        const data = await response.json();
        setContacts(data);
      } else {
        console.error('Failed to fetch contacts');
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
    const matchesQuery = !filterQuery || contact.query_type === filterQuery;
    return matchesSearch && matchesQuery;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getQueryTypeLabel = (queryType) => {
    const option = queryOptions.find(opt => opt.value === queryType);
    return option ? option.label : queryType;
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <Icon name="arrow-path" size="lg" className="animate-spin" style={{ color: theme.primary }} />
        <span style={{ marginLeft: '10px', color: theme.text }}>Loading contacts...</span>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: theme.text, marginBottom: '8px' }}>
            Contact Management
          </h1>
          <p style={{ color: '#6b7280' }}>
            View and manage all contact form submissions
          </p>
        </div>

        {/* Filters */}
        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: theme.text, marginBottom: '8px' }}>
                Search
              </label>
              <input
                type="text"
                placeholder="Search by name, email, or message..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: theme.text, marginBottom: '8px' }}>
                Filter by Query Type
              </label>
              <select
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              >
                <option value="">All Query Types</option>
                {queryOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: theme.primary }}>{contacts.length}</div>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>Total Contacts</div>
          </div>
          <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: theme.success }}>{filteredContacts.length}</div>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>Filtered Results</div>
          </div>
        </div>

        {/* Contacts List */}
        <div style={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
          {filteredContacts.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
              No contacts found matching your criteria.
            </div>
          ) : (
            <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
              {filteredContacts.map((contact) => (
                <div
                  key={contact.id}
                  style={{
                    padding: '20px',
                    borderBottom: '1px solid #e5e7eb',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onClick={() => setSelectedContact(selectedContact?.id === contact.id ? null : contact)}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: '600', color: theme.text, margin: 0 }}>
                          {contact.name}
                        </h3>
                        <span style={{
                          padding: '2px 8px',
                          backgroundColor: '#e0f2fe',
                          color: '#0369a1',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '500'
                        }}>
                          {contact.gender}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '16px', fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
                        <span>📧 {contact.email}</span>
                        <span>📱 {contact.number}</span>
                        <span>💬 {contact.whatsapp}</span>
                      </div>
                      <div style={{ fontSize: '14px', color: '#374151', marginBottom: '8px' }}>
                        <strong>Query:</strong> {getQueryTypeLabel(contact.query_type)}
                      </div>
                      <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                        {formatDate(contact.created_at)}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <Icon
                        name={selectedContact?.id === contact.id ? "chevron-up" : "chevron-down"}
                        size="sm"
                        style={{ color: '#6b7280' }}
                      />
                    </div>
                  </div>

                  {selectedContact?.id === contact.id && (
                    <div style={{ marginTop: '16px', padding: '16px', backgroundColor: '#f9fafb', borderRadius: '6px' }}>
                      <div style={{ marginBottom: '12px' }}>
                        <h4 style={{ fontSize: '14px', fontWeight: '600', color: theme.text, marginBottom: '8px' }}>
                          Message
                        </h4>
                        <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.5' }}>
                          {contact.message}
                        </p>
                      </div>

                      {contact.company_name && (
                        <div style={{ marginBottom: '12px' }}>
                          <h4 style={{ fontSize: '14px', fontWeight: '600', color: theme.text, marginBottom: '8px' }}>
                            Company Information
                          </h4>
                          <div style={{ fontSize: '14px', color: '#374151' }}>
                            {contact.company_name && <div><strong>Name:</strong> {contact.company_name}</div>}
                            {contact.company_website && <div><strong>Website:</strong> <a href={contact.company_website} target="_blank" rel="noopener noreferrer" style={{ color: theme.primary }}>{contact.company_website}</a></div>}
                            {contact.company_social_media && <div><strong>Social Media:</strong> {contact.company_social_media}</div>}
                          </div>
                        </div>
                      )}

                      {(contact.individual_linkedin || contact.individual_instagram) && (
                        <div style={{ marginBottom: '12px' }}>
                          <h4 style={{ fontSize: '14px', fontWeight: '600', color: theme.text, marginBottom: '8px' }}>
                            Individual Social Links
                          </h4>
                          <div style={{ fontSize: '14px', color: '#374151' }}>
                            {contact.individual_linkedin && <div><strong>LinkedIn:</strong> <a href={contact.individual_linkedin} target="_blank" rel="noopener noreferrer" style={{ color: theme.primary }}>{contact.individual_linkedin}</a></div>}
                            {contact.individual_instagram && <div><strong>Instagram:</strong> <a href={contact.individual_instagram} target="_blank" rel="noopener noreferrer" style={{ color: theme.primary }}>{contact.individual_instagram}</a></div>}
                          </div>
                        </div>
                      )}

                      {contact.how_did_you_hear && (
                        <div>
                          <h4 style={{ fontSize: '14px', fontWeight: '600', color: theme.text, marginBottom: '8px' }}>
                            How did you hear about us?
                          </h4>
                          <p style={{ fontSize: '14px', color: '#374151' }}>
                            {contact.how_did_you_hear}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactManagement;