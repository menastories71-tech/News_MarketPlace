import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import UserHeader from '../components/common/UserHeader';
import UserFooter from '../components/common/UserFooter';
import Icon from '../components/common/Icon';
import api from '../services/api';
import ReCAPTCHA from 'react-google-recaptcha';

// Theme colors
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

const ArticleSubmissionPage = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Tab state
  const [activeTab, setActiveTab] = useState('submit'); // 'submit' or 'my-submissions'

  // Form state
  const [formData, setFormData] = useState({
    publication_id: '',
    title: '',
    sub_title: '',
    by_line: '',
    tentative_publish_date: '',
    article_text: '',
    website_link: '',
    instagram_link: '',
    facebook_link: '',
    terms_agreed: false
  });

  const [files, setFiles] = useState({
    image1: null,
    image2: null,
    document: null
  });

  const [publications, setPublications] = useState([]);
  const [selectedPublication, setSelectedPublication] = useState(null);
  const [wordCount, setWordCount] = useState(0);
  const [wordLimit, setWordLimit] = useState(500);
  const [imageCount, setImageCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState('');
  const [errors, setErrors] = useState({});
  const [submitStatus, setSubmitStatus] = useState(null); // null, 'success', 'error'
  const [generatedSlug, setGeneratedSlug] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [popupType, setPopupType] = useState(''); // 'success' or 'error'

  // My submissions state
  const [mySubmissions, setMySubmissions] = useState([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
      return;
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Fetch publications
  useEffect(() => {
    if (isAuthenticated) {
      fetchPublications();
      if (activeTab === 'my-submissions') {
        fetchMySubmissions();
      }
    }
  }, [isAuthenticated, activeTab]);

  const fetchPublications = async () => {
    try {
      // Fetch publications from admin publication management
      const response = await api.get('/admin/publication-management');
      // All publication managements are available for selection
      setPublications(response.data.publications || []);
    } catch (error) {
      console.error('Error fetching publications:', error);
    }
  };

  const fetchMySubmissions = async () => {
    try {
      setSubmissionsLoading(true);
      const response = await api.get('/article-submissions/my');
      setMySubmissions(response.data.submissions || []);
    } catch (error) {
      console.error('Error fetching my submissions:', error);
      setMySubmissions([]);
    } finally {
      setSubmissionsLoading(false);
    }
  };

  // Generate slug from title
  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    // Update word count for article text
    if (name === 'article_text') {
      const words = value.trim().split(/\s+/).filter(word => word.length > 0);
      setWordCount(words.length);
    }

    // Generate slug when title changes
    if (name === 'title') {
      const slug = generateSlug(value);
      setGeneratedSlug(slug);
    }
  };

  const handleFileChange = (e) => {
    const { name, files: fileList } = e.target;
    const file = fileList[0];

    if (file) {
      // Validate file size for image1 (10MB limit)
      if (name === 'image1') {
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
          setErrors(prev => ({
            ...prev,
            [name]: 'Image size must not exceed 10 MB'
          }));
          setFiles(prev => ({ ...prev, [name]: null }));
          return;
        }
      }

      // Validate image dimensions for landscape
      if (name === 'image1' || name === 'image2') {
        const img = new Image();
        img.onload = () => {
          if (img.width < img.height) {
            setErrors(prev => ({
              ...prev,
              [name]: 'Image must be in landscape orientation (width > height)'
            }));
            setFiles(prev => ({ ...prev, [name]: null }));
            return;
          }
          setErrors(prev => ({ ...prev, [name]: '' }));
        };
        img.src = URL.createObjectURL(file);
      }
    }

    setFiles(prev => ({
      ...prev,
      [name]: file || null
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handlePublicationSelect = (publicationId) => {
    const pub = publications.find(p => p.id === parseInt(publicationId));
    setSelectedPublication(pub);
    setFormData(prev => ({ ...prev, publication_id: publicationId }));
    setWordLimit(pub?.word_limit || 500);
    setImageCount(pub?.image_count ?? 0);
    setSearchTerm(pub ? pub.publication_name : '');


    if (errors.publication_id) {
      setErrors(prev => ({ ...prev, publication_id: '' }));
    }
  };

  // Calculate total payload size
  const calculateTotalPayloadSize = () => {
    let totalSize = 0;

    // Add form data size (rough estimate)
    const formDataString = JSON.stringify(formData);
    totalSize += new Blob([formDataString]).size;

    // Add file sizes
    Object.values(files).forEach(file => {
      if (file) {
        totalSize += file.size;
      }
    });

    return totalSize;
  };

  const validateForm = () => {
    const newErrors = {};

    // Check total payload size (50MB limit to prevent 413 error)
    const maxPayloadSize = 50 * 1024 * 1024; // 50MB
    const totalSize = calculateTotalPayloadSize();
    if (totalSize > maxPayloadSize) {
      newErrors.payload = `Total upload size (${(totalSize / (1024 * 1024)).toFixed(2)} MB) exceeds the limit of 50 MB. Please reduce file sizes or remove some files.`;
    }

    // Required fields
    const requiredFields = [
      'publication_id', 'title', 'article_text', 'website_link', 'instagram_link', 'facebook_link'
    ];

    requiredFields.forEach(field => {
      if (!formData[field] || formData[field].toString().trim() === '') {
        newErrors[field] = 'This field is required';
      }
    });

    // Title validation: max 12 words, no special chars
    if (formData.title) {
      const words = formData.title.trim().split(/\s+/);
      if (words.length > 12) {
        newErrors.title = 'Title cannot exceed 12 words';
      }
      if (!/^[a-zA-Z0-9\s]+$/.test(formData.title)) {
        newErrors.title = 'Title can only contain letters, numbers, and spaces';
      }
    }

    // Word count validation
    if (wordCount > wordLimit) {
      newErrors.article_text = `Article text exceeds word limit of ${wordLimit} words`;
    }

    // URL validations
    if (formData.website_link && !formData.website_link.match(/^https?:\/\/.+/)) {
      newErrors.website_link = 'Please enter a valid URL starting with http:// or https://';
    }
    if (formData.instagram_link && !formData.instagram_link.match(/^https?:\/\/(www\.)?instagram\.com\/.+/)) {
      newErrors.instagram_link = 'Please enter a valid Instagram URL';
    }
    if (formData.facebook_link && !formData.facebook_link.match(/^https?:\/\/(www\.)?facebook\.com\/.+/)) {
      newErrors.facebook_link = 'Please enter a valid Facebook URL';
    }

    // Terms agreement
    if (!formData.terms_agreed) {
      newErrors.terms_agreed = 'You must accept the terms and conditions';
    }

    // Required files - based on image count
    for (let i = 1; i <= imageCount; i++) {
      if (!files[`image${i}`]) {
        newErrors[`image${i}`] = `Image ${i} is required`;
      }
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
      // Show validation errors in popup
      const errorMessages = Object.values(errors);
      if (errorMessages.length > 0) {
        setPopupMessage(errorMessages.join('\n'));
        setPopupType('error');
        setShowPopup(true);
        setTimeout(() => setShowPopup(false), 5000);
      }
      return;
    }

    setLoading(true);

    try {
      const submitData = new FormData();

      // Add form data with proper formatting
      Object.keys(formData).forEach(key => {
        if (key === 'terms_agreed') {
          // Convert boolean to string for backend validation
          submitData.append(key, formData[key] ? 'true' : 'false');
        } else if (key === 'tentative_publish_date' && formData[key]) {
          // Ensure date is in YYYY-MM-DD format
          const date = new Date(formData[key]);
          const formattedDate = date.toISOString().split('T')[0];
          submitData.append(key, formattedDate);
        } else {
          submitData.append(key, formData[key]);
        }
      });

      // Add files
      if (files.image1) submitData.append('image1', files.image1);
      if (files.image2) submitData.append('image2', files.image2);
      if (files.document) submitData.append('document', files.document);

      submitData.append('recaptcha_token', recaptchaToken);

      await api.post('/article-submissions', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // Show success popup
      setPopupMessage('Article submitted successfully! Your article has been submitted and is pending review.');
      setPopupType('success');
      setShowPopup(true);
      setTimeout(() => {
        setShowPopup(false);
        navigate('/articles');
      }, 3000);

    } catch (error) {
      console.error('Error submitting article:', error);
      console.error('Error response:', error.response?.data);

      let errorMessage = 'Failed to submit article. Please try again.';

      if (error.response?.status === 413) {
        errorMessage = 'Upload size too large. Please reduce file sizes and try again.';
      } else if (error.response?.status === 400) {
        errorMessage = 'Please check your input and try again.';
        if (error.response.data.details) {
          const validationErrors = {};
          error.response.data.details.forEach(detail => {
            validationErrors[detail.path] = detail.msg;
          });
          setErrors(validationErrors);
          console.error('Validation errors:', validationErrors);
          // Show validation errors in popup
          const errorList = Object.values(validationErrors);
          if (errorList.length > 0) {
            errorMessage = 'Validation errors:\n' + errorList.join('\n');
          }
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error;
        }
      }

      // Show error popup
      setPopupMessage(errorMessage);
      setPopupType('error');
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 5000);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: theme.backgroundAlt }}>
        <UserHeader />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Icon name="arrow-path" size="lg" className="animate-spin text-primary mx-auto mb-4" />
            <p style={{ color: theme.textSecondary }}>Loading...</p>
          </div>
        </div>
        <UserFooter />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const filteredPublications = publications.filter(pub =>
    pub.publication_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen" style={{ backgroundColor: theme.backgroundAlt }}>
      <UserHeader />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          {/* Tab Navigation */}
          <div className="mb-8">
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('submit')}
                className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === 'submit'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Submit Article
              </button>
              <button
                onClick={() => setActiveTab('my-submissions')}
                className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === 'my-submissions'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                My Submissions
              </button>
            </div>
          </div>

          {activeTab === 'submit' && (
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-bold mb-4" style={{ color: theme.textPrimary }}>
                  Submit Article
                </h1>
                <p style={{ color: theme.textSecondary }}>
                  Share your article with our network of publications
                </p>
              </div>


          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Publication Selection */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: theme.textPrimary }}>
                Publication <span style={{ color: theme.danger }}>*</span>
                <Icon name="information-circle" size="sm" className="ml-1 inline" title="Select the publication you want to submit to" />
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search and select a publication..."
                  value={selectedPublication ? selectedPublication.publication_name : searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    if (selectedPublication) {
                      setSelectedPublication(null);
                      setFormData(prev => ({ ...prev, publication_id: '' }));
                    }
                  }}
                  onFocus={() => setShowDropdown(true)}
                  onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  style={{ borderColor: errors.publication_id ? theme.danger : theme.borderLight, backgroundColor: theme.background }}
                />
                {showDropdown && !selectedPublication && filteredPublications.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {filteredPublications.map(pub => (
                      <div
                        key={pub.id}
                        className="px-4 py-3 hover:bg-gray-100 cursor-pointer"
                        onClick={() => {
                          handlePublicationSelect(pub.id.toString());
                          setShowDropdown(false);
                        }}
                      >
                        <div className="font-medium">{pub.publication_name}</div>
                        <div className="text-sm text-gray-500">Word limit: {pub.word_limit || 500}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {errors.publication_id && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.publication_id}</div>}
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: theme.textPrimary }}>
                Title <span style={{ color: theme.danger }}>*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                style={{ borderColor: errors.title ? theme.danger : theme.borderLight, backgroundColor: theme.background }}
                placeholder="Enter article title (max 12 words)"
              />
              {errors.title && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.title}</div>}
            </div>

            {/* Slug (Auto-generated) */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: theme.textPrimary }}>
                URL Slug (Auto-generated)
              </label>
              <input
                type="text"
                value={generatedSlug}
                readOnly
                className="w-full px-4 py-3 border rounded-lg bg-gray-50"
                style={{ borderColor: theme.borderLight, backgroundColor: '#f9f9f9', color: theme.textSecondary }}
                placeholder="Slug will be generated from title"
              />
              <div style={{ fontSize: '12px', color: theme.textSecondary, marginTop: '4px' }}>
                This will be used in the article URL
              </div>
            </div>

            {/* Subtitle */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: theme.textPrimary }}>
                Subtitle
                <Icon name="information-circle" size="sm" className="ml-1 inline" title="Not guaranteed" />
              </label>
              <input
                type="text"
                name="sub_title"
                value={formData.sub_title}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                style={{ borderColor: theme.borderLight, backgroundColor: theme.background }}
                placeholder="Enter article subtitle"
              />
            </div>

            {/* By Line */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: theme.textPrimary }}>
                By Line
                <Icon name="information-circle" size="sm" className="ml-1 inline" title="Not guaranteed" />
              </label>
              <input
                type="text"
                name="by_line"
                value={formData.by_line}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                style={{ borderColor: theme.borderLight, backgroundColor: theme.background }}
                placeholder="Enter author name"
              />
            </div>

            {/* Tentative Publish Date */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: theme.textPrimary }}>
                Tentative Publish Date
                <Icon name="information-circle" size="sm" className="ml-1 inline" title="Not guaranteed" />
              </label>
              <input
                type="date"
                name="tentative_publish_date"
                value={formData.tentative_publish_date}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                style={{ borderColor: theme.borderLight, backgroundColor: theme.background }}
              />
            </div>

            {/* Article Text */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: theme.textPrimary }}>
                Article Text <span style={{ color: theme.danger }}>*</span>
              </label>
              <textarea
                name="article_text"
                value={formData.article_text}
                onChange={handleInputChange}
                rows={10}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                style={{ borderColor: errors.article_text ? theme.danger : theme.borderLight, backgroundColor: theme.background }}
                placeholder="Enter your article content"
              />
              <div className="flex justify-between mt-2">
                <div style={{ fontSize: '12px', color: theme.textSecondary }}>
                  Word count: {wordCount} / {wordLimit}
                </div>
                {wordCount > wordLimit && (
                  <div style={{ color: theme.danger, fontSize: '12px' }}>
                    Exceeds limit by {wordCount - wordLimit} words
                  </div>
                )}
              </div>
              {errors.article_text && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.article_text}</div>}
            </div>

            {/* Image Upload Section - Dynamic based on publication requirements */}
            {imageCount > 0 && (
              <>
                {Array.from({ length: imageCount }, (_, index) => {
                  const imageNum = index + 1;
                  const imageKey = `image${imageNum}`;
                  return (
                    <div key={imageKey}>
                      <label className="block text-sm font-medium mb-2" style={{ color: theme.textPrimary }}>
                        Image {imageNum} <span style={{ color: theme.danger }}>*</span>
                        <Icon name="information-circle" size="sm" className="ml-1 inline" title="only landscape mode - portrait mode not allowed. Logos, thumbnail, icons and text in image not allowed. Restrict the size limit to 10 MB" />
                      </label>
                      <input
                        type="file"
                        name={imageKey}
                        onChange={handleFileChange}
                        accept="image/*"
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                        style={{ borderColor: errors[imageKey] ? theme.danger : theme.borderLight, backgroundColor: theme.background }}
                      />
                      <div style={{ fontSize: '12px', color: theme.textSecondary, marginTop: '4px' }}>
                        Must be landscape orientation (width greater than height), high resolution recommended. Size limit: 10 MB. No logos, thumbnails, icons, or text in image.
                      </div>
                      {errors[imageKey] && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors[imageKey]}</div>}
                    </div>
                  );
                })}
              </>
            )}


            {/* Website Link */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: theme.textPrimary }}>
                Website Link <span style={{ color: theme.danger }}>*</span>
                <Icon name="information-circle" size="sm" className="ml-1 inline" title="Required website link" />
              </label>
              <input
                type="url"
                name="website_link"
                value={formData.website_link}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                style={{ borderColor: errors.website_link ? theme.danger : theme.borderLight, backgroundColor: theme.background }}
                placeholder="https://example.com"
              />
              {errors.website_link && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.website_link}</div>}
            </div>

            {/* Instagram Link */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: theme.textPrimary }}>
                Instagram Link <span style={{ color: theme.danger }}>*</span>
              </label>
              <input
                type="url"
                name="instagram_link"
                value={formData.instagram_link}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                style={{ borderColor: errors.instagram_link ? theme.danger : theme.borderLight, backgroundColor: theme.background }}
                placeholder="https://instagram.com/username"
              />
              {errors.instagram_link && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.instagram_link}</div>}
            </div>

            {/* Facebook Link */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: theme.textPrimary }}>
                Facebook Link <span style={{ color: theme.danger }}>*</span>
              </label>
              <input
                type="url"
                name="facebook_link"
                value={formData.facebook_link}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                style={{ borderColor: errors.facebook_link ? theme.danger : theme.borderLight, backgroundColor: theme.background }}
                placeholder="https://facebook.com/username"
              />
              {errors.facebook_link && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.facebook_link}</div>}
            </div>

            {/* Upload Document */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: theme.textPrimary }}>
                Upload Document
              </label>
              <input
                type="file"
                name="document"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx"
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                style={{ borderColor: errors.document ? theme.danger : theme.borderLight, backgroundColor: theme.background }}
              />
              <div style={{ fontSize: '12px', color: theme.textSecondary, marginTop: '4px' }}>
                Optional: Upload a PDF or Word document
              </div>
              {errors.document && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.document}</div>}
            </div>

            {/* Terms Checkbox */}
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="terms_agreed"
                  checked={formData.terms_agreed}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <span style={{ color: theme.textPrimary, fontSize: '14px' }}>
                  I accept the <a href="/terms-and-conditions" target="_blank" rel="noopener noreferrer" style={{ color: theme.primary }}>Terms and Conditions</a> <span style={{ color: theme.danger }}>*</span>
                </span>
              </label>
              {errors.terms_agreed && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.terms_agreed}</div>}
            </div>

            {/* reCAPTCHA */}
            <div>
              <ReCAPTCHA
                sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY || "6LdNzrErAAAAAB1EB7ETPEhUrynf0wSQftMt-COT"}
                onChange={(token) => {
                  setRecaptchaToken(token);
                  if (errors.recaptcha) {
                    setErrors(prev => ({ ...prev, recaptcha: '' }));
                  }
                }}
                onExpired={() => {
                  setRecaptchaToken('');
                  setErrors(prev => ({ ...prev, recaptcha: 'reCAPTCHA expired. Please try again.' }));
                }}
                onError={() => {
                  setRecaptchaToken('');
                  setErrors(prev => ({ ...prev, recaptcha: 'reCAPTCHA error. Please try again.' }));
                }}
              />
              {errors.recaptcha && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.recaptcha}</div>}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="px-6 py-3 border rounded-lg font-medium transition-colors"
                style={{ borderColor: theme.borderLight, color: theme.textPrimary, backgroundColor: theme.background }}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3 rounded-lg font-medium text-white transition-colors"
                style={{ backgroundColor: theme.primary }}
                disabled={loading}
                onMouseEnter={(e) => e.target.style.backgroundColor = theme.primaryDark}
                onMouseLeave={(e) => e.target.style.backgroundColor = theme.primary}
              >
                {loading ? 'Submitting...' : 'Submit Article'}
              </button>
            </div>
          </form>
          </>
          )}

         {activeTab === 'my-submissions' && (
            <div>
              <div className="mb-8">
                <h1 className="text-3xl font-bold mb-4" style={{ color: theme.textPrimary }}>
                  My Submissions
                </h1>
                <p style={{ color: theme.textSecondary }}>
                  View all your article submissions and their status
                </p>
              </div>

              {submissionsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Icon name="arrow-path" size="lg" className="animate-spin text-primary mx-auto" />
                  <span className="ml-2" style={{ color: theme.textSecondary }}>Loading submissions...</span>
                </div>
              ) : mySubmissions.length === 0 ? (
                <div className="text-center py-12">
                  <Icon name="document-text" size="lg" className="mx-auto mb-4" style={{ color: theme.textDisabled }} />
                  <h3 className="text-lg font-medium mb-2" style={{ color: theme.textPrimary }}>No submissions yet</h3>
                  <p style={{ color: theme.textSecondary }}>You haven't submitted any articles yet.</p>
                  <button
                    onClick={() => setActiveTab('submit')}
                    className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Submit Your First Article
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {mySubmissions.map((submission) => (
                    <div key={submission.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold mb-2" style={{ color: theme.textPrimary }}>
                            {submission.title}
                          </h3>
                          <p className="text-sm mb-2" style={{ color: theme.textSecondary }}>
                            Submitted to: <span className="font-medium">{submission.publication_name}</span>
                          </p>
                          <p className="text-sm" style={{ color: theme.textSecondary }}>
                            Submitted on: {new Date(submission.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="ml-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              submission.status === 'approved'
                                ? 'bg-green-100 text-green-800'
                                : submission.status === 'rejected'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                          </span>
                        </div>
                      </div>

                      {submission.sub_title && (
                        <p className="text-sm mb-2" style={{ color: theme.textSecondary }}>
                          <strong>Subtitle:</strong> {submission.sub_title}
                        </p>
                      )}

                      {submission.article_text && (
                        <div className="mt-4">
                          <p className="text-sm line-clamp-3" style={{ color: theme.textSecondary }}>
                            {submission.article_text.substring(0, 200)}...
                          </p>
                        </div>
                      )}

                      {submission.status === 'approved' && submission.published_url && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <a
                            href={submission.published_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            <Icon name="external-link" size="sm" className="mr-1" />
                            View Published Article
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Popup for success/error messages */}
      {showPopup && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          backgroundColor: theme.background,
          border: `1px solid ${popupType === 'success' ? theme.success : theme.danger}`,
          borderRadius: '8px',
          padding: '16px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          zIndex: 1000,
          maxWidth: '400px',
          animation: 'slideIn 0.3s ease-out'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <Icon
              name={popupType === 'success' ? 'check-circle' : 'exclamation-triangle'}
              size="3x"
              style={{ color: popupType === 'success' ? theme.success : theme.danger }}
            />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: '600', color: popupType === 'success' ? theme.success : theme.danger, marginBottom: '8px' }}>
                {popupType === 'success' ? 'Success!' : 'Error!'}
              </div>
              <div style={{ fontSize: '14px', color: theme.textSecondary, whiteSpace: 'pre-line' }}>
                {popupMessage}
              </div>
            </div>
            <button
              onClick={() => setShowPopup(false)}
              style={{
                background: 'transparent',
                border: 'none',
                fontSize: '18px',
                cursor: 'pointer',
                color: theme.textSecondary,
                padding: '0',
                marginLeft: 'auto'
              }}
            >
              ×
            </button>
          </div>
        </div>
      )}

      <UserFooter />
    </div>
  );
};

export default ArticleSubmissionPage;

