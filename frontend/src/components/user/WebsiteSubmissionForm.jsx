
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useNavigate } from 'react-router-dom';
import Icon from '../common/Icon';
import api from '../../services/api';

// Website Submission Form Component
const WebsiteSubmissionForm = ({ onClose, onSuccess }) => {
  const { isAuthenticated } = useAuth();
  const { isAuthenticated: isAdminAuthenticated } = useAdminAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    media_name: '',
    media_website_address: '',
    news_media_type: '',
    languages: [],
    categories: [],
    custom_category: '',
    location_type: 'Global',
    selected_continent: '',
    selected_country: '',
    selected_state: '',
    ig: '',
    facebook: '',
    linkedin: '',
    tiktok: '',
    u_tube: '',
    snapchat: '',
    twitter: '',
    social_media_embedded_allowed: false,
    social_media_url_in_article_allowed: false,
    external_website_link_allowed: false,
    no_of_images_allowed_in_article: '',
    words_limit: '',
    back_date_allowed: false,
    da: '',
    dr: '',
    pa: '',
    do_follow_link: '',
    disclaimer: '',
    listicle_allowed: false,
    turnaround_time: '',
    price: '',
    name_of_the_company_allowed_in_title: false,
    name_of_the_individual_allowed_in_title: false,
    sub_heading_sub_title_allowed: false,
    by_line_author_name_allowed: false,
    will_article_be_placed_permanently: false,
    will_the_article_can_be_deleted_after_publishing_on_our_request: false,
    will_the_article_can_be_modified_after_publishing_on_our_request: false,
    website_owner_name: '',
    website_owner_nationality: '',
    website_owner_gender: '',
    number: '',
    whatsapp: '',
    email: '',
    telegram: '',
    terms_accepted: false,
    how_did_you_hear: '',
    any_to_say: ''
  });

  const [files, setFiles] = useState({
    website_registration_document: null,
    tax_document: null,
    bank_details: null,
    owner_passport: null,
    general_contact_details: null
  });

  const [loading, setLoading] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState('');
  const [errors, setErrors] = useState({});
  const [submitStatus, setSubmitStatus] = useState(null); // null, 'success', 'error'

  // Removed currentStep as OTP is now part of the form
  const [otpData, setOtpData] = useState({
    emailOtp: ''
  });
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpErrors, setOtpErrors] = useState({});

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
      alert('Admins should submit websites through the admin panel.');
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
      const container = document.getElementById('recaptcha-container-website');
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
        const widgetId = window.grecaptcha.render('recaptcha-container-website', {
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
    if (type === 'checkbox') {
      if (name === 'languages' || name === 'categories') {
        setFormData(prev => ({
          ...prev,
          [name]: checked
            ? [...prev[name], value]
            : prev[name].filter(item => item !== value)
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: checked
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e) => {
    const { name, files: fileList } = e.target;
    setFiles(prev => ({
      ...prev,
      [name]: fileList[0] || null
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    const requiredFields = [
      'media_name', 'media_website_address', 'news_media_type', 'website_owner_name',
      'website_owner_nationality', 'website_owner_gender', 'number', 'email', 'how_did_you_hear'
    ];

    requiredFields.forEach(field => {
      if (!formData[field] || formData[field].toString().trim() === '') {
        newErrors[field] = 'This field is required';
      }
    });

    // URL validations
    if (formData.media_website_address && !formData.media_website_address.match(/^https?:\/\/.+/)) {
      newErrors.media_website_address = 'Please enter a valid URL starting with http:// or https://';
    }

    // Email validations
    if (formData.email && !formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Number validations
    if (formData.no_of_images_allowed_in_article && isNaN(formData.no_of_images_allowed_in_article)) {
      newErrors.no_of_images_allowed_in_article = 'Please enter a valid number';
    }
    if (formData.words_limit && isNaN(formData.words_limit)) {
      newErrors.words_limit = 'Please enter a valid number';
    }
    if (formData.da && (isNaN(formData.da) || formData.da < 0 || formData.da > 100)) {
      newErrors.da = 'Please enter a valid DA score (0-100)';
    }
    if (formData.dr && (isNaN(formData.dr) || formData.dr < 0 || formData.dr > 100)) {
      newErrors.dr = 'Please enter a valid DR score (0-100)';
    }
    if (formData.pa && (isNaN(formData.pa) || formData.pa < 0 || formData.pa > 100)) {
      newErrors.pa = 'Please enter a valid PA score (0-100)';
    }
    if (formData.price && isNaN(formData.price)) {
      newErrors.price = 'Please enter a valid price';
    }

    // Terms accepted
    if (!formData.terms_accepted) {
      newErrors.terms_accepted = 'You must accept the terms and conditions';
    }

    // File validations (required)
    const requiredFiles = ['website_registration_document', 'tax_document', 'bank_details', 'owner_passport', 'general_contact_details'];
    requiredFiles.forEach(field => {
      if (!files[field]) {
        newErrors[field] = 'This file is required';
      }
    });

    // Textarea limit
    if (formData.any_to_say && formData.any_to_say.length > 500) {
      newErrors.any_to_say = 'Message cannot exceed 500 characters';
    }

    // OTP verification
    if (!otpVerified.email) {
      newErrors.otp = 'Please verify your email OTP before submitting';
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

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setSubmitStatus(null);

    try {
      const submitData = new FormData();

      // Add form data
      Object.keys(formData).forEach(key => {
        if (Array.isArray(formData[key])) {
          submitData.append(key, JSON.stringify(formData[key]));
        } else if (key === 'custom_location') {
          // Skip the old custom_location field as it's replaced by the new location fields
          return;
        } else {
          submitData.append(key, formData[key]);
        }
      });

      // Add files
      Object.keys(files).forEach(key => {
        if (files[key]) {
          submitData.append(key, files[key]);
        }
      });

      submitData.append('recaptchaToken', recaptchaToken);

      await api.post('/websites/submit', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setSubmitStatus('success');
      setTimeout(() => {
        if (onSuccess) onSuccess();
        if (onClose) onClose();
      }, 2000);

    } catch (error) {
      console.error('Error submitting website:', error);

      let errorMessage = 'Failed to submit website. Please try again.';

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

  const handleOtpChange = (name, value) => {
    setOtpData(prev => ({
      ...prev,
      [name]: value
    }));

    if (otpErrors[name]) {
      setOtpErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSendOtp = async (type) => {
    if (type !== 'email') return;

    const value = formData.email;
    if (!value) {
      setErrors(prev => ({ ...prev, email: 'This field is required to send OTP' }));
      return;
    }

    setOtpSendLoading(prev => ({ ...prev, [type]: true }));

    try {
      const payload = { type, email: value };

      console.log(`Sending ${type} OTP to:`, value);
      const response = await api.post('/websites/send-otp', payload);

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
    if (type !== 'email') return;

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
        email: formData.email
      };

      console.log('Sending verification data:', verificationData);
      await api.post('/websites/verify-otp', verificationData);

      setOtpVerified(prev => ({ ...prev, [type]: true }));
      setOtpErrors(prev => ({ ...prev, emailOtp: '' }));
      alert(`${type.charAt(0).toUpperCase() + type.slice(1)} verified successfully!`);
      console.log(`${type.charAt(0).toUpperCase() + type.slice(1)} verified successfully.`);
      // Keep form open for user to complete submission
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

  // Location data
  const continents = [
    'Africa', 'Asia', 'Europe', 'North America', 'South America', 'Australia/Oceania', 'Antarctica'
  ];

  const countries = [
    'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Antigua and Barbuda', 'Argentina', 'Armenia', 'Australia',
    'Austria', 'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin',
    'Bhutan', 'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi',
    'Cabo Verde', 'Cambodia', 'Cameroon', 'Canada', 'Central African Republic', 'Chad', 'Chile', 'China', 'Colombia',
    'Comoros', 'Congo', 'Costa Rica', 'Croatia', 'Cuba', 'Cyprus', 'Czech Republic', 'Denmark', 'Djibouti', 'Dominica',
    'Dominican Republic', 'Ecuador', 'Egypt', 'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia', 'Eswatini',
    'Ethiopia', 'Fiji', 'Finland', 'France', 'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Grenada',
    'Guatemala', 'Guinea', 'Guinea-Bissau', 'Guyana', 'Haiti', 'Honduras', 'Hungary', 'Iceland', 'India', 'Indonesia',
    'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy', 'Jamaica', 'Japan', 'Jordan', 'Kazakhstan', 'Kenya', 'Kiribati',
    'Kuwait', 'Kyrgyzstan', 'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania',
    'Luxembourg', 'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta', 'Marshall Islands', 'Mauritania',
    'Mauritius', 'Mexico', 'Micronesia', 'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 'Morocco', 'Mozambique',
    'Myanmar', 'Namibia', 'Nauru', 'Nepal', 'Netherlands', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'North Korea',
    'North Macedonia', 'Norway', 'Oman', 'Pakistan', 'Palau', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines',
    'Poland', 'Portugal', 'Qatar', 'Romania', 'Russia', 'Rwanda', 'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines',
    'Samoa', 'San Marino', 'Sao Tome and Principe', 'Saudi Arabia', 'Senegal', 'Serbia', 'Seychelles', 'Sierra Leone',
    'Singapore', 'Slovakia', 'Slovenia', 'Solomon Islands', 'Somalia', 'South Africa', 'South Korea', 'South Sudan',
    'Spain', 'Sri Lanka', 'Sudan', 'Suriname', 'Sweden', 'Switzerland', 'Syria', 'Taiwan', 'Tajikistan', 'Tanzania',
    'Thailand', 'Timor-Leste', 'Togo', 'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Turkey', 'Turkmenistan', 'Tuvalu',
    'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay', 'Uzbekistan', 'Vanuatu',
    'Vatican City', 'Venezuela', 'Vietnam', 'Yemen', 'Zambia', 'Zimbabwe'
  ];

  const states = [
    // US States
    'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia',
    'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland',
    'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
    'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania',
    'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington',
    'West Virginia', 'Wisconsin', 'Wyoming',
    // Canadian Provinces
    'Alberta', 'British Columbia', 'Manitoba', 'New Brunswick', 'Newfoundland and Labrador', 'Northwest Territories',
    'Nova Scotia', 'Nunavut', 'Ontario', 'Prince Edward Island', 'Quebec', 'Saskatchewan', 'Yukon',
    // Indian States
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh',
    'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland',
    'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
  ];

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
             Website Submission
           </h2>
           <button onClick={onClose} style={{ background: 'transparent', border: 'none', fontSize: '24px', cursor: 'pointer' }}>
             ×
           </button>
         </div>

        <>
            <div style={{ backgroundColor: '#e3f2fd', padding: '16px', borderRadius: '8px', marginBottom: '24px', border: `1px solid ${theme.primaryLight}` }}>
              <p style={{ margin: 0, fontSize: '16px', color: theme.textPrimary, fontWeight: '500' }}>
                U r one step away from seen to the masses and amplify your brand presence
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
                  <div style={{ fontWeight: '600', color: theme.success }}>Website Submitted Successfully!</div>
                  <div style={{ fontSize: '14px', color: theme.textSecondary }}>
                    Your website has been submitted and is pending review. You will be notified once it's approved.
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
              {/* Media Details Section */}
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: theme.textPrimary }}>Media Details</h3>
                <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 768 ? '1fr' : 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                  <div style={formGroupStyle}>
                    <label style={labelStyle}>
                      Media Name <span style={requiredAsterisk}>*</span>
                    </label>
                    <input
                      type="text"
                      name="media_name"
                      value={formData.media_name}
                      onChange={handleInputChange}
                      style={inputStyle}
                      required
                    />
                    {errors.media_name && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.media_name}</div>}
                  </div>

                  <div style={formGroupStyle}>
                    <label style={labelStyle}>
                      Media Website Address <span style={requiredAsterisk}>*</span>
                    </label>
                    <input
                      type="url"
                      name="media_website_address"
                      value={formData.media_website_address}
                      onChange={handleInputChange}
                      style={inputStyle}
                      required
                      placeholder="https://example.com"
                    />
                    {errors.media_website_address && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.media_website_address}</div>}
                  </div>

                  <div style={formGroupStyle}>
                    <label style={labelStyle}>
                      News Media Type <span style={requiredAsterisk}>*</span>
                    </label>
                    <select
                      name="news_media_type"
                      value={formData.news_media_type}
                      onChange={handleInputChange}
                      style={inputStyle}
                      required
                    >
                      <option value="">Select type</option>
                      <option value="Blog">Blog</option>
                      <option value="Local news">Local news</option>
                      <option value="News agency">News agency</option>
                      <option value="News media">News media</option>
                      <option value="Just a website">Just a website</option>
                      <option value="Social media">Social media</option>
                    </select>
                    {errors.news_media_type && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.news_media_type}</div>}
                  </div>

                  <div style={formGroupStyle}>
                    <label style={labelStyle}>Language You Publish In</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {['english', 'russian', 'arabic', 'hindi', 'french', 'chinese'].map(lang => (
                        <label key={lang} style={{ display: 'flex', alignItems: 'center', fontSize: '14px' }}>
                          <input
                            type="checkbox"
                            name="languages"
                            value={lang}
                            checked={formData.languages.includes(lang)}
                            onChange={handleInputChange}
                            style={checkboxStyle}
                          />
                          {lang.charAt(0).toUpperCase() + lang.slice(1)}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div style={formGroupStyle}>
                    <label style={labelStyle}>Do You Cover Any Specific Category?</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {['Tech', 'Marketing', 'Finance', 'Web 3', 'Entrepreneur', 'Hospitality', 'Other'].map(category => (
                        <label key={category} style={{ display: 'flex', alignItems: 'center', fontSize: '14px' }}>
                          <input
                            type="checkbox"
                            name="categories"
                            value={category.toLowerCase()}
                            checked={formData.categories.includes(category.toLowerCase())}
                            onChange={handleInputChange}
                            style={checkboxStyle}
                          />
                          {category}
                        </label>
                      ))}
                    </div>
                    <input
                      type="text"
                      name="custom_category"
                      value={formData.custom_category}
                      onChange={handleInputChange}
                      style={{ ...inputStyle, marginTop: '8px' }}
                      placeholder="Custom category"
                    />
                  </div>

                  <div style={formGroupStyle}>
                    <label style={labelStyle}>Does Your Media Cover a Particular Location or Is It Global?</label>
                    <select
                      name="location_type"
                      value={formData.location_type}
                      onChange={handleInputChange}
                      style={inputStyle}
                    >
                      <option value="Global">Global</option>
                      <option value="Regional">Regional</option>
                    </select>

                    {formData.location_type === 'Regional' && (
                      <div style={{ marginTop: '8px' }}>
                        <select
                          name="selected_continent"
                          value={formData.selected_continent}
                          onChange={handleInputChange}
                          style={{ ...inputStyle, marginBottom: '8px' }}
                        >
                          <option value="">Select a continent</option>
                          {continents.map(continent => (
                            <option key={continent} value={continent}>{continent}</option>
                          ))}
                        </select>

                        {formData.selected_continent && (
                          <select
                            name="selected_country"
                            value={formData.selected_country}
                            onChange={handleInputChange}
                            style={{ ...inputStyle, marginBottom: '8px' }}
                          >
                            <option value="">Select a country</option>
                            {countries.map(country => (
                              <option key={country} value={country}>{country}</option>
                            ))}
                          </select>
                        )}

                        {formData.selected_country && (
                          <select
                            name="selected_state"
                            value={formData.selected_state}
                            onChange={handleInputChange}
                            style={inputStyle}
                          >
                            <option value="">Select a state/province</option>
                            {states.map(state => (
                              <option key={state} value={state}>{state}</option>
                            ))}
                          </select>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Social Media Links Section */}
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: theme.textPrimary }}>Social Media Links</h3>
                <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 768 ? '1fr' : 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                  {[
                    { key: 'ig', label: 'Instagram', placeholder: '@instagram_handle' },
                    { key: 'facebook', label: 'Facebook', placeholder: '@facebook_handle' },
                    { key: 'linkedin', label: 'LinkedIn', placeholder: '@linkedin_handle' },
                    { key: 'tiktok', label: 'TikTok', placeholder: '@tiktok_handle' },
                    { key: 'u_tube', label: 'YouTube', placeholder: '@youtube_handle' },
                    { key: 'snapchat', label: 'Snapchat', placeholder: '@snapchat_handle' },
                    { key: 'twitter', label: 'X (Formerly known as Twitter)', placeholder: '@x_handle' }
                  ].map(social => (
                    <div key={social.key} style={formGroupStyle}>
                      <label style={labelStyle}>{social.label}</label>
                      <input
                        type="text"
                        name={social.key}
                        value={formData[social.key]}
                        onChange={handleInputChange}
                        style={inputStyle}
                        placeholder={social.placeholder}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Content Policies Section */}
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: theme.textPrimary }}>Content Policies</h3>
                <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 768 ? '1fr' : 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                  <div style={formGroupStyle}>
                    <label style={labelStyle}>Social Media Embedded Allowed</label>
                    <input
                      type="checkbox"
                      name="social_media_embedded_allowed"
                      checked={formData.social_media_embedded_allowed}
                      onChange={handleInputChange}
                      style={checkboxStyle}
                    />
                  </div>

                  <div style={formGroupStyle}>
                    <label style={labelStyle}>Social Media URL in Article Allowed</label>
                    <input
                      type="checkbox"
                      name="social_media_url_in_article_allowed"
                      checked={formData.social_media_url_in_article_allowed}
                      onChange={handleInputChange}
                      style={checkboxStyle}
                    />
                  </div>

                  <div style={formGroupStyle}>
                    <label style={labelStyle}>External Website Link Allowed</label>
                    <input
                      type="checkbox"
                      name="external_website_link_allowed"
                      checked={formData.external_website_link_allowed}
                      onChange={handleInputChange}
                      style={checkboxStyle}
                    />
                  </div>

                  <div style={formGroupStyle}>
                    <label style={labelStyle}>No. of Images Allowed in Article</label>
                    <input
                      type="number"
                      name="no_of_images_allowed_in_article"
                      value={formData.no_of_images_allowed_in_article}
                      onChange={handleInputChange}
                      style={inputStyle}
                      min="0"
                    />
                    {errors.no_of_images_allowed_in_article && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.no_of_images_allowed_in_article}</div>}
                  </div>

                  <div style={formGroupStyle}>
                    <label style={labelStyle}>Words Limit</label>
                    <input
                      type="number"
                      name="words_limit"
                      value={formData.words_limit}
                      onChange={handleInputChange}
                      style={inputStyle}
                      min="0"
                    />
                    {errors.words_limit && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.words_limit}</div>}
                  </div>

                  <div style={formGroupStyle}>
                    <label style={labelStyle}>Back Date Allowed</label>
                    <select
                      name="back_date_allowed"
                      value={formData.back_date_allowed}
                      onChange={handleInputChange}
                      style={inputStyle}
                    >
                      <option value={false}>No</option>
                      <option value={true}>Yes</option>
                    </select>
                  </div>

                  <div style={formGroupStyle}>
                    <label style={labelStyle}>DA</label>
                    <input
                      type="number"
                      name="da"
                      value={formData.da}
                      onChange={handleInputChange}
                      style={inputStyle}
                      min="0"
                      max="100"
                    />
                    {errors.da && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.da}</div>}
                  </div>

                  <div style={formGroupStyle}>
                    <label style={labelStyle}>DR</label>
                    <input
                      type="number"
                      name="dr"
                      value={formData.dr}
                      onChange={handleInputChange}
                      style={inputStyle}
                      min="0"
                      max="100"
                    />
                    {errors.dr && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.dr}</div>}
                  </div>

                  <div style={formGroupStyle}>
                    <label style={labelStyle}>PA</label>
                    <input
                      type="number"
                      name="pa"
                      value={formData.pa}
                      onChange={handleInputChange}
                      style={inputStyle}
                      min="0"
                      max="100"
                    />
                    {errors.pa && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.pa}</div>}
                  </div>

                  <div style={formGroupStyle}>
                    <label style={labelStyle}>Do Follow Link or No Follow Link</label>
                    <select
                      name="do_follow_link"
                      value={formData.do_follow_link}
                      onChange={handleInputChange}
                      style={inputStyle}
                    >
                      <option value="">Select</option>
                      <option value="Do Follow">Do Follow</option>
                      <option value="No Follow">No Follow</option>
                    </select>
                  </div>

                  <div style={formGroupStyle}>
                    <label style={labelStyle}>Disclaimer or Non Disclaimer</label>
                    <select
                      name="disclaimer"
                      value={formData.disclaimer}
                      onChange={handleInputChange}
                      style={inputStyle}
                    >
                      <option value="">Select</option>
                      <option value="Disclaimer">Disclaimer</option>
                      <option value="Non Disclaimer">Non Disclaimer</option>
                    </select>
                  </div>

                  <div style={formGroupStyle}>
                    <label style={labelStyle}>Listicle Allowed or Not</label>
                    <select
                      name="listicle_allowed"
                      value={formData.listicle_allowed}
                      onChange={handleInputChange}
                      style={inputStyle}
                    >
                      <option value={false}>Not Allowed</option>
                      <option value={true}>Allowed</option>
                    </select>
                  </div>

                  <div style={formGroupStyle}>
                    <label style={labelStyle}>Turnaround Time</label>
                    <input
                      type="text"
                      name="turnaround_time"
                      value={formData.turnaround_time}
                      onChange={handleInputChange}
                      style={inputStyle}
                    />
                  </div>

                  <div style={formGroupStyle}>
                    <label style={labelStyle}>Price</label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      style={inputStyle}
                      min="0"
                    />
                    {errors.price && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.price}</div>}
                  </div>

                  <div style={formGroupStyle}>
                    <label style={labelStyle}>Name of the Company Allowed in Title</label>
                    <select
                      name="name_of_the_company_allowed_in_title"
                      value={formData.name_of_the_company_allowed_in_title}
                      onChange={handleInputChange}
                      style={inputStyle}
                    >
                      <option value={false}>No</option>
                      <option value={true}>Yes</option>
                    </select>
                  </div>

                  <div style={formGroupStyle}>
                    <label style={labelStyle}>Name of the Individual Allowed in Title</label>
                    <select
                      name="name_of_the_individual_allowed_in_title"
                      value={formData.name_of_the_individual_allowed_in_title}
                      onChange={handleInputChange}
                      style={inputStyle}
                    >
                      <option value={false}>No</option>
                      <option value={true}>Yes</option>
                    </select>
                  </div>

                  <div style={formGroupStyle}>
                    <label style={labelStyle}>Sub Heading / Sub Title Allowed</label>
                    <select
                      name="sub_heading_sub_title_allowed"
                      value={formData.sub_heading_sub_title_allowed}
                      onChange={handleInputChange}
                      style={inputStyle}
                    >
                      <option value={false}>No</option>
                      <option value={true}>Yes</option>
                    </select>
                  </div>

                  <div style={formGroupStyle}>
                    <label style={labelStyle}>By Line / Author Name Allowed</label>
                    <select
                      name="by_line_author_name_allowed"
                      value={formData.by_line_author_name_allowed}
                      onChange={handleInputChange}
                      style={inputStyle}
                    >
                      <option value={false}>No</option>
                      <option value={true}>Yes</option>
                    </select>
                  </div>

                  <div style={formGroupStyle}>
                    <label style={labelStyle}>Will Article Be Placed Permanently</label>
                    <select
                      name="will_article_be_placed_permanently"
                      value={formData.will_article_be_placed_permanently}
                      onChange={handleInputChange}
                      style={inputStyle}
                    >
                      <option value={false}>No</option>
                      <option value={true}>Yes</option>
                    </select>
                  </div>

                  <div style={formGroupStyle}>
                    <label style={labelStyle}>Will the Article Can Be Deleted After Publishing on Our Request</label>
                    <select
                      name="will_the_article_can_be_deleted_after_publishing_on_our_request"
                      value={formData.will_the_article_can_be_deleted_after_publishing_on_our_request}
                      onChange={handleInputChange}
                      style={inputStyle}
                    >
                      <option value={false}>No</option>
                      <option value={true}>Yes</option>
                    </select>
                  </div>

                  <div style={formGroupStyle}>
                    <label style={labelStyle}>Will the Article Can Be Modified After Publishing on Our Request</label>
                    <select
                      name="will_the_article_can_be_modified_after_publishing_on_our_request"
                      value={formData.will_the_article_can_be_modified_after_publishing_on_our_request}
                      onChange={handleInputChange}
                      style={inputStyle}
                    >
                      <option value={false}>No</option>
                      <option value={true}>Yes</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Owner Information Section */}
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: theme.textPrimary }}>Owner Information</h3>
                <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 768 ? '1fr' : 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                  <div style={formGroupStyle}>
                    <label style={labelStyle}>
                      Website Owner Name <span style={requiredAsterisk}>*</span>
                    </label>
                    <input
                      type="text"
                      name="website_owner_name"
                      value={formData.website_owner_name}
                      onChange={handleInputChange}
                      style={inputStyle}
                      required
                    />
                    {errors.website_owner_name && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.website_owner_name}</div>}
                  </div>

                  <div style={formGroupStyle}>
                    <label style={labelStyle}>
                      Website Owner Nationality <span style={requiredAsterisk}>*</span>
                    </label>
                    <input
                      type="text"
                      name="website_owner_nationality"
                      value={formData.website_owner_nationality}
                      onChange={handleInputChange}
                      style={inputStyle}
                      required
                    />
                    {errors.website_owner_nationality && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.website_owner_nationality}</div>}
                  </div>

                  <div style={formGroupStyle}>
                    <label style={labelStyle}>
                      Website Owner Gender <span style={requiredAsterisk}>*</span>
                    </label>
                    <select
                      name="website_owner_gender"
                      value={formData.website_owner_gender}
                      onChange={handleInputChange}
                      style={inputStyle}
                      required
                    >
                      <option value="">Select gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                    {errors.website_owner_gender && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.website_owner_gender}</div>}
                  </div>

                  <div style={formGroupStyle}>
                    <label style={labelStyle}>
                      Number <span style={requiredAsterisk}>*</span>
                    </label>
                    <input
                      type="tel"
                      name="number"
                      value={formData.number}
                      onChange={handleInputChange}
                      style={inputStyle}
                      required
                      placeholder="Enter phone number"
                    />
                    {errors.number && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.number}</div>}
                  </div>

                  <div style={formGroupStyle}>
                    <label style={labelStyle}>WhatsApp</label>
                    <input
                      type="tel"
                      name="whatsapp"
                      value={formData.whatsapp}
                      onChange={handleInputChange}
                      style={inputStyle}
                      placeholder="Enter WhatsApp number"
                    />
                  </div>

                  <div style={formGroupStyle}>
                    <label style={labelStyle}>
                      Email <span style={requiredAsterisk}>*</span>
                    </label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          style={{ ...inputStyle, flex: 1 }}
                          placeholder="Enter email address"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => handleSendOtp('email')}
                          disabled={otpSendLoading.email || !formData.email}
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
                    {errors.email && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.email}</div>}
                    {errors.emailOtp && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.emailOtp}</div>}
                    {errors.otp && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.otp}</div>}
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
                  </div>
                </div>
              </div>

              {/* File Uploads */}
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: theme.textPrimary }}>Documents</h3>
                <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 768 ? '1fr' : 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                  <div style={formGroupStyle}>
                    <label style={labelStyle}>
                      Website Registration Document <span style={requiredAsterisk}>*</span>
                    </label>
                    <input
                      type="file"
                      name="website_registration_document"
                      onChange={handleFileChange}
                      style={fileInputStyle}
                      accept=".pdf,.jpg,.jpeg,.png"
                      required
                    />
                    {errors.website_registration_document && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.website_registration_document}</div>}
                  </div>

                  <div style={formGroupStyle}>
                    <label style={labelStyle}>
                      Tax Document <span style={requiredAsterisk}>*</span>
                    </label>
                    <input
                      type="file"
                      name="tax_document"
                      onChange={handleFileChange}
                      style={fileInputStyle}
                      accept=".pdf,.jpg,.jpeg,.png"
                      required
                    />
                    {errors.tax_document && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.tax_document}</div>}
                  </div>

                  <div style={formGroupStyle}>
                    <label style={labelStyle}>
                      Bank Details <span style={requiredAsterisk}>*</span>
                    </label>
                    <input
                      type="file"
                      name="bank_details"
                      onChange={handleFileChange}
                      style={fileInputStyle}
                      accept=".pdf,.jpg,.jpeg,.png"
                      required
                    />
                    {errors.bank_details && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.bank_details}</div>}
                  </div>

                  <div style={formGroupStyle}>
                    <label style={labelStyle}>
                      Owner Passport <span style={requiredAsterisk}>*</span>
                    </label>
                    <input
                      type="file"
                      name="owner_passport"
                      onChange={handleFileChange}
                      style={fileInputStyle}
                      accept=".pdf,.jpg,.jpeg,.png"
                      required
                    />
                    {errors.owner_passport && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.owner_passport}</div>}
                  </div>

                  <div style={formGroupStyle}>
                    <label style={labelStyle}>
                      General Contact Details <span style={requiredAsterisk}>*</span>
                    </label>
                    <input
                      type="file"
                      name="general_contact_details"
                      onChange={handleFileChange}
                      style={fileInputStyle}
                      accept=".pdf,.jpg,.jpeg,.png"
                      required
                    />
                    {errors.general_contact_details && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.general_contact_details}</div>}
                  </div>
                </div>
              </div>

              {/* Additional Fields */}
              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 768 ? '1fr' : 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
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
                      <option value="Search">Search</option>
                      <option value="Referral">Referral</option>
                      <option value="Other">Other</option>
                    </select>
                    {errors.how_did_you_hear && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.how_did_you_hear}</div>}
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
                  id="recaptcha-container-website"
                  style={{ display: 'inline-block' }}
                ></div>
                {errors.recaptcha && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.recaptcha}</div>}
                <div style={{ fontSize: '12px', color: theme.textSecondary, marginTop: '8px' }}>
                  Complete the reCAPTCHA verification to submit your website.
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
                  {loading ? 'Submitting...' : 'Submit Website'}
                </button>
              </div>
            </form>
        </>

      </div>
    </div>
  );
};

export default WebsiteSubmissionForm;