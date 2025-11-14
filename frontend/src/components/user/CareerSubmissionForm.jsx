import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useNavigate } from 'react-router-dom';
import Icon from '../common/Icon';
import api from '../../services/api';

// Career Submission Form Component
const CareerSubmissionForm = ({ onClose, onSuccess }) => {
  const { isAuthenticated, user } = useAuth();
  const { isAuthenticated: isAdminAuthenticated } = useAdminAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    company: '',
    location: '',
    salary: '',
    type: '',
    terms_accepted: false
  });

  const [loading, setLoading] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState('');
  const [errors, setErrors] = useState({});
  const [submitStatus, setSubmitStatus] = useState(null); // null, 'success', 'error'
  const [focusedField, setFocusedField] = useState(null);

  // Redirect if not authenticated or if admin is logged in
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (isAdminAuthenticated) {
      alert('Admins should submit careers through the admin panel.');
      onClose();
      return;
    }
  }, [isAuthenticated, isAdminAuthenticated, navigate, onClose]);

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
      const container = document.getElementById('recaptcha-container-career');
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
        const widgetId = window.grecaptcha.render('recaptcha-container-career', {
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

  const handleFocus = (fieldName) => {
    setFocusedField(fieldName);
  };

  const handleBlur = () => {
    setFocusedField(null);
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields
    if (!formData.title || formData.title.trim() === '') {
      newErrors.title = 'Title is required';
    }

    // Optional validations
    if (formData.salary && (isNaN(formData.salary) || parseFloat(formData.salary) < 0)) {
      newErrors.salary = 'Salary must be a positive number';
    }

    if (formData.type && !['full-time', 'part-time'].includes(formData.type)) {
      newErrors.type = 'Invalid job type';
    }

    // Terms accepted
    if (!formData.terms_accepted) {
      newErrors.terms_accepted = 'You must accept the terms and conditions';
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
      alert('Admins should submit careers through the admin panel.');
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

      await api.post('/careers', submitData);

      setSubmitStatus('success');
      setTimeout(() => {
        if (onSuccess) onSuccess();
        if (onClose) onClose();
      }, 2000);

    } catch (error) {
      console.error('Error submitting career:', error);

      let errorMessage = 'Failed to submit career opportunity. Please try again.';

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
    maxWidth: '600px',
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

  const getInputStyle = (fieldName, isFocused = false) => ({
    width: '100%',
    padding: '10px 12px',
    border: `1px solid ${errors[fieldName] ? theme.danger : (isFocused ? theme.primary : '#d1d5db')}`,
    borderRadius: '8px',
    fontSize: '14px',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    cursor: 'text',
    outline: 'none',
    backgroundColor: '#ffffff',
    color: theme.textPrimary,
    fontFamily: 'inherit',
    boxShadow: isFocused ? `0 0 0 3px ${theme.primaryLight}` : 'none'
  });

  const getTextareaStyle = (fieldName) => ({
    ...getInputStyle(fieldName),
    minHeight: '100px',
    resize: 'vertical',
    cursor: 'text'
  });

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
            Submit Career Opportunity
          </h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', fontSize: '24px', cursor: 'pointer' }}>
            ×
          </button>
        </div>

        <div style={{ backgroundColor: '#e3f2fd', padding: '16px', borderRadius: '8px', marginBottom: '24px', border: `1px solid ${theme.primaryLight}` }}>
          <p style={{ margin: 0, fontSize: '16px', color: theme.textPrimary, fontWeight: '500' }}>
            Share career opportunities with our community. All submissions are reviewed before publication.
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
              <div style={{ fontWeight: '600', color: theme.success }}>Career Opportunity Submitted Successfully!</div>
              <div style={{ fontSize: '14px', color: theme.textSecondary }}>
                Your submission has been received and is pending review. You will be notified once it's approved.
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
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 768 ? '1fr' : 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              <div style={formGroupStyle}>
                <label style={labelStyle}>
                  Job Title <span style={requiredAsterisk}>*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  onFocus={() => handleFocus('title')}
                  onBlur={handleBlur}
                  style={getInputStyle('title', focusedField === 'title')}
                  required
                  placeholder="e.g., Senior Reporter, Content Writer"
                />
                {errors.title && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.title}</div>}
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>Company</label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  onFocus={() => handleFocus('company')}
                  onBlur={handleBlur}
                  style={getInputStyle('company', focusedField === 'company')}
                  placeholder="e.g., News Corp, Media Inc"
                />
                {errors.company && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.company}</div>}
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  onFocus={() => handleFocus('location')}
                  onBlur={handleBlur}
                  style={getInputStyle('location', focusedField === 'location')}
                  placeholder="e.g., New York, USA or Remote"
                />
                {errors.location && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.location}</div>}
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>Job Type</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  onFocus={() => handleFocus('type')}
                  onBlur={handleBlur}
                  style={{...getInputStyle('type', focusedField === 'type'), cursor: 'pointer'}}
                >
                  <option value="">Select job type</option>
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                </select>
                {errors.type && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.type}</div>}
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>Salary (USD)</label>
                <input
                  type="number"
                  name="salary"
                  value={formData.salary}
                  onChange={handleInputChange}
                  onFocus={() => handleFocus('salary')}
                  onBlur={handleBlur}
                  style={getInputStyle('salary', focusedField === 'salary')}
                  min="0"
                  step="0.01"
                  placeholder="e.g., 50000"
                />
                {errors.salary && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.salary}</div>}
              </div>
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Job Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                onFocus={() => handleFocus('description')}
                onBlur={handleBlur}
                style={getTextareaStyle('description', focusedField === 'description')}
                placeholder="Describe the job responsibilities, requirements, and any additional information..."
              />
              {errors.description && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.description}</div>}
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginTop: '24px', flexDirection: window.innerWidth < 768 ? 'column' : 'row' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <input
                type="checkbox"
                name="terms_accepted"
                id="terms-career"
                checked={formData.terms_accepted}
                onChange={handleInputChange}
                style={{ marginRight: '8px', cursor: 'pointer' }}
              />
              <label htmlFor="terms-career" style={{ fontSize: '14px', color: '#212121' }}>
                I accept the <a href="/terms-and-conditions" target="_blank" rel="noopener noreferrer">Terms and Conditions</a> <span style={requiredAsterisk}>*</span>
              </label>
            </div>
          </div>
          {errors.terms_accepted && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.terms_accepted}</div>}

          {/* reCAPTCHA */}
          <div style={{ marginTop: '24px', marginBottom: '24px' }}>
            <div
              id="recaptcha-container-career"
              style={{ display: 'inline-block' }}
            ></div>
            {errors.recaptcha && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.recaptcha}</div>}
            <div style={{ fontSize: '12px', color: theme.textSecondary, marginTop: '8px' }}>
              Complete the reCAPTCHA verification to submit your career opportunity.
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
              {loading ? 'Submitting...' : 'Submit Career Opportunity'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CareerSubmissionForm;