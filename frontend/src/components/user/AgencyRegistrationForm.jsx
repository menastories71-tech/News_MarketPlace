import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useNavigate } from 'react-router-dom';
import Icon from '../common/Icon';
import api from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';

// Agency Registration Form Component
const AgencyRegistrationForm = ({ onClose, onSuccess }) => {
  const { isAuthenticated, user } = useAuth();
  const { isAuthenticated: isAdminAuthenticated } = useAdminAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [formData, setFormData] = useState({
    agency_name: '',
    agency_legal_entity_name: '',
    agency_website: '',
    agency_ig: '',
    agency_linkedin: '',
    agency_facebook: '',
    agency_country: '',
    agency_city: '',
    agency_address: '',
    agency_owner_name: '',
    agency_owner_linkedin: '',
    agency_founded_year: '',
    agency_owner_passport_nationality: '',
    agency_email: '',
    agency_alternate_email: '',
    agency_contact_number: '',
    agency_alternate_contact_number: '',
    agency_owner_email: '',
    agency_owner_alternate_email: '',
    agency_owner_contact_number: '',
    agency_owner_country_code: '',
    agency_owner_whatsapp_number: '',
    telegram: '',
    terms_accepted: false,
    how_did_you_hear: '',
    any_to_say: ''
  });

  const [files, setFiles] = useState({
    company_incorporation_trade_license: { file: null, url: '', uploading: false, error: '' },
    tax_registration_document: { file: null, url: '', uploading: false, error: '' },
    agency_bank_details: { file: null, url: '', uploading: false, error: '' },
    agency_owner_passport: { file: null, url: '', uploading: false, error: '' },
    agency_owner_photo: { file: null, url: '', uploading: false, error: '' }
  });

  const [loading, setLoading] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState('');
  const [errors, setErrors] = useState({});
  const [submitStatus, setSubmitStatus] = useState(null); // null, 'success', 'error'

  const [currentStep, setCurrentStep] = useState('form'); // 'form' or 'otp'
  const [otpData, setOtpData] = useState({
    emailOtp: ''
  });
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpErrors, setOtpErrors] = useState({});
  const [otpSubmitStatus, setOtpSubmitStatus] = useState(null); // null, 'success', 'error'

  // Country codes - removed as we only need email OTP

  // OTP sending states
  const [otpSent, setOtpSent] = useState({
    email: false
  });
  const [otpSendLoading, setOtpSendLoading] = useState({
    email: false
  });

  // OTP verification states
  const [otpVerified, setOtpVerified] = useState({
    email: false
  });

  // Redirect if not authenticated or if admin is logged in
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (isAdminAuthenticated) {
      alert('Admins should register agencies through the admin panel.');
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
      const container = document.getElementById('recaptcha-container-agency');
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
        const widgetId = window.grecaptcha.render('recaptcha-container-agency', {
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

  // Upload file to S3 immediately
  const uploadFileToS3 = async (file, fieldName) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fieldName', fieldName);

    try {
      const response = await api.post('/agencies/upload-file', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      return response.data.url;
    } catch (error) {
      console.error(`Failed to upload ${fieldName}:`, error);
      throw new Error(`Failed to upload ${fieldName}. Please try again.`);
    }
  };

  const handleFileChange = async (e) => {
    const { name, files: fileList } = e.target;
    const file = fileList[0];

    if (!file) {
      setFiles(prev => ({
        ...prev,
        [name]: { file: null, url: '', uploading: false, error: '' }
      }));
      return;
    }

    // Start uploading
    setFiles(prev => ({
      ...prev,
      [name]: { file, url: '', uploading: true, error: '' }
    }));

    try {
      const url = await uploadFileToS3(file, name);
      setFiles(prev => ({
        ...prev,
        [name]: { file, url, uploading: false, error: '' }
      }));

      // Clear any previous errors
      if (errors[name]) {
        setErrors(prev => ({ ...prev, [name]: '' }));
      }

      console.log(`Successfully uploaded ${name} to S3: ${url}`);
    } catch (error) {
      setFiles(prev => ({
        ...prev,
        [name]: { file: null, url: '', uploading: false, error: error.message }
      }));

      setErrors(prev => ({ ...prev, [name]: error.message }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    const requiredFields = [
      'agency_name', 'agency_legal_entity_name', 'agency_website', 'agency_country', 'agency_city', 'agency_address',
      'agency_owner_name', 'agency_founded_year', 'agency_owner_passport_nationality',
      'agency_email', 'agency_contact_number', 'agency_owner_email', 'agency_owner_contact_number',
      'how_did_you_hear'
    ];

    requiredFields.forEach(field => {
      if (!formData[field] || formData[field].toString().trim() === '') {
        newErrors[field] = t('agencyRegistration.errors.required');
      }
    });

    // URL validations
    const urlFields = ['agency_website', 'agency_linkedin', 'agency_facebook', 'agency_owner_linkedin'];
    urlFields.forEach(field => {
      if (formData[field] && !formData[field].match(/^https?:\/\/.+/)) {
        newErrors[field] = t('agencyRegistration.errors.invalidUrl');
      }
    });

    // Email validations
    const emailFields = ['agency_email', 'agency_owner_email'];
    emailFields.forEach(field => {
      if (formData[field] && !formData[field].match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        newErrors[field] = t('agencyRegistration.errors.invalidEmail');
      }
    });

    // Number validation
    if (formData.agency_founded_year && (isNaN(formData.agency_founded_year) || parseInt(formData.agency_founded_year) < 1950 || parseInt(formData.agency_founded_year) > 2026)) {
      newErrors.agency_founded_year = t('agencyRegistration.errors.invalidYear');
    }

    // Terms accepted
    if (!formData.terms_accepted) {
      newErrors.terms_accepted = t('agencyRegistration.errors.terms');
    }

    // File validations (required) - check for uploaded URLs
    const requiredFiles = ['company_incorporation_trade_license', 'agency_bank_details', 'agency_owner_passport', 'agency_owner_photo'];
    requiredFiles.forEach(field => {
      if (!files[field].url) {
        newErrors[field] = t('agencyRegistration.errors.fileRequired');
      }
    });

    // Textarea limit
    if (formData.any_to_say && formData.any_to_say.length > 500) {
      newErrors.any_to_say = t('agencyRegistration.errors.maxLength');
    }

    // reCAPTCHA
    if (!recaptchaToken) {
      newErrors.recaptcha = t('agencyRegistration.errors.recaptcha');
    }

    // Note: OTP verification is now done separately and doesn't block form submission
    // Users can verify OTPs before or after form submission

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
      // Prepare data with file URLs
      const submitData = {
        ...formData,
        recaptchaToken: recaptchaToken
      };

      // Add file URLs
      Object.keys(files).forEach(key => {
        if (files[key].url) {
          submitData[key] = files[key].url;
        }
      });

      await api.post('/agencies/register', submitData);

      setSubmitStatus('success');
      setTimeout(() => {
        if (onSuccess) onSuccess();
        if (onClose) onClose();
      }, 2000);

    } catch (error) {
      console.error('Error registering agency:', error);

      let errorMessage = 'Failed to register agency. Please try again.';

      if (error.response?.status === 429) {
        errorMessage = error.response.data.message || 'Rate limit exceeded. Please try again later.';
      } else if (error.response?.status === 400) {
        // Use the specific error message from backend if available
        errorMessage = error.response.data.message || error.response.data.error || 'Please check your input and try again.';

        // Handle validation errors
        if (error.response.data.details) {
          const validationErrors = {};
          error.response.data.details.forEach(detail => {
            validationErrors[detail.path] = detail.msg;
          });
          setErrors(validationErrors);
        }

        // Show toast notification with specific error
        if (typeof window !== 'undefined' && window.alert) {
          window.alert(`Registration failed: ${errorMessage}`);
        }
      } else if (error.response?.status === 500) {
        errorMessage = error.response.data.message || 'Server error occurred. Please try again later.';
        if (typeof window !== 'undefined' && window.alert) {
          window.alert(`Server error: ${errorMessage}`);
        }
      }

      setSubmitStatus('error');
      setErrors(prev => ({ ...prev, submit: errorMessage }));
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (name, value) => {
    setOtpData(prev => ({
      ...prev,
      [name]: value
    }));

    if (otpErrors[name]) {
      setOtpErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Removed handleOtpSubmit as we only need email OTP verification

  // Removed handleCountryCodeChange since we only need email OTP

  const handleSendOtp = async (type) => {
    if (type !== 'email') return; // Only email OTP is supported

    const value = formData.agency_email;
    if (!value) {
      setErrors(prev => ({ ...prev, agency_email: 'This field is required to send OTP' }));
      return;
    }

    setOtpSendLoading(prev => ({ ...prev, [type]: true }));

    try {
      const payload = { type, email: value };

      console.log(`Sending ${type} OTP to:`, value);
      const response = await api.post('/agencies/send-otp', payload);

      console.log(`${type.charAt(0).toUpperCase() + type.slice(1)} OTP:`, response.data.otp);
      setOtpSent(prev => ({ ...prev, [type]: true }));
      alert(`${type.charAt(0).toUpperCase() + type.slice(1)} OTP sent successfully.`);
    } catch (error) {
      console.error('Error sending OTP:', error);
      alert('Failed to send OTP. Please try again.');
    } finally {
      setOtpSendLoading(prev => ({ ...prev, [type]: false }));
    }
  };

  const handleVerifyOtp = async (type) => {
    if (type !== 'email') return; // Only email OTP is supported

    const otpValue = otpData.emailOtp;
    if (!otpValue || otpValue.length !== 6) {
      setOtpErrors(prev => ({ ...prev, emailOtp: 'Please enter a valid 6-digit OTP' }));
      return;
    }

    setOtpLoading(true);
    try {
      const verificationData = {
        type,
        otp: otpValue,
        email: formData.agency_email
      };

      console.log('Sending verification data:', verificationData);
      await api.post('/agencies/verify-otp', verificationData);

      setOtpVerified(prev => ({ ...prev, [type]: true }));
      setOtpErrors(prev => ({ ...prev, emailOtp: '' }));
      alert(`${type.charAt(0).toUpperCase() + type.slice(1)} verified successfully!`);
      console.log(`${type.charAt(0).toUpperCase() + type.slice(1)} verified successfully. You can now submit the registration form.`);
    } catch (error) {
      console.error('Error verifying OTP:', error);
      const errorMessage = error.response?.data?.error || 'Invalid OTP. Please try again.';
      setOtpErrors(prev => ({ ...prev, emailOtp: errorMessage }));
      console.error(`${type} OTP verification failed:`, errorMessage);
    } finally {
      setOtpLoading(false);
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

  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    border: `1px solid ${errors[name] ? theme.danger : '#d1d5db'}`,
    borderRadius: '8px',
    fontSize: '14px',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s'
  };

  const textareaStyle = {
    ...inputStyle,
    minHeight: '60px',
    resize: 'vertical'
  };

  const fileInputStyle = {
    ...inputStyle,
    padding: '8px'
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

  return (
    <div style={modalStyle} onClick={onClose}>
      <div style={contentStyle} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '800' }}>
            {currentStep === 'form' ? t('agencyRegistration.title') : t('agencyRegistration.otpTitle')}
          </h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', fontSize: '24px', cursor: 'pointer' }}>
            ×
          </button>
        </div>

        <div style={{ backgroundColor: '#e3f2fd', padding: '16px', borderRadius: '8px', marginBottom: '24px', border: `1px solid ${theme.primaryLight}` }}>
          <p style={{ margin: 0, fontSize: '16px', color: theme.textPrimary, fontWeight: '500' }}>
            {t('agencyRegistration.disclaimer')}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => {
              const formDataString = JSON.stringify(formData, null, 2);
              navigator.clipboard.writeText(formDataString).then(() => {
                alert('Form data copied to clipboard!');
              }).catch(err => {
                console.error('Failed to copy: ', err);
                alert('Failed to copy form data');
              });
            }}
            style={{
              ...buttonStyle,
              backgroundColor: '#2196F3',
              color: '#fff',
              padding: '8px 16px',
              fontSize: '14px'
            }}
          >
            {t('agencyRegistration.copyFields')}
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            style={{
              ...buttonStyle,
              backgroundColor: '#4CAF50',
              color: '#fff',
              padding: '8px 16px',
              fontSize: '14px'
            }}
          >
            {t('agencyRegistration.printPage')}
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
              <div style={{ fontWeight: '600', color: theme.success }}>{t('agencyRegistration.success.title')}</div>
              <div style={{ fontSize: '14px', color: theme.textSecondary }}>
                {t('agencyRegistration.success.desc')}
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
              <div style={{ fontWeight: '600', color: theme.danger }}>{t('agencyRegistration.failed.title')}</div>
              <div style={{ fontSize: '14px', color: theme.textSecondary }}>
                {errors.submit || 'Please check your input and try again.'}
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 768 ? '1fr' : 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
            <div style={formGroupStyle}>
              <label style={labelStyle}>
                {t('agencyRegistration.form.agencyName')} <span style={requiredAsterisk}>*</span>
              </label>
              <input
                type="text"
                name="agency_name"
                value={formData.agency_name}
                onChange={handleInputChange}
                style={inputStyle}
                required
              />
              {errors.agency_name && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.agency_name}</div>}
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>
                {t('agencyRegistration.form.legalEntityName')} <span style={requiredAsterisk}>*</span>
              </label>
              <input
                type="text"
                name="agency_legal_entity_name"
                value={formData.agency_legal_entity_name}
                onChange={handleInputChange}
                style={inputStyle}
                required
              />
              {errors.agency_legal_entity_name && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.agency_legal_entity_name}</div>}
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>
                {t('agencyRegistration.form.website')} <span style={requiredAsterisk}>*</span>
              </label>
              <input
                type="url"
                name="agency_website"
                value={formData.agency_website}
                onChange={handleInputChange}
                style={inputStyle}
                required
                placeholder="https://example.com"
              />
              {errors.agency_website && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.agency_website}</div>}
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>{t('agencyRegistration.form.ig')}</label>
              <input
                type="text"
                name="agency_ig"
                value={formData.agency_ig}
                onChange={handleInputChange}
                style={inputStyle}
                placeholder="@instagram_handle"
              />
              {errors.agency_ig && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.agency_ig}</div>}
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>{t('agencyRegistration.form.linkedin')}</label>
              <input
                type="url"
                name="agency_linkedin"
                value={formData.agency_linkedin}
                onChange={handleInputChange}
                style={inputStyle}
                placeholder="https://linkedin.com/company/example"
              />
              {errors.agency_linkedin && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.agency_linkedin}</div>}
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>{t('agencyRegistration.form.facebook')}</label>
              <input
                type="url"
                name="agency_facebook"
                value={formData.agency_facebook}
                onChange={handleInputChange}
                style={inputStyle}
                placeholder="https://facebook.com/example"
              />
              {errors.agency_facebook && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.agency_facebook}</div>}
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>
                {t('agencyRegistration.form.country')} <span style={requiredAsterisk}>*</span>
              </label>
              <select
                name="agency_country"
                value={formData.agency_country}
                onChange={handleInputChange}
                style={inputStyle}
                required
              >
                <option value="">{t('agencyRegistration.form.selectCountry')}</option>
                <option value="Afghanistan">Afghanistan</option>
                <option value="Albania">Albania</option>
                <option value="Algeria">Algeria</option>
                <option value="Argentina">Argentina</option>
                <option value="Australia">Australia</option>
                <option value="Austria">Austria</option>
                <option value="Bangladesh">Bangladesh</option>
                <option value="Belgium">Belgium</option>
                <option value="Brazil">Brazil</option>
                <option value="Canada">Canada</option>
                <option value="Chile">Chile</option>
                <option value="China">China</option>
                <option value="Colombia">Colombia</option>
                <option value="Denmark">Denmark</option>
                <option value="Egypt">Egypt</option>
                <option value="Finland">Finland</option>
                <option value="France">France</option>
                <option value="Germany">Germany</option>
                <option value="Greece">Greece</option>
                <option value="Hong Kong">Hong Kong</option>
                <option value="Iceland">Iceland</option>
                <option value="India">India</option>
                <option value="Indonesia">Indonesia</option>
                <option value="Ireland">Ireland</option>
                <option value="Israel">Israel</option>
                <option value="Italy">Italy</option>
                <option value="Japan">Japan</option>
                <option value="Jordan">Jordan</option>
                <option value="Kenya">Kenya</option>
                <option value="South Korea">South Korea</option>
                <option value="Kuwait">Kuwait</option>
                <option value="Lebanon">Lebanon</option>
                <option value="Malaysia">Malaysia</option>
                <option value="Mexico">Mexico</option>
                <option value="Morocco">Morocco</option>
                <option value="Netherlands">Netherlands</option>
                <option value="New Zealand">New Zealand</option>
                <option value="Norway">Norway</option>
                <option value="Oman">Oman</option>
                <option value="Pakistan">Pakistan</option>
                <option value="Peru">Peru</option>
                <option value="Philippines">Philippines</option>
                <option value="Poland">Poland</option>
                <option value="Portugal">Portugal</option>
                <option value="Qatar">Qatar</option>
                <option value="Romania">Romania</option>
                <option value="Russia">Russia</option>
                <option value="Saudi Arabia">Saudi Arabia</option>
                <option value="Singapore">Singapore</option>
                <option value="South Africa">South Africa</option>
                <option value="Spain">Spain</option>
                <option value="Sweden">Sweden</option>
                <option value="Switzerland">Switzerland</option>
                <option value="Thailand">Thailand</option>
                <option value="Turkey">Turkey</option>
                <option value="Ukraine">Ukraine</option>
                <option value="United Arab Emirates">United Arab Emirates</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="United States">United States</option>
                <option value="Vietnam">Vietnam</option>
              </select>
              {errors.agency_country && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.agency_country}</div>}
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>
                Agency City <span style={requiredAsterisk}>*</span>
              </label>
              <input
                type="text"
                name="agency_city"
                value={formData.agency_city}
                onChange={handleInputChange}
                style={inputStyle}
                required
                placeholder="Enter city"
              />
              {errors.agency_city && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.agency_city}</div>}
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>
                {t('agencyRegistration.form.ownerName')} <span style={requiredAsterisk}>*</span>
              </label>
              <input
                type="text"
                name="agency_owner_name"
                value={formData.agency_owner_name}
                onChange={handleInputChange}
                style={inputStyle}
                required
              />
              {errors.agency_owner_name && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.agency_owner_name}</div>}
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Agency Owner LinkedIn</label>
              <input
                type="url"
                name="agency_owner_linkedin"
                value={formData.agency_owner_linkedin}
                onChange={handleInputChange}
                style={inputStyle}
                placeholder="https://linkedin.com/in/example"
              />
              {errors.agency_owner_linkedin && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.agency_owner_linkedin}</div>}
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>
                Agency Founded Year <span style={requiredAsterisk}>*</span>
              </label>
              <input
                type="number"
                name="agency_founded_year"
                value={formData.agency_founded_year}
                onChange={handleInputChange}
                style={inputStyle}
                min="1950"
                max="2026"
                required
              />
              {errors.agency_founded_year && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.agency_founded_year}</div>}
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>
                Agency Owner Passport Nationality <span style={requiredAsterisk}>*</span>
              </label>
              <select
                name="agency_owner_passport_nationality"
                value={formData.agency_owner_passport_nationality}
                onChange={handleInputChange}
                style={inputStyle}
                required
              >
                <option value="">Select Nationality</option>
                <option value="Afghanistan">Afghanistan</option>
                <option value="Albania">Albania</option>
                <option value="Algeria">Algeria</option>
                <option value="Argentina">Argentina</option>
                <option value="Australia">Australia</option>
                <option value="Austria">Austria</option>
                <option value="Bangladesh">Bangladesh</option>
                <option value="Belgium">Belgium</option>
                <option value="Brazil">Brazil</option>
                <option value="Canada">Canada</option>
                <option value="Chile">Chile</option>
                <option value="China">China</option>
                <option value="Colombia">Colombia</option>
                <option value="Denmark">Denmark</option>
                <option value="Egypt">Egypt</option>
                <option value="Finland">Finland</option>
                <option value="France">France</option>
                <option value="Germany">Germany</option>
                <option value="Greece">Greece</option>
                <option value="Hong Kong">Hong Kong</option>
                <option value="Iceland">Iceland</option>
                <option value="India">India</option>
                <option value="Indonesia">Indonesia</option>
                <option value="Ireland">Ireland</option>
                <option value="Israel">Israel</option>
                <option value="Italy">Italy</option>
                <option value="Japan">Japan</option>
                <option value="Jordan">Jordan</option>
                <option value="Kenya">Kenya</option>
                <option value="South Korea">South Korea</option>
                <option value="Kuwait">Kuwait</option>
                <option value="Lebanon">Lebanon</option>
                <option value="Malaysia">Malaysia</option>
                <option value="Mexico">Mexico</option>
                <option value="Morocco">Morocco</option>
                <option value="Netherlands">Netherlands</option>
                <option value="New Zealand">New Zealand</option>
                <option value="Norway">Norway</option>
                <option value="Oman">Oman</option>
                <option value="Pakistan">Pakistan</option>
                <option value="Peru">Peru</option>
                <option value="Philippines">Philippines</option>
                <option value="Poland">Poland</option>
                <option value="Portugal">Portugal</option>
                <option value="Qatar">Qatar</option>
                <option value="Romania">Romania</option>
                <option value="Russia">Russia</option>
                <option value="Saudi Arabia">Saudi Arabia</option>
                <option value="Singapore">Singapore</option>
                <option value="South Africa">South Africa</option>
                <option value="Spain">Spain</option>
                <option value="Sweden">Sweden</option>
                <option value="Switzerland">Switzerland</option>
                <option value="Thailand">Thailand</option>
                <option value="Turkey">Turkey</option>
                <option value="Ukraine">Ukraine</option>
                <option value="United Arab Emirates">United Arab Emirates</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="United States">United States</option>
                <option value="Vietnam">Vietnam</option>
              </select>
              {errors.agency_owner_passport_nationality && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.agency_owner_passport_nationality}</div>}
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>
                Agency Email <span style={requiredAsterisk}>*</span>
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    type="email"
                    name="agency_email"
                    value={formData.agency_email}
                    onChange={handleInputChange}
                    style={{ ...inputStyle, flex: 1 }}
                    placeholder="Enter email address"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => handleSendOtp('email')}
                    disabled={otpSendLoading.email || !formData.agency_email}
                    style={{
                      ...buttonStyle,
                      backgroundColor: otpSent.email ? theme.success : '#1976D2',
                      color: '#fff',
                      padding: '8px 16px',
                      fontSize: '12px',
                      whiteSpace: 'nowrap',
                      minWidth: '100px'
                    }}
                  >
                    {otpSendLoading.email ? 'Sending...' : otpSent.email ? 'Sent' : 'Send OTP'}
                  </button>
                </div>
                {otpSent.email && !otpVerified.email && (
                  <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: `1px solid ${theme.primaryLight}` }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                      <input
                        type="text"
                        value={otpData.emailOtp}
                        onChange={(e) => handleOtpChange('emailOtp', e.target.value)}
                        style={{ ...inputStyle, flex: 1 }}
                        placeholder="Enter 6-digit OTP"
                        maxLength="6"
                        pattern="[0-9]{6}"
                      />
                      <button
                        type="button"
                        onClick={() => handleVerifyOtp('email')}
                        disabled={otpLoading}
                        style={{
                          ...buttonStyle,
                          backgroundColor: '#4CAF50',
                          color: '#fff',
                          padding: '8px 16px',
                          fontSize: '12px',
                          whiteSpace: 'nowrap',
                          minWidth: '80px'
                        }}
                      >
                        Verify
                      </button>
                    </div>
                    <p style={{ fontSize: '12px', color: theme.textSecondary, margin: 0, display: 'flex', alignItems: 'flex-start' }}>
                      <Icon name="information-circle" size="xs" style={{ color: theme.primary, marginRight: '6px', marginTop: '2px', flexShrink: 0 }} />
                      Check your email for the OTP code. It may take a few minutes to arrive.
                    </p>
                  </div>
                )}
                {otpVerified.email && (
                  <div style={{ display: 'flex', alignItems: 'center', color: theme.success, fontSize: '14px', marginTop: '8px' }}>
                    <Icon name="check-circle" size="sm" style={{ color: theme.success, marginRight: '6px' }} />
                    <span>Email verified successfully!</span>
                  </div>
                )}
              </div>
              {errors.agency_email && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.agency_email}</div>}
              {errors.emailOtp && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.emailOtp}</div>}
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Agency Alternate Email</label>
              <input
                type="email"
                name="agency_alternate_email"
                value={formData.agency_alternate_email}
                onChange={handleInputChange}
                style={inputStyle}
                placeholder="Enter alternate email address"
              />
              {errors.agency_alternate_email && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.agency_alternate_email}</div>}
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>
                Agency Contact Number <span style={requiredAsterisk}>*</span>
              </label>
              <input
                type="tel"
                name="agency_contact_number"
                value={formData.agency_contact_number}
                onChange={handleInputChange}
                style={inputStyle}
                placeholder="Enter phone number"
                required
              />
              {errors.agency_contact_number && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.agency_contact_number}</div>}
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Agency Alternate Contact Number</label>
              <input
                type="tel"
                name="agency_alternate_contact_number"
                value={formData.agency_alternate_contact_number}
                onChange={handleInputChange}
                style={inputStyle}
                placeholder="Enter alternate phone number"
              />
              {errors.agency_alternate_contact_number && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.agency_alternate_contact_number}</div>}
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>
                Agency Owner Email <span style={requiredAsterisk}>*</span>
              </label>
              <input
                type="email"
                name="agency_owner_email"
                value={formData.agency_owner_email}
                onChange={handleInputChange}
                style={inputStyle}
                required
              />
              {errors.agency_owner_email && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.agency_owner_email}</div>}
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Agency Owner Alternate Email</label>
              <input
                type="email"
                name="agency_owner_alternate_email"
                value={formData.agency_owner_alternate_email}
                onChange={handleInputChange}
                style={inputStyle}
                placeholder="Enter alternate email address"
              />
              {errors.agency_owner_alternate_email && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.agency_owner_alternate_email}</div>}
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>
                Agency Owner Contact Number <span style={requiredAsterisk}>*</span>
              </label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <select
                  name="agency_owner_country_code"
                  value={formData.agency_owner_country_code}
                  onChange={handleInputChange}
                  style={{ ...inputStyle, flex: '0 0 120px', padding: '10px 8px' }}
                  required
                >
                  <option value="">Code</option>
                  <option value="+1">+1 (US)</option>
                  <option value="+44">+44 (UK)</option>
                  <option value="+91">+91 (IN)</option>
                  <option value="+971">+971 (UAE)</option>
                  <option value="+966">+966 (SA)</option>
                  <option value="+65">+65 (SG)</option>
                  <option value="+60">+60 (MY)</option>
                  <option value="+852">+852 (HK)</option>
                  <option value="+81">+81 (JP)</option>
                  <option value="+82">+82 (KR)</option>
                  <option value="+86">+86 (CN)</option>
                  <option value="+49">+49 (DE)</option>
                  <option value="+33">+33 (FR)</option>
                  <option value="+39">+39 (IT)</option>
                  <option value="+34">+34 (ES)</option>
                  <option value="+31">+31 (NL)</option>
                  <option value="+46">+46 (SE)</option>
                  <option value="+47">+47 (NO)</option>
                  <option value="+45">+45 (DK)</option>
                  <option value="+41">+41 (CH)</option>
                  <option value="+43">+43 (AT)</option>
                  <option value="+32">+32 (BE)</option>
                  <option value="+351">+351 (PT)</option>
                  <option value="+30">+30 (GR)</option>
                  <option value="+48">+48 (PL)</option>
                  <option value="+420">+420 (CZ)</option>
                  <option value="+36">+36 (HU)</option>
                  <option value="+40">+40 (RO)</option>
                  <option value="+7">+7 (RU)</option>
                  <option value="+380">+380 (UA)</option>
                  <option value="+20">+20 (EG)</option>
                  <option value="+27">+27 (ZA)</option>
                  <option value="+234">+234 (NG)</option>
                  <option value="+254">+254 (KE)</option>
                  <option value="+212">+212 (MA)</option>
                  <option value="+216">+216 (TN)</option>
                  <option value="+213">+213 (DZ)</option>
                  <option value="+93">+93 (AF)</option>
                  <option value="+355">+355 (AL)</option>
                  <option value="+54">+54 (AR)</option>
                  <option value="+61">+61 (AU)</option>
                  <option value="+43">+43 (AT)</option>
                  <option value="+994">+994 (AZ)</option>
                  <option value="+973">+973 (BH)</option>
                  <option value="+880">+880 (BD)</option>
                  <option value="+32">+32 (BE)</option>
                  <option value="+55">+55 (BR)</option>
                  <option value="+359">+359 (BG)</option>
                  <option value="+226">+226 (BF)</option>
                  <option value="+257">+257 (BI)</option>
                  <option value="+855">+855 (KH)</option>
                  <option value="+237">+237 (CM)</option>
                  <option value="+1">+1 (CA)</option>
                  <option value="+56">+56 (CL)</option>
                  <option value="+57">+57 (CO)</option>
                  <option value="+506">+506 (CR)</option>
                  <option value="+385">+385 (HR)</option>
                  <option value="+53">+53 (CU)</option>
                  <option value="+357">+357 (CY)</option>
                  <option value="+420">+420 (CZ)</option>
                  <option value="+45">+45 (DK)</option>
                  <option value="+253">+253 (DJ)</option>
                  <option value="+1">+1 (DM)</option>
                  <option value="+1">+1 (DO)</option>
                  <option value="+593">+593 (EC)</option>
                  <option value="+20">+20 (EG)</option>
                  <option value="+503">+503 (SV)</option>
                  <option value="+372">+372 (EE)</option>
                  <option value="+251">+251 (ET)</option>
                  <option value="+679">+679 (FJ)</option>
                  <option value="+358">+358 (FI)</option>
                  <option value="+33">+33 (FR)</option>
                  <option value="+241">+241 (GA)</option>
                  <option value="+220">+220 (GM)</option>
                  <option value="+995">+995 (GE)</option>
                  <option value="+49">+49 (DE)</option>
                  <option value="+233">+233 (GH)</option>
                  <option value="+350">+350 (GI)</option>
                  <option value="+30">+30 (GR)</option>
                  <option value="+299">+299 (GL)</option>
                  <option value="+1">+1 (GD)</option>
                  <option value="+502">+502 (GT)</option>
                  <option value="+224">+224 (GN)</option>
                  <option value="+245">+245 (GW)</option>
                  <option value="+592">+592 (GY)</option>
                  <option value="+509">+509 (HT)</option>
                  <option value="+504">+504 (HN)</option>
                  <option value="+36">+36 (HU)</option>
                  <option value="+354">+354 (IS)</option>
                  <option value="+91">+91 (IN)</option>
                  <option value="+62">+62 (ID)</option>
                  <option value="+98">+98 (IR)</option>
                  <option value="+964">+964 (IQ)</option>
                  <option value="+353">+353 (IE)</option>
                  <option value="+972">+972 (IL)</option>
                  <option value="+39">+39 (IT)</option>
                  <option value="+225">+225 (CI)</option>
                  <option value="+1">+1 (JM)</option>
                  <option value="+962">+962 (JO)</option>
                  <option value="+7">+7 (KZ)</option>
                  <option value="+254">+254 (KE)</option>
                  <option value="+686">+686 (KI)</option>
                  <option value="+965">+965 (KW)</option>
                  <option value="+996">+996 (KG)</option>
                  <option value="+856">+856 (LA)</option>
                  <option value="+371">+371 (LV)</option>
                  <option value="+961">+961 (LB)</option>
                  <option value="+266">+266 (LS)</option>
                  <option value="+231">+231 (LR)</option>
                  <option value="+218">+218 (LY)</option>
                  <option value="+423">+423 (LI)</option>
                  <option value="+370">+370 (LT)</option>
                  <option value="+352">+352 (LU)</option>
                  <option value="+261">+261 (MG)</option>
                  <option value="+265">+265 (MW)</option>
                  <option value="+60">+60 (MY)</option>
                  <option value="+960">+960 (MV)</option>
                  <option value="+223">+223 (ML)</option>
                  <option value="+356">+356 (MT)</option>
                  <option value="+692">+692 (MH)</option>
                  <option value="+222">+222 (MR)</option>
                  <option value="+230">+230 (MU)</option>
                  <option value="+52">+52 (MX)</option>
                  <option value="+691">+691 (FM)</option>
                  <option value="+373">+373 (MD)</option>
                  <option value="+377">+377 (MC)</option>
                  <option value="+976">+976 (MN)</option>
                  <option value="+382">+382 (ME)</option>
                  <option value="+212">+212 (MA)</option>
                  <option value="+258">+258 (MZ)</option>
                  <option value="+95">+95 (MM)</option>
                  <option value="+264">+264 (NA)</option>
                  <option value="+674">+674 (NR)</option>
                  <option value="+977">+977 (NP)</option>
                  <option value="+31">+31 (NL)</option>
                  <option value="+687">+687 (NC)</option>
                  <option value="+64">+64 (NZ)</option>
                  <option value="+505">+505 (NI)</option>
                  <option value="+227">+227 (NE)</option>
                  <option value="+234">+234 (NG)</option>
                  <option value="+683">+683 (NU)</option>
                  <option value="+850">+850 (KP)</option>
                  <option value="+47">+47 (NO)</option>
                  <option value="+968">+968 (OM)</option>
                  <option value="+92">+92 (PK)</option>
                  <option value="+680">+680 (PW)</option>
                  <option value="+507">+507 (PA)</option>
                  <option value="+675">+675 (PG)</option>
                  <option value="+595">+595 (PY)</option>
                  <option value="+51">+51 (PE)</option>
                  <option value="+63">+63 (PH)</option>
                  <option value="+48">+48 (PL)</option>
                  <option value="+351">+351 (PT)</option>
                  <option value="+974">+974 (QA)</option>
                  <option value="+40">+40 (RO)</option>
                  <option value="+7">+7 (RU)</option>
                  <option value="+250">+250 (RW)</option>
                  <option value="+1">+1 (KN)</option>
                  <option value="+1">+1 (LC)</option>
                  <option value="+1">+1 (VC)</option>
                  <option value="+685">+685 (WS)</option>
                  <option value="+378">+378 (SM)</option>
                  <option value="+239">+239 (ST)</option>
                  <option value="+966">+966 (SA)</option>
                  <option value="+221">+221 (SN)</option>
                  <option value="+381">+381 (RS)</option>
                  <option value="+248">+248 (SC)</option>
                  <option value="+232">+232 (SL)</option>
                  <option value="+65">+65 (SG)</option>
                  <option value="+421">+421 (SK)</option>
                  <option value="+386">+386 (SI)</option>
                  <option value="+677">+677 (SB)</option>
                  <option value="+27">+27 (ZA)</option>
                  <option value="+211">+211 (SS)</option>
                  <option value="+34">+34 (ES)</option>
                  <option value="+94">+94 (LK)</option>
                  <option value="+249">+249 (SD)</option>
                  <option value="+597">+597 (SR)</option>
                  <option value="+268">+268 (SZ)</option>
                  <option value="+46">+46 (SE)</option>
                  <option value="+41">+41 (CH)</option>
                  <option value="+963">+963 (SY)</option>
                  <option value="+886">+886 (TW)</option>
                  <option value="+992">+992 (TJ)</option>
                  <option value="+255">+255 (TZ)</option>
                  <option value="+66">+66 (TH)</option>
                  <option value="+670">+670 (TL)</option>
                  <option value="+228">+228 (TG)</option>
                  <option value="+690">+690 (TK)</option>
                  <option value="+676">+676 (TO)</option>
                  <option value="+1">+1 (TT)</option>
                  <option value="+216">+216 (TN)</option>
                  <option value="+90">+90 (TR)</option>
                  <option value="+993">+993 (TM)</option>
                  <option value="+1">+1 (TC)</option>
                  <option value="+688">+688 (TV)</option>
                  <option value="+256">+256 (UG)</option>
                  <option value="+380">+380 (UA)</option>
                  <option value="+971">+971 (AE)</option>
                  <option value="+44">+44 (GB)</option>
                  <option value="+1">+1 (US)</option>
                  <option value="+598">+598 (UY)</option>
                  <option value="+998">+998 (UZ)</option>
                  <option value="+678">+678 (VU)</option>
                  <option value="+39">+39 (VA)</option>
                  <option value="+58">+58 (VE)</option>
                  <option value="+84">+84 (VN)</option>
                  <option value="+681">+681 (WF)</option>
                  <option value="+967">+967 (YE)</option>
                  <option value="+260">+260 (ZM)</option>
                  <option value="+263">+263 (ZW)</option>
                </select>
                <input
                  type="tel"
                  name="agency_owner_contact_number"
                  value={formData.agency_owner_contact_number}
                  onChange={handleInputChange}
                  style={{ ...inputStyle, flex: 1 }}
                  placeholder="Enter phone number"
                  required
                />
              </div>
              {errors.agency_owner_contact_number && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.agency_owner_contact_number}</div>}
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Agency Owner WhatsApp Number</label>
              <input
                type="tel"
                name="agency_owner_whatsapp_number"
                value={formData.agency_owner_whatsapp_number}
                onChange={handleInputChange}
                style={inputStyle}
                placeholder="Enter WhatsApp number"
              />
              {errors.agency_owner_whatsapp_number && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.agency_owner_whatsapp_number}</div>}
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Telegram</label>
              <input
                type="text"
                name="telegram"
                value={formData.telegram}
                onChange={handleInputChange}
                style={inputStyle}
                placeholder="@telegram_handle"
              />
              {errors.telegram && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.telegram}</div>}
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>
                How Did You Hear About Us? <span style={requiredAsterisk}>*</span>
              </label>
              <select
                name="how_did_you_hear"
                value={formData.how_did_you_hear}
                onChange={handleInputChange}
                style={inputStyle}
                required
              >
                <option value="">Select an option</option>
                <option value="Social Media">Social Media</option>
                <option value="Referral">Referral</option>
                <option value="Search Engine">Search Engine</option>
                <option value="Advertisement">Advertisement</option>
                <option value="Other">Other</option>
              </select>
              {errors.how_did_you_hear && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.how_did_you_hear}</div>}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 768 ? '1fr' : 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginTop: '16px' }}>
            <div style={formGroupStyle}>
              <label style={labelStyle}>
                Agency Address <span style={requiredAsterisk}>*</span>
              </label>
              <textarea
                name="agency_address"
                value={formData.agency_address}
                onChange={handleInputChange}
                style={textareaStyle}
                required
                placeholder="Full address"
              />
              {errors.agency_address && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.agency_address}</div>}
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Any to Say</label>
              <textarea
                name="any_to_say"
                value={formData.any_to_say}
                onChange={handleInputChange}
                style={textareaStyle}
                maxLength="500"
                placeholder="Additional comments (max 500 characters)"
              />
              <div style={{ fontSize: '12px', color: theme.textSecondary, marginTop: '4px' }}>
                {formData.any_to_say.length}/500 characters
              </div>
              {errors.any_to_say && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.any_to_say}</div>}
            </div>
          </div>

          <div style={{ marginTop: '16px' }}>
            <div style={formGroupStyle}>
              <label style={labelStyle}>
                Company Incorporation or Trade License <span style={requiredAsterisk}>*</span>
              </label>
              <input
                type="file"
                name="company_incorporation_trade_license"
                onChange={handleFileChange}
                style={fileInputStyle}
                accept=".pdf"
                required
                disabled={files.company_incorporation_trade_license.uploading}
              />
              {files.company_incorporation_trade_license.uploading && (
                <div style={{ color: theme.info, fontSize: '12px', marginTop: '4px' }}>Uploading...</div>
              )}
              {files.company_incorporation_trade_license.url && (
                <div style={{ color: theme.success, fontSize: '12px', marginTop: '4px' }}>✓ File uploaded successfully</div>
              )}
              {errors.company_incorporation_trade_license && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.company_incorporation_trade_license}</div>}
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>
                Tax Registration Document
              </label>
              <input
                type="file"
                name="tax_registration_document"
                onChange={handleFileChange}
                style={fileInputStyle}
                accept=".pdf"
                disabled={files.tax_registration_document.uploading}
              />
              {files.tax_registration_document.uploading && (
                <div style={{ color: theme.info, fontSize: '12px', marginTop: '4px' }}>Uploading...</div>
              )}
              {files.tax_registration_document.url && (
                <div style={{ color: theme.success, fontSize: '12px', marginTop: '4px' }}>✓ File uploaded successfully</div>
              )}
              {errors.tax_registration_document && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.tax_registration_document}</div>}
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>
                Agency Bank Details <span style={requiredAsterisk}>*</span>
              </label>
              <input
                type="file"
                name="agency_bank_details"
                onChange={handleFileChange}
                style={fileInputStyle}
                accept=".pdf"
                required
                disabled={files.agency_bank_details.uploading}
              />
              {files.agency_bank_details.uploading && (
                <div style={{ color: theme.info, fontSize: '12px', marginTop: '4px' }}>Uploading...</div>
              )}
              {files.agency_bank_details.url && (
                <div style={{ color: theme.success, fontSize: '12px', marginTop: '4px' }}>✓ File uploaded successfully</div>
              )}
              {errors.agency_bank_details && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.agency_bank_details}</div>}
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>
                Agency Owner Passport <span style={requiredAsterisk}>*</span>
              </label>
              <input
                type="file"
                name="agency_owner_passport"
                onChange={handleFileChange}
                style={fileInputStyle}
                accept=".pdf"
                required
                disabled={files.agency_owner_passport.uploading}
              />
              {files.agency_owner_passport.uploading && (
                <div style={{ color: theme.info, fontSize: '12px', marginTop: '4px' }}>Uploading...</div>
              )}
              {files.agency_owner_passport.url && (
                <div style={{ color: theme.success, fontSize: '12px', marginTop: '4px' }}>✓ File uploaded successfully</div>
              )}
              {errors.agency_owner_passport && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.agency_owner_passport}</div>}
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>
                Agency Owner Photo <span style={requiredAsterisk}>*</span>
              </label>
              <input
                type="file"
                name="agency_owner_photo"
                onChange={handleFileChange}
                style={fileInputStyle}
                accept=".jpg,.jpeg"
                required
                disabled={files.agency_owner_photo.uploading}
              />
              {files.agency_owner_photo.uploading && (
                <div style={{ color: theme.info, fontSize: '12px', marginTop: '4px' }}>Uploading...</div>
              )}
              {files.agency_owner_photo.url && (
                <div style={{ color: theme.success, fontSize: '12px', marginTop: '4px' }}>✓ File uploaded successfully</div>
              )}
              {errors.agency_owner_photo && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.agency_owner_photo}</div>}
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
              id="recaptcha-container-agency"
              style={{ display: 'inline-block' }}
            ></div>
            {errors.recaptcha && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.recaptcha}</div>}
            <div style={{ fontSize: '12px', color: theme.textSecondary, marginTop: '8px' }}>
              Complete the reCAPTCHA verification to register your agency.
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
              {loading ? 'Registering...' : 'Register Agency'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AgencyRegistrationForm;