import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

// Affiliate Enquiry Form Component
const AffiliateEnquiryForm = ({ onClose, onSuccess, embedded = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    gender: '',
    email: '',
    whatsapp: '',
    linkedin: '',
    ig: '',
    facebook: '',
    passport_nationality: '',
    current_residency: '',
    how_did_you_hear: '',
    message: '',
    terms_accepted: false
  });

  const [loading, setLoading] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState('');
  const [errors, setErrors] = useState({});
  const [submitStatus, setSubmitStatus] = useState(null); // null, 'success', 'error'
  const [referralCode, setReferralCode] = useState('');

  const { user } = useAuth();

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
      const container = document.getElementById('recaptcha-container-affiliate');
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
        const widgetId = window.grecaptcha.render('recaptcha-container-affiliate', {
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

  // Autofill email from logged-in user
  useEffect(() => {
    if (user && user.email && !formData.email) {
      setFormData(prev => ({ ...prev, email: user.email }));
    }
  }, [user]);

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
      'name', 'email'
    ];

    requiredFields.forEach(field => {
      if (!formData[field] || formData[field].toString().trim() === '') {
        newErrors[field] = 'This field is required';
      }
    });

    // Email validation
    if (formData.email && !formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // URL validations
    const urlFields = ['linkedin', 'ig', 'facebook'];
    urlFields.forEach(field => {
      if (formData[field] && !formData[field].match(/^https?:\/\/.+/)) {
        newErrors[field] = 'Please enter a valid URL starting with http:// or https://';
      }
    });

    // Phone validation
    if (formData.whatsapp && !formData.whatsapp.match(/^\+?[\d\s\-()]+$/)) {
      newErrors.whatsapp = 'Invalid WhatsApp number format';
    }

    // Terms accepted
    if (!formData.terms_accepted) {
      newErrors.terms_accepted = 'You must accept the terms and conditions';
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

      const response = await api.post('/affiliate-enquiries', submitData);

      setReferralCode(response.data.enquiry.referral_code);
      setSubmitStatus('success');
      setTimeout(() => {
        if (onSuccess) onSuccess();
        if (onClose) onClose();
      }, 5000); // Longer timeout to show referral code

    } catch (error) {
      console.error('Error submitting affiliate enquiry:', error);

      let errorMessage = 'Failed to submit affiliate enquiry. Please try again.';

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
    maxWidth: '800px',
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

  if (embedded) {
    return (
      <div>
        {submitStatus === 'success' && (
          <div style={{
            padding: '16px',
            backgroundColor: '#e8f5e8',
            border: `1px solid ${theme.success}`,
            borderRadius: '8px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{ fontWeight: '600', color: theme.success, fontSize: '18px' }}>Enquiry Submitted Successfully!</div>
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
          {/* Personal Information Section */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: theme.textPrimary }}>Personal Information</h3>
            <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 768 ? '1fr' : 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              <div style={formGroupStyle}>
                <label style={labelStyle}>
                  Full Name <span style={requiredAsterisk}>*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  style={getInputStyle('name')}
                  required
                />
                {errors.name && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.name}</div>}
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  style={getInputStyle('gender')}
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>
                  Email Address <span style={requiredAsterisk}>*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  style={getInputStyle('email')}
                  required
                />
                {errors.email && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.email}</div>}
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>WhatsApp Number</label>
                <input
                  type="tel"
                  name="whatsapp"
                  value={formData.whatsapp}
                  onChange={handleInputChange}
                  style={getInputStyle('whatsapp')}
                  placeholder="+1234567890"
                />
                {errors.whatsapp && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.whatsapp}</div>}
              </div>
            </div>
          </div>

          {/* Social Media Links Section */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: theme.textPrimary }}>Social Media Links</h3>
            <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 768 ? '1fr' : 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              <div style={formGroupStyle}>
                <label style={labelStyle}>LinkedIn Profile</label>
                <input
                  type="url"
                  name="linkedin"
                  value={formData.linkedin}
                  onChange={handleInputChange}
                  style={getInputStyle('linkedin')}
                  placeholder="https://linkedin.com/in/yourprofile"
                />
                {errors.linkedin && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.linkedin}</div>}
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>Instagram Profile</label>
                <input
                  type="url"
                  name="ig"
                  value={formData.ig}
                  onChange={handleInputChange}
                  style={getInputStyle('ig')}
                  placeholder="https://instagram.com/yourprofile"
                />
                {errors.ig && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.ig}</div>}
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>Facebook Profile</label>
                <input
                  type="url"
                  name="facebook"
                  value={formData.facebook}
                  onChange={handleInputChange}
                  style={getInputStyle('facebook')}
                  placeholder="https://facebook.com/yourprofile"
                />
                {errors.facebook && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.facebook}</div>}
              </div>
            </div>
          </div>

          {/* Location Information Section */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: theme.textPrimary }}>Location Information</h3>
            <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 768 ? '1fr' : 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              <div style={formGroupStyle}>
                <label style={labelStyle}>Passport Nationality</label>
                <input
                  type="text"
                  name="passport_nationality"
                  value={formData.passport_nationality}
                  onChange={handleInputChange}
                  style={getInputStyle('passport_nationality')}
                  placeholder="e.g., Indian, American"
                />
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>Current Residency</label>
                <input
                  type="text"
                  name="current_residency"
                  value={formData.current_residency}
                  onChange={handleInputChange}
                  style={getInputStyle('current_residency')}
                  placeholder="e.g., Dubai, London"
                />
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
                  placeholder="Any additional information or questions about the affiliate program (max 1000 characters)"
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
                name="terms_accepted"
                id="terms"
                checked={formData.terms_accepted}
                onChange={handleInputChange}
                style={checkboxStyle}
              />
              <label htmlFor="terms" style={{ fontSize: '14px', color: '#212121' }}>
                I accept the <a href="/terms-and-conditions" target="_blank" rel="noopener noreferrer">Terms and Conditions</a> <span style={requiredAsterisk}>*</span>
              </label>
            </div>
          </div>
          {errors.terms_accepted && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.terms_accepted}</div>}

          {/* reCAPTCHA */}
          <div style={{ marginTop: '24px', marginBottom: '24px' }}>
            <div
              id="recaptcha-container-affiliate"
              style={{ display: 'inline-block' }}
            ></div>
            {errors.recaptcha && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.recaptcha}</div>}
            <div style={{ fontSize: '12px', color: theme.textSecondary, marginTop: '8px' }}>
              Complete the reCAPTCHA verification to submit your enquiry.
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '32px' }}>
            <button
              type="submit"
              style={{ ...buttonStyle, backgroundColor: '#1976D2', color: '#fff', width: '100%', maxWidth: '200px' }}
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit Enquiry'}
            </button>
          </div>
        </form>
      </div>
    );
  } else {
    return (
      <div style={modalStyle} onClick={onClose}>
        <div style={contentStyle} onClick={(e) => e.stopPropagation()}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '800' }}>
              Affiliate Program Enquiry
            </h2>
            <button onClick={onClose} style={{ background: 'transparent', border: 'none', fontSize: '24px', cursor: 'pointer' }}>
              ×
            </button>
          </div>

          {/* Promotional Message */}
          <div style={{ backgroundColor: '#e3f2fd', padding: '16px', borderRadius: '8px', marginBottom: '24px', border: `1px solid ${theme.primaryLight}` }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', fontWeight: '700', color: theme.primary }}>Earn Passive Income with Our Referral Program!</h3>
            <p style={{ margin: 0, fontSize: '16px', color: theme.textPrimary, fontWeight: '500' }}>
              Join our affiliate program and earn commissions by referring clients to our premium media services.
              Get paid for every successful referral and build your income stream effortlessly.
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
              justifyContent: 'center'
            }}>
              <div style={{ fontWeight: '600', color: theme.success, fontSize: '18px' }}>Enquiry Submitted Successfully!</div>
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
            {/* Personal Information Section */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: theme.textPrimary }}>Personal Information</h3>
              <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 768 ? '1fr' : 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                <div style={formGroupStyle}>
                  <label style={labelStyle}>
                    Full Name <span style={requiredAsterisk}>*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    style={getInputStyle('name')}
                    required
                  />
                  {errors.name && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.name}</div>}
                </div>

                <div style={formGroupStyle}>
                  <label style={labelStyle}>Gender</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    style={getInputStyle('gender')}
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div style={formGroupStyle}>
                  <label style={labelStyle}>
                    Email Address <span style={requiredAsterisk}>*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    style={getInputStyle('email')}
                    required
                  />
                  {errors.email && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.email}</div>}
                </div>

                <div style={formGroupStyle}>
                  <label style={labelStyle}>WhatsApp Number</label>
                  <input
                    type="tel"
                    name="whatsapp"
                    value={formData.whatsapp}
                    onChange={handleInputChange}
                    style={getInputStyle('whatsapp')}
                    placeholder="+1234567890"
                  />
                  {errors.whatsapp && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.whatsapp}</div>}
                </div>
              </div>
            </div>

            {/* Social Media Links Section */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: theme.textPrimary }}>Social Media Links</h3>
              <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 768 ? '1fr' : 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                <div style={formGroupStyle}>
                  <label style={labelStyle}>LinkedIn Profile</label>
                  <input
                    type="url"
                    name="linkedin"
                    value={formData.linkedin}
                    onChange={handleInputChange}
                    style={getInputStyle('linkedin')}
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                  {errors.linkedin && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.linkedin}</div>}
                </div>

                <div style={formGroupStyle}>
                  <label style={labelStyle}>Instagram Profile</label>
                  <input
                    type="url"
                    name="ig"
                    value={formData.ig}
                    onChange={handleInputChange}
                    style={getInputStyle('ig')}
                    placeholder="https://instagram.com/yourprofile"
                  />
                  {errors.ig && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.ig}</div>}
                </div>

                <div style={formGroupStyle}>
                  <label style={labelStyle}>Facebook Profile</label>
                  <input
                    type="url"
                    name="facebook"
                    value={formData.facebook}
                    onChange={handleInputChange}
                    style={getInputStyle('facebook')}
                    placeholder="https://facebook.com/yourprofile"
                  />
                  {errors.facebook && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.facebook}</div>}
                </div>
              </div>
            </div>

            {/* Location Information Section */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: theme.textPrimary }}>Location Information</h3>
              <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 768 ? '1fr' : 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                <div style={formGroupStyle}>
                  <label style={labelStyle}>Passport Nationality</label>
                  <input
                    type="text"
                    name="passport_nationality"
                    value={formData.passport_nationality}
                    onChange={handleInputChange}
                    style={getInputStyle('passport_nationality')}
                    placeholder="e.g., Indian, American"
                  />
                </div>

                <div style={formGroupStyle}>
                  <label style={labelStyle}>Current Residency</label>
                  <input
                    type="text"
                    name="current_residency"
                    value={formData.current_residency}
                    onChange={handleInputChange}
                    style={getInputStyle('current_residency')}
                    placeholder="e.g., Dubai, London"
                  />
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
                    placeholder="Any additional information or questions about the affiliate program (max 1000 characters)"
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
                  name="terms_accepted"
                  id="terms"
                  checked={formData.terms_accepted}
                  onChange={handleInputChange}
                  style={checkboxStyle}
                />
                <label htmlFor="terms" style={{ fontSize: '14px', color: '#212121' }}>
                  I accept the <a href="/terms-and-conditions" target="_blank" rel="noopener noreferrer">Terms and Conditions</a> <span style={requiredAsterisk}>*</span>
                </label>
              </div>
            </div>
            {errors.terms_accepted && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.terms_accepted}</div>}

            {/* reCAPTCHA */}
            <div style={{ marginTop: '24px', marginBottom: '24px' }}>
              <div
                id="recaptcha-container-affiliate"
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
  }
};

export default AffiliateEnquiryForm;