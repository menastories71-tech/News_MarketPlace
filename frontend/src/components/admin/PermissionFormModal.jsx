import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';

const PermissionFormModal = ({ isOpen, onClose, permission, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    resource: '',
    action: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (permission) {
      setFormData({
        name: permission.name || '',
        description: permission.description || '',
        resource: permission.resource || '',
        action: permission.action || ''
      });
    } else {
      setFormData({
        name: '',
        description: '',
        resource: '',
        action: ''
      });
    }
  }, [permission, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (permission) {
        await adminAPI.updatePermission(permission.id, formData);
      } else {
        await adminAPI.createPermission(formData);
      }

      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving permission:', error);
      const errorMessage = error.response?.data?.error || 'Error saving permission. Please try again.';
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
    maxWidth: '500px',
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

  const commonActions = ['create', 'read', 'update', 'delete', 'manage', 'view', 'edit'];
  const commonResources = ['users', 'roles', 'permissions', 'blogs', 'publications', 'press_packs', 'reports', 'settings'];

  return (
    <div style={modalStyle} onClick={onClose}>
      <div style={contentStyle} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '800' }}>
            {permission ? 'Edit Permission' : 'Create Permission'}
          </h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', fontSize: '24px', cursor: 'pointer' }}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={formGroupStyle}>
            <label style={labelStyle}>Permission Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              style={inputStyle}
              required
              placeholder="e.g., create_user"
            />
          </div>

          <div style={formGroupStyle}>
            <label style={labelStyle}>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              style={{ ...inputStyle, minHeight: '60px', resize: 'vertical' }}
              placeholder="Permission description"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={formGroupStyle}>
              <label style={labelStyle}>Resource *</label>
              <select
                value={formData.resource}
                onChange={(e) => setFormData({ ...formData, resource: e.target.value })}
                style={inputStyle}
                required
              >
                <option value="">Select Resource</option>
                {commonResources.map(resource => (
                  <option key={resource} value={resource}>{resource}</option>
                ))}
                <option value="other">Other</option>
              </select>
              {formData.resource === 'other' && (
                <input
                  type="text"
                  placeholder="Enter custom resource"
                  onChange={(e) => setFormData({ ...formData, resource: e.target.value })}
                  style={{ ...inputStyle, marginTop: '8px' }}
                />
              )}
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Action *</label>
              <select
                value={formData.action}
                onChange={(e) => setFormData({ ...formData, action: e.target.value })}
                style={inputStyle}
                required
              >
                <option value="">Select Action</option>
                {commonActions.map(action => (
                  <option key={action} value={action}>{action}</option>
                ))}
                <option value="other">Other</option>
              </select>
              {formData.action === 'other' && (
                <input
                  type="text"
                  placeholder="Enter custom action"
                  onChange={(e) => setFormData({ ...formData, action: e.target.value })}
                  style={{ ...inputStyle, marginTop: '8px' }}
                />
              )}
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
              {loading ? 'Saving...' : (permission ? 'Update Permission' : 'Create Permission')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PermissionFormModal;