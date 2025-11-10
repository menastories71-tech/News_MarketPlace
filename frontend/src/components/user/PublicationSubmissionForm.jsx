import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Icon from '../common/Icon';
import api from '../../services/api';

// Publication Submission Form Component for Users
const PublicationSubmissionForm = ({ onClose, onSuccess }) => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    group_id: '',
    publication_sn: '',
    publication_grade: '',
    publication_name: '',
    publication_website: '',
    publication_price: '',
    agreement_tat: '',
    practical_tat: '',
    publication_socials_icons: '',
    publication_language: '',
    publication_region: '',
    publication_primary_industry: '',
    website_news_index: '',
    da: '',
    dr: '',
    sponsored_or_not: false,
    words_limit: '',
    number_of_images: '',
    do_follow_link: false,
    example_link: '',
    excluding_categories: '',
    other_remarks: '',
    tags_badges: '',
    live_on_platform: false
  });

  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState('');
  const [errors, setErrors] = useState({});
  const [submitStatus, setSubmitStatus] = useState(null); // null, 'success', 'error'

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchGroups();
  }, [isAuthenticated, navigate]);

  const fetchGroups = async () => {
    try {
      const response = await api.get('/groups');
      setGroups(response.data.groups || []);
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  };

  // Load reCAPTCHA script
  useEffect(() => {
    // Load reCAPTCHA script if not already loaded
    if (!window.grecaptcha) {
      const script = document.createElement('script');
      script.src = `https://www.google.com/recaptcha/enterprise.js?render=${import.meta.env.VITE_RECAPTCHA_SITE_KEY || "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"}`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);

      script.onload = () => {
        if (window.grecaptcha) {
          window.grecaptcha.ready(() => {
            console.log('reCAPTCHA ready');
          });
        }
      };
    }

    // Listen for reCAPTCHA events
    const handleRecaptchaSuccess = (event) => setRecaptchaToken(event.detail);
    const handleRecaptchaExpired = () => setRecaptchaToken('');
    const handleRecaptchaError = () => setRecaptchaToken('');

    window.addEventListener('recaptchaSuccess', handleRecaptchaSuccess);
    window.addEventListener('recaptchaExpired', handleRecaptchaExpired);
    window.addEventListener('recaptchaError', handleRecaptchaError);

    return () => {
      window.removeEventListener('recaptchaSuccess', handleRecaptchaSuccess);
      window.removeEventListener('recaptchaExpired', handleRecaptchaExpired);
      window.removeEventListener('recaptchaError', handleRecaptchaError);
    };
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
    const requiredFields = [
      'group_id', 'publication_sn', 'publication_grade', 'publication_name',
      'publication_website', 'publication_language', 'publication_region', 'publication_primary_industry'
    ];

    requiredFields.forEach(field => {
      if (!formData[field] || formData[field].toString().trim() === '') {
        newErrors[field] = 'This field is required';
      }
    });

    // URL validation
    if (formData.publication_website && !formData.publication_website.match(/^https?:\/\/.+/)) {
      newErrors.publication_website = 'Please enter a valid URL starting with http:// or https://';
    }

    if (formData.example_link && !formData.example_link.match(/^https?:\/\/.+/)) {
      newErrors.example_link = 'Please enter a valid URL starting with http:// or https://';
    }

    // Numeric validations
    if (formData.publication_price && (isNaN(formData.publication_price) || parseFloat(formData.publication_price) < 0)) {
      newErrors.publication_price = 'Price must be a positive number';
    }

    if (formData.agreement_tat && (isNaN(formData.agreement_tat) || parseInt(formData.agreement_tat) < 0)) {
      newErrors.agreement_tat = 'Agreement TAT must be a non-negative integer';
    }

    if (formData.practical_tat && (isNaN(formData.practical_tat) || parseInt(formData.practical_tat) < 0)) {
      newErrors.practical_tat = 'Practical TAT must be a non-negative integer';
    }

    if (formData.website_news_index && (isNaN(formData.website_news_index) || parseInt(formData.website_news_index) < 0)) {
      newErrors.website_news_index = 'Website news index must be a non-negative integer';
    }

    if (formData.da && (isNaN(formData.da) || parseInt(formData.da) < 0 || parseInt(formData.da) > 100)) {
      newErrors.da = 'Domain Authority must be between 0 and 100';
    }

    if (formData.dr && (isNaN(formData.dr) || parseInt(formData.dr) < 0 || parseInt(formData.dr) > 100)) {
      newErrors.dr = 'Domain Rating must be between 0 and 100';
    }

    if (formData.words_limit && (isNaN(formData.words_limit) || parseInt(formData.words_limit) < 0)) {
      newErrors.words_limit = 'Words limit must be a non-negative integer';
    }

    if (formData.number_of_images && (isNaN(formData.number_of_images) || parseInt(formData.number_of_images) < 0)) {
      newErrors.number_of_images = 'Number of images must be a non-negative integer';
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
        ...formData,
        publication_price: parseFloat(formData.publication_price) || 0,
        agreement_tat: parseInt(formData.agreement_tat) || 0,
        practical_tat: parseInt(formData.practical_tat) || 0,
        website_news_index: parseInt(formData.website_news_index) || 0,
        da: parseInt(formData.da) || 0,
        dr: parseInt(formData.dr) || 0,
        words_limit: parseInt(formData.words_limit) || 0,
        number_of_images: parseInt(formData.number_of_images) || 0,
        recaptchaToken
      };

      await api.post('/publications', dataToSend);

      setSubmitStatus('success');
      setTimeout(() => {
        if (onSuccess) onSuccess();
        if (onClose) onClose();
      }, 2000);

    } catch (error) {
      console.error('Error submitting publication:', error);

      let errorMessage = 'Failed to submit publication. Please try again.';

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

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
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
    boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
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

  return (
    <div style={modalStyle} onClick={onClose}>
      <div style={contentStyle} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '800' }}>
            Submit Publication
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
              <div style={{ fontWeight: '600', color: theme.success }}>Publication Submitted Successfully!</div>
              <div style={{ fontSize: '14px', color: theme.textSecondary }}>
                Your publication has been submitted and is pending review. You will be notified once it's approved.
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
          <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 768 ? '1fr' : 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
            <div style={formGroupStyle}>
              <label style={labelStyle}>
                Group <span style={requiredAsterisk}>*</span>
              </label>
              <select
                name="group_id"
                value={formData.group_id}
                onChange={handleInputChange}
                style={inputStyle}
                required
              >
                <option value="">Select Group</option>
                {groups.map(group => (
                  <option key={group.id} value={group.id}>{group.group_name}</option>
                ))}
              </select>
              {errors.group_id && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.group_id}</div>}
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>
                Publication SN <span style={requiredAsterisk}>*</span>
              </label>
              <input
                type="text"
                name="publication_sn"
                value={formData.publication_sn}
                onChange={handleInputChange}
                style={inputStyle}
                required
              />
              {errors.publication_sn && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.publication_sn}</div>}
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>
                Publication Grade <span style={requiredAsterisk}>*</span>
              </label>
              <input
                type="text"
                name="publication_grade"
                value={formData.publication_grade}
                onChange={handleInputChange}
                style={inputStyle}
                required
              />
              {errors.publication_grade && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.publication_grade}</div>}
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>
                Publication Name <span style={requiredAsterisk}>*</span>
              </label>
              <input
                type="text"
                name="publication_name"
                value={formData.publication_name}
                onChange={handleInputChange}
                style={inputStyle}
                required
              />
              {errors.publication_name && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.publication_name}</div>}
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>
                Website URL <span style={requiredAsterisk}>*</span>
              </label>
              <input
                type="url"
                name="publication_website"
                value={formData.publication_website}
                onChange={handleInputChange}
                style={inputStyle}
                required
                placeholder="https://example.com"
              />
              {errors.publication_website && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.publication_website}</div>}
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Price ($)</label>
              <input
                type="number"
                name="publication_price"
                step="0.01"
                min="0"
                value={formData.publication_price}
                onChange={handleInputChange}
                style={inputStyle}
              />
              {errors.publication_price && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.publication_price}</div>}
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Agreement TAT (days)</label>
              <input
                type="number"
                name="agreement_tat"
                min="0"
                value={formData.agreement_tat}
                onChange={handleInputChange}
                style={inputStyle}
              />
              {errors.agreement_tat && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.agreement_tat}</div>}
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Practical TAT (days)</label>
              <input
                type="number"
                name="practical_tat"
                min="0"
                value={formData.practical_tat}
                onChange={handleInputChange}
                style={inputStyle}
              />
              {errors.practical_tat && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.practical_tat}</div>}
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>
                Language <span style={requiredAsterisk}>*</span>
              </label>
              <input
                type="text"
                name="publication_language"
                value={formData.publication_language}
                onChange={handleInputChange}
                style={inputStyle}
                required
              />
              {errors.publication_language && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.publication_language}</div>}
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>
                Region <span style={requiredAsterisk}>*</span>
              </label>
              <input
                type="text"
                name="publication_region"
                value={formData.publication_region}
                onChange={handleInputChange}
                style={inputStyle}
                required
              />
              {errors.publication_region && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.publication_region}</div>}
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>
                Primary Industry <span style={requiredAsterisk}>*</span>
              </label>
              <input
                type="text"
                name="publication_primary_industry"
                value={formData.publication_primary_industry}
                onChange={handleInputChange}
                style={inputStyle}
                required
              />
              {errors.publication_primary_industry && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.publication_primary_industry}</div>}
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Website News Index</label>
              <input
                type="number"
                name="website_news_index"
                min="0"
                value={formData.website_news_index}
                onChange={handleInputChange}
                style={inputStyle}
              />
              {errors.website_news_index && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.website_news_index}</div>}
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Domain Authority (DA)</label>
              <input
                type="number"
                name="da"
                min="0"
                max="100"
                value={formData.da}
                onChange={handleInputChange}
                style={inputStyle}
              />
              {errors.da && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.da}</div>}
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Domain Rating (DR)</label>
              <input
                type="number"
                name="dr"
                min="0"
                max="100"
                value={formData.dr}
                onChange={handleInputChange}
                style={inputStyle}
              />
              {errors.dr && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.dr}</div>}
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Words Limit</label>
              <input
                type="number"
                name="words_limit"
                min="0"
                value={formData.words_limit}
                onChange={handleInputChange}
                style={inputStyle}
              />
              {errors.words_limit && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.words_limit}</div>}
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Number of Images</label>
              <input
                type="number"
                name="number_of_images"
                min="0"
                value={formData.number_of_images}
                onChange={handleInputChange}
                style={inputStyle}
              />
              {errors.number_of_images && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.number_of_images}</div>}
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Example Link</label>
              <input
                type="url"
                name="example_link"
                value={formData.example_link}
                onChange={handleInputChange}
                style={inputStyle}
                placeholder="https://example.com/article"
              />
              {errors.example_link && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.example_link}</div>}
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Social Media Icons</label>
              <input
                type="text"
                name="publication_socials_icons"
                value={formData.publication_socials_icons}
                onChange={handleInputChange}
                style={inputStyle}
                placeholder="Comma-separated social media links"
              />
              {errors.publication_socials_icons && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.publication_socials_icons}</div>}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 768 ? '1fr' : 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginTop: '16px' }}>
            <div style={formGroupStyle}>
              <label style={labelStyle}>Excluding Categories</label>
              <textarea
                name="excluding_categories"
                value={formData.excluding_categories}
                onChange={handleInputChange}
                style={{ ...inputStyle, minHeight: '60px', resize: 'vertical' }}
                placeholder="Categories to exclude"
              />
              {errors.excluding_categories && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.excluding_categories}</div>}
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Other Remarks</label>
              <textarea
                name="other_remarks"
                value={formData.other_remarks}
                onChange={handleInputChange}
                style={{ ...inputStyle, minHeight: '60px', resize: 'vertical' }}
                placeholder="Additional remarks"
              />
              {errors.other_remarks && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.other_remarks}</div>}
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Tags/Badges</label>
              <input
                type="text"
                name="tags_badges"
                value={formData.tags_badges}
                onChange={handleInputChange}
                style={inputStyle}
                placeholder="Comma-separated tags"
              />
              {errors.tags_badges && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.tags_badges}</div>}
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginTop: '24px', flexDirection: window.innerWidth < 768 ? 'column' : 'row' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <input
                type="checkbox"
                name="sponsored_or_not"
                id="sponsored"
                checked={formData.sponsored_or_not}
                onChange={handleInputChange}
                style={checkboxStyle}
              />
              <label htmlFor="sponsored" style={{ fontSize: '14px', color: '#212121' }}>Sponsored Content</label>
            </div>

            <div style={{ display: 'flex', alignItems: 'center' }}>
              <input
                type="checkbox"
                name="do_follow_link"
                id="dofollow"
                checked={formData.do_follow_link}
                onChange={handleInputChange}
                style={checkboxStyle}
              />
              <label htmlFor="dofollow" style={{ fontSize: '14px', color: '#212121' }}>Do-follow Link</label>
            </div>

            <div style={{ display: 'flex', alignItems: 'center' }}>
              <input
                type="checkbox"
                name="live_on_platform"
                id="live"
                checked={formData.live_on_platform}
                onChange={handleInputChange}
                style={checkboxStyle}
              />
              <label htmlFor="live" style={{ fontSize: '14px', color: '#212121' }}>Live on Platform</label>
            </div>
          </div>

          {/* reCAPTCHA */}
          <div style={{ marginTop: '24px', marginBottom: '24px' }}>
            <div
              className="g-recaptcha"
              data-sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY || "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"}
              data-callback="onRecaptchaSuccess"
              data-expired-callback="onRecaptchaExpired"
              data-error-callback="onRecaptchaError"
            ></div>
            {errors.recaptcha && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.recaptcha}</div>}
            <div style={{ fontSize: '12px', color: theme.textSecondary, marginTop: '8px' }}>
              Complete the reCAPTCHA verification to submit your publication.
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
              {loading ? 'Submitting...' : 'Submit Publication'}
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

export default PublicationSubmissionForm;