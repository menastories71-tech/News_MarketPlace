import React, { useState, useEffect } from 'react';
import api from '../../services/api';

// Publication Form Modal Component
const PublicationFormModal = ({ isOpen, onClose, publication, groups, onSave }) => {
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
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (publication) {
      setFormData({
        group_id: publication.group_id || '',
        publication_sn: publication.publication_sn || '',
        publication_grade: publication.publication_grade || '',
        publication_name: publication.publication_name || '',
        publication_website: publication.publication_website || '',
        publication_price: publication.publication_price || '',
        agreement_tat: publication.agreement_tat || '',
        practical_tat: publication.practical_tat || '',
        publication_socials_icons: publication.publication_socials_icons || '',
        publication_language: publication.publication_language || '',
        publication_region: publication.publication_region || '',
        publication_primary_industry: publication.publication_primary_industry || '',
        website_news_index: publication.website_news_index || '',
        da: publication.da || '',
        dr: publication.dr || '',
        sponsored_or_not: publication.sponsored_or_not || false,
        words_limit: publication.words_limit || '',
        number_of_images: publication.number_of_images || '',
        do_follow_link: publication.do_follow_link || false,
        example_link: publication.example_link || '',
        excluding_categories: publication.excluding_categories || '',
        other_remarks: publication.other_remarks || '',
        tags_badges: publication.tags_badges || '',
        live_on_platform: publication.live_on_platform || false
      });
    } else {
      setFormData({
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
    }
  }, [publication, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

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
        number_of_images: parseInt(formData.number_of_images) || 0
      };

      if (publication) {
        await api.put(`/publications/${publication.id}`, dataToSend);
      } else {
        await api.post('/publications', dataToSend);
      }

      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving publication:', error);
      alert('Error saving publication. Please try again.');
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
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    boxSizing: 'border-box'
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

  return (
    <div style={modalStyle} onClick={onClose}>
      <div style={contentStyle} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '800' }}>
            {publication ? 'Edit Publication' : 'Create Publication'}
          </h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', fontSize: '24px', cursor: 'pointer' }}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
            <div style={formGroupStyle}>
              <label style={labelStyle}>Group *</label>
              <select
                value={formData.group_id}
                onChange={(e) => setFormData({ ...formData, group_id: e.target.value })}
                style={inputStyle}
                required
              >
                <option value="">Select Group</option>
                {groups.map(group => (
                  <option key={group.id} value={group.id}>{group.group_name}</option>
                ))}
              </select>
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Publication SN *</label>
              <input
                type="text"
                value={formData.publication_sn}
                onChange={(e) => setFormData({ ...formData, publication_sn: e.target.value })}
                style={inputStyle}
                required
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Publication Grade *</label>
              <input
                type="text"
                value={formData.publication_grade}
                onChange={(e) => setFormData({ ...formData, publication_grade: e.target.value })}
                style={inputStyle}
                required
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Publication Name *</label>
              <input
                type="text"
                value={formData.publication_name}
                onChange={(e) => setFormData({ ...formData, publication_name: e.target.value })}
                style={inputStyle}
                required
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Website URL *</label>
              <input
                type="url"
                value={formData.publication_website}
                onChange={(e) => setFormData({ ...formData, publication_website: e.target.value })}
                style={inputStyle}
                required
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Price ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.publication_price}
                onChange={(e) => setFormData({ ...formData, publication_price: e.target.value })}
                style={inputStyle}
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Agreement TAT (days)</label>
              <input
                type="number"
                min="0"
                value={formData.agreement_tat}
                onChange={(e) => setFormData({ ...formData, agreement_tat: e.target.value })}
                style={inputStyle}
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Practical TAT (days)</label>
              <input
                type="number"
                min="0"
                value={formData.practical_tat}
                onChange={(e) => setFormData({ ...formData, practical_tat: e.target.value })}
                style={inputStyle}
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Language *</label>
              <input
                type="text"
                value={formData.publication_language}
                onChange={(e) => setFormData({ ...formData, publication_language: e.target.value })}
                style={inputStyle}
                required
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Region *</label>
              <input
                type="text"
                value={formData.publication_region}
                onChange={(e) => setFormData({ ...formData, publication_region: e.target.value })}
                style={inputStyle}
                required
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Primary Industry *</label>
              <input
                type="text"
                value={formData.publication_primary_industry}
                onChange={(e) => setFormData({ ...formData, publication_primary_industry: e.target.value })}
                style={inputStyle}
                required
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Website News Index</label>
              <input
                type="number"
                min="0"
                value={formData.website_news_index}
                onChange={(e) => setFormData({ ...formData, website_news_index: e.target.value })}
                style={inputStyle}
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Domain Authority (DA)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.da}
                onChange={(e) => setFormData({ ...formData, da: e.target.value })}
                style={inputStyle}
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Domain Rating (DR)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.dr}
                onChange={(e) => setFormData({ ...formData, dr: e.target.value })}
                style={inputStyle}
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Words Limit</label>
              <input
                type="number"
                min="0"
                value={formData.words_limit}
                onChange={(e) => setFormData({ ...formData, words_limit: e.target.value })}
                style={inputStyle}
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Number of Images</label>
              <input
                type="number"
                min="0"
                value={formData.number_of_images}
                onChange={(e) => setFormData({ ...formData, number_of_images: e.target.value })}
                style={inputStyle}
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Example Link</label>
              <input
                type="url"
                value={formData.example_link}
                onChange={(e) => setFormData({ ...formData, example_link: e.target.value })}
                style={inputStyle}
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Social Media Icons</label>
              <input
                type="text"
                value={formData.publication_socials_icons}
                onChange={(e) => setFormData({ ...formData, publication_socials_icons: e.target.value })}
                style={inputStyle}
                placeholder="Comma-separated social media links"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginTop: '16px' }}>
            <div style={formGroupStyle}>
              <label style={labelStyle}>Excluding Categories</label>
              <textarea
                value={formData.excluding_categories}
                onChange={(e) => setFormData({ ...formData, excluding_categories: e.target.value })}
                style={{ ...inputStyle, minHeight: '60px', resize: 'vertical' }}
                placeholder="Categories to exclude"
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Other Remarks</label>
              <textarea
                value={formData.other_remarks}
                onChange={(e) => setFormData({ ...formData, other_remarks: e.target.value })}
                style={{ ...inputStyle, minHeight: '60px', resize: 'vertical' }}
                placeholder="Additional remarks"
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Tags/Badges</label>
              <input
                type="text"
                value={formData.tags_badges}
                onChange={(e) => setFormData({ ...formData, tags_badges: e.target.value })}
                style={inputStyle}
                placeholder="Comma-separated tags"
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginTop: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <input
                type="checkbox"
                id="sponsored"
                checked={formData.sponsored_or_not}
                onChange={(e) => setFormData({ ...formData, sponsored_or_not: e.target.checked })}
                style={checkboxStyle}
              />
              <label htmlFor="sponsored" style={{ fontSize: '14px', color: '#212121' }}>Sponsored Content</label>
            </div>

            <div style={{ display: 'flex', alignItems: 'center' }}>
              <input
                type="checkbox"
                id="dofollow"
                checked={formData.do_follow_link}
                onChange={(e) => setFormData({ ...formData, do_follow_link: e.target.checked })}
                style={checkboxStyle}
              />
              <label htmlFor="dofollow" style={{ fontSize: '14px', color: '#212121' }}>Do-follow Link</label>
            </div>

            <div style={{ display: 'flex', alignItems: 'center' }}>
              <input
                type="checkbox"
                id="live"
                checked={formData.live_on_platform}
                onChange={(e) => setFormData({ ...formData, live_on_platform: e.target.checked })}
                style={checkboxStyle}
              />
              <label htmlFor="live" style={{ fontSize: '14px', color: '#212121' }}>Live on Platform</label>
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
              {loading ? 'Saving...' : (publication ? 'Update Publication' : 'Create Publication')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PublicationFormModal;