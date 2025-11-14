import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const ReporterFormModal = ({ isOpen, onClose, reporter, onSave }) => {
  const [formData, setFormData] = useState({
    function_department: '',
    position: '',
    name: '',
    gender: '',
    email: '',
    whatsapp: '',
    publication_name: '',
    website_url: '',
    linkedin: '',
    instagram: '',
    facebook: '',
    publication_industry: '',
    publication_location: '',
    niche_industry: '',
    minimum_expectation_usd: '',
    articles_per_month: '',
    turnaround_time: '',
    company_allowed_in_title: false,
    individual_allowed_in_title: false,
    subheading_allowed: false,
    sample_url: '',
    will_change_wordings: false,
    article_placed_permanently: false,
    article_can_be_deleted: false,
    article_can_be_modified: false,
    terms_accepted: false,
    how_heard_about_us: '',
    message: '',
    status: 'pending'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (reporter) {
      setFormData({
        function_department: reporter.function_department || '',
        position: reporter.position || '',
        name: reporter.name || '',
        gender: reporter.gender || '',
        email: reporter.email || '',
        whatsapp: reporter.whatsapp || '',
        publication_name: reporter.publication_name || '',
        website_url: reporter.website_url || '',
        linkedin: reporter.linkedin || '',
        instagram: reporter.instagram || '',
        facebook: reporter.facebook || '',
        publication_industry: reporter.publication_industry || '',
        publication_location: reporter.publication_location || '',
        niche_industry: reporter.niche_industry || '',
        minimum_expectation_usd: reporter.minimum_expectation_usd || '',
        articles_per_month: reporter.articles_per_month || '',
        turnaround_time: reporter.turnaround_time || '',
        company_allowed_in_title: reporter.company_allowed_in_title || false,
        individual_allowed_in_title: reporter.individual_allowed_in_title || false,
        subheading_allowed: reporter.subheading_allowed || false,
        sample_url: reporter.sample_url || '',
        will_change_wordings: reporter.will_change_wordings || false,
        article_placed_permanently: reporter.article_placed_permanently || false,
        article_can_be_deleted: reporter.article_can_be_deleted || false,
        article_can_be_modified: reporter.article_can_be_modified || false,
        terms_accepted: reporter.terms_accepted || false,
        how_heard_about_us: reporter.how_heard_about_us || '',
        message: reporter.message || '',
        status: reporter.status || 'pending'
      });
    } else {
      setFormData({
        function_department: '',
        position: '',
        name: '',
        gender: '',
        email: '',
        whatsapp: '',
        publication_name: '',
        website_url: '',
        linkedin: '',
        instagram: '',
        facebook: '',
        publication_industry: '',
        publication_location: '',
        niche_industry: '',
        minimum_expectation_usd: '',
        articles_per_month: '',
        turnaround_time: '',
        company_allowed_in_title: false,
        individual_allowed_in_title: false,
        subheading_allowed: false,
        sample_url: '',
        will_change_wordings: false,
        article_placed_permanently: false,
        article_can_be_deleted: false,
        article_can_be_modified: false,
        terms_accepted: false,
        how_heard_about_us: '',
        message: '',
        status: 'pending'
      });
    }
  }, [reporter, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const dataToSend = {
        ...formData,
        minimum_expectation_usd: formData.minimum_expectation_usd ? parseFloat(formData.minimum_expectation_usd) : null,
        articles_per_month: formData.articles_per_month ? parseInt(formData.articles_per_month) : null
      };

      if (reporter) {
        await api.put(`/reporters/admin/${reporter.id}`, dataToSend);
      } else {
        await api.post('/reporters/admin', dataToSend);
      }

      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving reporter:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Error saving reporter. Please try again.';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
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

  const textareaStyle = {
    ...inputStyle,
    minHeight: '80px',
    resize: 'vertical'
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
    color: '#F44336',
    marginLeft: '4px'
  };

  return (
    <div style={modalStyle} onClick={onClose}>
      <div style={contentStyle} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '800' }}>
            {reporter ? 'Edit Reporter Submission' : 'Create Reporter Submission'}
          </h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', fontSize: '24px', cursor: 'pointer' }}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Personal Information Section */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: '#212121' }}>Personal Information</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              <div style={formGroupStyle}>
                <label style={labelStyle}>
                  Function Department <span style={requiredAsterisk}>*</span>
                </label>
                <select
                  name="function_department"
                  value={formData.function_department}
                  onChange={handleInputChange}
                  style={inputStyle}
                  required
                >
                  <option value="">Select department</option>
                  <option value="Commercial">Commercial</option>
                  <option value="Procurement">Procurement</option>
                  <option value="Publishing">Publishing</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Accounts and Finance">Accounts and Finance</option>
                </select>
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>
                  Position <span style={requiredAsterisk}>*</span>
                </label>
                <select
                  name="position"
                  value={formData.position}
                  onChange={handleInputChange}
                  style={inputStyle}
                  required
                >
                  <option value="">Select position</option>
                  <option value="Journalist">Journalist</option>
                  <option value="Reporter">Reporter</option>
                  <option value="Contributor">Contributor</option>
                  <option value="Staff">Staff</option>
                </select>
              </div>

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
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>
                  Gender <span style={requiredAsterisk}>*</span>
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  style={inputStyle}
                  required
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>
                  Email <span style={requiredAsterisk}>*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  style={inputStyle}
                  required
                />
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>WhatsApp</label>
                <input
                  type="tel"
                  name="whatsapp"
                  value={formData.whatsapp}
                  onChange={handleInputChange}
                  style={inputStyle}
                  placeholder="+1234567890"
                />
              </div>
            </div>
          </div>

          {/* Publication Information Section */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: '#212121' }}>Publication Information</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
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
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>Website URL</label>
                <input
                  type="url"
                  name="website_url"
                  value={formData.website_url}
                  onChange={handleInputChange}
                  style={inputStyle}
                  placeholder="https://example.com"
                />
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>
                  Publication Industry <span style={requiredAsterisk}>*</span>
                </label>
                <input
                  type="text"
                  name="publication_industry"
                  value={formData.publication_industry}
                  onChange={handleInputChange}
                  style={inputStyle}
                  placeholder="e.g., Technology, Finance, Health"
                  required
                />
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>
                  Publication Location <span style={requiredAsterisk}>*</span>
                </label>
                <input
                  type="text"
                  name="publication_location"
                  value={formData.publication_location}
                  onChange={handleInputChange}
                  style={inputStyle}
                  placeholder="e.g., New York, USA"
                  required
                />
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>
                  Niche Industry <span style={requiredAsterisk}>*</span>
                </label>
                <input
                  type="text"
                  name="niche_industry"
                  value={formData.niche_industry}
                  onChange={handleInputChange}
                  style={inputStyle}
                  placeholder="e.g., AI, Blockchain, Healthcare"
                  required
                />
              </div>
            </div>
          </div>

          {/* Social Media Links Section */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: '#212121' }}>Social Media Links</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              <div style={formGroupStyle}>
                <label style={labelStyle}>LinkedIn</label>
                <input
                  type="url"
                  name="linkedin"
                  value={formData.linkedin}
                  onChange={handleInputChange}
                  style={inputStyle}
                  placeholder="https://linkedin.com/in/username"
                />
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>Instagram</label>
                <input
                  type="url"
                  name="instagram"
                  value={formData.instagram}
                  onChange={handleInputChange}
                  style={inputStyle}
                  placeholder="https://instagram.com/username"
                />
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>Facebook</label>
                <input
                  type="url"
                  name="facebook"
                  value={formData.facebook}
                  onChange={handleInputChange}
                  style={inputStyle}
                  placeholder="https://facebook.com/username"
                />
              </div>
            </div>
          </div>

          {/* Content Policies Section */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: '#212121' }}>Content Policies & Requirements</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              <div style={formGroupStyle}>
                <label style={labelStyle}>Minimum Expectation (USD)</label>
                <input
                  type="number"
                  name="minimum_expectation_usd"
                  value={formData.minimum_expectation_usd}
                  onChange={handleInputChange}
                  style={inputStyle}
                  min="0"
                  step="0.01"
                />
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>Articles Per Month</label>
                <input
                  type="number"
                  name="articles_per_month"
                  value={formData.articles_per_month}
                  onChange={handleInputChange}
                  style={inputStyle}
                  min="0"
                />
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>Turnaround Time</label>
                <input
                  type="text"
                  name="turnaround_time"
                  value={formData.turnaround_time}
                  onChange={handleInputChange}
                  style={inputStyle}
                  placeholder="e.g., 24-48 hours"
                />
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>Sample URL</label>
                <input
                  type="url"
                  name="sample_url"
                  value={formData.sample_url}
                  onChange={handleInputChange}
                  style={inputStyle}
                  placeholder="https://example.com/sample-article"
                />
              </div>
            </div>

            <div style={{ marginTop: '16px' }}>
              <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: '#212121' }}>Article Permissions</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                <div style={formGroupStyle}>
                  <label style={{ display: 'flex', alignItems: 'center', fontSize: '14px' }}>
                    <input
                      type="checkbox"
                      name="company_allowed_in_title"
                      checked={formData.company_allowed_in_title}
                      onChange={handleInputChange}
                      style={checkboxStyle}
                    />
                    Company Name Allowed in Title
                  </label>
                </div>

                <div style={formGroupStyle}>
                  <label style={{ display: 'flex', alignItems: 'center', fontSize: '14px' }}>
                    <input
                      type="checkbox"
                      name="individual_allowed_in_title"
                      checked={formData.individual_allowed_in_title}
                      onChange={handleInputChange}
                      style={checkboxStyle}
                    />
                    Individual Name Allowed in Title
                  </label>
                </div>

                <div style={formGroupStyle}>
                  <label style={{ display: 'flex', alignItems: 'center', fontSize: '14px' }}>
                    <input
                      type="checkbox"
                      name="subheading_allowed"
                      checked={formData.subheading_allowed}
                      onChange={handleInputChange}
                      style={checkboxStyle}
                    />
                    Subheading Allowed
                  </label>
                </div>

                <div style={formGroupStyle}>
                  <label style={{ display: 'flex', alignItems: 'center', fontSize: '14px' }}>
                    <input
                      type="checkbox"
                      name="will_change_wordings"
                      checked={formData.will_change_wordings}
                      onChange={handleInputChange}
                      style={checkboxStyle}
                    />
                    Will Change Wordings if Required
                  </label>
                </div>

                <div style={formGroupStyle}>
                  <label style={{ display: 'flex', alignItems: 'center', fontSize: '14px' }}>
                    <input
                      type="checkbox"
                      name="article_placed_permanently"
                      checked={formData.article_placed_permanently}
                      onChange={handleInputChange}
                      style={checkboxStyle}
                    />
                    Article Placed Permanently
                  </label>
                </div>

                <div style={formGroupStyle}>
                  <label style={{ display: 'flex', alignItems: 'center', fontSize: '14px' }}>
                    <input
                      type="checkbox"
                      name="article_can_be_deleted"
                      checked={formData.article_can_be_deleted}
                      onChange={handleInputChange}
                      style={checkboxStyle}
                    />
                    Article Can Be Deleted on Request
                  </label>
                </div>

                <div style={formGroupStyle}>
                  <label style={{ display: 'flex', alignItems: 'center', fontSize: '14px' }}>
                    <input
                      type="checkbox"
                      name="article_can_be_modified"
                      checked={formData.article_can_be_modified}
                      onChange={handleInputChange}
                      style={checkboxStyle}
                    />
                    Article Can Be Modified on Request
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Information Section */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              <div style={formGroupStyle}>
                <label style={labelStyle}>
                  How Did You Hear About Us? <span style={requiredAsterisk}>*</span>
                </label>
                <select
                  name="how_heard_about_us"
                  value={formData.how_heard_about_us}
                  onChange={handleInputChange}
                  style={inputStyle}
                  required
                >
                  <option value="">Select an option</option>
                  <option value="Social Media">Social Media</option>
                  <option value="Search Engine">Search Engine</option>
                  <option value="Referral">Referral</option>
                  <option value="Email">Email</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  style={textareaStyle}
                  maxLength="500"
                  placeholder="Additional comments or requirements (max 500 characters)"
                />
                <div style={{ fontSize: '12px', color: '#757575', marginTop: '4px' }}>
                  {formData.message.length}/500 characters
                </div>
              </div>
            </div>
          </div>

          {/* Status (Admin only) */}
          {reporter && (
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: '#212121' }}>Admin Settings</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                <div style={formGroupStyle}>
                  <label style={labelStyle}>Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    style={inputStyle}
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginTop: '24px', flexDirection: 'row' }}>
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
                Terms and Conditions Accepted <span style={requiredAsterisk}>*</span>
              </label>
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
              {loading ? 'Saving...' : (reporter ? 'Update Reporter' : 'Create Reporter')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReporterFormModal;