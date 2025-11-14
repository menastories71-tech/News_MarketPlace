import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useNavigate } from 'react-router-dom';
import Icon from '../common/Icon';
import api from '../../services/api';

// Reporter Submission Form Component
const ReporterSubmissionForm = ({ onClose, onSuccess }) => {
  const { isAuthenticated, user } = useAuth();
  const { isAuthenticated: isAdminAuthenticated } = useAdminAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    function_department: '',
    position: '',
    name: '',
    gender: '',
    email: '',
    whatsapp: '',
    publication_name: '',
    website_url: '',
    linkedin: '',
    instagram: '',
    facebook: '',
    publication_industry: '',
    publication_location: '',
    niche_industry: '',
    minimum_expectation_usd: '',
    articles_per_month: '',
    turnaround_time: '',
    company_allowed_in_title: false,
    individual_allowed_in_title: false,
    subheading_allowed: false,
    sample_url: '',
    will_change_wordings: false,
    article_placed_permanently: false,
    article_can_be_deleted: false,
    article_can_be_modified: false,
    terms_accepted: false,
    how_heard_about_us: '',
    message: ''
  });

  const [loading, setLoading] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState('');
  const [errors, setErrors] = useState({});
  const [submitStatus, setSubmitStatus] = useState(null); // null, 'success', 'error'

  // Redirect if not authenticated or if admin is logged in
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (isAdminAuthenticated) {
      alert('Admins should submit reporters through the admin panel.');
      onClose();
      return;
    }
  }, [isAuthenticated, isAdminAuthenticated, navigate, onClose]);

  // Pre-fill email from user account
  useEffect(() => {
    if (user?.email && !formData.email) {
      setFormData(prev => ({
        ...prev,
        email: user.email
      }));
    }
  }, [user, formData.email]);

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
      const container = document.getElementById('recaptcha-container-reporter');
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
        const widgetId = window.grecaptcha.render('recaptcha-container-reporter', {
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

    const requiredFields = [
      'function_department', 'position', 'name', 'gender', 'email',
      'publication_name', 'publication_industry', 'publication_location',
      'niche_industry', 'how_heard_about_us'
    ];

    requiredFields.forEach(field => {
      if (!formData[field] || formData[field].toString().trim() === '') {
        newErrors[field] = 'This field is required';
      }
    });

    // URL validations
    if (formData.website_url && !formData.website_url.match(/^https?:\/\/.+/)) {
      newErrors.website_url = 'Please enter a valid URL starting with http:// or https://';
    }
    if (formData.linkedin && !formData.linkedin.match(/^https?:\/\/.+/)) {
      newErrors.linkedin = 'Please enter a valid LinkedIn URL';
    }
    if (formData.instagram && !formData.instagram.match(/^https?:\/\/.+/)) {
      newErrors.instagram = 'Please enter a valid Instagram URL';
    }
    if (formData.facebook && !formData.facebook.match(/^https?:\/\/.+/)) {
      newErrors.facebook = 'Please enter a valid Facebook URL';
    }
    if (formData.sample_url && !formData.sample_url.match(/^https?:\/\/.+/)) {
      newErrors.sample_url = 'Please enter a valid sample URL';
    }

    // Email validation
    if (formData.email && !formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // WhatsApp validation
    if (formData.whatsapp && !formData.whatsapp.match(/^\+?[\d\s\-()]+$/)) {
      newErrors.whatsapp = 'Invalid WhatsApp number format';
    }

    // Numeric validations
    if (formData.minimum_expectation_usd && isNaN(formData.minimum_expectation_usd)) {
      newErrors.minimum_expectation_usd = 'Please enter a valid number';
    }
    if (formData.articles_per_month && (isNaN(formData.articles_per_month) || formData.articles_per_month < 0)) {
      newErrors.articles_per_month = 'Please enter a valid non-negative number';
    }

    // Terms accepted
    if (!formData.terms_accepted) {
      newErrors.terms_accepted = 'You must accept the terms and conditions';
    }

    // Message character limit
    if (formData.message && formData.message.length > 500) {
      newErrors.message = 'Message cannot exceed 500 characters';
    }

    // reCAPTCHA
    if (!recaptchaToken) {
      newErrors.recaptcha = 'Please complete the reCAPTCHA verification';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Double-check authentication before submission
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (isAdminAuthenticated) {
      alert('Admins should submit reporters through the admin panel.');
      if (onClose) onClose();
      return;
    }

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

      await api.post('/reporters', submitData);

      setSubmitStatus('success');
      setTimeout(() => {
        if (onSuccess) onSuccess();
        if (onClose) onClose();
      }, 2000);

    } catch (error) {
      console.error('Error submitting reporter:', error);

      let errorMessage = 'Failed to submit reporter profile. Please try again.';

      if (error.response?.status === 401) {
        errorMessage = 'Authentication required. Please log in and try again.';
        navigate('/login');
        return;
      } else if (error.response?.status === 429) {
        errorMessage = error.response.data.message || 'Rate limit exceeded. Please try again later.';
      } else if (error.response?.status === 400) {
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

  if (!isAuthenticated || isAdminAuthenticated) {
    return null;
  }

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
            Reporter Profile Submission
          </h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', fontSize: '24px', cursor: 'pointer' }}>
            ×
          </button>
        </div>

        <div style={{ backgroundColor: '#e3f2fd', padding: '16px', borderRadius: '8px', marginBottom: '24px', border: `1px solid ${theme.primaryLight}` }}>
          <p style={{ margin: 0, fontSize: '16px', color: theme.textPrimary, fontWeight: '500' }}>
            Your confidentiality will be maintained all the time in any case.
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
            <Icon name="check-circle" size="lg" style={{ color: theme.success }} />
            <div>
              <div style={{ fontWeight: '600', color: theme.success }}>Reporter Profile Submitted Successfully!</div>
              <div style={{ fontSize: '14px', color: theme.textSecondary }}>
                Your reporter profile has been submitted and is pending review. You will be notified once it's approved.
              </div>
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
            <Icon name="exclamation-triangle" size="lg" style={{ color: theme.danger }} />
            <div>
              <div style={{ fontWeight: '600', color: theme.danger }}>Submission Failed</div>
              <div style={{ fontSize: '14px', color: theme.textSecondary }}>
                {errors.submit || 'Please check your input and try again.'}
              </div>
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
                  Function Department <span style={requiredAsterisk}>*</span>
                </label>
                <select
                  name="function_department"
                  value={formData.function_department}
                  onChange={handleInputChange}
                  style={getInputStyle('function_department')}
                  required
                >
                  <option value="">Select department</option>
                  <option value="Commercial">Commercial</option>
                  <option value="Procurement">Procurement</option>
                  <option value="Publishing">Publishing</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Accounts and Finance">Accounts and Finance</option>
                </select>
                {errors.function_department && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.function_department}</div>}
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>
                  Position <span style={requiredAsterisk}>*</span>
                </label>
                <select
                  name="position"
                  value={formData.position}
                  onChange={handleInputChange}
                  style={getInputStyle('position')}
                  required
                >
                  <option value="">Select position</option>
                  <option value="Journalist">Journalist</option>
                  <option value="Reporter">Reporter</option>
                  <option value="Contributor">Contributor</option>
                  <option value="Staff">Staff</option>
                </select>
                {errors.position && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.position}</div>}
              </div>

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
                <label style={labelStyle}>
                  Gender <span style={requiredAsterisk}>*</span>
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  style={getInputStyle('gender')}
                  required
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                {errors.gender && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.gender}</div>}
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>
                  Email <span style={requiredAsterisk}>*</span>
                  {user?.email && formData.email === user.email && (
                    <span style={{ fontSize: '12px', color: theme.textSecondary, marginLeft: '8px' }}>
                      (from your account)
                    </span>
                  )}
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  style={getInputStyle('email')}
                  required
                  readOnly={user?.email && formData.email === user.email}
                />
                {errors.email && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.email}</div>}
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>WhatsApp</label>
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

          {/* Publication Information Section */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: theme.textPrimary }}>Publication Information</h3>
            <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 768 ? '1fr' : 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              <div style={formGroupStyle}>
                <label style={labelStyle}>
                  Publication Name <span style={requiredAsterisk}>*</span>
                </label>
                <input
                  type="text"
                  name="publication_name"
                  value={formData.publication_name}
                  onChange={handleInputChange}
                  style={getInputStyle('publication_name')}
                  required
                />
                {errors.publication_name && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.publication_name}</div>}
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>Website URL</label>
                <input
                  type="url"
                  name="website_url"
                  value={formData.website_url}
                  onChange={handleInputChange}
                  style={getInputStyle('website_url')}
                  placeholder="https://example.com"
                />
                {errors.website_url && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.website_url}</div>}
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>
                  Publication Industry <span style={requiredAsterisk}>*</span>
                </label>
                <input
                  type="text"
                  name="publication_industry"
                  value={formData.publication_industry}
                  onChange={handleInputChange}
                  style={getInputStyle('publication_industry')}
                  placeholder="e.g., Technology, Finance, Health"
                  required
                />
                {errors.publication_industry && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.publication_industry}</div>}
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>
                  Publication Location <span style={requiredAsterisk}>*</span>
                </label>
                <input
                  type="text"
                  name="publication_location"
                  value={formData.publication_location}
                  onChange={handleInputChange}
                  style={getInputStyle('publication_location')}
                  placeholder="e.g., New York, USA"
                  required
                />
                {errors.publication_location && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.publication_location}</div>}
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>
                  Niche Industry <span style={requiredAsterisk}>*</span>
                </label>
                <input
                  type="text"
                  name="niche_industry"
                  value={formData.niche_industry}
                  onChange={handleInputChange}
                  style={getInputStyle('niche_industry')}
                  placeholder="e.g., AI, Blockchain, Healthcare"
                  required
                />
                {errors.niche_industry && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.niche_industry}</div>}
              </div>
            </div>
          </div>

          {/* Social Media Links Section */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: theme.textPrimary }}>Social Media Links</h3>
            <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 768 ? '1fr' : 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              <div style={formGroupStyle}>
                <label style={labelStyle}>LinkedIn</label>
                <input
                  type="url"
                  name="linkedin"
                  value={formData.linkedin}
                  onChange={handleInputChange}
                  style={getInputStyle('linkedin')}
                  placeholder="https://linkedin.com/in/username"
                />
                {errors.linkedin && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.linkedin}</div>}
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>Instagram</label>
                <input
                  type="url"
                  name="instagram"
                  value={formData.instagram}
                  onChange={handleInputChange}
                  style={getInputStyle('instagram')}
                  placeholder="https://instagram.com/username"
                />
                {errors.instagram && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.instagram}</div>}
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>Facebook</label>
                <input
                  type="url"
                  name="facebook"
                  value={formData.facebook}
                  onChange={handleInputChange}
                  style={getInputStyle('facebook')}
                  placeholder="https://facebook.com/username"
                />
                {errors.facebook && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.facebook}</div>}
              </div>
            </div>
          </div>

          {/* Content Policies Section */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: theme.textPrimary }}>Content Policies & Requirements</h3>
            <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 768 ? '1fr' : 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              <div style={formGroupStyle}>
                <label style={labelStyle}>Minimum Expectation (USD)</label>
                <input
                  type="number"
                  name="minimum_expectation_usd"
                  value={formData.minimum_expectation_usd}
                  onChange={handleInputChange}
                  style={getInputStyle('minimum_expectation_usd')}
                  min="0"
                  step="0.01"
                />
                {errors.minimum_expectation_usd && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.minimum_expectation_usd}</div>}
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>Articles Per Month</label>
                <input
                  type="number"
                  name="articles_per_month"
                  value={formData.articles_per_month}
                  onChange={handleInputChange}
                  style={getInputStyle('articles_per_month')}
                  min="0"
                />
                {errors.articles_per_month && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.articles_per_month}</div>}
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>Turnaround Time</label>
                <input
                  type="text"
                  name="turnaround_time"
                  value={formData.turnaround_time}
                  onChange={handleInputChange}
                  style={getInputStyle('turnaround_time')}
                  placeholder="e.g., 24-48 hours"
                />
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>Sample URL</label>
                <input
                  type="url"
                  name="sample_url"
                  value={formData.sample_url}
                  onChange={handleInputChange}
                  style={getInputStyle('sample_url')}
                  placeholder="https://example.com/sample-article"
                />
                {errors.sample_url && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.sample_url}</div>}
              </div>
            </div>

            <div style={{ marginTop: '16px' }}>
              <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: theme.textPrimary }}>Article Permissions</h4>
              <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 768 ? '1fr' : 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                <div style={formGroupStyle}>
                  <label style={{ display: 'flex', alignItems: 'center', fontSize: '14px' }}>
                    <input
                      type="checkbox"
                      name="company_allowed_in_title"
                      checked={formData.company_allowed_in_title}
                      onChange={handleInputChange}
                      style={checkboxStyle}
                    />
                    Company Name Allowed in Title
                  </label>
                </div>

                <div style={formGroupStyle}>
                  <label style={{ display: 'flex', alignItems: 'center', fontSize: '14px' }}>
                    <input
                      type="checkbox"
                      name="individual_allowed_in_title"
                      checked={formData.individual_allowed_in_title}
                      onChange={handleInputChange}
                      style={checkboxStyle}
                    />
                    Individual Name Allowed in Title
                  </label>
                </div>

                <div style={formGroupStyle}>
                  <label style={{ display: 'flex', alignItems: 'center', fontSize: '14px' }}>
                    <input
                      type="checkbox"
                      name="subheading_allowed"
                      checked={formData.subheading_allowed}
                      onChange={handleInputChange}
                      style={checkboxStyle}
                    />
                    Subheading Allowed
                  </label>
                </div>

                <div style={formGroupStyle}>
                  <label style={{ display: 'flex', alignItems: 'center', fontSize: '14px' }}>
                    <input
                      type="checkbox"
                      name="will_change_wordings"
                      checked={formData.will_change_wordings}
                      onChange={handleInputChange}
                      style={checkboxStyle}
                    />
                    Will Change Wordings if Required
                  </label>
                </div>

                <div style={formGroupStyle}>
                  <label style={{ display: 'flex', alignItems: 'center', fontSize: '14px' }}>
                    <input
                      type="checkbox"
                      name="article_placed_permanently"
                      checked={formData.article_placed_permanently}
                      onChange={handleInputChange}
                      style={checkboxStyle}
                    />
                    Article Placed Permanently
                  </label>
                </div>

                <div style={formGroupStyle}>
                  <label style={{ display: 'flex', alignItems: 'center', fontSize: '14px' }}>
                    <input
                      type="checkbox"
                      name="article_can_be_deleted"
                      checked={formData.article_can_be_deleted}
                      onChange={handleInputChange}
                      style={checkboxStyle}
                    />
                    Article Can Be Deleted on Request
                  </label>
                </div>

                <div style={formGroupStyle}>
                  <label style={{ display: 'flex', alignItems: 'center', fontSize: '14px' }}>
                    <input
                      type="checkbox"
                      name="article_can_be_modified"
                      checked={formData.article_can_be_modified}
                      onChange={handleInputChange}
                      style={checkboxStyle}
                    />
                    Article Can Be Modified on Request
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Information Section */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 768 ? '1fr' : 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              <div style={formGroupStyle}>
                <label style={labelStyle}>
                  How Did You Hear About Us? <span style={requiredAsterisk}>*</span>
                </label>
                <select
                  name="how_heard_about_us"
                  value={formData.how_heard_about_us}
                  onChange={handleInputChange}
                  style={getInputStyle('how_heard_about_us')}
                  required
                >
                  <option value="">Select an option</option>
                  <option value="Social Media">Social Media</option>
                  <option value="Search Engine">Search Engine</option>
                  <option value="Referral">Referral</option>
                  <option value="Email">Email</option>
                  <option value="Other">Other</option>
                </select>
                {errors.how_heard_about_us && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.how_heard_about_us}</div>}
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  style={getTextareaStyle('message')}
                  maxLength="500"
                  placeholder="Additional comments or requirements (max 500 characters)"
                />
                <div style={{ fontSize: '12px', color: theme.textSecondary, marginTop: '4px' }}>
                  {formData.message.length}/500 characters
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
              id="recaptcha-container-reporter"
              style={{ display: 'inline-block' }}
            ></div>
            {errors.recaptcha && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.recaptcha}</div>}
            <div style={{ fontSize: '12px', color: theme.textSecondary, marginTop: '8px' }}>
              Complete the reCAPTCHA verification to submit your reporter profile.
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
              {loading ? 'Submitting...' : 'Submit Reporter Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReporterSubmissionForm;