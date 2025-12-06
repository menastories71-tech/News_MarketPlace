import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import Icon from '../../components/common/Icon';
import Sidebar from '../../components/admin/Sidebar';
import api from '../../services/api';

// Press Pack Creation Form Modal Component
const PressPackCreationFormModal = ({ isOpen, onClose, record, onSave }) => {
  const [formData, setFormData] = useState({
    press_release_name: '',
    region: '',
    niche: '',
    distribution_to_no_of_media_websites: '',
    guaranteed_no_of_media_placements: '',
    end_client_media_details_in_press_release: '',
    middlemen_or_pr_agency_contact_details_in_press_release: '',
    google_search_optimised_status: '',
    google_search_optimised_publications: '',
    google_news_index_status: '',
    google_news_index_publications: '',
    no_of_images_allowed: '',
    word_limit: '',
    press_release_package_options: [],
    price: '',
    turnaround_time_in_days: '',
    information_and_documents_needed_from_customers: [],
    description: '',
    image_logo: '',
    best_seller: false,
    newly_added: false,
    exclusive: false,
    best_price_guarantee: false,
    vaas_choice: false,
    content_writing_assistance: ''
  });

  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);

  // Image handling functions
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (500KB limit)
      if (file.size > 500 * 1024) {
        alert('File size exceeds 500KB limit');
        e.target.value = '';
        return;
      }

      // Check file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        alert('Only image files (jpeg, jpg, png, gif, webp) are allowed');
        e.target.value = '';
        return;
      }

      setSelectedImage(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setFormData(prev => ({ ...prev, image_logo: '' }));
  };

  const handlePackageOptionChange = (option, checked) => {
    setFormData(prev => ({
      ...prev,
      press_release_package_options: checked
        ? [...prev.press_release_package_options, option]
        : prev.press_release_package_options.filter(item => item !== option)
    }));
  };

  const handleDocumentChange = (document, checked) => {
    setFormData(prev => ({
      ...prev,
      information_and_documents_needed_from_customers: checked
        ? [...prev.information_and_documents_needed_from_customers, document]
        : prev.information_and_documents_needed_from_customers.filter(item => item !== document)
    }));
  };

  useEffect(() => {
    if (record) {
      setFormData({
        press_release_name: record.name || '',
        region: record.region || '',
        niche: record.niche || '',
        distribution_to_no_of_media_websites: record.distribution_media_websites || '',
        guaranteed_no_of_media_placements: record.guaranteed_media_placements || '',
        end_client_media_details_in_press_release: record.end_client_media_details || '',
        middlemen_or_pr_agency_contact_details_in_press_release: record.middlemen_contact_details || '',
        google_search_optimised_status: record.google_search_optimised_status || '',
        google_search_optimised_publications: record.google_search_optimised_publications || '',
        google_news_index_status: record.google_news_index_status || '',
        google_news_index_publications: record.google_news_index_publications || '',
        no_of_images_allowed: record.images_allowed || '',
        word_limit: record.word_limit || '',
        press_release_package_options: record.package_options || [],
        price: record.price || '',
        turnaround_time_in_days: record.turnaround_time || '',
        information_and_documents_needed_from_customers: record.customer_info_needed || [],
        description: record.description || '',
        image_logo: record.image_logo || '',
        best_seller: record.best_seller || false,
        newly_added: false, // Not in API
        exclusive: false, // Not in API
        best_price_guarantee: false, // Not in API
        vaas_choice: false, // Not in API
        content_writing_assistance: record.content_writing_assistance ? 'Required' : 'Not required'
      });

      // Set image preview for existing record
      if (record.image_logo) {
        setImagePreview(record.image_logo);
      }
    } else {
      setFormData({
        press_release_name: '',
        region: '',
        niche: '',
        distribution_to_no_of_media_websites: '',
        guaranteed_no_of_media_placements: '',
        end_client_media_details_in_press_release: '',
        middlemen_or_pr_agency_contact_details_in_press_release: '',
        google_search_optimised_status: '',
        google_search_optimised_publications: '',
        google_news_index_status: '',
        google_news_index_publications: '',
        no_of_images_allowed: '',
        word_limit: '',
        press_release_package_options: [],
        price: '',
        turnaround_time_in_days: '',
        information_and_documents_needed_from_customers: [],
        description: '',
        image_logo: '',
        best_seller: false,
        newly_added: false,
        exclusive: false,
        best_price_guarantee: false,
        vaas_choice: false,
        content_writing_assistance: ''
      });
      setSelectedImage(null);
      setImagePreview(null);
    }
  }, [record, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create FormData for multipart upload
      const submitData = new FormData();

      // Add text fields with correct backend field names
      submitData.append('name', formData.press_release_name);
      submitData.append('region', formData.region);
      submitData.append('niche', formData.niche);
      submitData.append('distribution_media_websites', formData.distribution_to_no_of_media_websites);
      submitData.append('guaranteed_media_placements', formData.guaranteed_no_of_media_placements);
      submitData.append('end_client_media_details', formData.end_client_media_details_in_press_release);
      submitData.append('middlemen_contact_details', formData.middlemen_or_pr_agency_contact_details_in_press_release);
      submitData.append('google_search_optimised_status', formData.google_search_optimised_status);
      if (formData.google_search_optimised_status === 'Guaranteed' && formData.google_search_optimised_publications) {
        submitData.append('google_search_optimised_publications', formData.google_search_optimised_publications);
      }
      submitData.append('google_news_index_status', formData.google_news_index_status);
      if (formData.google_news_index_status === 'Guaranteed' && formData.google_news_index_publications) {
        submitData.append('google_news_index_publications', formData.google_news_index_publications);
      }
      submitData.append('images_allowed', formData.no_of_images_allowed);
      submitData.append('word_limit', formData.word_limit);
      submitData.append('package_options', JSON.stringify(formData.press_release_package_options));
      submitData.append('price', formData.price);
      submitData.append('turnaround_time', formData.turnaround_time_in_days);
      // Ensure it's an array before stringifying
      const customerInfo = Array.isArray(formData.information_and_documents_needed_from_customers)
        ? formData.information_and_documents_needed_from_customers
        : [];
      submitData.append('customer_info_needed', JSON.stringify(customerInfo));
      submitData.append('description', formData.description);
      submitData.append('best_seller', formData.best_seller);
      // Convert content_writing_assistance string to boolean
      const contentWritingBoolean = formData.content_writing_assistance === 'Required';
      submitData.append('content_writing_assistance', contentWritingBoolean);
      submitData.append('is_active', true); // Default to active

      // Add image file if selected
      if (selectedImage) {
        submitData.append('image_logo', selectedImage);
      }

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      };

      if (record) {
        await api.put(`/admin/press-releases/${record.id}`, submitData, config);
      } else {
        await api.post('/admin/press-releases', submitData, config);
      }

      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving record:', error);
      let errorMessage = 'Error saving record. Please try again.';

      if (error.response?.data) {
        if (error.response.data.error === 'Validation failed' && error.response.data.details) {
          // Show validation errors
          const validationErrors = error.response.data.details.map(err => `${err.param}: ${err.msg}`).join('\n');
          errorMessage = `Validation failed:\n${validationErrors}`;
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      }

      alert(errorMessage);
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
    maxWidth: '900px',
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

  const buttonStyle = {
    padding: '10px 20px',
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
            {record ? 'Edit Press Pack' : 'Create Press Pack'}
          </h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', fontSize: '24px', cursor: 'pointer' }}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
            <div style={formGroupStyle}>
              <label style={labelStyle}>Press Release Name *</label>
              <input
                type="text"
                value={formData.press_release_name}
                onChange={(e) => setFormData({ ...formData, press_release_name: e.target.value })}
                style={inputStyle}
                required
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Region *</label>
              <select
                value={formData.region}
                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                style={inputStyle}
                required
              >
                <option value="">Select Region</option>
                <option value="Asia">Asia</option>
                <option value="Middle East">Middle East</option>
                <option value="North America">North America</option>
                <option value="USA">USA</option>
                <option value="GCC">GCC</option>
                <option value="India">India</option>
                <option value="Russia">Russia</option>
                <option value="China">China</option>
              </select>
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Niche *</label>
              <select
                value={formData.niche}
                onChange={(e) => setFormData({ ...formData, niche: e.target.value })}
                style={inputStyle}
                required
              >
                <option value="">Select Niche</option>
                <option value="General">General</option>
                <option value="Business">Business</option>
                <option value="Finance">Finance</option>
                <option value="Cyber">Cyber</option>
                <option value="Web3">Web3</option>
                <option value="Sports">Sports</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Gambling">Gambling</option>
                <option value="Gaming">Gaming</option>
              </select>
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Distribution to No. of Media Websites</label>
              <input
                type="number"
                value={formData.distribution_to_no_of_media_websites}
                onChange={(e) => setFormData({ ...formData, distribution_to_no_of_media_websites: e.target.value })}
                style={inputStyle}
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Guaranteed No. of Media Placements</label>
              <input
                type="number"
                value={formData.guaranteed_no_of_media_placements}
                onChange={(e) => setFormData({ ...formData, guaranteed_no_of_media_placements: e.target.value })}
                style={inputStyle}
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>End Client Media Details in Press Release</label>
              <select
                value={formData.end_client_media_details_in_press_release}
                onChange={(e) => setFormData({ ...formData, end_client_media_details_in_press_release: e.target.value })}
                style={inputStyle}
              >
                <option value="">Select Option</option>
                <option value="Mandatory">Mandatory</option>
                <option value="Optional">Optional</option>
                <option value="Not Allowed">Not Allowed</option>
              </select>
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Middlemen or PR Agency Contact Details</label>
              <select
                value={formData.middlemen_or_pr_agency_contact_details_in_press_release}
                onChange={(e) => setFormData({ ...formData, middlemen_or_pr_agency_contact_details_in_press_release: e.target.value })}
                style={inputStyle}
              >
                <option value="">Select Option</option>
                <option value="Mandatory">Mandatory</option>
                <option value="Optional">Optional</option>
                <option value="Not Allowed">Not Allowed</option>
              </select>
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Google Search Optimised</label>
              <select
                value={formData.google_search_optimised_status}
                onChange={(e) => setFormData({ ...formData, google_search_optimised_status: e.target.value })}
                style={inputStyle}
              >
                <option value="">Select Option</option>
                <option value="Not Guaranteed">Not Guaranteed</option>
                <option value="Guaranteed">Guaranteed</option>
              </select>
              {formData.google_search_optimised_status === 'Guaranteed' && (
                <div style={{ marginTop: '8px' }}>
                  <label style={{ ...labelStyle, fontSize: '12px', fontWeight: '500' }}>Number of Publications</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.google_search_optimised_publications}
                    onChange={(e) => setFormData({ ...formData, google_search_optimised_publications: e.target.value })}
                    style={inputStyle}
                    placeholder="Enter number of publications"
                  />
                </div>
              )}
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Google News Index</label>
              <select
                value={formData.google_news_index_status}
                onChange={(e) => setFormData({ ...formData, google_news_index_status: e.target.value })}
                style={inputStyle}
              >
                <option value="">Select Option</option>
                <option value="Not Guaranteed">Not Guaranteed</option>
                <option value="Guaranteed">Guaranteed</option>
              </select>
              {formData.google_news_index_status === 'Guaranteed' && (
                <div style={{ marginTop: '8px' }}>
                  <label style={{ ...labelStyle, fontSize: '12px', fontWeight: '500' }}>Number of Publications</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.google_news_index_publications}
                    onChange={(e) => setFormData({ ...formData, google_news_index_publications: e.target.value })}
                    style={inputStyle}
                    placeholder="Enter number of publications"
                  />
                </div>
              )}
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>No. of Images Allowed</label>
              <input
                type="number"
                value={formData.no_of_images_allowed}
                onChange={(e) => setFormData({ ...formData, no_of_images_allowed: e.target.value })}
                style={inputStyle}
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Word Limit</label>
              <select
                value={formData.word_limit}
                onChange={(e) => setFormData({ ...formData, word_limit: e.target.value })}
                style={inputStyle}
              >
                <option value="">Select Word Limit</option>
                <option value="500">500</option>
                <option value="600">600</option>
                <option value="700">700</option>
              </select>
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Price *</label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                style={inputStyle}
                required
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Turnaround Time in Days *</label>
              <input
                type="number"
                value={formData.turnaround_time_in_days}
                onChange={(e) => setFormData({ ...formData, turnaround_time_in_days: e.target.value })}
                style={inputStyle}
                required
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Content Writing Assistance</label>
              <select
                value={formData.content_writing_assistance}
                onChange={(e) => setFormData({ ...formData, content_writing_assistance: e.target.value })}
                style={inputStyle}
              >
                <option value="">Select Option</option>
                <option value="Required">Required</option>
                <option value="Not required">Not required</option>
              </select>
            </div>
          </div>

          {/* Package Options */}
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Press Release Package Options</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
              {['Diamond', 'Titanium', 'Platinum', 'Gold', 'Silver', 'Bronze', 'Steel'].map(option => (
                <label key={option} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.press_release_package_options.includes(option)}
                    onChange={(e) => handlePackageOptionChange(option, e.target.checked)}
                  />
                  <span style={{ fontSize: '14px', color: '#212121' }}>{option}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Documents Needed */}
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Information and Documents Needed from Customers</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
              {[
                'Authorised person name',
                'Email',
                'Phone number',
                'Website',
                'Press release on letter head',
                'Letter of authorisation'
              ].map(document => (
                <label key={document} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.information_and_documents_needed_from_customers.includes(document)}
                    onChange={(e) => handleDocumentChange(document, e.target.checked)}
                  />
                  <span style={{ fontSize: '14px', color: '#212121' }}>{document}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Special Tags */}
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Special Tags</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
              {[
                { key: 'best_seller', label: 'Best Seller' },
                { key: 'newly_added', label: 'Newly Added' },
                { key: 'exclusive', label: 'Exclusive' },
                { key: 'best_price_guarantee', label: 'Best Price Guarantee' },
                { key: 'vaas_choice', label: 'VaaS Choice' }
              ].map(tag => (
                <label key={tag.key} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData[tag.key]}
                    onChange={(e) => setFormData({ ...formData, [tag.key]: e.target.checked })}
                  />
                  <span style={{ fontSize: '14px', color: '#212121' }}>{tag.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Description */}
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              style={{ ...inputStyle, resize: 'vertical' }}
              placeholder="Enter description..."
            />
          </div>

          {/* Image Upload Section */}
          <div style={{ marginTop: '16px', padding: '20px', border: '2px dashed #e0e0e0', borderRadius: '8px', backgroundColor: '#fafafa' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600', color: '#212121' }}>Image or Logo</h3>

            {/* Image Preview */}
            {imagePreview && (
              <div style={{ marginBottom: '16px', textAlign: 'center' }}>
                <img
                  src={imagePreview}
                  alt="Preview"
                  style={{
                    maxWidth: '200px',
                    maxHeight: '200px',
                    borderRadius: '8px',
                    border: '1px solid #e0e0e0',
                    objectFit: 'cover'
                  }}
                />
                <div style={{ marginTop: '8px' }}>
                  <button
                    type="button"
                    onClick={removeImage}
                    style={{
                      padding: '4px 12px',
                      backgroundColor: '#f44336',
                      color: '#fff',
                      border: '4px solid none',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    Remove Image
                  </button>
                </div>
              </div>
            )}

            {/* File Upload */}
            {!imagePreview && (
              <div style={{ textAlign: 'center' }}>
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  style={{
                    display: 'inline-block',
                    padding: '12px 24px',
                    backgroundColor: '#1976D2',
                    color: '#fff',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  Choose Image
                </label>
                <div style={{ marginTop: '8px', fontSize: '12px', color: '#757575' }}>
                  Max size: 500KB | Formats: JPEG, PNG, GIF, WebP
                </div>
              </div>
            )}
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
              {loading ? 'Saving...' : (record ? 'Update Record' : 'Create Record')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Brand colors from Color palette
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

const PressPackCreationPage = () => {
  const { admin, logout, hasRole } = useAdminAuth();

  // Redirect to login if not authenticated
  if (!admin) {
    window.location.href = '/admin/login';
    return null;
  }

  // Check if user has permission to manage press pack creation
  if (!hasRole('super_admin')) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: theme.backgroundSoft }}>
        <div style={{ textAlign: 'center' }}>
          <Icon name="shield-exclamation" size="lg" style={{ color: theme.danger, marginBottom: '16px' }} />
          <h2 style={{ color: theme.textPrimary, marginBottom: '8px' }}>Access Denied</h2>
          <p style={{ color: theme.textSecondary }}>You don't have permission to access press pack creation management.</p>
          <p style={{ color: theme.textSecondary, fontSize: '14px', marginTop: '8px' }}>
            Required role: Super Admin
          </p>
        </div>
      </div>
    );
  }

  const [records, setRecords] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [message, setMessage] = useState(null);

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

  const btnPrimary = {
    backgroundColor: theme.primary,
    color: '#fff',
    padding: '0.625rem 1rem',
    borderRadius: '0.5rem',
    fontWeight: 600,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    cursor: 'pointer',
    border: 'none',
    boxShadow: `0 6px 18px rgba(25,118,210,0.14)`
  };

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    onResize();
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    if (sidebarOpen && isMobile) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }
    return undefined;
  }, [sidebarOpen, isMobile]);

  useEffect(() => {
    fetchRecords();
  }, [currentPage, pageSize]);

  const fetchRecords = async () => {
    try {
      const params = new URLSearchParams();
      params.append('page', currentPage.toString());
      params.append('limit', pageSize.toString());
      const response = await api.get(`/admin/press-releases?${params.toString()}`);
      setRecords(response.data.pressReleases || []);
      setTotalRecords(response.data.pagination?.total || 0);
    } catch (error) {
      console.error('Error fetching records:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('adminAccessToken');
        window.location.href = '/admin/login';
      } else {
        alert('Failed to load records. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFormSave = () => {
    fetchRecords();
    setMessage({ type: 'success', text: 'Record saved successfully!' });
  };

  const handleCreateRecord = () => {
    setEditingRecord(null);
    setShowFormModal(true);
  };

  const handleEditRecord = (record) => {
    setEditingRecord(record);
    setShowFormModal(true);
  };

  const handleDeleteRecord = async (recordId) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;

    try {
      setLoading(true);
      await api.delete(`/admin/press-releases/${recordId}`);
      fetchRecords();
      setMessage({ type: 'success', text: 'Record deleted successfully!' });
    } catch (error) {
      console.error('Error deleting record:', error);
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Error deleting record. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const totalPages = Math.ceil(totalRecords / pageSize);

  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: theme.backgroundSoft, color: theme.text, paddingBottom: '3rem' }}>
        {/* Header */}
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
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <span style={{ fontWeight: 700, fontSize: 18 }}>Loading...</span>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-10">
          <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
            <main style={{ flex: 1, minWidth: 0 }}>
              <div style={{ backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 8px 20px rgba(2,6,23,0.06)', overflow: 'hidden' }}>
                <div style={{ padding: '80px', textAlign: 'center', color: theme.textSecondary }}>
                  Loading press pack records...
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: theme.backgroundSoft, color: theme.text, paddingBottom: '3rem' }}>
      {/* Header */}
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
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="mr-3 md:hidden"
                aria-label="Toggle sidebar"
                style={{ background: 'transparent', border: 'none', padding: 6, cursor: 'pointer' }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={theme.text} strokeWidth="2"><path d="M3 6h18M3 12h18M3 18h18" /></svg>
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Icon name="newspaper" size="lg" style={{ color: '#1976D2' }} />
                <span style={{ fontWeight: 700, fontSize: 18 }}>News Marketplace Admin</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 700 }}>{admin?.first_name ? `${admin.first_name} ${admin.last_name}` : 'Master Admin'}</div>
              </div>

              <button onClick={logout} style={{ ...btnPrimary, padding: '0.45rem 0.75rem' }}>
                <Icon name="arrow-right-on-rectangle" size="sm" style={{ color: '#fff', marginRight: 8 }} />
                Logout
              </button>
            </div>
          </div>
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
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-10" style={{
        paddingTop: mainPaddingTop,
        marginLeft: !isMobile && sidebarOpen ? (sidebarWidth + leftGap) : 0,
        transition: 'margin-left 0.28s ease-in-out'
      }}>
        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
          <main style={{ flex: 1, minWidth: 0 }}>
            {/* Page Header */}
            <div style={{ background: '#fff', borderRadius: 12, padding: 28, border: `4px solid #000`, display: 'flex', justifyContent: 'space-between', gap: '16px', marginBottom: 24, alignItems: 'center' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: '#e6f0ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name="newspaper" size="sm" style={{ color: '#1976D2' }} />
                  </div>
                  <h1 style={{ margin: 0, fontSize: 34, fontWeight: 800 }}>Press Pack Creation</h1>
                </div>
                <p style={{ marginTop: 8, color: '#757575' }}>Manage press pack records</p>
              </div>

              <button
                onClick={handleCreateRecord}
                style={btnPrimary}
              >
                <Icon name="plus-circle" size="sm" style={{ color: '#fff' }} />
                Add Record
              </button>
            </div>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
              <div style={{ background: '#fff', borderRadius: 12, padding: 18, boxShadow: '0 8px 20px rgba(2,6,23,0.06)', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 48, height: 48, borderRadius: 10, background: '#e6f0ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="newspaper" size="lg" style={{ color: '#1976D2' }} />
                </div>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 800 }}>{totalRecords}</div>
                  <div style={{ fontSize: 12, color: '#757575' }}>Total Records</div>
                </div>
              </div>
            </div>

            {/* Message */}
            {message && (
              <div style={{
                padding: '12px 16px',
                borderRadius: '8px',
                marginBottom: '16px',
                backgroundColor: message.type === 'success' ? '#dcfce7' : '#fee2e2',
                border: `1px solid ${message.type === 'success' ? '#10b981' : '#ef4444'}`,
                color: message.type === 'success' ? '#065f46' : '#991b1b'
              }}>
                {message.text}
                <button
                  onClick={() => setMessage(null)}
                  style={{ float: 'right', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '16px' }}
                >
                  ×
                </button>
              </div>
            )}

            {/* Table */}
            <div style={{ backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 8px 20px rgba(2,6,23,0.06)', overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb', backgroundColor: '#f8fafc' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: theme.textPrimary }}>
                    Press Pack Records
                  </span>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      const newPageSize = parseInt(e.target.value);
                      setPageSize(newPageSize);
                      setCurrentPage(1);
                    }}
                    style={{
                      padding: '6px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      backgroundColor: '#fff'
                    }}
                  >
                    <option value="10">10 per page</option>
                    <option value="25">25 per page</option>
                    <option value="50">50 per page</option>
                    <option value="100">100 per page</option>
                  </select>
                </div>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                      <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', fontSize: '12px', color: theme.textPrimary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Press Release Name
                      </th>
                      <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', fontSize: '12px', color: theme.textPrimary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Region
                      </th>
                      <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', fontSize: '12px', color: theme.textPrimary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Niche
                      </th>
                      <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', fontSize: '12px', color: theme.textPrimary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Price
                      </th>
                      <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', fontSize: '12px', color: theme.textPrimary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Image
                      </th>
                      <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', fontSize: '12px', color: theme.textPrimary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((record, index) => (
                      <tr key={record.id} style={{
                        borderBottom: '1px solid #f1f5f9',
                        backgroundColor: index % 2 === 0 ? '#ffffff' : '#fafbfc'
                      }}>
                        <td style={{ padding: '16px' }}>
                          <div style={{ fontSize: '14px', color: theme.textPrimary, fontWeight: '500' }}>
                            {record.name}
                          </div>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <div style={{ fontSize: '14px', color: theme.textPrimary }}>
                            {record.region || '—'}
                          </div>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <div style={{ fontSize: '14px', color: theme.textPrimary }}>
                            {record.niche || '—'}
                          </div>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <div style={{ fontSize: '14px', color: theme.primary, fontWeight: '600' }}>
                            ${record.price || '—'}
                          </div>
                        </td>
                        <td style={{ padding: '16px' }}>
                          {record.image_logo ? (
                            <img
                              src={record.image_logo}
                              alt="Press Pack"
                              style={{
                                width: '50px',
                                height: '50px',
                                objectFit: 'cover',
                                borderRadius: '4px',
                                border: '1px solid #e0e0e0'
                              }}
                            />
                          ) : (
                            <span style={{ fontSize: '12px', color: theme.textSecondary }}>No image</span>
                          )}
                        </td>
                        <td style={{ padding: '16px' }}>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              onClick={() => handleEditRecord(record)}
                              style={{
                                padding: '6px 10px',
                                backgroundColor: theme.primary,
                                color: '#fff',
                                border: 'none',
                                borderRadius: '4px',
                                fontSize: '12px',
                                cursor: 'pointer',
                                fontWeight: '600'
                              }}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteRecord(record.id)}
                              style={{
                                padding: '6px 10px',
                                backgroundColor: '#dc2626',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '4px',
                                fontSize: '12px',
                                cursor: 'pointer',
                                fontWeight: '600'
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={{ padding: '16px 20px', borderTop: '1px solid #e5e7eb', backgroundColor: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '14px', color: theme.textSecondary }}>
                    Page {currentPage} of {totalPages} ({totalRecords} total records)
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      style={{
                        padding: '8px 12px',
                        backgroundColor: currentPage === 1 ? '#e5e7eb' : theme.primary,
                        color: currentPage === 1 ? theme.textSecondary : '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '14px',
                        cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                      }}
                    >
                      ← Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      style={{
                        padding: '8px 12px',
                        backgroundColor: currentPage === totalPages ? '#e5e7eb' : theme.primary,
                        color: currentPage === totalPages ? theme.textSecondary : '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '14px',
                        cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
                      }}
                    >
                      Next →
                    </button>
                  </div>
                </div>
              )}

              {records.length === 0 && (
                <div style={{ padding: '80px', textAlign: 'center', color: theme.textSecondary }}>
                  <div style={{ fontSize: '64px', marginBottom: '16px' }}>
                    📰
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>
                    No records found
                  </div>
                  <div style={{ fontSize: '16px' }}>
                    Try adjusting your search criteria or add a new record.
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* Form Modal */}
      <PressPackCreationFormModal
        isOpen={showFormModal}
        onClose={() => setShowFormModal(false)}
        record={editingRecord}
        onSave={handleFormSave}
      />
    </div>
  );
};

export default PressPackCreationPage;