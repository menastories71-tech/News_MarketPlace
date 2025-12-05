import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAdminAuth } from '../../context/AdminAuthContext';
import Icon from '../common/Icon';
import Sidebar from './Sidebar';
import api from '../../services/api';
import ReCAPTCHA from 'react-google-recaptcha';
import {
  Plus, Eye, Edit, Trash2, Search, Filter, CheckCircle2, XCircle,
  AlertCircle, Info, FileText, User, Newspaper, Calendar, Tag
} from 'lucide-react';

// Article Submission View Modal Component
const ArticleSubmissionViewModal = ({ isOpen, onClose, submission }) => {
  if (!isOpen || !submission) return null;

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

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div style={modalStyle} onClick={onClose}>
      <div style={contentStyle} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '800' }}>
            Article Submission Details
          </h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', fontSize: '24px', cursor: 'pointer' }}>
            ×
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
          <div>
            <strong>ID:</strong> {submission.id}
          </div>
          <div>
            <strong>Title:</strong> {submission.title}
          </div>
          <div>
            <strong>Subtitle:</strong> {submission.sub_title || 'N/A'}
          </div>
          <div>
            <strong>By Line:</strong> {submission.by_line || 'N/A'}
          </div>
          <div>
            <strong>Publication:</strong> {submission.publication?.publication_name || 'Not Assigned'}
          </div>
          <div>
            <strong>User:</strong> {submission.user?.first_name} {submission.user?.last_name} ({submission.user?.email})
          </div>
          <div>
            <strong>Status:</strong>
            <span style={{
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: 'bold',
              color: submission.status === 'approved' ? '#4CAF50' :
                     submission.status === 'rejected' ? '#F44336' : '#FF9800',
              backgroundColor: submission.status === 'approved' ? '#E8F5E8' :
                              submission.status === 'rejected' ? '#FFEBEE' : '#FFF3E0'
            }}>
              {submission.status.toUpperCase()}
            </span>
          </div>
          <div>
            <strong>Tentative Publish Date:</strong> {formatDate(submission.tentative_publish_date)}
          </div>
          <div>
            <strong>Created At:</strong> {formatDate(submission.created_at)}
          </div>
          <div>
            <strong>Updated At:</strong> {formatDate(submission.updated_at)}
          </div>
        </div>

        <div style={{ marginTop: '24px' }}>
          <strong>Article Text:</strong>
          <p style={{ marginTop: '8px', whiteSpace: 'pre-wrap', backgroundColor: '#f9f9f9', padding: '12px', borderRadius: '4px' }}>
            {submission.article_text}
          </p>
        </div>

        {(submission.website_link || submission.instagram_link || submission.facebook_link) && (
          <div style={{ marginTop: '24px' }}>
            <strong>Social Links:</strong>
            <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {submission.website_link && (
                <a href={submission.website_link} target="_blank" rel="noopener noreferrer" style={{ color: '#1976D2', textDecoration: 'none' }}>
                  Website: {submission.website_link}
                </a>
              )}
              {submission.instagram_link && (
                <a href={submission.instagram_link} target="_blank" rel="noopener noreferrer" style={{ color: '#1976D2', textDecoration: 'none' }}>
                  Instagram: {submission.instagram_link}
                </a>
              )}
              {submission.facebook_link && (
                <a href={submission.facebook_link} target="_blank" rel="noopener noreferrer" style={{ color: '#1976D2', textDecoration: 'none' }}>
                  Facebook: {submission.facebook_link}
                </a>
              )}
            </div>
          </div>
        )}

        {(submission.image1 || submission.image2) && (
          <div style={{ marginTop: '24px' }}>
            <strong>Images:</strong>
            <div style={{ marginTop: '8px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {submission.image1 && (
                <img
                  src={submission.image1}
                  alt="Article Image 1"
                  style={{ maxWidth: '200px', maxHeight: '150px', borderRadius: '4px', border: '1px solid #ddd' }}
                />
              )}
              {submission.image2 && (
                <img
                  src={submission.image2}
                  alt="Article Image 2"
                  style={{ maxWidth: '200px', maxHeight: '150px', borderRadius: '4px', border: '1px solid #ddd' }}
                />
              )}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '32px' }}>
          <button
            onClick={onClose}
            style={{
              paddingTop: '10px',
              paddingBottom: '10px',
              paddingLeft: '20px',
              paddingRight: '20px',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer',
              border: '1px solid #d1d5db',
              backgroundColor: '#f3f4f6',
              color: '#374151'
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// Article Submission Create Modal Component
const ArticleSubmissionCreateModal = ({ isOpen, onClose, onSave }) => {
  const recaptchaRef = useRef(null);
  const [formData, setFormData] = useState({
    publication_id: '',
    title: '',
    sub_title: '',
    by_line: '',
    tentative_publish_date: '',
    article_text: '',
    image1: null,
    image2: null,
    website_link: '',
    instagram_link: '',
    facebook_link: '',
    recaptcha_token: '',
    terms_agreed: false
  });
  const [publications, setPublications] = useState([]);
  const [publicationSearch, setPublicationSearch] = useState('');
  const [filteredPublications, setFilteredPublications] = useState([]);
  const [wordLimit, setWordLimit] = useState(500);
  const [wordCount, setWordCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [image1Preview, setImage1Preview] = useState(null);
  const [image2Preview, setImage2Preview] = useState(null);
  const [generatedSlug, setGeneratedSlug] = useState('');

  // Generate slug from title
  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  };

  useEffect(() => {
    if (isOpen) {
      fetchPublications();
      setFormData({
        publication_id: '',
        title: '',
        sub_title: '',
        by_line: '',
        tentative_publish_date: '',
        article_text: '',
        image1: null,
        image2: null,
        website_link: '',
        instagram_link: '',
        facebook_link: '',
        recaptcha_token: '',
        terms_agreed: false
      });
      setWordLimit(500);
      setWordCount(0);
      setImage1Preview(null);
      setImage2Preview(null);
      setGeneratedSlug('');
      if (recaptchaRef.current) {
        recaptchaRef.current.reset();
      }
    }
  }, [isOpen]);

  useEffect(() => {
    const filtered = publications.filter(pub =>
      pub.publication_name.toLowerCase().includes(publicationSearch.toLowerCase())
    );
    setFilteredPublications(filtered);
  }, [publications, publicationSearch]);

  const fetchPublications = async () => {
    try {
      const response = await api.get('/admin/publication-managements');
      setPublications(response.data.publications || []);
    } catch (error) {
      console.error('Error fetching publications:', error);
    }
  };

  const handlePublicationChange = (pubId) => {
    const selectedPub = publications.find(p => p.id === parseInt(pubId));
    if (selectedPub) {
      setWordLimit(selectedPub.word_limit || 500);
      setFormData({ ...formData, publication_id: pubId });
    }
  };

  const handleTitleChange = (value) => {
    const words = value.trim().split(/\s+/);
    if (words.length <= 12 && !/[^a-zA-Z0-9\s]/.test(value)) {
      setFormData({ ...formData, title: value });
      // Generate slug when title changes
      const slug = generateSlug(value);
      setGeneratedSlug(slug);
    }
  };

  const handleArticleTextChange = (value) => {
    const words = value.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
    if (words.length <= wordLimit) {
      setFormData({ ...formData, article_text: value });
    }
  };

  const validateImage = (file) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const isLandscape = img.width > img.height;
        const isHighRes = img.width >= 1000 && img.height >= 600;
        resolve(isLandscape && isHighRes);
      };
      img.src = URL.createObjectURL(file);
    });
  };

  const handleImage1Change = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const isValid = await validateImage(file);
      if (isValid) {
        setFormData({ ...formData, image1: file });
        setImage1Preview(URL.createObjectURL(file));
      } else {
        alert('Image must be landscape orientation and high resolution (min 1000x600px)');
        e.target.value = '';
      }
    }
  };

  const handleImage2Change = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const isValid = await validateImage(file);
      if (isValid) {
        setFormData({ ...formData, image2: file });
        setImage2Preview(URL.createObjectURL(file));
      } else {
        alert('Image must be landscape orientation and high resolution (min 1000x600px)');
        e.target.value = '';
      }
    }
  };

  const validateUrl = (url, type) => {
    if (!url) return true; // Optional fields

    try {
      const parsedUrl = new URL(url);
      if (type === 'website') {
        return parsedUrl.protocol === 'https:' && !url.includes('?');
      } else if (type === 'instagram') {
        return (parsedUrl.hostname === 'instagram.com' || parsedUrl.hostname === 'www.instagram.com') && !url.includes('?');
      } else if (type === 'facebook') {
        return parsedUrl.hostname === 'www.facebook.com';
      }
    } catch {
      return false;
    }
    return false;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.publication_id) {
      alert('Please select a publication');
      return;
    }
    if (!formData.title.trim()) {
      alert('Title is required');
      return;
    }
    if (!formData.article_text.trim()) {
      alert('Article text is required');
      return;
    }
    if (!formData.image1) {
      alert('Primary image is required');
      return;
    }
    if (!formData.recaptcha_token) {
      alert('Please complete the captcha verification');
      return;
    }
    if (!formData.terms_agreed) {
      alert('Please agree to the terms and conditions');
      return;
    }

    // URL validations
    if (formData.website_link && !validateUrl(formData.website_link, 'website')) {
      alert('Invalid website URL format. Must be https:// and no question marks.');
      return;
    }
    if (formData.instagram_link && !validateUrl(formData.instagram_link, 'instagram')) {
      alert('Invalid Instagram URL format. Must be https://instagram.com/username or https://www.instagram.com/username');
      return;
    }
    if (formData.facebook_link && !validateUrl(formData.facebook_link, 'facebook')) {
      alert('Invalid Facebook URL format. Must be https://www.facebook.com/...');
      return;
    }

    setLoading(true);

    try {
      const submitData = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== undefined && formData[key] !== '') {
          if (key === 'image1' || key === 'image2') {
            submitData.append(key, formData[key]);
          } else {
            submitData.append(key, formData[key]);
          }
        }
      });

      await api.post('/article-submissions', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      onSave();
      onClose();
    } catch (error) {
      console.error('Error creating submission:', error);
      const message = error.response?.data?.message || error.message || 'Error creating submission. Please try again.';
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

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
    maxWidth: '700px',
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
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    boxSizing: 'border-box'
  };

  const selectStyle = {
    ...inputStyle,
    backgroundColor: '#fff'
  };

  const buttonStyle = {
    paddingTop: '10px',
    paddingBottom: '10px',
    paddingLeft: '20px',
    paddingRight: '20px',
    borderRadius: '8px',
    fontWeight: '600',
    cursor: 'pointer',
    border: 'none',
    marginRight: '12px'
  };

  return (
    <div style={modalStyle} onClick={onClose}>
      <div style={contentStyle} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '800' }}>
            Create New Article Submission
          </h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', fontSize: '24px', cursor: 'pointer' }}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Publication Selection with Search */}
          <div style={formGroupStyle}>
            <label style={labelStyle}>Publication Name *</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Search publications..."
                value={publicationSearch}
                onChange={(e) => setPublicationSearch(e.target.value)}
                style={{
                  ...inputStyle,
                  paddingRight: '40px',
                  marginBottom: '8px'
                }}
              />
              <div style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#757575'
              }}>
                <Search className="w-5 h-5" />
              </div>
            </div>
            <select
              value={formData.publication_id}
              onChange={(e) => handlePublicationChange(e.target.value)}
              style={selectStyle}
              required
            >
              <option value="">Select a publication</option>
              {filteredPublications.map(pub => (
                <option key={pub.id} value={pub.id}>
                  {pub.publication_name} (Word limit: {pub.word_limit || 500})
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div style={formGroupStyle}>
            <label style={labelStyle}>Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              style={inputStyle}
              placeholder="Enter title (max 12 words, no special characters)"
              required
            />
            <small style={{ color: '#757575', fontSize: '12px' }}>
              {formData.title.trim().split(/\s+/).filter(word => word.length > 0).length}/12 words
            </small>
          </div>

          {/* Slug (Auto-generated) */}
          <div style={formGroupStyle}>
            <label style={labelStyle}>URL Slug (Auto-generated)</label>
            <input
              type="text"
              value={generatedSlug}
              readOnly
              style={{ ...inputStyle, backgroundColor: '#f9f9f9', color: '#757575' }}
              placeholder="Slug will be generated from title"
            />
            <small style={{ color: '#757575', fontSize: '12px' }}>
              This will be used in the article URL
            </small>
          </div>

          {/* Subtitle with Info Icon */}
          <div style={formGroupStyle}>
            <label style={labelStyle}>
              Sub Title
              <Info className="w-4 h-4 inline ml-1 text-[#9C27B0] cursor-help" title="Not guaranteed - will be included only if confirmed after order confirmation" />
            </label>
            <input
              type="text"
              value={formData.sub_title}
              onChange={(e) => setFormData({ ...formData, sub_title: e.target.value })}
              style={inputStyle}
              placeholder="Enter subtitle"
            />
          </div>

          {/* By Line with Info Icon */}
          <div style={formGroupStyle}>
            <label style={labelStyle}>
              By Line / Author Name
              <Info className="w-4 h-4 inline ml-1 text-[#9C27B0] cursor-help" title="Not guaranteed - will be included only if confirmed after order confirmation" />
            </label>
            <input
              type="text"
              value={formData.by_line}
              onChange={(e) => setFormData({ ...formData, by_line: e.target.value })}
              style={inputStyle}
              placeholder="Enter author name"
            />
          </div>

          {/* Tentative Publish Date with Info Icon */}
          <div style={formGroupStyle}>
            <label style={labelStyle}>
              Tentative Article Publish Date
              <Info className="w-4 h-4 inline ml-1 text-[#9C27B0] cursor-help" title="Not guaranteed - date will be as per turnaround time mentioned in publication page and order confirmation" />
            </label>
            <input
              type="date"
              value={formData.tentative_publish_date}
              onChange={(e) => setFormData({ ...formData, tentative_publish_date: e.target.value })}
              style={inputStyle}
              required
            />
          </div>

          {/* Article Text with Word Count */}
          <div style={formGroupStyle}>
            <label style={labelStyle}>Article Text *</label>
            <textarea
              value={formData.article_text}
              onChange={(e) => handleArticleTextChange(e.target.value)}
              style={{
                ...inputStyle,
                minHeight: '150px',
                resize: 'vertical',
                borderColor: wordCount > wordLimit ? '#F44336' : wordCount === wordLimit ? '#FF9800' : '#d1d5db'
              }}
              placeholder={`Enter article text (max ${wordLimit} words)`}
              required
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
              <small style={{
                color: wordCount > wordLimit ? '#F44336' : wordCount === wordLimit ? '#FF9800' : '#757575',
                fontSize: '12px'
              }}>
                {wordCount}/{wordLimit} words
                {wordCount > wordLimit && ' - Please reduce the word count'}
              </small>
            </div>
          </div>

          {/* Image Uploads */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
            <div style={formGroupStyle}>
              <label style={labelStyle}>Image Upload *</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImage1Change}
                style={{ ...inputStyle, padding: '8px' }}
                required
              />
              <small style={{ color: '#757575', fontSize: '12px' }}>
                Landscape image only, high resolution (min 1000x600px)
              </small>
              {image1Preview && (
                <img
                  src={image1Preview}
                  alt="Preview"
                  style={{ maxWidth: '200px', maxHeight: '120px', marginTop: '8px', borderRadius: '4px' }}
                />
              )}
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>
                Image Upload
                <Info className="w-4 h-4 inline ml-1 text-[#9C27B0] cursor-help" title="Not guaranteed" />
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImage2Change}
                style={{ ...inputStyle, padding: '8px' }}
              />
              <small style={{ color: '#757575', fontSize: '12px' }}>
                Optional landscape image, high resolution
              </small>
              {image2Preview && (
                <img
                  src={image2Preview}
                  alt="Preview"
                  style={{ maxWidth: '200px', maxHeight: '120px', marginTop: '8px', borderRadius: '4px' }}
                />
              )}
            </div>
          </div>

          {/* Social Links */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
            <div style={formGroupStyle}>
              <label style={labelStyle}>
                Website Link
                <Info className="w-4 h-4 inline ml-1 text-[#9C27B0] cursor-help" title="Format: https://www.example.com (no question marks)" />
              </label>
              <input
                type="url"
                value={formData.website_link}
                onChange={(e) => setFormData({ ...formData, website_link: e.target.value })}
                style={inputStyle}
                placeholder="https://www.example.com"
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>
                Instagram Link
                <Info className="w-4 h-4 inline ml-1 text-[#9C27B0] cursor-help" title="Format: https://www.instagram.com/username (no question marks)" />
              </label>
              <input
                type="url"
                value={formData.instagram_link}
                onChange={(e) => setFormData({ ...formData, instagram_link: e.target.value })}
                style={inputStyle}
                placeholder="https://www.instagram.com/username"
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Facebook Link</label>
              <input
                type="url"
                value={formData.facebook_link}
                onChange={(e) => setFormData({ ...formData, facebook_link: e.target.value })}
                style={inputStyle}
                placeholder="https://www.facebook.com/..."
              />
            </div>
          </div>

          {/* reCAPTCHA */}
          <div style={formGroupStyle}>
            <label style={labelStyle}>Security Verification *</label>
            <div className="flex justify-center lg:justify-start">
              <div className="overflow-x-auto">
                <ReCAPTCHA
                  ref={recaptchaRef}
                  sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY || "6LdNzrErAAAAAB1EB7ETPEhUrynf0wSQftMt-COT"}
                  onChange={(token) => {
                    setFormData({ ...formData, recaptcha_token: token });
                  }}
                  onExpired={() => {
                    setFormData({ ...formData, recaptcha_token: '' });
                  }}
                  onError={() => {
                    setFormData({ ...formData, recaptcha_token: '' });
                  }}
                  size={typeof window !== 'undefined' && window.innerWidth < 400 ? "compact" : "normal"}
                  theme="light"
                />
              </div>
            </div>
          </div>

          {/* Terms and Conditions */}
          <div style={formGroupStyle}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={formData.terms_agreed}
                onChange={(e) => setFormData({ ...formData, terms_agreed: e.target.checked })}
                style={{ width: '16px', height: '16px' }}
                required
              />
              <span style={{ fontSize: '14px', color: '#212121' }}>
                I agree to the <a href="/terms-and-conditions" target="_blank" style={{ color: '#1976D2', textDecoration: 'none' }}>Terms and Conditions</a>
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '32px', gap: '12px' }}>
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
              style={{
                ...buttonStyle,
                backgroundColor: wordCount > wordLimit ? '#BDBDBD' : '#1976D2',
                color: '#fff',
                cursor: wordCount > wordLimit ? 'not-allowed' : 'pointer'
              }}
              disabled={loading || wordCount > wordLimit}
            >
              {loading ? 'Creating...' : wordCount > wordLimit ? `Reduce words (${wordCount - wordLimit} over limit)` : 'Create Submission'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Article Submission Edit Modal Component
const ArticleSubmissionEditModal = ({ isOpen, onClose, submission, onSave }) => {
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
      delete_image1: false,
      delete_image2: false
    });
    const [publications, setPublications] = useState([]);
    const [publicationSearch, setPublicationSearch] = useState('');
    const [filteredPublications, setFilteredPublications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [image1File, setImage1File] = useState(null);
    const [image2File, setImage2File] = useState(null);
    const [image1Preview, setImage1Preview] = useState(null);
    const [image2Preview, setImage2Preview] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchPublications();
      if (submission) {
        const formatDateForInput = (dateString) => {
          if (!dateString) return '';
          try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return '';
            return date.toISOString().split('T')[0];
          } catch {
            return '';
          }
        };

        setFormData({
          publication_id: submission.publication_id ? String(submission.publication_id) : '',
          title: submission.title || '',
          sub_title: submission.sub_title || '',
          by_line: submission.by_line || '',
          tentative_publish_date: formatDateForInput(submission.tentative_publish_date),
          article_text: submission.article_text || '',
          website_link: submission.website_link || '',
          instagram_link: submission.instagram_link || '',
          facebook_link: submission.facebook_link || '',
          delete_image1: false,
          delete_image2: false
        });
      }
      setPublicationSearch('');
      setImage1File(null);
      setImage2File(null);
      setImage1Preview(null);
      setImage2Preview(null);
    }
  }, [submission, isOpen]);

  useEffect(() => {
    const filtered = publications.filter(pub =>
      pub.publication_name.toLowerCase().includes(publicationSearch.toLowerCase())
    );
    setFilteredPublications(filtered);
  }, [publications, publicationSearch]);

  const fetchPublications = async () => {
    try {
      const response = await api.get('/admin/publication-management');
      setPublications(response.data.publications || []);
    } catch (error) {
      console.error('Error fetching publications:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = new FormData();

      // Add form data
      Object.keys(formData).forEach(key => {
        if (formData[key] !== undefined && formData[key] !== null && formData[key] !== '') {
          submitData.append(key, formData[key]);
        }
      });

      // Add image files if uploaded
      if (image1File) {
        submitData.append('image1', image1File);
      }
      if (image2File) {
        submitData.append('image2', image2File);
      }

      await api.put(`/admin/article-submissions/${submission.id}`, submitData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      onSave();
      onClose();
    } catch (error) {
      console.error('Error updating submission:', error);
      const message = error.response?.data?.message || error.message || 'Error updating submission. Please try again.';
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  const handlePublicationChange = (pubId) => {
    setFormData({ ...formData, publication_id: pubId || '' });
  };

  const validateImage = (file) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const isLandscape = img.width > img.height;
        const isHighRes = img.width >= 1000 && img.height >= 600;
        resolve(isLandscape && isHighRes);
      };
      img.src = URL.createObjectURL(file);
    });
  };

  const handleImage1Change = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const isValid = await validateImage(file);
      if (isValid) {
        setImage1File(file);
        setImage1Preview(URL.createObjectURL(file));
        setFormData({ ...formData, delete_image1: false }); // Uncheck delete when uploading new
      } else {
        alert('Image must be landscape orientation and high resolution (min 1000x600px)');
        e.target.value = '';
      }
    }
  };

  const handleImage2Change = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const isValid = await validateImage(file);
      if (isValid) {
        setImage2File(file);
        setImage2Preview(URL.createObjectURL(file));
        setFormData({ ...formData, delete_image2: false }); // Uncheck delete when uploading new
      } else {
        alert('Image must be landscape orientation and high resolution (min 1000x600px)');
        e.target.value = '';
      }
    }
  };

  if (!isOpen) return null;

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
    maxWidth: '700px',
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
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    boxSizing: 'border-box'
  };

  const selectStyle = {
    ...inputStyle,
    backgroundColor: '#fff'
  };

  const buttonStyle = {
    paddingTop: '10px',
    paddingBottom: '10px',
    paddingLeft: '20px',
    paddingRight: '20px',
    borderRadius: '8px',
    fontWeight: '600',
    cursor: 'pointer',
    border: 'none',
    marginRight: '12px'
  };

  return (
    <div style={modalStyle} onClick={onClose}>
      <div style={contentStyle} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '800' }}>
            Edit Article Submission
          </h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', fontSize: '24px', cursor: 'pointer' }}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
           {/* Publication Selection with Search */}
           <div style={formGroupStyle}>
             <label style={labelStyle}>Publication Name</label>
             <div style={{ position: 'relative' }}>
               <input
                 type="text"
                 placeholder="Search publications..."
                 value={publicationSearch}
                 onChange={(e) => setPublicationSearch(e.target.value)}
                 style={{
                   ...inputStyle,
                   paddingRight: '40px',
                   marginBottom: '8px'
                 }}
               />
               <div style={{
                 position: 'absolute',
                 right: '12px',
                 top: '50%',
                 transform: 'translateY(-50%)',
                 color: '#757575'
               }}>
                 <Search className="w-5 h-5" />
               </div>
             </div>
             <select
               value={formData.publication_id || ''}
               onChange={(e) => handlePublicationChange(e.target.value)}
               style={selectStyle}
             >
               <option value="">Select a publication</option>
               {filteredPublications.map(pub => (
                 <option key={pub.id} value={pub.id}>
                   {pub.publication_name} (Word limit: {pub.word_limit || 500})
                 </option>
               ))}
             </select>
             {submission.publication && (
               <small style={{ color: '#757575', fontSize: '12px' }}>
                 Current: {submission.publication.publication_name}
               </small>
             )}
           </div>

           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
             <div style={formGroupStyle}>
               <label style={labelStyle}>Title *</label>
               <input
                 type="text"
                 value={formData.title}
                 onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                 style={inputStyle}
                 required
               />
             </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Subtitle</label>
              <input
                type="text"
                value={formData.sub_title}
                onChange={(e) => setFormData({ ...formData, sub_title: e.target.value })}
                style={inputStyle}
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>By Line</label>
              <input
                type="text"
                value={formData.by_line}
                onChange={(e) => setFormData({ ...formData, by_line: e.target.value })}
                style={inputStyle}
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Tentative Publish Date</label>
              <input
                type="date"
                value={formData.tentative_publish_date}
                onChange={(e) => setFormData({ ...formData, tentative_publish_date: e.target.value })}
                style={inputStyle}
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Website Link</label>
              <input
                type="url"
                value={formData.website_link}
                onChange={(e) => setFormData({ ...formData, website_link: e.target.value })}
                style={inputStyle}
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Instagram Link</label>
              <input
                type="url"
                value={formData.instagram_link}
                onChange={(e) => setFormData({ ...formData, instagram_link: e.target.value })}
                style={inputStyle}
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Facebook Link</label>
              <input
                type="url"
                value={formData.facebook_link}
                onChange={(e) => setFormData({ ...formData, facebook_link: e.target.value })}
                style={inputStyle}
              />
            </div>
          </div>

          {/* Image Uploads */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', marginTop: '16px' }}>
            <div style={formGroupStyle}>
              <label style={labelStyle}>Primary Image</label>
              <div style={{ marginBottom: '8px' }}>
                {submission?.image1 && !formData.delete_image1 && (
                  <div style={{ marginBottom: '8px' }}>
                    <strong>Current Image:</strong>
                    <img
                      src={submission.image1}
                      alt="Current primary image"
                      style={{ maxWidth: '200px', maxHeight: '120px', marginTop: '4px', borderRadius: '4px', border: '1px solid #ddd' }}
                    />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImage1Change}
                  style={{ ...inputStyle, padding: '8px' }}
                />
                <small style={{ color: '#757575', fontSize: '12px' }}>
                  Upload new image to replace current one (landscape, min 1000x600px)
                </small>
                {image1Preview && (
                  <img
                    src={image1Preview}
                    alt="New preview"
                    style={{ maxWidth: '200px', maxHeight: '120px', marginTop: '8px', borderRadius: '4px' }}
                  />
                )}
              </div>
              {submission?.image1 && (
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px' }}>
                  <input
                    type="checkbox"
                    checked={formData.delete_image1}
                    onChange={(e) => setFormData({ ...formData, delete_image1: e.target.checked })}
                    style={{ width: '16px', height: '16px' }}
                  />
                  <span style={{ color: '#F44336' }}>Delete current primary image</span>
                </label>
              )}
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Secondary Image</label>
              <div style={{ marginBottom: '8px' }}>
                {submission?.image2 && !formData.delete_image2 && (
                  <div style={{ marginBottom: '8px' }}>
                    <strong>Current Image:</strong>
                    <img
                      src={submission.image2}
                      alt="Current secondary image"
                      style={{ maxWidth: '200px', maxHeight: '120px', marginTop: '4px', borderRadius: '4px', border: '1px solid #ddd' }}
                    />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImage2Change}
                  style={{ ...inputStyle, padding: '8px' }}
                />
                <small style={{ color: '#757575', fontSize: '12px' }}>
                  Upload new image to replace current one (landscape, min 1000x600px)
                </small>
                {image2Preview && (
                  <img
                    src={image2Preview}
                    alt="New preview"
                    style={{ maxWidth: '200px', maxHeight: '120px', marginTop: '8px', borderRadius: '4px' }}
                  />
                )}
              </div>
              {submission?.image2 && (
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px' }}>
                  <input
                    type="checkbox"
                    checked={formData.delete_image2}
                    onChange={(e) => setFormData({ ...formData, delete_image2: e.target.checked })}
                    style={{ width: '16px', height: '16px' }}
                  />
                  <span style={{ color: '#F44336' }}>Delete current secondary image</span>
                </label>
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', marginTop: '16px' }}>
            <div style={formGroupStyle}>
              <label style={labelStyle}>Article Text *</label>
              <textarea
                value={formData.article_text}
                onChange={(e) => setFormData({ ...formData, article_text: e.target.value })}
                style={{ ...inputStyle, minHeight: '120px', resize: 'vertical' }}
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '32px', gap: '12px' }}>
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
              {loading ? 'Updating...' : 'Update Submission'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Brand colors from Color palette .pdf - using only defined colors
const theme = {
  primary: '#1976D2',        // Primary Blue
  primaryDark: '#0D47A1',    // Primary Dark
  primaryLight: '#E3F2FD',   // Primary Light
  secondary: '#00796B',      // Secondary Teal
  secondaryDark: '#004D40',  // Secondary Dark
  secondaryLight: '#E0F2F1', // Secondary Light
  success: '#4CAF50',        // Success Green
  warning: '#FF9800',        // Warning Orange
  danger: '#F44336',         // Error Red
  info: '#9C27B0',           // Info Purple
  textPrimary: '#212121',    // Text Primary
  textSecondary: '#757575',  // Text Secondary
  textDisabled: '#BDBDBD',   // Text Disabled
  background: '#FFFFFF',     // Background
  backgroundAlt: '#FAFAFA',  // Background Alt
  backgroundSoft: '#F5F5F5', // Background Soft
  borderLight: '#E0E0E0',    // Border Light
  borderMedium: '#BDBDBD',   // Border Medium
  borderDark: '#757575',     // Border Dark
};

const ArticleSubmissionsManagement = () => {
  const { admin, logout, hasRole } = useAdminAuth();

  const roleDisplayNames = {
    'super_admin': 'Super Administrator',
    'content_manager': 'Content Manager',
    'editor': 'Editor',
    'registered_user': 'Registered User',
    'agency': 'Agency',
    'other': 'Other'
  };

  const getRoleStyle = (role) => {
    const roleColors = {
      super_admin: { bg: '#E0F2F1', color: '#004D40' },
      content_manager: { bg: '#E3F2FD', color: '#0D47A1' },
      editor: { bg: '#FFF3E0', color: '#E65100' },
      registered_user: { bg: '#F3E5F5', color: '#6A1B9A' },
      agency: { bg: '#E8F5E8', color: '#2E7D32' },
      other: { bg: '#FAFAFA', color: '#616161' }
    };

    const r = roleColors[role] || roleColors.other;
    return {
      backgroundColor: r.bg,
      color: r.color,
      padding: '0.125rem 0.5rem',
      borderRadius: '9999px',
      fontSize: '0.75rem',
      fontWeight: 600,
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.25rem',
      lineHeight: 1
    };
  };

  // Check if user has permission to manage article submissions
  if (!hasRole('super_admin')) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: theme.backgroundSoft }}>
        <div style={{ textAlign: 'center' }}>
          <Icon name="shield-exclamation" size="lg" style={{ color: theme.danger, marginBottom: '16px' }} />
          <h2 style={{ color: theme.textPrimary, marginBottom: '8px' }}>Access Denied</h2>
          <p style={{ color: theme.textSecondary }}>You don't have permission to access article submissions management.</p>
          <p style={{ color: theme.textSecondary, fontSize: '14px', marginTop: '8px' }}>
            Required role: Super Admin
          </p>
        </div>
      </div>
    );
  }

  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalSubmissions, setTotalSubmissions] = useState(0);

  // Layout constants
  const headerZ = 1000;
  const mobileOverlayZ = 500;
  const sidebarZ = 200;
  const headerHeight = 64;
  const mainPaddingTop = headerHeight + 18;
  const sidebarWidth = 240;
  const leftGap = 24;

  const sidebarStyles = {
    width: sidebarWidth,
    backgroundColor: theme.background,
    borderRight: `1px solid ${theme.borderLight}`,
    padding: 16,
    boxSizing: 'border-box',
    borderRadius: 8
  };

  const mobileSidebarOverlay = {
    position: 'fixed',
    top: headerHeight,
    left: 0,
    height: `calc(100vh - ${headerHeight}px)`,
    zIndex: mobileOverlayZ,
    backgroundColor: '#fff',
    padding: 16,
    boxSizing: 'border-box',
    width: sidebarWidth,
    boxShadow: '0 8px 24px rgba(0,0,0,0.08)'
  };

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    onResize();
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    fetchSubmissions();
  }, [currentPage, pageSize, statusFilter]);

  const fetchSubmissions = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: pageSize,
        search: searchQuery
      });
      if (statusFilter) params.append('status', statusFilter);

      const response = await api.get(`/admin/article-submissions?${params.toString()}`);
      setSubmissions(response.data.submissions || []);
      setTotalPages(response.data.pagination?.totalPages || 1);
      setTotalSubmissions(response.data.pagination?.total || 0);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('adminAccessToken');
        window.location.href = '/admin/login';
      } else {
        alert('Failed to load submissions. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchSubmissions();
  };

  const handleViewSubmission = async (submission) => {
    try {
      const response = await api.get(`/admin/article-submissions/${submission.id}`);
      setSelectedSubmission(response.data.submission);
      setShowViewModal(true);
    } catch (error) {
      console.error('Error fetching submission details:', error);
      alert('Failed to load submission details.');
    }
  };

  const handleEditSubmission = async (submission) => {
    try {
      const response = await api.get(`/admin/article-submissions/${submission.id}`);
      setSelectedSubmission(response.data.submission);
      setShowEditModal(true);
    } catch (error) {
      console.error('Error fetching submission details:', error);
      alert('Failed to load submission details.');
    }
  };

  const handleApproveSubmission = async (submissionId) => {
    if (!window.confirm('Are you sure you want to approve this submission?')) return;

    try {
      await api.put(`/admin/article-submissions/${submissionId}/approve`);
      fetchSubmissions();
    } catch (error) {
      console.error('Error approving submission:', error);
      alert('Error approving submission. Please try again.');
    }
  };

  const handleRejectSubmission = async (submissionId) => {
    if (!window.confirm('Are you sure you want to reject this submission?')) return;

    try {
      await api.put(`/admin/article-submissions/${submissionId}/reject`);
      fetchSubmissions();
    } catch (error) {
      console.error('Error rejecting submission:', error);
      alert('Error rejecting submission. Please try again.');
    }
  };

  const handleDeleteSubmission = async (submissionId) => {
    if (!window.confirm('Are you sure you want to delete this submission? This action cannot be undone.')) return;

    try {
      await api.delete(`/admin/article-submissions/${submissionId}`);
      fetchSubmissions();
    } catch (error) {
      console.error('Error deleting submission:', error);
      alert('Error deleting submission. Please try again.');
    }
  };

  const handleFormSave = () => {
    fetchSubmissions();
    setShowEditModal(false);
    setSelectedSubmission(null);
  };

  const handleCreateFormSave = () => {
    fetchSubmissions();
    setShowCreateModal(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return { color: '#4CAF50', bg: '#E8F5E8' };
      case 'rejected': return { color: '#F44336', bg: '#FFEBEE' };
      case 'pending': return { color: '#FF9800', bg: '#FFF3E0' };
      default: return { color: '#757575', bg: '#F5F5F5' };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: theme.backgroundSoft, color: theme.text, paddingBottom: '3rem' }}>
        <header
          className="shadow-sm"
          style={{
            position: 'sticky',
            top: 0,
            zIndex: headerZ,
            backgroundColor: theme.background,
            boxShadow: '0 6px 20px rgba(2,6,23,0.06)',
            borderBottom: `1px solid ${theme.borderLight}`
          }}
        >
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10" style={{ minHeight: 64 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 3 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Icon name="shield-check" size="lg" style={{ color: '#1976D2' }} />
                <span style={{ fontWeight: 700, fontSize: 18 }}>News Marketplace Admin</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700 }}>Loading...</div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <div>Loading article submissions...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: theme.backgroundSoft, minHeight: '100vh', color: theme.textPrimary }}>
      {/* Header */}
      <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: headerHeight,
        backgroundColor: theme.background,
        borderBottom: `1px solid ${theme.borderLight}`,
        zIndex: headerZ,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.04)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={theme.textSecondary} strokeWidth="2">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #1976D2, #0D47A1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#fff', fontSize: '18px', fontWeight: '800' }}>N</span>
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: theme.textPrimary }}>News MarketPlace</h1>
              <p style={{ margin: 0, fontSize: '12px', color: theme.textSecondary }}>Admin Panel</p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '14px', fontWeight: '600', color: theme.textPrimary }}>
              {admin?.first_name} {admin?.last_name}
            </div>
            <div style={getRoleStyle(admin?.role)}>
              {roleDisplayNames[admin?.role] || 'User'}
            </div>
          </div>

          <button
            onClick={logout}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#fee2e2'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            title="Logout"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={theme.danger} strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16,17 21,12 16,7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </header>

      {/* Sidebar */}
      {sidebarOpen && (
        <>
          {isMobile && (
            <div
              style={mobileSidebarOverlay}
              onClick={() => setSidebarOpen(false)}
            />
          )}
          <aside style={{
            position: isMobile ? 'fixed' : 'fixed',
            top: headerHeight,
            left: 0,
            width: sidebarWidth,
            height: `calc(100vh - ${headerHeight}px)`,
            zIndex: sidebarZ,
            ...sidebarStyles
          }}>
            <Sidebar
              admin={admin}
              sidebarOpen={sidebarOpen}
              setSidebarOpen={setSidebarOpen}
              sidebarStyles={sidebarStyles}
              mobileSidebarOverlay={mobileSidebarOverlay}
              isMobile={isMobile}
              headerHeight={headerHeight}
              sidebarWidth={sidebarWidth}
              sidebarZ={sidebarZ}
              mobileOverlayZ={mobileOverlayZ}
            />
          </aside>
        </>
      )}

      {/* Main Content */}
      <main style={{
        marginLeft: sidebarOpen && !isMobile ? sidebarWidth + leftGap : leftGap,
        paddingTop: mainPaddingTop,
        paddingRight: leftGap,
        paddingBottom: leftGap,
        minHeight: '100vh',
        transition: 'margin-left 0.3s ease'
      }}>
        {/* Hero Section */}
        <section className="relative py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#E3F2FD] to-white border-b border-[#E0E0E0]">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-[#212121] mb-6 tracking-tight">
                Article Submissions Management
              </h1>
              <p className="text-lg md:text-xl text-[#757575] max-w-3xl mx-auto leading-relaxed font-light">
                Review and manage article submissions from users across the News Marketplace platform.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Search and Filter Section */}
        <section className="py-8 px-4 sm:px-6 lg:px-8 bg-white border-b border-[#E0E0E0]">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              {/* Search Bar */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#757575] w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-10 pr-4 py-3 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976D2] focus:border-transparent text-[#212121] bg-white"
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-4 py-3 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976D2] focus:border-transparent text-[#212121] bg-white"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>

              <button
                onClick={handleSearch}
                className="bg-[#1976D2] hover:bg-[#0D47A1] text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <Search className="w-5 h-5" />
                Search
              </button>

              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-[#4CAF50] hover:bg-[#388E3C] text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Create New Submission
              </button>
            </div>
          </div>
        </section>

        {/* Submissions Table */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-[#FAFAFA]">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm border border-[#E0E0E0] overflow-hidden">
              {/* Table Controls */}
              <div className="px-6 py-4 border-b border-[#E5E7EB] bg-[#F8FAFC]">
                <div className="flex justify-between items-center flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-semibold text-[#212121]">Article Submissions</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <select
                      value={pageSize}
                      onChange={(e) => {
                        setPageSize(parseInt(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="px-3 py-2 border border-[#E0E0E0] rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1976D2] focus:border-transparent"
                    >
                      <option value="10">10 per page</option>
                      <option value="25">25 per page</option>
                      <option value="50">50 per page</option>
                      <option value="100">100 per page</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-[#F8FAFC] border-b-2 border-[#E2E8F0]">
                      <th className="px-6 py-4 text-left font-bold text-xs text-[#212121] uppercase tracking-wider">ID</th>
                      <th className="px-6 py-4 text-left font-bold text-xs text-[#212121] uppercase tracking-wider">Title</th>
                      <th className="px-6 py-4 text-left font-bold text-xs text-[#212121] uppercase tracking-wider">Publication</th>
                      <th className="px-6 py-4 text-left font-bold text-xs text-[#212121] uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left font-bold text-xs text-[#212121] uppercase tracking-wider">Created At</th>
                      <th className="px-6 py-4 text-left font-bold text-xs text-[#212121] uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {submissions.map((submission, index) => (
                      <tr key={submission.id} className={index % 2 === 0 ? 'bg-white' : 'bg-[#FAFBFC]'}>
                        <td className="px-6 py-4 text-sm text-[#212121]">{submission.id}</td>
                        <td className="px-6 py-4 text-sm text-[#212121] font-medium">{submission.title}</td>
                        <td className="px-6 py-4 text-sm text-[#212121]">{submission.publication?.publication_name || 'Not Assigned'}</td>
                        <td className="px-6 py-4">
                          <span style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            ...getStatusColor(submission.status)
                          }}>
                            {submission.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-[#212121]">{formatDate(submission.created_at)}</td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2 flex-wrap">
                            <button
                              onClick={() => handleViewSubmission(submission)}
                              className="px-3 py-2 bg-[#9C27B0] hover:bg-[#7B1FA2] text-white rounded text-xs font-medium transition-colors flex items-center gap-1"
                            >
                              <Eye className="w-3 h-3" />
                              View
                            </button>
                            <button
                              onClick={() => handleEditSubmission(submission)}
                              className="px-3 py-2 bg-[#1976D2] hover:bg-[#0D47A1] text-white rounded text-xs font-medium transition-colors flex items-center gap-1"
                            >
                              <Edit className="w-3 h-3" />
                              Edit
                            </button>
                            {submission.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleApproveSubmission(submission.id)}
                                  className="px-3 py-2 bg-[#4CAF50] hover:bg-[#388E3C] text-white rounded text-xs font-medium transition-colors flex items-center gap-1"
                                >
                                  <CheckCircle2 className="w-3 h-3" />
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleRejectSubmission(submission.id)}
                                  className="px-3 py-2 bg-[#FF9800] hover:bg-[#F57C00] text-white rounded text-xs font-medium transition-colors flex items-center gap-1"
                                >
                                  <XCircle className="w-3 h-3" />
                                  Reject
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => handleDeleteSubmission(submission.id)}
                              className="px-3 py-2 bg-[#F44336] hover:bg-[#D32F2F] text-white rounded text-xs font-medium transition-colors flex items-center gap-1"
                            >
                              <Trash2 className="w-3 h-3" />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {submissions.length === 0 && (
                <div className="px-6 py-20 text-center">
                  <div className="w-24 h-24 bg-[#F5F5F5] rounded-full flex items-center justify-center mx-auto mb-6">
                    <FileText className="w-12 h-12 text-[#BDBDBD]" />
                  </div>
                  <h3 className="text-2xl font-semibold text-[#212121] mb-3">No submissions found</h3>
                  <p className="text-[#757575] mb-6 max-w-md mx-auto">
                    {searchQuery || statusFilter ? 'Try adjusting your search or filter criteria.' : 'Article submissions will appear here once users start submitting content.'}
                  </p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ padding: '16px 20px', borderTop: '1px solid #e5e7eb', backgroundColor: '#f8fafc', display: 'flex', justifyContent: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    style={{
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      backgroundColor: currentPage === 1 ? '#f3f4f6' : '#fff',
                      color: currentPage === 1 ? '#9ca3af' : '#212121',
                      cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    Previous
                  </button>

                  <span style={{ fontSize: '14px', color: '#757575' }}>
                    Page {currentPage} of {totalPages}
                  </span>

                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    style={{
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      backgroundColor: currentPage === totalPages ? '#f3f4f6' : '#fff',
                      color: currentPage === totalPages ? '#9ca3af' : '#212121',
                      cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Statistics */}
        {submissions.length > 0 && (
          <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-2xl font-semibold text-[#212121] mb-6">Management Statistics</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-[#E3F2FD] rounded-lg p-6 border border-[#E0E0E0]">
                  <div className="text-3xl font-bold text-[#1976D2] mb-2">{totalSubmissions}</div>
                  <div className="text-[#757575]">Total Submissions</div>
                </div>
                <div className="bg-[#FFF3E0] rounded-lg p-6 border border-[#E0E0E0]">
                  <div className="text-3xl font-bold text-[#FF9800] mb-2">
                    {submissions.filter(s => s.status === 'pending').length}
                  </div>
                  <div className="text-[#757575]">Pending Review</div>
                </div>
                <div className="bg-[#E8F5E8] rounded-lg p-6 border border-[#E0E0E0]">
                  <div className="text-3xl font-bold text-[#4CAF50] mb-2">
                    {submissions.filter(s => s.status === 'approved').length}
                  </div>
                  <div className="text-[#757575]">Approved</div>
                </div>
                <div className="bg-[#FFEBEE] rounded-lg p-6 border border-[#E0E0E0]">
                  <div className="text-3xl font-bold text-[#F44336] mb-2">
                    {submissions.filter(s => s.status === 'rejected').length}
                  </div>
                  <div className="text-[#757575]">Rejected</div>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* View Modal */}
      <ArticleSubmissionViewModal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        submission={selectedSubmission}
      />

      {/* Edit Modal */}
      <ArticleSubmissionEditModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        submission={selectedSubmission}
        onSave={handleFormSave}
      />

      {/* Create Modal */}
      <ArticleSubmissionCreateModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleCreateFormSave}
      />
    </div>
  );
};

export default ArticleSubmissionsManagement;