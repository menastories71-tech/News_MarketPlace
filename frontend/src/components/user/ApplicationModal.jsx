import React, { useState } from 'react';
import api from '../../services/api';
import CosmicButton from '../common/CosmicButton';

const ApplicationModal = ({ isOpen, onClose, event, roleType }) => {
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);

  if (!isOpen || !event) return null;

  const roleConfig = {
    sponsor: {
      title: 'Apply as Sponsor',
      fields: [
        { name: 'company_name', label: 'Company Name', type: 'text', required: true },
        { name: 'contact_person', label: 'Contact Person', type: 'text', required: true },
        { name: 'email', label: 'Email', type: 'email', required: true },
        { name: 'phone', label: 'Phone', type: 'tel', required: false },
        { name: 'website', label: 'Website', type: 'url', required: false },
        { name: 'sponsorship_level', label: 'Sponsorship Level', type: 'select', required: false, options: ['Platinum', 'Gold', 'Silver', 'Bronze'] },
        { name: 'sponsorship_amount', label: 'Sponsorship Amount', type: 'number', required: false },
        { name: 'description', label: 'Description', type: 'textarea', required: false }
      ]
    },
    media_partner: {
      title: 'Apply as Media Partner',
      fields: [
        { name: 'organization_name', label: 'Organization Name', type: 'text', required: true },
        { name: 'contact_person', label: 'Contact Person', type: 'text', required: true },
        { name: 'email', label: 'Email', type: 'email', required: true },
        { name: 'phone', label: 'Phone', type: 'tel', required: false },
        { name: 'website', label: 'Website', type: 'url', required: false },
        { name: 'media_type', label: 'Media Type', type: 'select', required: false, options: ['TV', 'Radio', 'Print', 'Digital', 'Social Media'] },
        { name: 'audience_size', label: 'Audience Size', type: 'text', required: false },
        { name: 'coverage_areas', label: 'Coverage Areas', type: 'textarea', required: false },
        { name: 'partnership_type', label: 'Partnership Type', type: 'select', required: false, options: ['Media Partner', 'Content Partner', 'Broadcast Partner'] },
        { name: 'description', label: 'Description', type: 'textarea', required: false }
      ]
    },
    speaker: {
      title: 'Apply as Speaker',
      fields: [
        { name: 'full_name', label: 'Full Name', type: 'text', required: true },
        { name: 'email', label: 'Email', type: 'email', required: true },
        { name: 'phone', label: 'Phone', type: 'tel', required: false },
        { name: 'organization', label: 'Organization', type: 'text', required: false },
        { name: 'position', label: 'Position/Title', type: 'text', required: false },
        { name: 'bio', label: 'Bio', type: 'textarea', required: false },
        { name: 'expertise', label: 'Areas of Expertise', type: 'textarea', required: false },
        { name: 'topic', label: 'Proposed Topic', type: 'text', required: true },
        { name: 'presentation_type', label: 'Presentation Type', type: 'select', required: false, options: ['Keynote', 'Panel Discussion', 'Workshop', 'Breakout Session'] },
        { name: 'duration', label: 'Duration (minutes)', type: 'number', required: false },
        { name: 'special_requirements', label: 'Special Requirements', type: 'textarea', required: false },
        { name: 'linkedin_profile', label: 'LinkedIn Profile', type: 'url', required: false },
        { name: 'website', label: 'Website', type: 'url', required: false }
      ]
    },
    guest: {
      title: 'Apply as Guest',
      fields: [
        { name: 'full_name', label: 'Full Name', type: 'text', required: true },
        { name: 'email', label: 'Email', type: 'email', required: true },
        { name: 'phone', label: 'Phone', type: 'tel', required: false },
        { name: 'organization', label: 'Organization', type: 'text', required: false },
        { name: 'position', label: 'Position/Title', type: 'text', required: false },
        { name: 'guest_type', label: 'Guest Type', type: 'select', required: false, options: ['VIP', 'Press', 'Industry Expert', 'Attendee'] },
        { name: 'reason_for_attendance', label: 'Reason for Attendance', type: 'textarea', required: false },
        { name: 'special_dietary_requirements', label: 'Special Dietary Requirements', type: 'textarea', required: false },
        { name: 'accessibility_needs', label: 'Accessibility Needs', type: 'textarea', required: false },
        { name: 'accompanying_guests', label: 'Number of Accompanying Guests', type: 'number', required: false },
        { name: 'linkedin_profile', label: 'LinkedIn Profile', type: 'url', required: false },
        { name: 'website', label: 'Website', type: 'url', required: false }
      ]
    }
  };

  const config = roleConfig[roleType];
  if (!config) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = { event_id: event.id, ...formData };

      let endpoint = '';
      switch (roleType) {
        case 'sponsor':
          endpoint = '/event-applications/sponsors';
          break;
        case 'media_partner':
          endpoint = '/event-applications/media-partners';
          break;
        case 'speaker':
          endpoint = '/event-applications/speakers';
          break;
        case 'guest':
          endpoint = '/event-applications/guests';
          break;
        default:
          throw new Error('Invalid role type');
      }

      await api.post(endpoint, submitData);
      alert('Application submitted successfully!');
      onClose();
    } catch (error) {
      console.error('Application submission error:', error);
      alert('Failed to submit application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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

  const contentStyle = {
    background: '#fff',
    borderRadius: '12px',
    padding: '24px',
    maxWidth: '600px',
    width: '100%',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
  };

  return (
    <div style={modalStyle} onClick={onClose}>
      <div style={contentStyle} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '800' }}>
            {config.title}
          </h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', fontSize: '24px', cursor: 'pointer' }}>
            ×
          </button>
        </div>

        <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#E3F2FD', borderRadius: '8px' }}>
          <strong>Event:</strong> {event.title}
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            {config.fields.map(field => (
              <div key={field.name} style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#212121', marginBottom: '6px' }}>
                  {field.label} {field.required && <span style={{ color: '#F44336' }}>*</span>}
                </label>

                {field.type === 'textarea' ? (
                  <textarea
                    value={formData[field.name] || ''}
                    onChange={(e) => handleInputChange(field.name, e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #E0E0E0',
                      borderRadius: '8px',
                      fontSize: '14px',
                      minHeight: '80px',
                      resize: 'vertical',
                      boxSizing: 'border-box'
                    }}
                    required={field.required}
                  />
                ) : field.type === 'select' ? (
                  <select
                    value={formData[field.name] || ''}
                    onChange={(e) => handleInputChange(field.name, e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #E0E0E0',
                      borderRadius: '8px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                    required={field.required}
                  >
                    <option value="">Select {field.label.toLowerCase()}</option>
                    {field.options.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type}
                    value={formData[field.name] || ''}
                    onChange={(e) => handleInputChange(field.name, e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #E0E0E0',
                      borderRadius: '8px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                    required={field.required}
                  />
                )}
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <CosmicButton
              type="button"
              onClick={onClose}
              variant="secondary"
              disabled={loading}
            >
              Cancel
            </CosmicButton>
            <CosmicButton
              type="submit"
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit Application'}
            </CosmicButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplicationModal;