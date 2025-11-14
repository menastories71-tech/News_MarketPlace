import React, { useState, useEffect } from 'react';
import api from '../../services/api';

// Event Media Partnership Enquiry Form Component
const EventEnquiryForm = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    event_name: '',
    event_date: '',
    organiser: '',
    event_industry: '',
    event_sub_industry: '',
    country: '',
    city: '',
    event_venue_name: '',
    google_map_location: '',
    event_mode: '',
    event_type: '',
    event_organised_by: '',
    event_commercial: '',
    event_website: '',
    event_ig: '',
    event_linkedin: '',
    event_facebook: '',
    event_youtube: '',
    event_entrance: '',
    contact_person_name: '',
    contact_person_email: '',
    contact_person_number: '',
    contact_person_whatsapp: '',
    market_company_name: false,
    provide_booth: false,
    terms_and_conditions: false,
    how_did_you_hear: '',
    message: ''
  });

  const [loading, setLoading] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState('');
  const [errors, setErrors] = useState({});
  const [submitStatus, setSubmitStatus] = useState(null); // null, 'success', 'error'

  // Load reCAPTCHA script and render widget
  useEffect(() => {
    const loadRecaptcha = () => {
      if (!window.grecaptcha) {
        const script = document.createElement('script');
        script.src = `https://www.google.com/recaptcha/api.js?render=explicit`;
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);

        script.onload = () => {
          if (window.grecaptcha) {
            window.grecaptcha.ready(() => {
              console.log('reCAPTCHA ready');
              renderRecaptcha();
            });
          }
        };
      } else {
        setTimeout(() => {
          renderRecaptcha();
        }, 100);
      }
    };

    const renderRecaptcha = () => {
      const container = document.getElementById('recaptcha-container-event');
      if (!container) {
        console.log('reCAPTCHA container not found');
        return;
      }

      if (container.hasChildNodes()) {
        console.log('reCAPTCHA already rendered, skipping');
        return;
      }

      const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY || "6LdNzrErAAAAAB1EB7ETPEhUrynf0wSQftMt-COT";

      try {
        const widgetId = window.grecaptcha.render('recaptcha-container-event', {
          'sitekey': siteKey,
          'callback': (token) => {
            setRecaptchaToken(token);
            setErrors(prev => ({ ...prev, recaptcha: '' }));
          },
          'expired-callback': () => {
            setRecaptchaToken('');
            setErrors(prev => ({ ...prev, recaptcha: 'reCAPTCHA expired. Please try again.' }));
          },
          'error-callback': () => {
            setRecaptchaToken('');
            setErrors(prev => ({ ...prev, recaptcha: 'reCAPTCHA error. Please try again.' }));
          }
        });
        console.log('reCAPTCHA rendered with widget ID:', widgetId);
      } catch (error) {
        console.error('Error rendering reCAPTCHA:', error);
      }
    };

    loadRecaptcha();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields
    const requiredFields = [
      'event_name', 'contact_person_name', 'contact_person_email'
    ];

    requiredFields.forEach(field => {
      if (!formData[field] || formData[field].toString().trim() === '') {
        newErrors[field] = 'This field is required';
      }
    });

    // Email validation
    if (formData.contact_person_email && !formData.contact_person_email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      newErrors.contact_person_email = 'Please enter a valid email address';
    }

    // URL validations
    const urlFields = ['event_website', 'event_ig', 'event_linkedin', 'event_facebook', 'event_youtube'];
    urlFields.forEach(field => {
      if (formData[field] && !formData[field].match(/^https?:\/\/.+/)) {
        newErrors[field] = 'Please enter a valid URL starting with http:// or https://';
      }
    });

    // Phone validation
    if (formData.contact_person_number && !formData.contact_person_number.match(/^\+?[\d\s\-()]+$/)) {
      newErrors.contact_person_number = 'Invalid phone number format';
    }
    if (formData.contact_person_whatsapp && !formData.contact_person_whatsapp.match(/^\+?[\d\s\-()]+$/)) {
      newErrors.contact_person_whatsapp = 'Invalid WhatsApp number format';
    }

    // Date validation
    if (formData.event_date && isNaN(Date.parse(formData.event_date))) {
      newErrors.event_date = 'Please enter a valid date';
    }

    // Terms accepted
    if (!formData.terms_and_conditions) {
      newErrors.terms_and_conditions = 'You must accept the terms and conditions';
    }

    // Message character limit
    if (formData.message && formData.message.length > 1000) {
      newErrors.message = 'Message cannot exceed 1000 characters';
    }

    // Temporarily skip reCAPTCHA validation for testing
    // if (!recaptchaToken) {
    //   newErrors.recaptcha = 'Please complete the reCAPTCHA verification';
    // }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setSubmitStatus(null);

    try {
      const submitData = {
        ...formData,
        recaptchaToken
      };

      await api.post('/event-enquiries', submitData);

      setSubmitStatus('success');
      setTimeout(() => {
        if (onSuccess) onSuccess();
        if (onClose) onClose();
      }, 2000);

    } catch (error) {
      console.error('Error submitting event enquiry:', error);

      let errorMessage = 'Failed to submit event enquiry. Please try again.';

      if (error.response?.status === 400) {
        errorMessage = 'Please check your input and try again.';
        if (error.response.data.details) {
          const validationErrors = {};
          error.response.data.details.forEach(detail => {
            validationErrors[detail.path] = detail.msg;
          });
          setErrors(validationErrors);
        }
      }

      setSubmitStatus('error');
      setErrors(prev => ({ ...prev, submit: errorMessage }));
    } finally {
      setLoading(false);
    }
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
    boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
    margin: 'auto'
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

  const getInputStyle = (fieldName) => ({
    width: '100%',
    padding: '10px 12px',
    border: `1px solid ${errors[fieldName] ? theme.danger : '#d1d5db'}`,
    borderRadius: '8px',
    fontSize: '14px',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s'
  });

  const getTextareaStyle = (fieldName) => ({
    ...getInputStyle(fieldName),
    minHeight: '80px',
    resize: 'vertical'
  });

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

  const requiredAsterisk = {
    color: theme.danger,
    marginLeft: '4px'
  };

  return (
    <div style={modalStyle} onClick={onClose}>
      <div style={contentStyle} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '800' }}>
            Event Media Partnership Enquiry
          </h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', fontSize: '24px', cursor: 'pointer' }}>
            ×
          </button>
        </div>

        <div style={{ backgroundColor: '#e3f2fd', padding: '16px', borderRadius: '8px', marginBottom: '24px', border: `1px solid ${theme.primaryLight}` }}>
          <p style={{ margin: 0, fontSize: '16px', color: theme.textPrimary, fontWeight: '500' }}>
            Fill out this form to enquire about media partnership opportunities for your event.
          </p>
        </div>

        {submitStatus === 'success' && (
          <div style={{
            padding: '16px',
            backgroundColor: '#e8f5e8',
            border: `1px solid ${theme.success}`,
            borderRadius: '8px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{ fontWeight: '600', color: theme.success }}>Enquiry Submitted Successfully!</div>
            <div style={{ fontSize: '14px', color: theme.textSecondary }}>
              Your event enquiry has been submitted. We will review it and get back to you soon.
            </div>
          </div>
        )}

        {submitStatus === 'error' && (
          <div style={{
            padding: '16px',
            backgroundColor: '#ffebee',
            border: `1px solid ${theme.danger}`,
            borderRadius: '8px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{ fontWeight: '600', color: theme.danger }}>Submission Failed</div>
            <div style={{ fontSize: '14px', color: theme.textSecondary }}>
              {errors.submit || 'Please check your input and try again.'}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Event Information Section */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: theme.textPrimary }}>Event Information</h3>
            <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 768 ? '1fr' : 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              <div style={formGroupStyle}>
                <label style={labelStyle}>
                  Event Name <span style={requiredAsterisk}>*</span>
                </label>
                <input
                  type="text"
                  name="event_name"
                  value={formData.event_name}
                  onChange={handleInputChange}
                  style={getInputStyle('event_name')}
                  required
                />
                {errors.event_name && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.event_name}</div>}
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>Event Date</label>
                <input
                  type="date"
                  name="event_date"
                  value={formData.event_date}
                  onChange={handleInputChange}
                  style={getInputStyle('event_date')}
                />
                {errors.event_date && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.event_date}</div>}
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>Organiser</label>
                <input
                  type="text"
                  name="organiser"
                  value={formData.organiser}
                  onChange={handleInputChange}
                  style={getInputStyle('organiser')}
                />
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>Event Industry</label>
                <input
                  type="text"
                  name="event_industry"
                  value={formData.event_industry}
                  onChange={handleInputChange}
                  style={getInputStyle('event_industry')}
                />
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>Event Sub Industry</label>
                <input
                  type="text"
                  name="event_sub_industry"
                  value={formData.event_sub_industry}
                  onChange={handleInputChange}
                  style={getInputStyle('event_sub_industry')}
                />
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>Country</label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  style={getInputStyle('country')}
                />
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  style={getInputStyle('city')}
                />
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>Event Venue Name</label>
                <input
                  type="text"
                  name="event_venue_name"
                  value={formData.event_venue_name}
                  onChange={handleInputChange}
                  style={getInputStyle('event_venue_name')}
                />
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>Google Map Location</label>
                <input
                  type="url"
                  name="google_map_location"
                  value={formData.google_map_location}
                  onChange={handleInputChange}
                  style={getInputStyle('google_map_location')}
                  placeholder="https://maps.google.com/..."
                />
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>Event Mode</label>
                <select
                  name="event_mode"
                  value={formData.event_mode}
                  onChange={handleInputChange}
                  style={getInputStyle('event_mode')}
                >
                  <option value="">Select mode</option>
                  <option value="virtual">Virtual</option>
                  <option value="in person">In Person</option>
                </select>
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>Event Type</label>
                <select
                  name="event_type"
                  value={formData.event_type}
                  onChange={handleInputChange}
                  style={getInputStyle('event_type')}
                >
                  <option value="">Select type</option>
                  <option value="networking">Networking</option>
                  <option value="expo">Expo</option>
                  <option value="exhibition">Exhibition</option>
                  <option value="conference">Conference</option>
                  <option value="awards">Awards</option>
                  <option value="seminar">Seminar</option>
                  <option value="forum">Forum</option>
                </select>
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>Event Organised By</label>
                <select
                  name="event_organised_by"
                  value={formData.event_organised_by}
                  onChange={handleInputChange}
                  style={getInputStyle('event_organised_by')}
                >
                  <option value="">Select organiser type</option>
                  <option value="Government">Government</option>
                  <option value="private">Private</option>
                  <option value="ngo">NGO</option>
                </select>
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>Event Commercial</label>
                <select
                  name="event_commercial"
                  value={formData.event_commercial}
                  onChange={handleInputChange}
                  style={getInputStyle('event_commercial')}
                >
                  <option value="">Select type</option>
                  <option value="profit oriented">Profit Oriented</option>
                  <option value="community oriented">Community Oriented</option>
                </select>
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>Event Website</label>
                <input
                  type="url"
                  name="event_website"
                  value={formData.event_website}
                  onChange={handleInputChange}
                  style={getInputStyle('event_website')}
                  placeholder="https://example.com"
                />
                {errors.event_website && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.event_website}</div>}
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>Event Instagram</label>
                <input
                  type="url"
                  name="event_ig"
                  value={formData.event_ig}
                  onChange={handleInputChange}
                  style={getInputStyle('event_ig')}
                  placeholder="https://instagram.com/event"
                />
                {errors.event_ig && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.event_ig}</div>}
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>Event LinkedIn</label>
                <input
                  type="url"
                  name="event_linkedin"
                  value={formData.event_linkedin}
                  onChange={handleInputChange}
                  style={getInputStyle('event_linkedin')}
                  placeholder="https://linkedin.com/company/event"
                />
                {errors.event_linkedin && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.event_linkedin}</div>}
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>Event Facebook</label>
                <input
                  type="url"
                  name="event_facebook"
                  value={formData.event_facebook}
                  onChange={handleInputChange}
                  style={getInputStyle('event_facebook')}
                  placeholder="https://facebook.com/event"
                />
                {errors.event_facebook && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.event_facebook}</div>}
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>Event YouTube</label>
                <input
                  type="url"
                  name="event_youtube"
                  value={formData.event_youtube}
                  onChange={handleInputChange}
                  style={getInputStyle('event_youtube')}
                  placeholder="https://youtube.com/channel/event"
                />
                {errors.event_youtube && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.event_youtube}</div>}
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>Event Entrance</label>
                <select
                  name="event_entrance"
                  value={formData.event_entrance}
                  onChange={handleInputChange}
                  style={getInputStyle('event_entrance')}
                >
                  <option value="">Select entrance type</option>
                  <option value="free for all">Free for All</option>
                  <option value="ticket based">Ticket Based</option>
                  <option value="invite based">Invite Based</option>
                </select>
              </div>
            </div>
          </div>

          {/* Contact Information Section */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: theme.textPrimary }}>Contact Information</h3>
            <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 768 ? '1fr' : 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              <div style={formGroupStyle}>
                <label style={labelStyle}>
                  Contact Person Name <span style={requiredAsterisk}>*</span>
                </label>
                <input
                  type="text"
                  name="contact_person_name"
                  value={formData.contact_person_name}
                  onChange={handleInputChange}
                  style={getInputStyle('contact_person_name')}
                  required
                />
                {errors.contact_person_name && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.contact_person_name}</div>}
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>
                  Contact Person Email <span style={requiredAsterisk}>*</span>
                </label>
                <input
                  type="email"
                  name="contact_person_email"
                  value={formData.contact_person_email}
                  onChange={handleInputChange}
                  style={getInputStyle('contact_person_email')}
                  required
                />
                {errors.contact_person_email && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.contact_person_email}</div>}
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>Contact Person Number</label>
                <input
                  type="tel"
                  name="contact_person_number"
                  value={formData.contact_person_number}
                  onChange={handleInputChange}
                  style={getInputStyle('contact_person_number')}
                  placeholder="+1234567890"
                />
                {errors.contact_person_number && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.contact_person_number}</div>}
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>Contact Person WhatsApp</label>
                <input
                  type="tel"
                  name="contact_person_whatsapp"
                  value={formData.contact_person_whatsapp}
                  onChange={handleInputChange}
                  style={getInputStyle('contact_person_whatsapp')}
                  placeholder="+1234567890"
                />
                {errors.contact_person_whatsapp && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.contact_person_whatsapp}</div>}
              </div>
            </div>
          </div>

          {/* Partnership Requirements Section */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: theme.textPrimary }}>Partnership Requirements</h3>
            <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 768 ? '1fr' : 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              <div style={formGroupStyle}>
                <label style={{ display: 'flex', alignItems: 'center', fontSize: '14px' }}>
                  <input
                    type="checkbox"
                    name="market_company_name"
                    checked={formData.market_company_name}
                    onChange={handleInputChange}
                    style={checkboxStyle}
                  />
                  Will you market our company name in marketing material?
                </label>
              </div>

              <div style={formGroupStyle}>
                <label style={{ display: 'flex', alignItems: 'center', fontSize: '14px' }}>
                  <input
                    type="checkbox"
                    name="provide_booth"
                    checked={formData.provide_booth}
                    onChange={handleInputChange}
                    style={checkboxStyle}
                  />
                  Will you provide booth at the event for our company?
                </label>
              </div>
            </div>
          </div>

          {/* Additional Information Section */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 768 ? '1fr' : 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              <div style={formGroupStyle}>
                <label style={labelStyle}>How Did You Hear About Us?</label>
                <select
                  name="how_did_you_hear"
                  value={formData.how_did_you_hear}
                  onChange={handleInputChange}
                  style={getInputStyle('how_did_you_hear')}
                >
                  <option value="">Select an option</option>
                  <option value="Social Media">Social Media</option>
                  <option value="Search Engine">Search Engine</option>
                  <option value="Referral">Referral</option>
                  <option value="Email">Email</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  style={getTextareaStyle('message')}
                  maxLength="1000"
                  placeholder="Any additional information or requirements (max 1000 characters)"
                />
                <div style={{ fontSize: '12px', color: theme.textSecondary, marginTop: '4px' }}>
                  {formData.message.length}/1000 characters
                </div>
                {errors.message && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.message}</div>}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginTop: '24px', flexDirection: window.innerWidth < 768 ? 'column' : 'row' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <input
                type="checkbox"
                name="terms_and_conditions"
                id="terms"
                checked={formData.terms_and_conditions}
                onChange={handleInputChange}
                style={checkboxStyle}
              />
              <label htmlFor="terms" style={{ fontSize: '14px', color: '#212121' }}>
                I accept the <a href="/terms-and-conditions" target="_blank" rel="noopener noreferrer">Terms and Conditions</a> <span style={requiredAsterisk}>*</span>
              </label>
            </div>
          </div>
          {errors.terms_and_conditions && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.terms_and_conditions}</div>}

          {/* reCAPTCHA */}
          <div style={{ marginTop: '24px', marginBottom: '24px' }}>
            <div
              id="recaptcha-container-event"
              style={{ display: 'inline-block' }}
            ></div>
            {errors.recaptcha && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.recaptcha}</div>}
            <div style={{ fontSize: '12px', color: theme.textSecondary, marginTop: '8px' }}>
              Complete the reCAPTCHA verification to submit your enquiry.
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '32px', gap: '12px', flexDirection: window.innerWidth < 768 ? 'column' : 'row' }}>
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
              {loading ? 'Submitting...' : 'Submit Enquiry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventEnquiryForm;