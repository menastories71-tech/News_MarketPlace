import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';

const RoleFormModal = ({ isOpen, onClose, role, permissions, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    level: 1
  });
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (role) {
      setFormData({
        name: role.name || '',
        description: role.description || '',
        level: role.level || 1
      });
      setSelectedPermissions(role.permissions?.map(p => p.id) || []);
    } else {
      setFormData({
        name: '',
        description: '',
        level: 1
      });
      setSelectedPermissions([]);
    }
  }, [role, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const dataToSend = {
        ...formData,
        level: parseInt(formData.level),
        permissionIds: selectedPermissions
      };

      if (role) {
        await adminAPI.updateRole(role.id, dataToSend);
      } else {
        await adminAPI.createRole(dataToSend);
      }

      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving role:', error);
      const errorMessage = error.response?.data?.error || 'Error saving role. Please try again.';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionToggle = (permissionId) => {
    setSelectedPermissions(prev =>
      prev.includes(permissionId)
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    );
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
            {role ? 'Edit Role' : 'Create Role'}
          </h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', fontSize: '24px', cursor: 'pointer' }}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={formGroupStyle}>
            <label style={labelStyle}>Role Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              style={inputStyle}
              required
              placeholder="e.g., content_manager"
            />
          </div>

          <div style={formGroupStyle}>
            <label style={labelStyle}>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
              placeholder="Role description"
            />
          </div>

          <div style={formGroupStyle}>
            <label style={labelStyle}>Level *</label>
            <input
              type="number"
              min="0"
              max="10"
              value={formData.level}
              onChange={(e) => setFormData({ ...formData, level: e.target.value })}
              style={inputStyle}
              required
            />
            <small style={{ color: '#757575', fontSize: '12px' }}>
              Higher numbers indicate higher access levels (0-10)
            </small>
          </div>

          {/* Permission Selection */}
          <div style={{ marginTop: '24px', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px' }}>Permissions</h3>
            <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '12px' }}>
              {permissions.length === 0 ? (
                <p style={{ color: '#757575', fontStyle: 'italic' }}>No permissions available</p>
              ) : (
                permissions.map(permission => (
                  <div key={permission.id} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                    <input
                      type="checkbox"
                      checked={selectedPermissions.includes(permission.id)}
                      onChange={() => handlePermissionToggle(permission.id)}
                      style={{ marginRight: '8px' }}
                    />
                    <div>
                      <label style={{ fontSize: '14px', color: '#212121', fontWeight: '600' }}>
                        {permission.name}
                      </label>
                      <br />
                      <small style={{ color: '#757575' }}>
                        {permission.resource} - {permission.action}
                        {permission.description && ` (${permission.description})`}
                      </small>
                    </div>
                  </div>
                ))
              )}
            </div>
            <p style={{ fontSize: '12px', color: '#757575', marginTop: '8px' }}>
              Selected: {selectedPermissions.length} permission{selectedPermissions.length !== 1 ? 's' : ''}
            </p>
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
              {loading ? 'Saving...' : (role ? 'Update Role' : 'Create Role')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoleFormModal;