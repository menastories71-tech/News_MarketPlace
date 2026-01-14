import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAdminAuth } from '../../context/AdminAuthContext';
import Icon from '../common/Icon';
import Sidebar from './Sidebar';
import api from '../../services/api';
import {
  Plus, Eye, Edit, Trash2, Search, Filter, CheckCircle2, XCircle,
  AlertCircle, Info, Calendar, MapPin, Users, Ticket, FileText, User,
  ToggleLeft, ToggleRight, CheckSquare, Square, Download, Upload, FileDown
} from 'lucide-react';

// Event View Modal Component
const EventViewModal = ({ isOpen, onClose, event }) => {
  if (!isOpen || !event) return null;

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
            Event Details
          </h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', fontSize: '24px', cursor: 'pointer' }}>
            ×
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
          <div>
            <strong>ID:</strong> {event.id}
          </div>
          <div>
            <strong>Title:</strong> {event.title}
          </div>
          <div>
            <strong>Event Type:</strong> {event.event_type || 'N/A'}
          </div>
          <div>
            <strong>Status:</strong>
            <span style={{
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: 'bold',
              color: event.status === 'active' ? '#4CAF50' :
                event.status === 'cancelled' ? '#F44336' : '#FF9800',
              backgroundColor: event.status === 'active' ? '#E8F5E8' :
                event.status === 'cancelled' ? '#FFEBEE' : '#FFF3E0'
            }}>
              {event.status ? event.status.toUpperCase() : 'N/A'}
            </span>
          </div>
          <div>
            <strong>Country:</strong> {event.country || 'N/A'}
          </div>
          <div>
            <strong>City:</strong> {event.city || 'N/A'}
          </div>
          <div>
            <strong>Venue:</strong> {event.venue || 'N/A'}
          </div>
          <div>
            <strong>Organizer:</strong> {event.organizer || 'N/A'}
          </div>
          <div>
            <strong>Start Date:</strong> {formatDate(event.start_date)}
          </div>
          <div>
            <strong>End Date:</strong> {formatDate(event.end_date)}
          </div>
          <div>
            <strong>Registration Deadline:</strong> {formatDate(event.registration_deadline)}
          </div>
          <div>
            <strong>Capacity:</strong> {event.capacity || 'Unlimited'}
          </div>
          <div>
            <strong>Free Event:</strong> {event.is_free ? 'Yes' : 'No'}
          </div>
          <div>
            <strong>Created At:</strong> {formatDate(event.created_at)}
          </div>
        </div>

        <div style={{ marginTop: '24px' }}>
          <strong>Description:</strong>
          <p style={{ marginTop: '8px', whiteSpace: 'pre-wrap', backgroundColor: '#f9f9f9', padding: '12px', borderRadius: '4px' }}>
            {event.description || 'No description'}
          </p>
        </div>

        {event.custom_form_fields && Object.keys(event.custom_form_fields).length > 0 && (
          <div style={{ marginTop: '24px' }}>
            <strong>Custom Registration Form Fields:</strong>
            <div style={{ marginTop: '8px', backgroundColor: '#f9f9f9', padding: '12px', borderRadius: '4px' }}>
              {Object.entries(event.custom_form_fields).map(([fieldName, fieldConfig], index) => (
                <div key={fieldName} style={{
                  marginBottom: index < Object.keys(event.custom_form_fields).length - 1 ? '12px' : 0,
                  padding: '8px',
                  backgroundColor: '#fff',
                  borderRadius: '4px',
                  border: '1px solid #e0e0e0'
                }}>
                  <div style={{ fontWeight: '600', color: '#212121', marginBottom: '4px' }}>
                    {fieldConfig.label || fieldName}
                  </div>
                  <div style={{ fontSize: '12px', color: '#757575' }}>
                    Type: {fieldConfig.type}
                    {fieldConfig.required && <span style={{ color: '#f44336', marginLeft: '8px' }}>• Required</span>}
                    {fieldConfig.type === 'select' && fieldConfig.options && (
                      <div style={{ marginTop: '4px' }}>
                        Options: {fieldConfig.options.join(', ')}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {event.disclaimer_text && (
          <div style={{ marginTop: '24px' }}>
            <strong>Disclaimer Text:</strong>
            <p style={{ marginTop: '8px', whiteSpace: 'pre-wrap', backgroundColor: '#f9f9f9', padding: '12px', borderRadius: '4px' }}>
              {event.disclaimer_text}
            </p>
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

// Ticket Create/Edit Modal Component
const TicketFormModal = ({ isOpen, onClose, ticket, eventId, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    quantity_available: '',
    max_per_user: '1',
    sale_start_date: '',
    sale_end_date: '',
    status: 'active'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (ticket) {
        setFormData({
          name: ticket.name || '',
          description: ticket.description || '',
          price: ticket.price ? ticket.price.toString() : '',
          quantity_available: ticket.quantity_available ? ticket.quantity_available.toString() : '',
          max_per_user: ticket.max_per_user ? ticket.max_per_user.toString() : '1',
          sale_start_date: ticket.sale_start_date ? ticket.sale_start_date.split('T')[0] : '',
          sale_end_date: ticket.sale_end_date ? ticket.sale_end_date.split('T')[0] : '',
          status: ticket.status || 'active'
        });
      } else {
        setFormData({
          name: '',
          description: '',
          price: '',
          quantity_available: '',
          max_per_user: '1',
          sale_start_date: '',
          sale_end_date: '',
          status: 'active'
        });
      }
    }
  }, [isOpen, ticket]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      alert('Name is required');
      return;
    }
    if (!formData.quantity_available || parseInt(formData.quantity_available) < 1) {
      alert('Quantity available must be at least 1');
      return;
    }
    if (parseFloat(formData.price) < 0) {
      alert('Price cannot be negative');
      return;
    }

    setLoading(true);

    try {
      const submitData = {
        ...formData,
        event_id: eventId,
        price: parseFloat(formData.price) || 0,
        quantity_available: parseInt(formData.quantity_available),
        max_per_user: parseInt(formData.max_per_user) || 1
      };

      if (ticket) {
        await api.put(`/events/tickets/${ticket.id}`, submitData);
      } else {
        await api.post(`/events/${eventId}/tickets`, submitData);
      }

      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving ticket:', error);
      const message = error.response?.data?.message || error.message || 'Error saving ticket. Please try again.';
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
            {ticket ? 'Edit Ticket' : 'Create New Ticket'}
          </h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', fontSize: '24px', cursor: 'pointer' }}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
            <div style={formGroupStyle}>
              <label style={labelStyle}>Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                style={inputStyle}
                required
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Price</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                style={inputStyle}
                min="0"
                step="0.01"
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Quantity Available *</label>
              <input
                type="number"
                value={formData.quantity_available}
                onChange={(e) => setFormData({ ...formData, quantity_available: e.target.value })}
                style={inputStyle}
                min="1"
                required
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Max Per User</label>
              <input
                type="number"
                value={formData.max_per_user}
                onChange={(e) => setFormData({ ...formData, max_per_user: e.target.value })}
                style={inputStyle}
                min="1"
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Sale Start Date</label>
              <input
                type="date"
                value={formData.sale_start_date}
                onChange={(e) => setFormData({ ...formData, sale_start_date: e.target.value })}
                style={inputStyle}
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Sale End Date</label>
              <input
                type="date"
                value={formData.sale_end_date}
                onChange={(e) => setFormData({ ...formData, sale_end_date: e.target.value })}
                style={inputStyle}
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                style={selectStyle}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div style={formGroupStyle}>
            <label style={labelStyle}>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
            />
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
              {loading ? 'Saving...' : (ticket ? 'Update Ticket' : 'Create Ticket')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Disclaimer Create/Edit Modal Component
const DisclaimerFormModal = ({ isOpen, onClose, disclaimer, eventId, onSave }) => {
  const [formData, setFormData] = useState({
    message: '',
    is_active: true,
    display_order: '0'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (disclaimer) {
        setFormData({
          message: disclaimer.message || '',
          is_active: disclaimer.is_active !== undefined ? disclaimer.is_active : true,
          display_order: disclaimer.display_order ? disclaimer.display_order.toString() : '0'
        });
      } else {
        setFormData({
          message: '',
          is_active: true,
          display_order: '0'
        });
      }
    }
  }, [isOpen, disclaimer]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.message.trim()) {
      alert('Message is required');
      return;
    }

    setLoading(true);

    try {
      const submitData = {
        ...formData,
        event_id: eventId,
        display_order: parseInt(formData.display_order) || 0
      };

      if (disclaimer) {
        await api.put(`/events/disclaimers/${disclaimer.id}`, submitData);
      } else {
        await api.post(`/events/${eventId}/disclaimers`, submitData);
      }

      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving disclaimer:', error);
      const message = error.response?.data?.message || error.message || 'Error saving disclaimer. Please try again.';
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
            {disclaimer ? 'Edit Disclaimer' : 'Create New Disclaimer'}
          </h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', fontSize: '24px', cursor: 'pointer' }}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={formGroupStyle}>
            <label style={labelStyle}>Message *</label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div style={formGroupStyle}>
              <label style={labelStyle}>Display Order</label>
              <input
                type="number"
                value={formData.display_order}
                onChange={(e) => setFormData({ ...formData, display_order: e.target.value })}
                style={inputStyle}
                min="0"
              />
            </div>

            <div style={formGroupStyle}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  style={{ width: '16px', height: '16px' }}
                />
                <span style={{ fontSize: '14px', color: '#212121' }}>Active</span>
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
              {loading ? 'Saving...' : (disclaimer ? 'Update Disclaimer' : 'Create Disclaimer')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Event Create/Edit Modal Component
const EventFormModal = ({ isOpen, onClose, event, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    country: '',
    city: '',
    start_date: '',
    end_date: '',
    month: '',
    event_type: '',
    is_free: false,
    organizer: '',
    venue: '',
    capacity: '',
    registration_deadline: '',
    status: 'active',
    custom_form_fields: [],
    disclaimer_text: '',
    enable_sponsor: false,
    enable_media_partner: false,
    enable_speaker: false,
    enable_guest: false
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (event) {
        // Convert JSON object to array format for easier editing
        const customFieldsArray = event.custom_form_fields ?
          (Array.isArray(event.custom_form_fields) ? event.custom_form_fields :
            Object.entries(event.custom_form_fields).map(([key, value]) => ({
              name: key,
              ...value
            }))) : [];

        setFormData({
          title: event.title || '',
          description: event.description || '',
          country: event.country || '',
          city: event.city || '',
          start_date: event.start_date ? event.start_date.split('T')[0] : '',
          end_date: event.end_date ? event.end_date.split('T')[0] : '',
          month: event.month || '',
          event_type: event.event_type || '',
          is_free: event.is_free || false,
          organizer: event.organizer || '',
          venue: event.venue || '',
          capacity: event.capacity || '',
          registration_deadline: event.registration_deadline ? event.registration_deadline.split('T')[0] : '',
          status: event.status || 'active',
          custom_form_fields: customFieldsArray,
          disclaimer_text: event.disclaimer_text || '',
          enable_sponsor: event.enable_sponsor || false,
          enable_media_partner: event.enable_media_partner || false,
          enable_speaker: event.enable_speaker || false,
          enable_guest: event.enable_guest || false
        });
      } else {
        setFormData({
          title: '',
          description: '',
          country: '',
          city: '',
          start_date: '',
          end_date: '',
          month: '',
          event_type: '',
          is_free: false,
          organizer: '',
          venue: '',
          capacity: '',
          registration_deadline: '',
          status: 'active',
          custom_form_fields: [],
          disclaimer_text: '',
          enable_sponsor: false,
          enable_media_partner: false,
          enable_speaker: false,
          enable_guest: false
        });
      }
    }
  }, [isOpen, event]);

  // Helper functions for custom form fields
  const addCustomField = () => {
    setFormData({
      ...formData,
      custom_form_fields: [
        ...formData.custom_form_fields,
        { name: '', type: 'text', required: false, label: '', options: [] }
      ]
    });
  };

  const updateCustomField = (index, field, value) => {
    const updatedFields = [...formData.custom_form_fields];
    updatedFields[index] = { ...updatedFields[index], [field]: value };
    setFormData({ ...formData, custom_form_fields: updatedFields });
  };

  const removeCustomField = (index) => {
    const updatedFields = formData.custom_form_fields.filter((_, i) => i !== index);
    setFormData({ ...formData, custom_form_fields: updatedFields });
  };

  const addSelectOption = (fieldIndex) => {
    const updatedFields = [...formData.custom_form_fields];
    if (!updatedFields[fieldIndex].options) {
      updatedFields[fieldIndex].options = [];
    }
    updatedFields[fieldIndex].options.push('');
    setFormData({ ...formData, custom_form_fields: updatedFields });
  };

  const updateSelectOption = (fieldIndex, optionIndex, value) => {
    const updatedFields = [...formData.custom_form_fields];
    updatedFields[fieldIndex].options[optionIndex] = value;
    setFormData({ ...formData, custom_form_fields: updatedFields });
  };

  const removeSelectOption = (fieldIndex, optionIndex) => {
    const updatedFields = [...formData.custom_form_fields];
    updatedFields[fieldIndex].options.splice(optionIndex, 1);
    setFormData({ ...formData, custom_form_fields: updatedFields });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.title.trim()) {
      alert('Title is required');
      return;
    }
    if (!formData.start_date) {
      alert('Start date is required');
      return;
    }

    // Convert custom form fields array to object format for backend
    const customFieldsObject = {};
    formData.custom_form_fields.forEach(field => {
      if (field.name && field.name.trim()) {
        customFieldsObject[field.name] = {
          type: field.type,
          required: field.required,
          label: field.label || field.name
        };
        if (field.type === 'select' && field.options && field.options.length > 0) {
          customFieldsObject[field.name].options = field.options.filter(opt => opt.trim());
        }
      }
    });

    setLoading(true);

    try {
      const submitData = {
        ...formData,
        custom_form_fields: customFieldsObject
      };

      if (event) {
        await api.put(`/events/${event.id}`, submitData);
      } else {
        await api.post('/events', submitData);
      }

      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving event:', error);
      const message = error.response?.data?.message || error.message || 'Error saving event. Please try again.';
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
            {event ? 'Edit Event' : 'Create New Event'}
          </h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', fontSize: '24px', cursor: 'pointer' }}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
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
              <label style={labelStyle}>Event Type</label>
              <select
                value={formData.event_type}
                onChange={(e) => setFormData({ ...formData, event_type: e.target.value })}
                style={selectStyle}
              >
                <option value="">Select event type</option>
                <option value="Government Summit">Government Summit</option>
                <option value="Power List">Power List</option>
                <option value="Membership">Membership</option>
                <option value="Leisure Events">Leisure Events</option>
                <option value="Sports Events">Sports Events</option>
                <option value="Music Festival">Music Festival</option>
                <option value="Art Festival">Art Festival</option>
              </select>
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Country</label>
              <input
                type="text"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                style={inputStyle}
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>City</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                style={inputStyle}
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Venue</label>
              <input
                type="text"
                value={formData.venue}
                onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                style={inputStyle}
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Organizer</label>
              <input
                type="text"
                value={formData.organizer}
                onChange={(e) => setFormData({ ...formData, organizer: e.target.value })}
                style={inputStyle}
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Start Date *</label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                style={inputStyle}
                required
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>End Date</label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                style={inputStyle}
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Registration Deadline</label>
              <input
                type="date"
                value={formData.registration_deadline}
                onChange={(e) => setFormData({ ...formData, registration_deadline: e.target.value })}
                style={inputStyle}
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Capacity</label>
              <input
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                style={inputStyle}
                min="1"
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                style={selectStyle}
              >
                <option value="active">Active</option>
                <option value="cancelled">Cancelled</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div style={formGroupStyle}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.is_free}
                  onChange={(e) => setFormData({ ...formData, is_free: e.target.checked })}
                  style={{ width: '16px', height: '16px' }}
                />
                <span style={{ fontSize: '14px', color: '#212121' }}>Free Event</span>
              </label>
            </div>
          </div>

          <div style={formGroupStyle}>
            <label style={labelStyle}>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
            />
          </div>

          <div style={formGroupStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <label style={labelStyle}>Custom Registration Form Fields</label>
              <button
                type="button"
                onClick={addCustomField}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#4CAF50',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                + Add Field
              </button>
            </div>

            {formData.custom_form_fields.map((field, index) => (
              <div key={index} style={{
                border: '1px solid #E0E0E0',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '16px',
                backgroundColor: '#FAFAFA'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#212121' }}>
                    Field {index + 1}
                  </h4>
                  <button
                    type="button"
                    onClick={() => removeCustomField(index)}
                    style={{
                      padding: '4px 8px',
                      backgroundColor: '#F44336',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    Remove
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#212121', marginBottom: '4px' }}>
                      Field Name *
                    </label>
                    <input
                      type="text"
                      value={field.name}
                      onChange={(e) => updateCustomField(index, 'name', e.target.value)}
                      style={{ ...inputStyle, fontSize: '14px', padding: '8px 12px' }}
                      placeholder="e.g., full_name"
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#212121', marginBottom: '4px' }}>
                      Display Label
                    </label>
                    <input
                      type="text"
                      value={field.label}
                      onChange={(e) => updateCustomField(index, 'label', e.target.value)}
                      style={{ ...inputStyle, fontSize: '14px', padding: '8px 12px' }}
                      placeholder="e.g., Full Name"
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#212121', marginBottom: '4px' }}>
                      Field Type
                    </label>
                    <select
                      value={field.type}
                      onChange={(e) => updateCustomField(index, 'type', e.target.value)}
                      style={{ ...selectStyle, fontSize: '14px', padding: '8px 12px' }}
                    >
                      <option value="text">Text</option>
                      <option value="email">Email</option>
                      <option value="tel">Phone</option>
                      <option value="textarea">Textarea</option>
                      <option value="select">Select</option>
                      <option value="checkbox">Checkbox</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', paddingTop: '24px' }}>
                    <input
                      type="checkbox"
                      checked={field.required}
                      onChange={(e) => updateCustomField(index, 'required', e.target.checked)}
                      style={{ width: '16px', height: '16px', marginRight: '8px' }}
                    />
                    <label style={{ fontSize: '12px', color: '#212121' }}>Required</label>
                  </div>
                </div>

                {field.type === 'select' && (
                  <div style={{ marginTop: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <label style={{ fontSize: '12px', fontWeight: '600', color: '#212121' }}>Select Options</label>
                      <button
                        type="button"
                        onClick={() => addSelectOption(index)}
                        style={{
                          padding: '4px 8px',
                          backgroundColor: '#2196F3',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '4px',
                          fontSize: '11px',
                          cursor: 'pointer'
                        }}
                      >
                        + Add Option
                      </button>
                    </div>
                    {field.options && field.options.map((option, optionIndex) => (
                      <div key={optionIndex} style={{ display: 'flex', gap: '8px', marginBottom: '4px', alignItems: 'center' }}>
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => updateSelectOption(index, optionIndex, e.target.value)}
                          style={{ ...inputStyle, fontSize: '12px', padding: '6px 8px', flex: 1 }}
                          placeholder="Option value"
                        />
                        <button
                          type="button"
                          onClick={() => removeSelectOption(index, optionIndex)}
                          style={{
                            padding: '6px 8px',
                            backgroundColor: '#FF9800',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '11px',
                            cursor: 'pointer'
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {formData.custom_form_fields.length === 0 && (
              <div style={{
                textAlign: 'center',
                padding: '40px',
                backgroundColor: '#FAFAFA',
                border: '2px dashed #E0E0E0',
                borderRadius: '8px',
                color: '#757575'
              }}>
                <p>No custom form fields added yet.</p>
                <p style={{ fontSize: '14px' }}>Click "Add Field" to create custom registration form fields.</p>
              </div>
            )}
          </div>

          <div style={formGroupStyle}>
            <label style={labelStyle}>Disclaimer Text</label>
            <textarea
              value={formData.disclaimer_text}
              onChange={(e) => setFormData({ ...formData, disclaimer_text: e.target.value })}
              style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
            />
          </div>

          <div style={formGroupStyle}>
            <label style={{ ...labelStyle, marginBottom: '12px', display: 'block' }}>Application Types</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  checked={formData.enable_sponsor || false}
                  onChange={(e) => setFormData({ ...formData, enable_sponsor: e.target.checked })}
                  style={{ width: '16px', height: '16px' }}
                />
                <label style={{ fontSize: '14px', color: '#212121' }}>Enable Sponsor Applications</label>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  checked={formData.enable_media_partner || false}
                  onChange={(e) => setFormData({ ...formData, enable_media_partner: e.target.checked })}
                  style={{ width: '16px', height: '16px' }}
                />
                <label style={{ fontSize: '14px', color: '#212121' }}>Enable Media Partner Applications</label>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  checked={formData.enable_speaker || false}
                  onChange={(e) => setFormData({ ...formData, enable_speaker: e.target.checked })}
                  style={{ width: '16px', height: '16px' }}
                />
                <label style={{ fontSize: '14px', color: '#212121' }}>Enable Speaker Applications</label>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  checked={formData.enable_guest || false}
                  onChange={(e) => setFormData({ ...formData, enable_guest: e.target.checked })}
                  style={{ width: '16px', height: '16px' }}
                />
                <label style={{ fontSize: '14px', color: '#212121' }}>Enable Guest Applications</label>
              </div>
            </div>
            <p style={{ fontSize: '12px', color: '#757575', marginTop: '8px' }}>
              Check the boxes to allow users to apply for these roles during event registration.
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
              {loading ? 'Saving...' : (event ? 'Update Event' : 'Create Event')}
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


// Bulk Upload Modal
const BulkUploadModal = ({ isOpen, onClose, onUpload, loading }) => {
  const [file, setFile] = useState(null);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000
    }} onClick={onClose}>
      <div style={{
        background: '#fff', borderRadius: '12px', padding: '24px', width: '100%', maxWidth: '500px'
      }} onClick={e => e.stopPropagation()}>
        <h2 style={{ marginTop: 0 }}>Bulk Upload Events</h2>
        <p style={{ color: '#666', marginBottom: '20px' }}>Upload a CSV file to create multiple events at once.</p>

        <div style={{ border: '2px dashed #ccc', padding: '30px', textAlign: 'center', borderRadius: '8px', marginBottom: '20px' }}>
          <input
            type="file"
            accept=".csv"
            onChange={(e) => setFile(e.target.files[0])}
            style={{ display: 'none' }}
            id="csv-upload"
          />
          <label htmlFor="csv-upload" style={{ cursor: 'pointer', display: 'block' }}>
            {file ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#1976D2' }}>
                <FileText size={24} />
                <span>{file.name}</span>
              </div>
            ) : (
              <div style={{ color: '#666' }}>
                <Upload size={40} style={{ color: '#ccc', marginBottom: '10px' }} />
                <div>Click to select CSV file</div>
              </div>
            )}
          </label>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button onClick={onClose} style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #ccc', background: '#fff', cursor: 'pointer' }}>Cancel</button>
          <button
            onClick={() => onUpload(file)}
            disabled={!file || loading}
            style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: '#1976D2', color: '#fff', cursor: 'pointer', opacity: (!file || loading) ? 0.7 : 1 }}
          >
            {loading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Download Options Modal
const DownloadOptionsModal = ({ isOpen, onClose, onDownload, onDownloadTemplate }) => {
  if (!isOpen) return null;
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000
    }} onClick={onClose}>
      <div style={{
        background: '#fff', borderRadius: '12px', padding: '24px', width: '100%', maxWidth: '400px'
      }} onClick={e => e.stopPropagation()}>
        <h2 style={{ marginTop: 0, marginBottom: '24px' }}>Download Options</h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button
            onClick={() => onDownload(true)}
            style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e0e0e0', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', textAlign: 'left' }}
          >
            <div style={{ background: '#E3F2FD', padding: '8px', borderRadius: '6px' }}>
              <Filter size={20} color="#1976D2" />
            </div>
            <div>
              <div style={{ fontWeight: '600' }}>Download Filtered Data</div>
              <div style={{ fontSize: '12px', color: '#666' }}>Export currently visible events</div>
            </div>
          </button>

          <button
            onClick={() => onDownload(false)}
            style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e0e0e0', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', textAlign: 'left' }}
          >
            <div style={{ background: '#E8F5E9', padding: '8px', borderRadius: '6px' }}>
              <FileText size={20} color="#2E7D32" />
            </div>
            <div>
              <div style={{ fontWeight: '600' }}>Download All Data</div>
              <div style={{ fontSize: '12px', color: '#666' }}>Export complete database</div>
            </div>
          </button>

          <div style={{ height: '1px', background: '#eee', margin: '4px 0' }}></div>

          <button
            onClick={onDownloadTemplate}
            style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e0e0e0', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', textAlign: 'left' }}
          >
            <div style={{ background: '#FFF3E0', padding: '8px', borderRadius: '6px' }}>
              <FileDown size={20} color="#EF6C00" />
            </div>
            <div>
              <div style={{ fontWeight: '600' }}>Download Template</div>
              <div style={{ fontSize: '12px', color: '#666' }}>CSV template for bulk upload</div>
            </div>
          </button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
          <button onClick={onClose} style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #ccc', background: '#fff', cursor: 'pointer' }}>Close</button>
        </div>
      </div>
    </div>
  );
};

const EventManagement = () => {
  const { admin, logout, hasRole } = useAdminAuth();

  // Check if user has permission to manage events
  if (!hasRole('super_admin')) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: theme.backgroundSoft }}>
        <div style={{ textAlign: 'center' }}>
          <Icon name="shield-exclamation" size="lg" style={{ color: theme.danger, marginBottom: '16px' }} />
          <h2 style={{ color: theme.textPrimary, marginBottom: '8px' }}>Access Denied</h2>
          <p style={{ color: theme.textSecondary }}>You don't have permission to access event management.</p>
          <p style={{ color: theme.textSecondary, fontSize: '14px', marginTop: '8px' }}>
            Required role: Super Admin
          </p>
        </div>
      </div>
    );
  }

  const [activeTab, setActiveTab] = useState('events');
  const [events, setEvents] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [disclaimers, setDisclaimers] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [sponsors, setSponsors] = useState([]);
  const [mediaPartners, setMediaPartners] = useState([]);
  const [speakers, setSpeakers] = useState([]);
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Modal states
  const [showEventViewModal, setShowEventViewModal] = useState(false);
  const [showEventFormModal, setShowEventFormModal] = useState(false);
  const [showTicketFormModal, setShowTicketFormModal] = useState(false);
  const [showDisclaimerFormModal, setShowDisclaimerFormModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [selectedDisclaimer, setSelectedDisclaimer] = useState(null);
  const [selectedEventId, setSelectedEventId] = useState(null);

  // Search and filter states
  const [eventSearchQuery, setEventSearchQuery] = useState('');
  const [eventStatusFilter, setEventStatusFilter] = useState('');
  const [eventCurrentPage, setEventCurrentPage] = useState(1);
  const [eventPageSize, setEventPageSize] = useState(10);
  const [eventTotalPages, setEventTotalPages] = useState(1);

  // Bulk/CSV states
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Pagination states for different tabs
  const [ticketsCurrentPage, setTicketsCurrentPage] = useState(1);
  const [ticketsPageSize, setTicketsPageSize] = useState(10);
  const [disclaimersCurrentPage, setDisclaimersCurrentPage] = useState(1);
  const [disclaimersPageSize, setDisclaimersPageSize] = useState(10);
  const [registrationsCurrentPage, setRegistrationsCurrentPage] = useState(1);
  const [registrationsPageSize, setRegistrationsPageSize] = useState(10);
  const [sponsorsCurrentPage, setSponsorsCurrentPage] = useState(1);
  const [sponsorsPageSize, setSponsorsPageSize] = useState(10);
  const [mediaPartnersCurrentPage, setMediaPartnersCurrentPage] = useState(1);
  const [mediaPartnersPageSize, setMediaPartnersPageSize] = useState(10);
  const [speakersCurrentPage, setSpeakersCurrentPage] = useState(1);
  const [speakersPageSize, setSpeakersPageSize] = useState(10);
  const [guestsCurrentPage, setGuestsCurrentPage] = useState(1);
  const [guestsPageSize, setGuestsPageSize] = useState(10);

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
    fetchEvents();
  }, []);

  useEffect(() => {
    if (activeTab === 'events') {
      fetchEvents();
    } else if (activeTab === 'tickets') {
      fetchTickets();
    } else if (activeTab === 'disclaimers') {
      fetchDisclaimers();
    } else if (activeTab === 'registrations') {
      fetchRegistrations();
    } else if (activeTab === 'sponsors') {
      fetchSponsors();
    } else if (activeTab === 'media_partners') {
      fetchMediaPartners();
    } else if (activeTab === 'speakers') {
      fetchSpeakers();
    } else if (activeTab === 'guests') {
      fetchGuests();
    }
  }, [activeTab]);

  const fetchEvents = async () => {
    try {
      const params = new URLSearchParams({
        page: eventCurrentPage,
        limit: eventPageSize,
        search: eventSearchQuery
      });
      if (eventStatusFilter) params.append('status', eventStatusFilter);

      const response = await api.get(`/events?${params.toString()}`);
      setEvents(response.data.events || []);
      setEventTotalPages(response.data.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Error fetching events:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('adminAccessToken');
        window.location.href = '/admin/login';
      } else {
        alert('Failed to load events. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchTickets = async () => {
    // For now, fetch all tickets - in a real app, you might want to filter by event
    try {
      const response = await api.get('/events/tickets');
      setTickets(response.data || []);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    }
  };

  // Pagination logic for tickets
  const paginatedTickets = useMemo(() => {
    const filteredTickets = selectedEventId ? tickets.filter(ticket => ticket.event_id === parseInt(selectedEventId)) : tickets;
    const startIndex = (ticketsCurrentPage - 1) * ticketsPageSize;
    return filteredTickets.slice(startIndex, startIndex + ticketsPageSize);
  }, [tickets, selectedEventId, ticketsCurrentPage, ticketsPageSize]);

  const ticketsTotalPages = Math.ceil((selectedEventId ? tickets.filter(ticket => ticket.event_id === parseInt(selectedEventId)).length : tickets.length) / ticketsPageSize);

  const fetchDisclaimers = async () => {
    try {
      const response = await api.get('/events/disclaimers');
      setDisclaimers(response.data.disclaimers || []);
    } catch (error) {
      console.error('Error fetching disclaimers:', error);
    }
  };

  const fetchRegistrations = async () => {
    // For admin view, we might need a general registrations endpoint
    // For now, we'll try to get registrations from all events
    try {
      // Ensure events are loaded
      if (events.length === 0) {
        await fetchEvents();
      }

      const allRegistrations = [];
      for (const event of events) {
        try {
          const response = await api.get(`/events/${event.id}/registrations`);
          if (response.data.registrations) {
            allRegistrations.push(...response.data.registrations);
          }
        } catch (error) {
          // Skip events that don't have registrations or fail
          console.log(`No registrations for event ${event.id}`);
        }
      }
      setRegistrations(allRegistrations);
    } catch (error) {
      console.error('Error fetching registrations:', error);
      setRegistrations([]);
    }
  };

  const fetchSponsors = async () => {
    try {
      // Ensure events are loaded
      if (events.length === 0) {
        await fetchEvents();
      }

      const allSponsors = [];
      for (const event of events) {
        try {
          const response = await api.get(`/event-applications/events/${event.id}/sponsors`);
          if (response.data.sponsors) {
            allSponsors.push(...response.data.sponsors);
          }
        } catch (error) {
          console.log(`No sponsors for event ${event.id}`);
        }
      }
      setSponsors(allSponsors);
    } catch (error) {
      console.error('Error fetching sponsors:', error);
      setSponsors([]);
    }
  };

  const fetchMediaPartners = async () => {
    try {
      // Ensure events are loaded
      if (events.length === 0) {
        await fetchEvents();
      }

      const allMediaPartners = [];
      for (const event of events) {
        try {
          const response = await api.get(`/event-applications/events/${event.id}/media-partners`);
          if (response.data.media_partners) {
            allMediaPartners.push(...response.data.media_partners);
          }
        } catch (error) {
          console.log(`No media partners for event ${event.id}`);
        }
      }
      setMediaPartners(allMediaPartners);
    } catch (error) {
      console.error('Error fetching media partners:', error);
      setMediaPartners([]);
    }
  };

  const fetchSpeakers = async () => {
    try {
      // Ensure events are loaded
      if (events.length === 0) {
        await fetchEvents();
      }

      const allSpeakers = [];
      for (const event of events) {
        try {
          const response = await api.get(`/event-applications/events/${event.id}/speakers`);
          if (response.data.speakers) {
            allSpeakers.push(...response.data.speakers);
          }
        } catch (error) {
          console.log(`No speakers for event ${event.id}`);
        }
      }
      setSpeakers(allSpeakers);
    } catch (error) {
      console.error('Error fetching speakers:', error);
      setSpeakers([]);
    }
  };

  const fetchGuests = async () => {
    try {
      // Ensure events are loaded
      if (events.length === 0) {
        await fetchEvents();
      }

      const allGuests = [];
      for (const event of events) {
        try {
          const response = await api.get(`/event-applications/events/${event.id}/guests`);
          if (response.data.guests) {
            allGuests.push(...response.data.guests);
          }
        } catch (error) {
          console.log(`No guests for event ${event.id}`);
        }
      }
      setGuests(allGuests);
    } catch (error) {
      console.error('Error fetching guests:', error);
      setGuests([]);
    }
  };

  const handleEventSearch = () => {
    setEventCurrentPage(1);
    fetchEvents();
  };

  const handleViewEvent = async (event) => {
    setSelectedEvent(event);
    setShowEventViewModal(true);
  };

  const handleEditEvent = async (event) => {
    setSelectedEvent(event);
    setShowEventFormModal(true);
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) return;

    try {
      await api.delete(`/events/${eventId}`);
      fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Error deleting event. Please try again.');
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await api.get('/events/download-template', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'event_template.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      setDownloadModalOpen(false);
    } catch (error) {
      console.error('Error downloading template:', error);
      alert('Failed to download template');
    }
  };

  const handleDownloadCSV = async (filtered = false) => {
    try {
      const params = filtered ? new URLSearchParams({
        ...(eventSearchQuery && { search: eventSearchQuery }),
        ...(eventStatusFilter && { status: eventStatusFilter })
      }) : new URLSearchParams();

      const response = await api.get(`/events/download-csv?${params}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filtered ? 'events_filtered.csv' : 'events_all.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      setDownloadModalOpen(false);
    } catch (error) {
      console.error('Error downloading CSV:', error);
      alert('Failed to download CSV');
    }
  };

  const handleBulkUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/events/bulk-upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      alert(response.data.message);
      if (response.data.errors) {
        console.error('Upload errors:', response.data.errors);
        alert('Some records failed. Check console for details.');
      }
      fetchEvents();
      setUploadModalOpen(false);
    } catch (error) {
      console.error('Bulk upload error:', error);
      alert('Failed to upload events');
    } finally {
      setUploading(false);
    }
  };

  const handleEventFormSave = () => {
    fetchEvents();
    setShowEventFormModal(false);
    setSelectedEvent(null);
  };

  const handleTicketFormSave = () => {
    fetchTickets();
    setShowTicketFormModal(false);
    setSelectedTicket(null);
    setSelectedEventId(null);
  };

  const handleDisclaimerFormSave = () => {
    fetchDisclaimers();
    setShowDisclaimerFormModal(false);
    setSelectedDisclaimer(null);
    setSelectedEventId(null);
  };

  const handleCreateTicket = (eventId) => {
    setSelectedEventId(eventId);
    setShowTicketFormModal(true);
  };

  const handleEditTicket = (ticket) => {
    setSelectedTicket(ticket);
    setSelectedEventId(ticket.event_id);
    setShowTicketFormModal(true);
  };

  const handleDeleteTicket = async (ticketId) => {
    if (!window.confirm('Are you sure you want to delete this ticket? This action cannot be undone.')) return;

    try {
      await api.delete(`/events/tickets/${ticketId}`);
      fetchTickets();
    } catch (error) {
      console.error('Error deleting ticket:', error);
      alert('Error deleting ticket. Please try again.');
    }
  };

  const handleCreateDisclaimer = (eventId) => {
    setSelectedEventId(eventId);
    setShowDisclaimerFormModal(true);
  };

  const handleEditDisclaimer = (disclaimer) => {
    setSelectedDisclaimer(disclaimer);
    setSelectedEventId(disclaimer.event_id);
    setShowDisclaimerFormModal(true);
  };

  const handleDeleteDisclaimer = async (disclaimerId) => {
    if (!window.confirm('Are you sure you want to delete this disclaimer? This action cannot be undone.')) return;

    try {
      await api.delete(`/events/disclaimers/${disclaimerId}`);
      fetchDisclaimers();
    } catch (error) {
      console.error('Error deleting disclaimer:', error);
      alert('Error deleting disclaimer. Please try again.');
    }
  };

  const handleToggleDisclaimerStatus = async (disclaimer) => {
    try {
      await api.put(`/events/disclaimers/${disclaimer.id}`, {
        ...disclaimer,
        is_active: !disclaimer.is_active
      });
      fetchDisclaimers();
    } catch (error) {
      console.error('Error updating disclaimer status:', error);
      alert('Error updating disclaimer status. Please try again.');
    }
  };

  const handleViewRegistration = (registration) => {
    // For now, just show an alert with registration details
    alert(`Registration Details:\nID: ${registration.id}\nEvent: ${registration.event_title}\nUser: ${registration.user?.first_name} ${registration.user?.last_name}\nStatus: ${registration.status}\nPayment: ${registration.payment_status}`);
  };

  const handleUpdateRegistrationStatus = async (registrationId, newStatus) => {
    if (!window.confirm(`Are you sure you want to ${newStatus} this registration?`)) return;

    try {
      await api.put(`/events/registrations/${registrationId}`, { status: newStatus });
      fetchRegistrations();
    } catch (error) {
      console.error('Error updating registration status:', error);
      alert('Error updating registration status. Please try again.');
    }
  };

  const handleUpdateSponsorStatus = async (sponsorId, newStatus) => {
    if (!window.confirm(`Are you sure you want to ${newStatus} this sponsor application?`)) return;

    try {
      await api.put(`/event-applications/sponsors/${sponsorId}/status`, { status: newStatus });
      fetchSponsors();
    } catch (error) {
      console.error('Error updating sponsor status:', error);
      alert('Error updating sponsor status. Please try again.');
    }
  };

  const handleUpdateMediaPartnerStatus = async (partnerId, newStatus) => {
    if (!window.confirm(`Are you sure you want to ${newStatus} this media partner application?`)) return;

    try {
      await api.put(`/event-applications/media-partners/${partnerId}/status`, { status: newStatus });
      fetchMediaPartners();
    } catch (error) {
      console.error('Error updating media partner status:', error);
      alert('Error updating media partner status. Please try again.');
    }
  };

  const handleUpdateSpeakerStatus = async (speakerId, newStatus) => {
    if (!window.confirm(`Are you sure you want to ${newStatus} this speaker application?`)) return;

    try {
      await api.put(`/event-applications/speakers/${speakerId}/status`, { status: newStatus });
      fetchSpeakers();
    } catch (error) {
      console.error('Error updating speaker status:', error);
      alert('Error updating speaker status. Please try again.');
    }
  };

  const handleUpdateGuestStatus = async (guestId, newStatus) => {
    if (!window.confirm(`Are you sure you want to ${newStatus} this guest application?`)) return;

    try {
      await api.put(`/event-applications/guests/${guestId}/status`, { status: newStatus });
      fetchGuests();
    } catch (error) {
      console.error('Error updating guest status:', error);
      alert('Error updating guest status. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return { color: '#4CAF50', bg: '#E8F5E8' };
      case 'cancelled': return { color: '#F44336', bg: '#FFEBEE' };
      case 'completed': return { color: '#FF9800', bg: '#FFF3E0' };
      default: return { color: '#757575', bg: '#F5F5F5' };
    }
  };

  const tabs = [
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'tickets', label: 'Tickets', icon: Ticket },
    { id: 'disclaimers', label: 'Disclaimers', icon: FileText },
    { id: 'registrations', label: 'Registrations', icon: Users },
    { id: 'sponsors', label: 'Sponsors', icon: Users },
    { id: 'media_partners', label: 'Media Partners', icon: Users },
    { id: 'speakers', label: 'Speakers', icon: Users },
    { id: 'guests', label: 'Guests', icon: Users }
  ];

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
          <div>Loading event management...</div>
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
          <div className="flex justify-between items-center py-3">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="mr-3 md:hidden"
                aria-label="Toggle sidebar"
                style={{ background: 'transparent', border: 'none', padding: 6, cursor: 'pointer' }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={theme.text} strokeWidth="2"><path d="M3 6h18M3 12h18M3 18h18" /></svg>
              </button>

              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="mr-3 hidden md:block"
                aria-label="Toggle sidebar"
                style={{ background: 'transparent', border: 'none', padding: 6, cursor: 'pointer' }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={theme.text} strokeWidth="2"><path d="M3 6h18M3 12h18M3 18h18" /></svg>
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Icon name="shield-check" size="lg" style={{ color: '#1976D2' }} />
                <span style={{ fontWeight: 700, fontSize: 18 }}>News Marketplace Admin</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 700 }}>{admin?.first_name ? `${admin.first_name} ${admin.last_name}` : 'Master Admin'}</div>
                <div style={{ marginTop: 6 }}>
                  <span style={{
                    backgroundColor: theme.secondaryLight,
                    color: theme.secondaryDark,
                    padding: '0.125rem 0.5rem',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    lineHeight: 1
                  }}>{admin?.role === 'super_admin' ? 'Super Admin' : 'Admin'}</span>
                </div>
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
              theme={theme}
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
                Event Management
              </h1>
              <p className="text-lg md:text-xl text-[#757575] max-w-3xl mx-auto leading-relaxed font-light">
                Manage events, tickets, disclaimers, and registrations across the News Marketplace platform.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Tabs */}
        <section className="py-8 px-4 sm:px-6 lg:px-8 bg-white border-b border-[#E0E0E0]">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-wrap gap-2">
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 ${activeTab === tab.id
                      ? 'bg-[#1976D2] text-white'
                      : 'bg-[#F5F5F5] text-[#212121] hover:bg-[#E0E0E0]'
                      }`}
                  >
                    <IconComponent className="w-5 h-5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Events Tab */}
        {activeTab === 'events' && (
          <>
            {/* Search and Filter Section */}
            <section className="py-8 px-4 sm:px-6 lg:px-8 bg-white border-b border-[#E0E0E0]">
              <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  {/* Search Bar */}
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#757575] w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search events..."
                      value={eventSearchQuery}
                      onChange={(e) => setEventSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleEventSearch()}
                      className="w-full pl-10 pr-4 py-3 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976D2] focus:border-transparent text-[#212121] bg-white"
                    />
                  </div>

                  {/* Status Filter */}
                  <select
                    value={eventStatusFilter}
                    onChange={(e) => {
                      setEventStatusFilter(e.target.value);
                      setEventCurrentPage(1);
                    }}
                    className="px-4 py-3 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976D2] focus:border-transparent text-[#212121] bg-white"
                  >
                    <option value="">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="completed">Completed</option>
                  </select>

                  <button
                    onClick={handleEventSearch}
                    className="bg-[#1976D2] hover:bg-[#0D47A1] text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
                  >
                    <Search className="w-5 h-5" />
                    Search
                  </button>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => setUploadModalOpen(true)}
                      title="Bulk Upload Events"
                      className="bg-white border border-[#E0E0E0] hover:bg-[#F5F5F5] text-[#212121] px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center"
                    >
                      <Upload className="w-5 h-5" />
                    </button>

                    <button
                      onClick={() => setDownloadModalOpen(true)}
                      title="Download Events CSV"
                      className="bg-white border border-[#E0E0E0] hover:bg-[#F5F5F5] text-[#212121] px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                  </div>

                  <button
                    onClick={() => setShowEventFormModal(true)}
                    className="bg-[#4CAF50] hover:bg-[#388E3C] text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Create Event
                  </button>
                </div>
              </div>
            </section>

            {/* Events Table */}
            <section className="py-12 px-4 sm:px-6 lg:px-8 bg-[#FAFAFA]">
              <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-lg shadow-sm border border-[#E0E0E0] overflow-hidden">
                  {/* Table Controls */}
                  <div className="px-6 py-4 border-b border-[#E5E7EB] bg-[#F8FAFC]">
                    <div className="flex justify-between items-center flex-wrap gap-4">
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-semibold text-[#212121]">Events</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <select
                          value={eventPageSize}
                          onChange={(e) => {
                            setEventPageSize(parseInt(e.target.value));
                            setEventCurrentPage(1);
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
                          <th className="px-6 py-4 text-left font-bold text-xs text-[#212121] uppercase tracking-wider">Type</th>
                          <th className="px-6 py-4 text-left font-bold text-xs text-[#212121] uppercase tracking-wider">Status</th>
                          <th className="px-6 py-4 text-left font-bold text-xs text-[#212121] uppercase tracking-wider">Start Date</th>
                          <th className="px-6 py-4 text-left font-bold text-xs text-[#212121] uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {events.map((event, index) => (
                          <tr key={event.id} className={index % 2 === 0 ? 'bg-white' : 'bg-[#FAFBFC]'}>
                            <td className="px-6 py-4 text-sm text-[#212121]">{event.id}</td>
                            <td className="px-6 py-4 text-sm text-[#212121] font-medium">{event.title}</td>
                            <td className="px-6 py-4 text-sm text-[#212121]">{event.event_type || 'N/A'}</td>
                            <td className="px-6 py-4">
                              <span style={{
                                padding: '4px 8px',
                                borderRadius: '4px',
                                fontSize: '12px',
                                fontWeight: 'bold',
                                ...getStatusColor(event.status)
                              }}>
                                {event.status ? event.status.toUpperCase() : 'N/A'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-[#212121]">{formatDate(event.start_date)}</td>
                            <td className="px-6 py-4">
                              <div className="flex gap-2 flex-wrap">
                                <button
                                  onClick={() => handleViewEvent(event)}
                                  className="px-3 py-2 bg-[#9C27B0] hover:bg-[#7B1FA2] text-white rounded text-xs font-medium transition-colors flex items-center gap-1"
                                >
                                  <Eye className="w-3 h-3" />
                                  View
                                </button>
                                <button
                                  onClick={() => handleEditEvent(event)}
                                  className="px-3 py-2 bg-[#1976D2] hover:bg-[#0D47A1] text-white rounded text-xs font-medium transition-colors flex items-center gap-1"
                                >
                                  <Edit className="w-3 h-3" />
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteEvent(event.id)}
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

                  {events.length === 0 && (
                    <div className="px-6 py-20 text-center">
                      <div className="w-24 h-24 bg-[#F5F5F5] rounded-full flex items-center justify-center mx-auto mb-6">
                        <Calendar className="w-12 h-12 text-[#BDBDBD]" />
                      </div>
                      <h3 className="text-2xl font-semibold text-[#212121] mb-3">No events found</h3>
                      <p className="text-[#757575] mb-6 max-w-md mx-auto">
                        {eventSearchQuery || eventStatusFilter ? 'Try adjusting your search or filter criteria.' : 'Events will appear here once they are created.'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Pagination */}
                {eventTotalPages > 1 && (
                  <div style={{ padding: '16px 20px', borderTop: '1px solid #e5e7eb', backgroundColor: '#f8fafc', display: 'flex', justifyContent: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        onClick={() => setEventCurrentPage(Math.max(1, eventCurrentPage - 1))}
                        disabled={eventCurrentPage === 1}
                        style={{
                          padding: '8px 12px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          backgroundColor: eventCurrentPage === 1 ? '#f3f4f6' : '#fff',
                          color: eventCurrentPage === 1 ? '#9ca3af' : '#212121',
                          cursor: eventCurrentPage === 1 ? 'not-allowed' : 'pointer',
                          fontSize: '14px'
                        }}
                      >
                        Previous
                      </button>

                      <span style={{ fontSize: '14px', color: '#757575' }}>
                        Page {eventCurrentPage} of {eventTotalPages}
                      </span>

                      <button
                        onClick={() => setEventCurrentPage(Math.min(eventTotalPages, eventCurrentPage + 1))}
                        disabled={eventCurrentPage === eventTotalPages}
                        style={{
                          padding: '8px 12px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          backgroundColor: eventCurrentPage === eventTotalPages ? '#f3f4f6' : '#fff',
                          color: eventCurrentPage === eventTotalPages ? '#9ca3af' : '#212121',
                          cursor: eventCurrentPage === eventTotalPages ? 'not-allowed' : 'pointer',
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
          </>
        )}

        {/* Tickets Tab */}
        {activeTab === 'tickets' && (
          <>
            {/* Tickets Search and Filter Section */}
            <section className="py-8 px-4 sm:px-6 lg:px-8 bg-white border-b border-[#E0E0E0]">
              <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <p className="text-[#757575] text-sm mb-2">Select an event to manage tickets:</p>
                    <select
                      value={selectedEventId || ''}
                      onChange={(e) => setSelectedEventId(e.target.value)}
                      className="w-full px-4 py-3 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976D2] focus:border-transparent text-[#212121] bg-white"
                    >
                      <option value="">Select an event</option>
                      {events.filter(e => e.status === 'active').map(event => (
                        <option key={event.id} value={event.id}>
                          {event.title} - {formatDate(event.start_date)}
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedEventId && (
                    <button
                      onClick={() => handleCreateTicket(selectedEventId)}
                      className="bg-[#4CAF50] hover:bg-[#388E3C] text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
                    >
                      <Plus className="w-5 h-5" />
                      Create Ticket
                    </button>
                  )}
                </div>
              </div>
            </section>

            {/* Tickets Table */}
            <section className="py-12 px-4 sm:px-6 lg:px-8 bg-[#FAFAFA]">
              <div className="max-w-7xl mx-auto">
                {selectedEventId ? (
                  <div className="bg-white rounded-lg shadow-sm border border-[#E0E0E0] overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-[#F8FAFC] border-b-2 border-[#E2E8F0]">
                            <th className="px-6 py-4 text-left font-bold text-xs text-[#212121] uppercase tracking-wider">ID</th>
                            <th className="px-6 py-4 text-left font-bold text-xs text-[#212121] uppercase tracking-wider">Name</th>
                            <th className="px-6 py-4 text-left font-bold text-xs text-[#212121] uppercase tracking-wider">Price</th>
                            <th className="px-6 py-4 text-left font-bold text-xs text-[#212121] uppercase tracking-wider">Available</th>
                            <th className="px-6 py-4 text-left font-bold text-xs text-[#212121] uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-left font-bold text-xs text-[#212121] uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paginatedTickets.map((ticket, index) => (
                            <tr key={ticket.id} className={index % 2 === 0 ? 'bg-white' : 'bg-[#FAFBFC]'}>
                              <td className="px-6 py-4 text-sm text-[#212121]">{ticket.id}</td>
                              <td className="px-6 py-4 text-sm text-[#212121] font-medium">{ticket.name}</td>
                              <td className="px-6 py-4 text-sm text-[#212121]">${ticket.price}</td>
                              <td className="px-6 py-4 text-sm text-[#212121]">{ticket.quantity_available}</td>
                              <td className="px-6 py-4">
                                <span style={{
                                  padding: '4px 8px',
                                  borderRadius: '4px',
                                  fontSize: '12px',
                                  fontWeight: 'bold',
                                  color: ticket.status === 'active' ? '#4CAF50' : '#F44336',
                                  backgroundColor: ticket.status === 'active' ? '#E8F5E8' : '#FFEBEE'
                                }}>
                                  {ticket.status.toUpperCase()}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex gap-2 flex-wrap">
                                  <button
                                    onClick={() => handleEditTicket(ticket)}
                                    className="px-3 py-2 bg-[#1976D2] hover:bg-[#0D47A1] text-white rounded text-xs font-medium transition-colors flex items-center gap-1"
                                  >
                                    <Edit className="w-3 h-3" />
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDeleteTicket(ticket.id)}
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

                    {tickets.filter(ticket => ticket.event_id === parseInt(selectedEventId)).length === 0 && (
                      <div className="px-6 py-20 text-center">
                        <div className="w-24 h-24 bg-[#F5F5F5] rounded-full flex items-center justify-center mx-auto mb-6">
                          <Ticket className="w-12 h-12 text-[#BDBDBD]" />
                        </div>
                        <h3 className="text-2xl font-semibold text-[#212121] mb-3">No tickets found</h3>
                        <p className="text-[#757575] mb-6 max-w-md mx-auto">
                          No tickets have been created for this event yet.
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-white rounded-lg shadow-sm border border-[#E0E0E0] p-8 text-center">
                    <Ticket className="w-16 h-16 text-[#BDBDBD] mx-auto mb-4" />
                    <h3 className="text-2xl font-semibold text-[#212121] mb-3">Select an Event</h3>
                    <p className="text-[#757575] mb-6">Please select an event from the dropdown above to manage its tickets.</p>
                  </div>
                )}
              </div>
            </section>
          </>
        )}

        {/* Disclaimers Tab */}
        {activeTab === 'disclaimers' && (
          <>
            {/* Disclaimers Search and Filter Section */}
            <section className="py-8 px-4 sm:px-6 lg:px-8 bg-white border-b border-[#E0E0E0]">
              <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <p className="text-[#757575] text-sm mb-2">Select an event to manage disclaimers:</p>
                    <select
                      value={selectedEventId || ''}
                      onChange={(e) => setSelectedEventId(e.target.value)}
                      className="w-full px-4 py-3 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976D2] focus:border-transparent text-[#212121] bg-white"
                    >
                      <option value="">Select an event</option>
                      {events.filter(e => e.status === 'active').map(event => (
                        <option key={event.id} value={event.id}>
                          {event.title} - {formatDate(event.start_date)}
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedEventId && (
                    <button
                      onClick={() => handleCreateDisclaimer(selectedEventId)}
                      className="bg-[#4CAF50] hover:bg-[#388E3C] text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
                    >
                      <Plus className="w-5 h-5" />
                      Create Disclaimer
                    </button>
                  )}
                </div>
              </div>
            </section>

            {/* Disclaimers Table */}
            <section className="py-12 px-4 sm:px-6 lg:px-8 bg-[#FAFAFA]">
              <div className="max-w-7xl mx-auto">
                {selectedEventId ? (
                  <div className="bg-white rounded-lg shadow-sm border border-[#E0E0E0] overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-[#F8FAFC] border-b-2 border-[#E2E8F0]">
                            <th className="px-6 py-4 text-left font-bold text-xs text-[#212121] uppercase tracking-wider">ID</th>
                            <th className="px-6 py-4 text-left font-bold text-xs text-[#212121] uppercase tracking-wider">Message</th>
                            <th className="px-6 py-4 text-left font-bold text-xs text-[#212121] uppercase tracking-wider">Order</th>
                            <th className="px-6 py-4 text-left font-bold text-xs text-[#212121] uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-left font-bold text-xs text-[#212121] uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {disclaimers.filter(disclaimer => disclaimer.event_id === parseInt(selectedEventId)).map((disclaimer, index) => (
                            <tr key={disclaimer.id} className={index % 2 === 0 ? 'bg-white' : 'bg-[#FAFBFC]'}>
                              <td className="px-6 py-4 text-sm text-[#212121]">{disclaimer.id}</td>
                              <td className="px-6 py-4 text-sm text-[#212121] max-w-xs truncate" title={disclaimer.message}>
                                {disclaimer.message}
                              </td>
                              <td className="px-6 py-4 text-sm text-[#212121]">{disclaimer.display_order}</td>
                              <td className="px-6 py-4">
                                <button
                                  onClick={() => handleToggleDisclaimerStatus(disclaimer)}
                                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors ${disclaimer.is_active
                                    ? 'bg-[#E8F5E8] text-[#4CAF50] hover:bg-[#C8E6C9]'
                                    : 'bg-[#FFEBEE] text-[#F44336] hover:bg-[#FFCDD2]'
                                    }`}
                                >
                                  {disclaimer.is_active ? (
                                    <ToggleRight className="w-4 h-4 mr-1" />
                                  ) : (
                                    <ToggleLeft className="w-4 h-4 mr-1" />
                                  )}
                                  {disclaimer.is_active ? 'Active' : 'Inactive'}
                                </button>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex gap-2 flex-wrap">
                                  <button
                                    onClick={() => handleEditDisclaimer(disclaimer)}
                                    className="px-3 py-2 bg-[#1976D2] hover:bg-[#0D47A1] text-white rounded text-xs font-medium transition-colors flex items-center gap-1"
                                  >
                                    <Edit className="w-3 h-3" />
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDeleteDisclaimer(disclaimer.id)}
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

                    {disclaimers.filter(disclaimer => disclaimer.event_id === parseInt(selectedEventId)).length === 0 && (
                      <div className="px-6 py-20 text-center">
                        <div className="w-24 h-24 bg-[#F5F5F5] rounded-full flex items-center justify-center mx-auto mb-6">
                          <FileText className="w-12 h-12 text-[#BDBDBD]" />
                        </div>
                        <h3 className="text-2xl font-semibold text-[#212121] mb-3">No disclaimers found</h3>
                        <p className="text-[#757575] mb-6 max-w-md mx-auto">
                          No disclaimers have been created for this event yet.
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-white rounded-lg shadow-sm border border-[#E0E0E0] p-8 text-center">
                    <FileText className="w-16 h-16 text-[#BDBDBD] mx-auto mb-4" />
                    <h3 className="text-2xl font-semibold text-[#212121] mb-3">Select an Event</h3>
                    <p className="text-[#757575] mb-6">Please select an event from the dropdown above to manage its disclaimers.</p>
                  </div>
                )}
              </div>
            </section>
          </>
        )}

        {/* Registrations Tab */}
        {activeTab === 'registrations' && (
          <>
            {/* Registrations Search and Filter Section */}
            <section className="py-8 px-4 sm:px-6 lg:px-8 bg-white border-b border-[#E0E0E0]">
              <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <p className="text-[#757575] text-sm mb-2">Filter registrations:</p>
                    <div className="flex gap-4">
                      <select
                        value={eventStatusFilter}
                        onChange={(e) => setEventStatusFilter(e.target.value)}
                        className="px-4 py-3 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976D2] focus:border-transparent text-[#212121] bg-white"
                      >
                        <option value="">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>

                      <select
                        value={eventStatusFilter}
                        onChange={(e) => setEventStatusFilter(e.target.value)}
                        className="px-4 py-3 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976D2] focus:border-transparent text-[#212121] bg-white"
                      >
                        <option value="">All Payment Statuses</option>
                        <option value="paid">Paid</option>
                        <option value="unpaid">Unpaid</option>
                        <option value="refunded">Refunded</option>
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={() => fetchRegistrations()}
                    className="bg-[#1976D2] hover:bg-[#0D47A1] text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
                  >
                    <Search className="w-5 h-5" />
                    Refresh
                  </button>
                </div>
              </div>
            </section>

            {/* Registrations Table */}
            <section className="py-12 px-4 sm:px-6 lg:px-8 bg-[#FAFAFA]">
              <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-lg shadow-sm border border-[#E0E0E0] overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-[#F8FAFC] border-b-2 border-[#E2E8F0]">
                          <th className="px-6 py-4 text-left font-bold text-xs text-[#212121] uppercase tracking-wider">ID</th>
                          <th className="px-6 py-4 text-left font-bold text-xs text-[#212121] uppercase tracking-wider">Event</th>
                          <th className="px-6 py-4 text-left font-bold text-xs text-[#212121] uppercase tracking-wider">User</th>
                          <th className="px-6 py-4 text-left font-bold text-xs text-[#212121] uppercase tracking-wider">Status</th>
                          <th className="px-6 py-4 text-left font-bold text-xs text-[#212121] uppercase tracking-wider">Payment</th>
                          <th className="px-6 py-4 text-left font-bold text-xs text-[#212121] uppercase tracking-wider">Registered</th>
                          <th className="px-6 py-4 text-left font-bold text-xs text-[#212121] uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {registrations.map((registration, index) => (
                          <tr key={registration.id} className={index % 2 === 0 ? 'bg-white' : 'bg-[#FAFBFC]'}>
                            <td className="px-6 py-4 text-sm text-[#212121]">{registration.id}</td>
                            <td className="px-6 py-4 text-sm text-[#212121]">
                              <div>
                                <div className="font-medium">{registration.event_title && registration.event_title !== 'N/A' ? registration.event_title : 'Event Title Not Available'}</div>
                                <div className="text-xs text-[#757575]">{formatDate(registration.event_date)}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-[#212121]">
                              {registration.user ? `${registration.user.first_name} ${registration.user.last_name}` : 'N/A'}
                              <br />
                              <span className="text-xs text-[#757575]">{registration.user?.email}</span>
                            </td>
                            <td className="px-6 py-4">
                              <span style={{
                                padding: '4px 8px',
                                borderRadius: '4px',
                                fontSize: '12px',
                                fontWeight: 'bold',
                                color: registration.status === 'confirmed' ? '#4CAF50' :
                                  registration.status === 'pending' ? '#FF9800' : '#F44336',
                                backgroundColor: registration.status === 'confirmed' ? '#E8F5E8' :
                                  registration.status === 'pending' ? '#FFF3E0' : '#FFEBEE'
                              }}>
                                {registration.status.toUpperCase()}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-[#212121]">
                              <div>
                                <div className={`font-medium ${registration.payment_status === 'paid' ? 'text-[#4CAF50]' : 'text-[#F44336]'}`}>
                                  {registration.payment_status.toUpperCase()}
                                </div>
                                {registration.payment_amount && (
                                  <div className="text-xs text-[#757575]">${registration.payment_amount}</div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-[#212121]">{formatDate(registration.registration_date)}</td>
                            <td className="px-6 py-4">
                              <div className="flex gap-2 flex-wrap">
                                <button
                                  onClick={() => handleViewRegistration(registration)}
                                  className="px-3 py-2 bg-[#9C27B0] hover:bg-[#7B1FA2] text-white rounded text-xs font-medium transition-colors flex items-center gap-1"
                                >
                                  <Eye className="w-3 h-3" />
                                  View
                                </button>
                                {registration.status === 'pending' && (
                                  <>
                                    <button
                                      onClick={() => handleUpdateRegistrationStatus(registration.id, 'confirmed')}
                                      className="px-3 py-2 bg-[#4CAF50] hover:bg-[#388E3C] text-white rounded text-xs font-medium transition-colors flex items-center gap-1"
                                    >
                                      <CheckCircle2 className="w-3 h-3" />
                                      Confirm
                                    </button>
                                    <button
                                      onClick={() => handleUpdateRegistrationStatus(registration.id, 'cancelled')}
                                      className="px-3 py-2 bg-[#FF9800] hover:bg-[#F57C00] text-white rounded text-xs font-medium transition-colors flex items-center gap-1"
                                    >
                                      <XCircle className="w-3 h-3" />
                                      Cancel
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {registrations.length === 0 && (
                    <div className="px-6 py-20 text-center">
                      <div className="w-24 h-24 bg-[#F5F5F5] rounded-full flex items-center justify-center mx-auto mb-6">
                        <Users className="w-12 h-12 text-[#BDBDBD]" />
                      </div>
                      <h3 className="text-2xl font-semibold text-[#212121] mb-3">No registrations found</h3>
                      <p className="text-[#757575] mb-6 max-w-md mx-auto">
                        No event registrations have been made yet, or they are not accessible through the current API endpoints.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </section>
          </>
        )}

        {/* Sponsors Tab */}
        {activeTab === 'sponsors' && (
          <>
            {/* Sponsors Search and Filter Section */}
            <section className="py-8 px-4 sm:px-6 lg:px-8 bg-white border-b border-[#E0E0E0]">
              <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <p className="text-[#757575] text-sm mb-2">Filter sponsors:</p>
                    <div className="flex gap-4">
                      <select
                        value={eventStatusFilter}
                        onChange={(e) => setEventStatusFilter(e.target.value)}
                        className="px-4 py-3 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976D2] focus:border-transparent text-[#212121] bg-white"
                      >
                        <option value="">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={() => fetchSponsors()}
                    className="bg-[#1976D2] hover:bg-[#0D47A1] text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
                  >
                    <Search className="w-5 h-5" />
                    Refresh
                  </button>
                </div>
              </div>
            </section>

            {/* Sponsors Table */}
            <section className="py-12 px-4 sm:px-6 lg:px-8 bg-[#FAFAFA]">
              <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-lg shadow-sm border border-[#E0E0E0] overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-[#F8FAFC] border-b-2 border-[#E2E8F0]">
                          <th className="px-6 py-4 text-left font-bold text-xs text-[#212121] uppercase tracking-wider">ID</th>
                          <th className="px-6 py-4 text-left font-bold text-xs text-[#212121] uppercase tracking-wider">Company</th>
                          <th className="px-6 py-4 text-left font-bold text-xs text-[#212121] uppercase tracking-wider">Contact</th>
                          <th className="px-6 py-4 text-left font-bold text-xs text-[#212121] uppercase tracking-wider">Level</th>
                          <th className="px-6 py-4 text-left font-bold text-xs text-[#212121] uppercase tracking-wider">Status</th>
                          <th className="px-6 py-4 text-left font-bold text-xs text-[#212121] uppercase tracking-wider">Applied</th>
                          <th className="px-6 py-4 text-left font-bold text-xs text-[#212121] uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sponsors.map((sponsor, index) => (
                          <tr key={sponsor.id} className={index % 2 === 0 ? 'bg-white' : 'bg-[#FAFBFC]'}>
                            <td className="px-6 py-4 text-sm text-[#212121]">{sponsor.id}</td>
                            <td className="px-6 py-4 text-sm text-[#212121] font-medium">{sponsor.company_name}</td>
                            <td className="px-6 py-4 text-sm text-[#212121]">
                              {sponsor.contact_person}
                              <br />
                              <span className="text-xs text-[#757575]">{sponsor.email}</span>
                            </td>
                            <td className="px-6 py-4 text-sm text-[#212121]">{sponsor.sponsorship_level || 'N/A'}</td>
                            <td className="px-6 py-4">
                              <span style={{
                                padding: '4px 8px',
                                borderRadius: '4px',
                                fontSize: '12px',
                                fontWeight: 'bold',
                                color: sponsor.status === 'approved' ? '#4CAF50' :
                                  sponsor.status === 'pending' ? '#FF9800' : '#F44336',
                                backgroundColor: sponsor.status === 'approved' ? '#E8F5E8' :
                                  sponsor.status === 'pending' ? '#FFF3E0' : '#FFEBEE'
                              }}>
                                {sponsor.status.toUpperCase()}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-[#212121]">{formatDate(sponsor.application_date)}</td>
                            <td className="px-6 py-4">
                              <div className="flex gap-2 flex-wrap">
                                <button
                                  onClick={() => handleViewRegistration(sponsor)}
                                  className="px-3 py-2 bg-[#9C27B0] hover:bg-[#7B1FA2] text-white rounded text-xs font-medium transition-colors flex items-center gap-1"
                                >
                                  <Eye className="w-3 h-3" />
                                  View
                                </button>
                                {sponsor.status === 'pending' && (
                                  <>
                                    <button
                                      onClick={() => handleUpdateSponsorStatus(sponsor.id, 'approved')}
                                      className="px-3 py-2 bg-[#4CAF50] hover:bg-[#388E3C] text-white rounded text-xs font-medium transition-colors flex items-center gap-1"
                                    >
                                      <CheckCircle2 className="w-3 h-3" />
                                      Approve
                                    </button>
                                    <button
                                      onClick={() => handleUpdateSponsorStatus(sponsor.id, 'rejected')}
                                      className="px-3 py-2 bg-[#FF9800] hover:bg-[#F57C00] text-white rounded text-xs font-medium transition-colors flex items-center gap-1"
                                    >
                                      <XCircle className="w-3 h-3" />
                                      Reject
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {sponsors.length === 0 && (
                    <div className="px-6 py-20 text-center">
                      <div className="w-24 h-24 bg-[#F5F5F5] rounded-full flex items-center justify-center mx-auto mb-6">
                        <Users className="w-12 h-12 text-[#BDBDBD]" />
                      </div>
                      <h3 className="text-2xl font-semibold text-[#212121] mb-3">No sponsors found</h3>
                      <p className="text-[#757575] mb-6 max-w-md mx-auto">
                        No sponsor applications have been submitted yet.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </section>
          </>
        )}

        {/* Media Partners Tab */}
        {activeTab === 'media_partners' && (
          <>
            {/* Media Partners Search and Filter Section */}
            <section className="py-8 px-4 sm:px-6 lg:px-8 bg-white border-b border-[#E0E0E0]">
              <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <p className="text-[#757575] text-sm mb-2">Filter media partners:</p>
                    <div className="flex gap-4">
                      <select
                        value={eventStatusFilter}
                        onChange={(e) => setEventStatusFilter(e.target.value)}
                        className="px-4 py-3 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976D2] focus:border-transparent text-[#212121] bg-white"
                      >
                        <option value="">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={() => fetchMediaPartners()}
                    className="bg-[#1976D2] hover:bg-[#0D47A1] text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
                  >
                    <Search className="w-5 h-5" />
                    Refresh
                  </button>
                </div>
              </div>
            </section>

            {/* Media Partners Table */}
            <section className="py-12 px-4 sm:px-6 lg:px-8 bg-[#FAFAFA]">
              <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-lg shadow-sm border border-[#E0E0E0] overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-[#F8FAFC] border-b-2 border-[#E2E8F0]">
                          <th className="px-6 py-4 text-left font-bold text-xs text-[#212121] uppercase tracking-wider">ID</th>
                          <th className="px-6 py-4 text-left font-bold text-xs text-[#212121] uppercase tracking-wider">Organization</th>
                          <th className="px-6 py-4 text-left font-bold text-xs text-[#212121] uppercase tracking-wider">Contact</th>
                          <th className="px-6 py-4 text-left font-bold text-xs text-[#212121] uppercase tracking-wider">Type</th>
                          <th className="px-6 py-4 text-left font-bold text-xs text-[#212121] uppercase tracking-wider">Status</th>
                          <th className="px-6 py-4 text-left font-bold text-xs text-[#212121] uppercase tracking-wider">Applied</th>
                          <th className="px-6 py-4 text-left font-bold text-xs text-[#212121] uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {mediaPartners.map((partner, index) => (
                          <tr key={partner.id} className={index % 2 === 0 ? 'bg-white' : 'bg-[#FAFBFC]'}>
                            <td className="px-6 py-4 text-sm text-[#212121]">{partner.id}</td>
                            <td className="px-6 py-4 text-sm text-[#212121] font-medium">{partner.organization_name}</td>
                            <td className="px-6 py-4 text-sm text-[#212121]">
                              {partner.contact_person}
                              <br />
                              <span className="text-xs text-[#757575]">{partner.email}</span>
                            </td>
                            <td className="px-6 py-4 text-sm text-[#212121]">{partner.media_type || 'N/A'}</td>
                            <td className="px-6 py-4">
                              <span style={{
                                padding: '4px 8px',
                                borderRadius: '4px',
                                fontSize: '12px',
                                fontWeight: 'bold',
                                color: partner.status === 'approved' ? '#4CAF50' :
                                  partner.status === 'pending' ? '#FF9800' : '#F44336',
                                backgroundColor: partner.status === 'approved' ? '#E8F5E8' :
                                  partner.status === 'pending' ? '#FFF3E0' : '#FFEBEE'
                              }}>
                                {partner.status.toUpperCase()}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-[#212121]">{formatDate(partner.application_date)}</td>
                            <td className="px-6 py-4">
                              <div className="flex gap-2 flex-wrap">
                                <button
                                  onClick={() => handleViewRegistration(partner)}
                                  className="px-3 py-2 bg-[#9C27B0] hover:bg-[#7B1FA2] text-white rounded text-xs font-medium transition-colors flex items-center gap-1"
                                >
                                  <Eye className="w-3 h-3" />
                                  View
                                </button>
                                {partner.status === 'pending' && (
                                  <>
                                    <button
                                      onClick={() => handleUpdateMediaPartnerStatus(partner.id, 'approved')}
                                      className="px-3 py-2 bg-[#4CAF50] hover:bg-[#388E3C] text-white rounded text-xs font-medium transition-colors flex items-center gap-1"
                                    >
                                      <CheckCircle2 className="w-3 h-3" />
                                      Approve
                                    </button>
                                    <button
                                      onClick={() => handleUpdateMediaPartnerStatus(partner.id, 'rejected')}
                                      className="px-3 py-2 bg-[#FF9800] hover:bg-[#F57C00] text-white rounded text-xs font-medium transition-colors flex items-center gap-1"
                                    >
                                      <XCircle className="w-3 h-3" />
                                      Reject
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {mediaPartners.length === 0 && (
                    <div className="px-6 py-20 text-center">
                      <div className="w-24 h-24 bg-[#F5F5F5] rounded-full flex items-center justify-center mx-auto mb-6">
                        <Users className="w-12 h-12 text-[#BDBDBD]" />
                      </div>
                      <h3 className="text-2xl font-semibold text-[#212121] mb-3">No media partners found</h3>
                      <p className="text-[#757575] mb-6 max-w-md mx-auto">
                        No media partner applications have been submitted yet.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </section>
          </>
        )}

        {/* Speakers Tab */}
        {activeTab === 'speakers' && (
          <>
            {/* Speakers Search and Filter Section */}
            <section className="py-8 px-4 sm:px-6 lg:px-8 bg-white border-b border-[#E0E0E0]">
              <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <p className="text-[#757575] text-sm mb-2">Filter speakers:</p>
                    <div className="flex gap-4">
                      <select
                        value={eventStatusFilter}
                        onChange={(e) => setEventStatusFilter(e.target.value)}
                        className="px-4 py-3 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976D2] focus:border-transparent text-[#212121] bg-white"
                      >
                        <option value="">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={() => fetchSpeakers()}
                    className="bg-[#1976D2] hover:bg-[#0D47A1] text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
                  >
                    <Search className="w-5 h-5" />
                    Refresh
                  </button>
                </div>
              </div>
            </section>

            {/* Speakers Table */}
            <section className="py-12 px-4 sm:px-6 lg:px-8 bg-[#FAFAFA]">
              <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-lg shadow-sm border border-[#E0E0E0] overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-[#F8FAFC] border-b-2 border-[#E2E8F0]">
                          <th className="px-6 py-4 text-left font-bold text-xs text-[#212121] uppercase tracking-wider">ID</th>
                          <th className="px-6 py-4 text-left font-bold text-xs text-[#212121] uppercase tracking-wider">Speaker</th>
                          <th className="px-6 py-4 text-left font-bold text-xs text-[#212121] uppercase tracking-wider">Topic</th>
                          <th className="px-6 py-4 text-left font-bold text-xs text-[#212121] uppercase tracking-wider">Type</th>
                          <th className="px-6 py-4 text-left font-bold text-xs text-[#212121] uppercase tracking-wider">Status</th>
                          <th className="px-6 py-4 text-left font-bold text-xs text-[#212121] uppercase tracking-wider">Applied</th>
                          <th className="px-6 py-4 text-left font-bold text-xs text-[#212121] uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {speakers.map((speaker, index) => (
                          <tr key={speaker.id} className={index % 2 === 0 ? 'bg-white' : 'bg-[#FAFBFC]'}>
                            <td className="px-6 py-4 text-sm text-[#212121]">{speaker.id}</td>
                            <td className="px-6 py-4 text-sm text-[#212121] font-medium">
                              {speaker.full_name}
                              <br />
                              <span className="text-xs text-[#757575]">{speaker.organization}</span>
                            </td>
                            <td className="px-6 py-4 text-sm text-[#212121]">{speaker.topic}</td>
                            <td className="px-6 py-4 text-sm text-[#212121]">{speaker.presentation_type || 'N/A'}</td>
                            <td className="px-6 py-4">
                              <span style={{
                                padding: '4px 8px',
                                borderRadius: '4px',
                                fontSize: '12px',
                                fontWeight: 'bold',
                                color: speaker.status === 'approved' ? '#4CAF50' :
                                  speaker.status === 'pending' ? '#FF9800' : '#F44336',
                                backgroundColor: speaker.status === 'approved' ? '#E8F5E8' :
                                  speaker.status === 'pending' ? '#FFF3E0' : '#FFEBEE'
                              }}>
                                {speaker.status.toUpperCase()}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-[#212121]">{formatDate(speaker.application_date)}</td>
                            <td className="px-6 py-4">
                              <div className="flex gap-2 flex-wrap">
                                <button
                                  onClick={() => handleViewRegistration(speaker)}
                                  className="px-3 py-2 bg-[#9C27B0] hover:bg-[#7B1FA2] text-white rounded text-xs font-medium transition-colors flex items-center gap-1"
                                >
                                  <Eye className="w-3 h-3" />
                                  View
                                </button>
                                {speaker.status === 'pending' && (
                                  <>
                                    <button
                                      onClick={() => handleUpdateSpeakerStatus(speaker.id, 'approved')}
                                      className="px-3 py-2 bg-[#4CAF50] hover:bg-[#388E3C] text-white rounded text-xs font-medium transition-colors flex items-center gap-1"
                                    >
                                      <CheckCircle2 className="w-3 h-3" />
                                      Approve
                                    </button>
                                    <button
                                      onClick={() => handleUpdateSpeakerStatus(speaker.id, 'rejected')}
                                      className="px-3 py-2 bg-[#FF9800] hover:bg-[#F57C00] text-white rounded text-xs font-medium transition-colors flex items-center gap-1"
                                    >
                                      <XCircle className="w-3 h-3" />
                                      Reject
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {speakers.length === 0 && (
                    <div className="px-6 py-20 text-center">
                      <div className="w-24 h-24 bg-[#F5F5F5] rounded-full flex items-center justify-center mx-auto mb-6">
                        <Users className="w-12 h-12 text-[#BDBDBD]" />
                      </div>
                      <h3 className="text-2xl font-semibold text-[#212121] mb-3">No speakers found</h3>
                      <p className="text-[#757575] mb-6 max-w-md mx-auto">
                        No speaker applications have been submitted yet.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </section>
          </>
        )}

        {/* Guests Tab */}
        {activeTab === 'guests' && (
          <>
            {/* Guests Search and Filter Section */}
            <section className="py-8 px-4 sm:px-6 lg:px-8 bg-white border-b border-[#E0E0E0]">
              <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <p className="text-[#757575] text-sm mb-2">Filter guests:</p>
                    <div className="flex gap-4">
                      <select
                        value={eventStatusFilter}
                        onChange={(e) => setEventStatusFilter(e.target.value)}
                        className="px-4 py-3 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976D2] focus:border-transparent text-[#212121] bg-white"
                      >
                        <option value="">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={() => fetchGuests()}
                    className="bg-[#1976D2] hover:bg-[#0D47A1] text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
                  >
                    <Search className="w-5 h-5" />
                    Refresh
                  </button>
                </div>
              </div>
            </section>

            {/* Guests Table */}
            <section className="py-12 px-4 sm:px-6 lg:px-8 bg-[#FAFAFA]">
              <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-lg shadow-sm border border-[#E0E0E0] overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-[#F8FAFC] border-b-2 border-[#E2E8F0]">
                          <th className="px-6 py-4 text-left font-bold text-xs text-[#212121] uppercase tracking-wider">ID</th>
                          <th className="px-6 py-4 text-left font-bold text-xs text-[#212121] uppercase tracking-wider">Guest</th>
                          <th className="px-6 py-4 text-left font-bold text-xs text-[#212121] uppercase tracking-wider">Type</th>
                          <th className="px-6 py-4 text-left font-bold text-xs text-[#212121] uppercase tracking-wider">Organization</th>
                          <th className="px-6 py-4 text-left font-bold text-xs text-[#212121] uppercase tracking-wider">Status</th>
                          <th className="px-6 py-4 text-left font-bold text-xs text-[#212121] uppercase tracking-wider">Applied</th>
                          <th className="px-6 py-4 text-left font-bold text-xs text-[#212121] uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {guests.map((guest, index) => (
                          <tr key={guest.id} className={index % 2 === 0 ? 'bg-white' : 'bg-[#FAFBFC]'}>
                            <td className="px-6 py-4 text-sm text-[#212121]">{guest.id}</td>
                            <td className="px-6 py-4 text-sm text-[#212121] font-medium">
                              {guest.full_name}
                              <br />
                              <span className="text-xs text-[#757575]">{guest.email}</span>
                            </td>
                            <td className="px-6 py-4 text-sm text-[#212121]">{guest.guest_type || 'N/A'}</td>
                            <td className="px-6 py-4 text-sm text-[#212121]">{guest.organization || 'N/A'}</td>
                            <td className="px-6 py-4">
                              <span style={{
                                padding: '4px 8px',
                                borderRadius: '4px',
                                fontSize: '12px',
                                fontWeight: 'bold',
                                color: guest.status === 'approved' ? '#4CAF50' :
                                  guest.status === 'pending' ? '#FF9800' : '#F44336',
                                backgroundColor: guest.status === 'approved' ? '#E8F5E8' :
                                  guest.status === 'pending' ? '#FFF3E0' : '#FFEBEE'
                              }}>
                                {guest.status.toUpperCase()}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-[#212121]">{formatDate(guest.application_date)}</td>
                            <td className="px-6 py-4">
                              <div className="flex gap-2 flex-wrap">
                                <button
                                  onClick={() => handleViewRegistration(guest)}
                                  className="px-3 py-2 bg-[#9C27B0] hover:bg-[#7B1FA2] text-white rounded text-xs font-medium transition-colors flex items-center gap-1"
                                >
                                  <Eye className="w-3 h-3" />
                                  View
                                </button>
                                {guest.status === 'pending' && (
                                  <>
                                    <button
                                      onClick={() => handleUpdateGuestStatus(guest.id, 'approved')}
                                      className="px-3 py-2 bg-[#4CAF50] hover:bg-[#388E3C] text-white rounded text-xs font-medium transition-colors flex items-center gap-1"
                                    >
                                      <CheckCircle2 className="w-3 h-3" />
                                      Approve
                                    </button>
                                    <button
                                      onClick={() => handleUpdateGuestStatus(guest.id, 'rejected')}
                                      className="px-3 py-2 bg-[#FF9800] hover:bg-[#F57C00] text-white rounded text-xs font-medium transition-colors flex items-center gap-1"
                                    >
                                      <XCircle className="w-3 h-3" />
                                      Reject
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {guests.length === 0 && (
                    <div className="px-6 py-20 text-center">
                      <div className="w-24 h-24 bg-[#F5F5F5] rounded-full flex items-center justify-center mx-auto mb-6">
                        <Users className="w-12 h-12 text-[#BDBDBD]" />
                      </div>
                      <h3 className="text-2xl font-semibold text-[#212121] mb-3">No guests found</h3>
                      <p className="text-[#757575] mb-6 max-w-md mx-auto">
                        No guest applications have been submitted yet.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </section>
          </>
        )}

      </div>

      {/* Event View Modal */}
      <EventViewModal
        isOpen={showEventViewModal}
        onClose={() => setShowEventViewModal(false)}
        event={selectedEvent}
      />

      {/* Event Form Modal */}
      <EventFormModal
        isOpen={showEventFormModal}
        onClose={() => setShowEventFormModal(false)}
        event={selectedEvent}
        onSave={handleEventFormSave}
      />

      {/* Ticket Form Modal */}
      <TicketFormModal
        isOpen={showTicketFormModal}
        onClose={() => setShowTicketFormModal(false)}
        ticket={selectedTicket}
        eventId={selectedEventId}
        onSave={handleTicketFormSave}
      />

      {/* Disclaimer Form Modal */}
      <DisclaimerFormModal
        isOpen={showDisclaimerFormModal}
        onClose={() => {
          setShowDisclaimerFormModal(false);
          setSelectedEventId(null);
        }}
        disclaimer={selectedDisclaimer}
        eventId={selectedEventId}
        onSave={handleDisclaimerFormSave}
      />

      <DownloadOptionsModal
        isOpen={downloadModalOpen}
        onClose={() => setDownloadModalOpen(false)}
        onDownload={handleDownloadCSV}
        onDownloadTemplate={handleDownloadTemplate}
      />

      <BulkUploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onUpload={handleBulkUpload}
        loading={uploading}
      />
    </div>
  );
};

export default EventManagement;