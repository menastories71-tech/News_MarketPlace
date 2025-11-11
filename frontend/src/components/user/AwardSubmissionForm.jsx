import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useNavigate } from 'react-router-dom';
import Icon from '../common/Icon';
import api from '../../services/api';

// Award Submission Form Component for Users
const AwardSubmissionForm = ({ award, onClose, onSuccess }) => {
  const { isAuthenticated, user } = useAuth();
  const { isAuthenticated: isAdminAuthenticated } = useAdminAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    // Award interests
    interested_receive_award: false,
    interested_sponsor_award: false,
    interested_speak_award: false,
    interested_exhibit_award: false,
    interested_attend_award: false,

    // Personal Info
    name: '',
    email: '',
    whatsapp: '',
    calling_number: '',
    telegram_username: '',
    direct_number: '',
    gender: '',
    dob: '',

    // Passport/Residency
    dual_passport: false,
    passport_1: '',
    passport_2: '',
    residence_uae: false,
    other_residence: false,
    other_residence_name: '',

    // Company Info
    current_company: '',
    position: '',
    company_industry: '',

    // Social Links
    linkedin: '',
    instagram: '',
    facebook: '',
    personal_website: '',
    company_website: '',

    // Earlier News Features
    earlier_news_features: '',

    // Behalf Filling
    filling_on_behalf: false,
    behalf_name: '',
    behalf_position: '',
    behalf_relation: '',
    behalf_gender: '',
    behalf_email: '',
    behalf_contact_number: '',

    // Other
    message: '',
    agree_terms: false
  });

  const [loading, setLoading] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState('');
  const [errors, setErrors] = useState({});
  const [submitStatus, setSubmitStatus] = useState(null); // null, 'success', 'error'

  // Redirect if admin is logged in
  useEffect(() => {
    if (isAdminAuthenticated) {
      // If admin is logged in, close the form and show message
      alert('Admins should submit award applications through the admin panel.');
      onClose();
      return;
    }
  }, [isAdminAuthenticated, onClose]);

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
        // Small delay to ensure DOM is ready
        setTimeout(() => {
          renderRecaptcha();
        }, 100);
      }
    };

    const renderRecaptcha = () => {
      const container = document.getElementById('recaptcha-container-award');
      if (!container) {
        console.log('reCAPTCHA container not found');
        return;
      }

      // Check if already rendered
      if (container.hasChildNodes()) {
        console.log('reCAPTCHA already rendered, skipping');
        return;
      }

      const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY || "6LdNzrErAAAAAB1EB7ETPEhUrynf0wSQftMt-COT";

      try {
        const widgetId = window.grecaptcha.render('recaptcha-container-award', {
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

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields
    const requiredFields = ['name', 'email'];
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
    const urlFields = ['linkedin', 'instagram', 'facebook', 'personal_website', 'company_website'];
    urlFields.forEach(field => {
      if (formData[field] && !formData[field].match(/^https?:\/\/.+/)) {
        newErrors[field] = 'Please enter a valid URL starting with http:// or https://';
      }
    });

    // Conditional validations
    if (formData.dual_passport && !formData.passport_1) {
      newErrors.passport_1 = 'First passport nationality is required when dual passport is selected';
    }

    if (formData.other_residence && !formData.other_residence_name) {
      newErrors.other_residence_name = 'Please specify the other residency when selected';
    }

    if (formData.filling_on_behalf) {
      const behalfFields = ['behalf_name', 'behalf_email', 'behalf_contact_number'];
      behalfFields.forEach(field => {
        if (!formData[field] || formData[field].toString().trim() === '') {
          newErrors[field] = 'This field is required when filling on behalf';
        }
      });
      if (formData.behalf_email && !formData.behalf_email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        newErrors.behalf_email = 'Please enter a valid email address';
      }
    }

    // Terms agreement
    if (!formData.agree_terms) {
      newErrors.agree_terms = 'You must agree to the terms and conditions';
    }

    // reCAPTCHA validation
    if (!recaptchaToken) {
      newErrors.recaptcha = 'Please complete the reCAPTCHA verification';
    }

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
      const dataToSend = {
        award_id: award.id,
        ...formData,
        captcha_token: recaptchaToken,
        // Convert boolean fields to strings for backend validation
        terms_agreed: formData.agree_terms ? 'true' : 'false',
        filling_for_other: formData.filling_on_behalf ? 'true' : 'false',
        dual_passport: formData.dual_passport ? 'true' : 'false',
        other_residence: formData.other_residence ? 'true' : 'false',
        residence_uae: formData.residence_uae ? 'true' : 'false',
        // Ensure conditional fields are provided when required
        ...(formData.filling_on_behalf && {
          other_person_details: `Name: ${formData.behalf_name}, Position: ${formData.behalf_position}, Relation: ${formData.behalf_relation}, Gender: ${formData.behalf_gender}, Email: ${formData.behalf_email}, Contact: ${formData.behalf_contact_number}`
        })
      };


      await api.post('/award-submissions', dataToSend);

      setSubmitStatus('success');
      setTimeout(() => {
        if (onSuccess) onSuccess();
        if (onClose) onClose();
      }, 2000);

    } catch (error) {
      console.error('Error submitting award application:', error);

      let errorMessage = 'Failed to submit award application. Please try again.';

      if (error.response?.status === 429) {
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

  if (isAdminAuthenticated) {
    return null; // Will close in useEffect if admin
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

  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    border: `1px solid ${errors[name] ? theme.danger : '#d1d5db'}`,
    borderRadius: '8px',
    fontSize: '14px',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s'
  };

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

  const sectionStyle = {
    marginBottom: '32px',
    padding: '20px',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    backgroundColor: '#fafafa'
  };

  const sectionTitleStyle = {
    fontSize: '18px',
    fontWeight: '700',
    color: theme.primary,
    marginBottom: '16px',
    borderBottom: '2px solid #e0e0e0',
    paddingBottom: '8px'
  };

  return (
    <div style={modalStyle} onClick={onClose}>
      <div style={contentStyle} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '800' }}>
            Award Application - {award.award_name}
          </h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', fontSize: '24px', cursor: 'pointer' }}>
            ×
          </button>
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
              <div style={{ fontWeight: '600', color: theme.success }}>Application Submitted Successfully!</div>
              <div style={{ fontSize: '14px', color: theme.textSecondary }}>
                Your award application has been submitted and is pending review. You will be notified once it's approved.
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
          {/* Interest Selection Section */}
          <div style={sectionStyle}>
            <h3 style={sectionTitleStyle}>Your Interest in the Award</h3>
            <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 768 ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div style={formGroupStyle}>
                <label style={labelStyle}>
                  <input
                    type="checkbox"
                    name="interested_receive_award"
                    checked={formData.interested_receive_award}
                    onChange={handleInputChange}
                    style={checkboxStyle}
                  />
                  Interested to Receive Award
                </label>
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>
                  <input
                    type="checkbox"
                    name="interested_sponsor_award"
                    checked={formData.interested_sponsor_award}
                    onChange={handleInputChange}
                    style={checkboxStyle}
                  />
                  Interested to Sponsor Award
                </label>
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>
                  <input
                    type="checkbox"
                    name="interested_speak_award"
                    checked={formData.interested_speak_award}
                    onChange={handleInputChange}
                    style={checkboxStyle}
                  />
                  Interested to Speak at Award
                </label>
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>
                  <input
                    type="checkbox"
                    name="interested_exhibit_award"
                    checked={formData.interested_exhibit_award}
                    onChange={handleInputChange}
                    style={checkboxStyle}
                  />
                  Interested to Exhibit at Award
                </label>
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>
                  <input
                    type="checkbox"
                    name="interested_attend_award"
                    checked={formData.interested_attend_award}
                    onChange={handleInputChange}
                    style={checkboxStyle}
                  />
                  Interested to Attend Award
                </label>
              </div>
            </div>
          </div>

          {/* Personal Information Section */}
          <div style={sectionStyle}>
            <h3 style={sectionTitleStyle}>Personal Information</h3>
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
                  style={inputStyle}
                  required
                />
                {errors.name && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.name}</div>}
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
                  style={inputStyle}
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
                  style={inputStyle}
                  placeholder="+1234567890"
                />
                {errors.whatsapp && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.whatsapp}</div>}
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>Calling Number</label>
                <input
                  type="tel"
                  name="calling_number"
                  value={formData.calling_number}
                  onChange={handleInputChange}
                  style={inputStyle}
                  placeholder="+1234567890"
                />
                {errors.calling_number && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.calling_number}</div>}
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>Telegram Username</label>
                <input
                  type="text"
                  name="telegram_username"
                  value={formData.telegram_username}
                  onChange={handleInputChange}
                  style={inputStyle}
                  placeholder="@username"
                />
                {errors.telegram_username && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.telegram_username}</div>}
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>Direct Number</label>
                <input
                  type="tel"
                  name="direct_number"
                  value={formData.direct_number}
                  onChange={handleInputChange}
                  style={inputStyle}
                  placeholder="+1234567890"
                />
                {errors.direct_number && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.direct_number}</div>}
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  style={inputStyle}
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer_not_to_say">Prefer not to say</option>
                </select>
                {errors.gender && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.gender}</div>}
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>Date of Birth</label>
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleInputChange}
                  style={inputStyle}
                />
                {errors.dob && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.dob}</div>}
              </div>
            </div>
          </div>

          {/* Passport/Residency Information Section */}
          <div style={sectionStyle}>
            <h3 style={sectionTitleStyle}>Passport & Residency Information</h3>
            <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 768 ? '1fr' : 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              <div style={formGroupStyle}>
                <label style={labelStyle}>
                  <input
                    type="checkbox"
                    name="dual_passport"
                    checked={formData.dual_passport}
                    onChange={handleInputChange}
                    style={checkboxStyle}
                  />
                  Dual Passport Holder
                </label>
              </div>

              {formData.dual_passport && (
                <>
                  <div style={formGroupStyle}>
                    <label style={labelStyle}>
                      First Passport Nationality <span style={requiredAsterisk}>*</span>
                    </label>
                    <input
                      type="text"
                      name="passport_1"
                      value={formData.passport_1}
                      onChange={handleInputChange}
                      style={inputStyle}
                      required={formData.dual_passport}
                    />
                    {errors.passport_1 && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.passport_1}</div>}
                  </div>

                  <div style={formGroupStyle}>
                    <label style={labelStyle}>Second Passport Nationality</label>
                    <input
                      type="text"
                      name="passport_2"
                      value={formData.passport_2}
                      onChange={handleInputChange}
                      style={inputStyle}
                    />
                    {errors.passport_2 && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.passport_2}</div>}
                  </div>
                </>
              )}

              <div style={formGroupStyle}>
                <label style={labelStyle}>
                  <input
                    type="checkbox"
                    name="residence_uae"
                    checked={formData.residence_uae}
                    onChange={handleInputChange}
                    style={checkboxStyle}
                  />
                  UAE Permanent Residence
                </label>
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>
                  <input
                    type="checkbox"
                    name="other_residence"
                    checked={formData.other_residence}
                    onChange={handleInputChange}
                    style={checkboxStyle}
                  />
                  Other Permanent Residency
                </label>
              </div>

              {formData.other_residence && (
                <div style={formGroupStyle}>
                  <label style={labelStyle}>
                    Please specify the residency <span style={requiredAsterisk}>*</span>
                  </label>
                  <input
                    type="text"
                    name="other_residence_name"
                    value={formData.other_residence_name}
                    onChange={handleInputChange}
                    style={inputStyle}
                    required={formData.other_residence}
                    placeholder="e.g., USA, Canada, etc."
                  />
                  {errors.other_residence_name && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.other_residence_name}</div>}
                </div>
              )}
            </div>
          </div>

          {/* Company Information Section */}
          <div style={sectionStyle}>
            <h3 style={sectionTitleStyle}>Company Information</h3>
            <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 768 ? '1fr' : 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              <div style={formGroupStyle}>
                <label style={labelStyle}>Current Company</label>
                <input
                  type="text"
                  name="current_company"
                  value={formData.current_company}
                  onChange={handleInputChange}
                  style={inputStyle}
                  placeholder="Company name"
                />
                {errors.current_company && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.current_company}</div>}
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>Position</label>
                <input
                  type="text"
                  name="position"
                  value={formData.position}
                  onChange={handleInputChange}
                  style={inputStyle}
                  placeholder="Your position/title"
                />
                {errors.position && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.position}</div>}
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>Company Industry</label>
                <input
                  type="text"
                  name="company_industry"
                  value={formData.company_industry}
                  onChange={handleInputChange}
                  style={inputStyle}
                  placeholder="e.g., Technology, Finance, etc."
                />
                {errors.company_industry && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.company_industry}</div>}
              </div>
            </div>
          </div>

          {/* Social Links Section */}
          <div style={sectionStyle}>
            <h3 style={sectionTitleStyle}>Social Media & Websites</h3>
            <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 768 ? '1fr' : 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              <div style={formGroupStyle}>
                <label style={labelStyle}>LinkedIn Profile</label>
                <input
                  type="url"
                  name="linkedin"
                  value={formData.linkedin}
                  onChange={handleInputChange}
                  style={inputStyle}
                  placeholder="https://linkedin.com/in/username"
                />
                {errors.linkedin && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.linkedin}</div>}
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>Instagram Profile</label>
                <input
                  type="url"
                  name="instagram"
                  value={formData.instagram}
                  onChange={handleInputChange}
                  style={inputStyle}
                  placeholder="https://instagram.com/username"
                />
                {errors.instagram && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.instagram}</div>}
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>Facebook Profile</label>
                <input
                  type="url"
                  name="facebook"
                  value={formData.facebook}
                  onChange={handleInputChange}
                  style={inputStyle}
                  placeholder="https://facebook.com/username"
                />
                {errors.facebook && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.facebook}</div>}
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>Personal Website</label>
                <input
                  type="url"
                  name="personal_website"
                  value={formData.personal_website}
                  onChange={handleInputChange}
                  style={inputStyle}
                  placeholder="https://yourwebsite.com"
                />
                {errors.personal_website && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.personal_website}</div>}
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>Company Website</label>
                <input
                  type="url"
                  name="company_website"
                  value={formData.company_website}
                  onChange={handleInputChange}
                  style={inputStyle}
                  placeholder="https://companywebsite.com"
                />
                {errors.company_website && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.company_website}</div>}
              </div>
            </div>
          </div>

          {/* Earlier News Features Section */}
          <div style={sectionStyle}>
            <h3 style={sectionTitleStyle}>Earlier News Features</h3>
            <div style={formGroupStyle}>
              <label style={labelStyle}>Earlier News Features (Optional)</label>
              <textarea
                name="earlier_news_features"
                value={formData.earlier_news_features}
                onChange={handleInputChange}
                style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }}
                placeholder="Describe any previous media coverage or news features..."
              />
              {errors.earlier_news_features && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.earlier_news_features}</div>}
            </div>
          </div>

          {/* Behalf Filling Section */}
          <div style={sectionStyle}>
            <h3 style={sectionTitleStyle}>Filling on Behalf</h3>
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>
                <input
                  type="checkbox"
                  name="filling_on_behalf"
                  checked={formData.filling_on_behalf}
                  onChange={handleInputChange}
                  style={checkboxStyle}
                />
                I am filling this application on behalf of someone else
              </label>
            </div>

            {formData.filling_on_behalf && (
              <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 768 ? '1fr' : 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                <div style={formGroupStyle}>
                  <label style={labelStyle}>
                    Person's Full Name <span style={requiredAsterisk}>*</span>
                  </label>
                  <input
                    type="text"
                    name="behalf_name"
                    value={formData.behalf_name}
                    onChange={handleInputChange}
                    style={inputStyle}
                    required={formData.filling_on_behalf}
                  />
                  {errors.behalf_name && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.behalf_name}</div>}
                </div>

                <div style={formGroupStyle}>
                  <label style={labelStyle}>Person's Position</label>
                  <input
                    type="text"
                    name="behalf_position"
                    value={formData.behalf_position}
                    onChange={handleInputChange}
                    style={inputStyle}
                    placeholder="Their position/title"
                  />
                  {errors.behalf_position && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.behalf_position}</div>}
                </div>

                <div style={formGroupStyle}>
                  <label style={labelStyle}>Your Relation to the Person</label>
                  <input
                    type="text"
                    name="behalf_relation"
                    value={formData.behalf_relation}
                    onChange={handleInputChange}
                    style={inputStyle}
                    placeholder="e.g., Assistant, Colleague, etc."
                  />
                  {errors.behalf_relation && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.behalf_relation}</div>}
                </div>

                <div style={formGroupStyle}>
                  <label style={labelStyle}>Person's Gender</label>
                  <select
                    name="behalf_gender"
                    value={formData.behalf_gender}
                    onChange={handleInputChange}
                    style={inputStyle}
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer_not_to_say">Prefer not to say</option>
                  </select>
                  {errors.behalf_gender && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.behalf_gender}</div>}
                </div>

                <div style={formGroupStyle}>
                  <label style={labelStyle}>
                    Person's Email Address <span style={requiredAsterisk}>*</span>
                  </label>
                  <input
                    type="email"
                    name="behalf_email"
                    value={formData.behalf_email}
                    onChange={handleInputChange}
                    style={inputStyle}
                    required={formData.filling_on_behalf}
                  />
                  {errors.behalf_email && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.behalf_email}</div>}
                </div>

                <div style={formGroupStyle}>
                  <label style={labelStyle}>
                    Person's Contact Number <span style={requiredAsterisk}>*</span>
                  </label>
                  <input
                    type="tel"
                    name="behalf_contact_number"
                    value={formData.behalf_contact_number}
                    onChange={handleInputChange}
                    style={inputStyle}
                    required={formData.filling_on_behalf}
                    placeholder="+1234567890"
                  />
                  {errors.behalf_contact_number && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.behalf_contact_number}</div>}
                </div>
              </div>
            )}
          </div>

          {/* Message Section */}
          <div style={sectionStyle}>
            <h3 style={sectionTitleStyle}>Additional Message</h3>
            <div style={formGroupStyle}>
              <label style={labelStyle}>Message (Optional)</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }}
                placeholder="Any additional information you'd like to share..."
              />
              {errors.message && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.message}</div>}
            </div>
          </div>

          {/* Terms Agreement and Captcha */}
          <div style={sectionStyle}>
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>
                <input
                  type="checkbox"
                  name="agree_terms"
                  checked={formData.agree_terms}
                  onChange={handleInputChange}
                  style={checkboxStyle}
                  required
                />
                I agree to the <a href="/terms-and-conditions" target="_blank" rel="noopener noreferrer" style={{ color: theme.primary }}>Terms and Conditions</a> <span style={requiredAsterisk}>*</span>
              </label>
              {errors.agree_terms && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.agree_terms}</div>}
            </div>

            {/* reCAPTCHA */}
            <div style={{ marginBottom: '24px' }}>
              <div
                id="recaptcha-container-award"
                style={{ display: 'inline-block' }}
              ></div>
              {errors.recaptcha && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.recaptcha}</div>}
              <div style={{ fontSize: '12px', color: theme.textSecondary, marginTop: '8px' }}>
                Complete the reCAPTCHA verification to submit your application.
              </div>
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
              {loading ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>

      {/* Global reCAPTCHA callback functions */}
      <script>
        {`
          window.onRecaptchaSuccess = function(token) {
            window.recaptchaToken = token;
            const event = new CustomEvent('recaptchaSuccess', { detail: token });
            window.dispatchEvent(event);
          };
          window.onRecaptchaExpired = function() {
            window.recaptchaToken = '';
            const event = new CustomEvent('recaptchaExpired');
            window.dispatchEvent(event);
          };
          window.onRecaptchaError = function() {
            window.recaptchaToken = '';
            const event = new CustomEvent('recaptchaError');
            window.dispatchEvent(event);
          };
        `}
      </script>
    </div>
  );
};

export default AwardSubmissionForm;