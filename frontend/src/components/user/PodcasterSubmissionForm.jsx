import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useNavigate } from 'react-router-dom';
import Icon from '../common/Icon';
import api from '../../services/api';

// Podcaster Submission Form Component
const PodcasterSubmissionForm = ({ onClose, onSuccess }) => {
  const { isAuthenticated, user } = useAuth();
  const { isAuthenticated: isAdminAuthenticated } = useAdminAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    podcast_name: '',
    podcast_host: '',
    podcast_focus_industry: '',
    podcast_target_audience: '',
    podcast_region: '',
    podcast_website: '',
    podcast_ig: '',
    podcast_linkedin: '',
    podcast_facebook: '',
    podcast_ig_username: '',
    podcast_ig_followers: '',
    podcast_ig_engagement_rate: '',
    podcast_ig_prominent_guests: '',
    spotify_channel_name: '',
    spotify_channel_url: '',
    youtube_channel_name: '',
    youtube_channel_url: '',
    tiktok: '',
    cta: '',
    contact_us_to_be_on_podcast: '',
    terms_accepted: false,
    how_heard_about_us: '',
    message: ''
  });

  const [image, setImage] = useState(null);
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
      alert('Admins should submit podcasters through the admin panel.');
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
      const container = document.getElementById('recaptcha-container-podcaster');
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
        const widgetId = window.grecaptcha.render('recaptcha-container-podcaster', {
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);

    if (errors.image) {
      setErrors(prev => ({ ...prev, image: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields
    if (!formData.podcast_name || formData.podcast_name.trim() === '') {
      newErrors.podcast_name = 'Podcast name is required';
    }

    // URL validations
    if (formData.podcast_website && !formData.podcast_website.match(/^https?:\/\/.+/)) {
      newErrors.podcast_website = 'Please enter a valid URL starting with http:// or https://';
    }
    if (formData.podcast_ig && !formData.podcast_ig.match(/^https?:\/\/.+/)) {
      newErrors.podcast_ig = 'Please enter a valid Instagram URL';
    }
    if (formData.podcast_linkedin && !formData.podcast_linkedin.match(/^https?:\/\/.+/)) {
      newErrors.podcast_linkedin = 'Please enter a valid LinkedIn URL';
    }
    if (formData.podcast_facebook && !formData.podcast_facebook.match(/^https?:\/\/.+/)) {
      newErrors.podcast_facebook = 'Please enter a valid Facebook URL';
    }
    if (formData.spotify_channel_url && !formData.spotify_channel_url.match(/^https?:\/\/.+/)) {
      newErrors.spotify_channel_url = 'Please enter a valid Spotify URL';
    }
    if (formData.youtube_channel_url && !formData.youtube_channel_url.match(/^https?:\/\/.+/)) {
      newErrors.youtube_channel_url = 'Please enter a valid YouTube URL';
    }

    // Numeric validations
    if (formData.podcast_ig_followers && (isNaN(formData.podcast_ig_followers) || formData.podcast_ig_followers < 0)) {
      newErrors.podcast_ig_followers = 'Please enter a valid non-negative number';
    }
    if (formData.podcast_ig_engagement_rate && (isNaN(formData.podcast_ig_engagement_rate) || formData.podcast_ig_engagement_rate < 0 || formData.podcast_ig_engagement_rate > 100)) {
      newErrors.podcast_ig_engagement_rate = 'Please enter a valid percentage (0-100)';
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
      alert('Admins should submit podcasters through the admin panel.');
      if (onClose) onClose();
      return;
    }

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setSubmitStatus(null);

    try {
      const submitData = new FormData();

      // Add form data
      Object.keys(formData).forEach(key => {
        submitData.append(key, formData[key]);
      });

      // Add image
      if (image) {
        submitData.append('image', image);
      }

      submitData.append('recaptchaToken', recaptchaToken);

      await api.post('/podcasters', submitData, {
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
      console.error('Error submitting podcaster:', error);

      let errorMessage = 'Failed to submit podcaster profile. Please try again.';

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

  const fileInputStyle = {
    ...getInputStyle('image'),
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
            Podcaster Profile Submission
          </h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', fontSize: '24px', cursor: 'pointer' }}>
            ×
          </button>
        </div>

        <div style={{ backgroundColor: '#e3f2fd', padding: '16px', borderRadius: '8px', marginBottom: '24px', border: `1px solid ${theme.primaryLight}` }}>
          <p style={{ margin: 0, fontSize: '16px', color: theme.textPrimary, fontWeight: '500' }}>
            Share your podcast details and connect with our community.
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
              <div style={{ fontWeight: '600', color: theme.success }}>Podcaster Profile Submitted Successfully!</div>
              <div style={{ fontSize: '14px', color: theme.textSecondary }}>
                Your podcaster profile has been submitted and is pending review. You will be notified once it's approved.
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
          {/* Podcast Information Section */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: theme.textPrimary }}>Podcast Information</h3>
            <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 768 ? '1fr' : 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              <div style={formGroupStyle}>
                <label style={labelStyle}>
                  Podcast Name <span style={requiredAsterisk}>*</span>
                </label>
                <input
                  type="text"
                  name="podcast_name"
                  value={formData.podcast_name}
                  onChange={handleInputChange}
                  style={getInputStyle('podcast_name')}
                  required
                />
                {errors.podcast_name && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.podcast_name}</div>}
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>Podcast Host</label>
                <input
                  type="text"
                  name="podcast_host"
                  value={formData.podcast_host}
                  onChange={handleInputChange}
                  style={getInputStyle('podcast_host')}
                />
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>Focus Industry</label>
                <input
                  type="text"
                  name="podcast_focus_industry"
                  value={formData.podcast_focus_industry}
                  onChange={handleInputChange}
                  style={getInputStyle('podcast_focus_industry')}
                  placeholder="e.g., Technology, Business, Health"
                />
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>Target Audience</label>
                <input
                  type="text"
                  name="podcast_target_audience"
                  value={formData.podcast_target_audience}
                  onChange={handleInputChange}
                  style={getInputStyle('podcast_target_audience')}
                  placeholder="e.g., Entrepreneurs, Students, Professionals"
                />
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>Region</label>
                <input
                  type="text"
                  name="podcast_region"
                  value={formData.podcast_region}
                  onChange={handleInputChange}
                  style={getInputStyle('podcast_region')}
                  placeholder="e.g., Global, North America, Europe"
                />
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>Podcast Website</label>
                <input
                  type="url"
                  name="podcast_website"
                  value={formData.podcast_website}
                  onChange={handleInputChange}
                  style={getInputStyle('podcast_website')}
                  placeholder="https://yourpodcast.com"
                />
                {errors.podcast_website && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.podcast_website}</div>}
              </div>
            </div>
          </div>

          {/* Social Media Links Section */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: theme.textPrimary }}>Social Media Links</h3>
            <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 768 ? '1fr' : 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              <div style={formGroupStyle}>
                <label style={labelStyle}>Instagram</label>
                <input
                  type="url"
                  name="podcast_ig"
                  value={formData.podcast_ig}
                  onChange={handleInputChange}
                  style={getInputStyle('podcast_ig')}
                  placeholder="https://instagram.com/yourpodcast"
                />
                {errors.podcast_ig && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.podcast_ig}</div>}
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>LinkedIn</label>
                <input
                  type="url"
                  name="podcast_linkedin"
                  value={formData.podcast_linkedin}
                  onChange={handleInputChange}
                  style={getInputStyle('podcast_linkedin')}
                  placeholder="https://linkedin.com/company/yourpodcast"
                />
                {errors.podcast_linkedin && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.podcast_linkedin}</div>}
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>Facebook</label>
                <input
                  type="url"
                  name="podcast_facebook"
                  value={formData.podcast_facebook}
                  onChange={handleInputChange}
                  style={getInputStyle('podcast_facebook')}
                  placeholder="https://facebook.com/yourpodcast"
                />
                {errors.podcast_facebook && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.podcast_facebook}</div>}
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>Instagram Username</label>
                <input
                  type="text"
                  name="podcast_ig_username"
                  value={formData.podcast_ig_username}
                  onChange={handleInputChange}
                  style={getInputStyle('podcast_ig_username')}
                  placeholder="@yourpodcast"
                />
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>Instagram Followers</label>
                <input
                  type="number"
                  name="podcast_ig_followers"
                  value={formData.podcast_ig_followers}
                  onChange={handleInputChange}
                  style={getInputStyle('podcast_ig_followers')}
                  min="0"
                />
                {errors.podcast_ig_followers && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.podcast_ig_followers}</div>}
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>Instagram Engagement Rate (%)</label>
                <input
                  type="number"
                  name="podcast_ig_engagement_rate"
                  value={formData.podcast_ig_engagement_rate}
                  onChange={handleInputChange}
                  style={getInputStyle('podcast_ig_engagement_rate')}
                  min="0"
                  max="100"
                  step="0.1"
                />
                {errors.podcast_ig_engagement_rate && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.podcast_ig_engagement_rate}</div>}
              </div>
            </div>
          </div>

          {/* Platform Links Section */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: theme.textPrimary }}>Platform Links</h3>
            <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 768 ? '1fr' : 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              <div style={formGroupStyle}>
                <label style={labelStyle}>Spotify Channel Name</label>
                <input
                  type="text"
                  name="spotify_channel_name"
                  value={formData.spotify_channel_name}
                  onChange={handleInputChange}
                  style={getInputStyle('spotify_channel_name')}
                />
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>Spotify Channel URL</label>
                <input
                  type="url"
                  name="spotify_channel_url"
                  value={formData.spotify_channel_url}
                  onChange={handleInputChange}
                  style={getInputStyle('spotify_channel_url')}
                  placeholder="https://open.spotify.com/show/..."
                />
                {errors.spotify_channel_url && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.spotify_channel_url}</div>}
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>YouTube Channel Name</label>
                <input
                  type="text"
                  name="youtube_channel_name"
                  value={formData.youtube_channel_name}
                  onChange={handleInputChange}
                  style={getInputStyle('youtube_channel_name')}
                />
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>YouTube Channel URL</label>
                <input
                  type="url"
                  name="youtube_channel_url"
                  value={formData.youtube_channel_url}
                  onChange={handleInputChange}
                  style={getInputStyle('youtube_channel_url')}
                  placeholder="https://youtube.com/channel/..."
                />
                {errors.youtube_channel_url && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.youtube_channel_url}</div>}
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>TikTok</label>
                <input
                  type="text"
                  name="tiktok"
                  value={formData.tiktok}
                  onChange={handleInputChange}
                  style={getInputStyle('tiktok')}
                  placeholder="@yourpodcast"
                />
              </div>
            </div>
          </div>

          {/* Additional Information Section */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: theme.textPrimary }}>Additional Information</h3>
            <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 768 ? '1fr' : 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              <div style={formGroupStyle}>
                <label style={labelStyle}>Call to Action</label>
                <input
                  type="text"
                  name="cta"
                  value={formData.cta}
                  onChange={handleInputChange}
                  style={getInputStyle('cta')}
                  placeholder="e.g., Subscribe now, Listen today"
                />
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>Contact Us to Be on Podcast</label>
                <input
                  type="text"
                  name="contact_us_to_be_on_podcast"
                  value={formData.contact_us_to_be_on_podcast}
                  onChange={handleInputChange}
                  style={getInputStyle('contact_us_to_be_on_podcast')}
                  placeholder="Contact information or instructions"
                />
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>Prominent Guests</label>
                <input
                  type="text"
                  name="podcast_ig_prominent_guests"
                  value={formData.podcast_ig_prominent_guests}
                  onChange={handleInputChange}
                  style={getInputStyle('podcast_ig_prominent_guests')}
                  placeholder="Notable guests or speakers"
                />
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>Podcast Image</label>
                <input
                  type="file"
                  name="image"
                  onChange={handleImageChange}
                  style={fileInputStyle}
                  accept="image/*"
                />
                {errors.image && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.image}</div>}
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
                  placeholder="Additional comments or information (max 500 characters)"
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
              id="recaptcha-container-podcaster"
              style={{ display: 'inline-block' }}
            ></div>
            {errors.recaptcha && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.recaptcha}</div>}
            <div style={{ fontSize: '12px', color: theme.textSecondary, marginTop: '8px' }}>
              Complete the reCAPTCHA verification to submit your podcaster profile.
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
              {loading ? 'Submitting...' : 'Submit Podcaster Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PodcasterSubmissionForm;