import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const CareerFormModal = ({ isOpen, onClose, career, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    company: '',
    location: '',
    salary: '',
    type: '',
    status: 'active'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (career) {
      setFormData({
        title: career.title || '',
        description: career.description || '',
        company: career.company || '',
        location: career.location || '',
        salary: career.salary || '',
        type: career.type || '',
        status: career.status || 'active'
      });
    } else {
      setFormData({
        title: '',
        description: '',
        company: '',
        location: '',
        salary: '',
        type: '',
        status: 'active'
      });
    }
  }, [career, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const dataToSend = {
        ...formData,
        salary: formData.salary ? parseFloat(formData.salary) : null
      };

      if (career) {
        await api.put(`/careers/admin/${career.id}`, dataToSend);
      } else {
        await api.post('/careers/admin', dataToSend);
      }

      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving career:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Error saving career. Please try again.';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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
    maxWidth: '600px',
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
    minHeight: '100px',
    resize: 'vertical'
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
            {career ? 'Edit Career Posting' : 'Create Career Posting'}
          </h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', fontSize: '24px', cursor: 'pointer' }}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              <div style={formGroupStyle}>
                <label style={labelStyle}>
                  Job Title <span style={requiredAsterisk}>*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  style={inputStyle}
                  required
                  placeholder="e.g., Senior Software Engineer"
                />
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>Company</label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  style={inputStyle}
                  placeholder="e.g., Tech Corp Inc."
                />
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  style={inputStyle}
                  placeholder="e.g., New York, NY or Remote"
                />
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>Job Type</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  style={inputStyle}
                >
                  <option value="">Select type</option>
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                </select>
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>Salary (USD)</label>
                <input
                  type="number"
                  name="salary"
                  value={formData.salary}
                  onChange={handleInputChange}
                  style={inputStyle}
                  min="0"
                  step="1000"
                  placeholder="e.g., 75000"
                />
              </div>
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Job Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                style={textareaStyle}
                placeholder="Describe the job responsibilities, requirements, and benefits..."
                maxLength="2000"
              />
              <div style={{ fontSize: '12px', color: '#757575', marginTop: '4px' }}>
                {formData.description.length}/2000 characters
              </div>
            </div>
          </div>

          {/* Status (Admin only) */}
          {career && (
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
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>
            </div>
          )}

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
              {loading ? 'Saving...' : (career ? 'Update Career' : 'Create Career')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CareerFormModal;