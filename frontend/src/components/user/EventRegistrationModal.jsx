import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAdminAuth } from '../../context/AdminAuthContext';
import api from '../../services/api';
import CosmicButton from '../common/CosmicButton';

const EventRegistrationModal = ({ isOpen, onClose, event }) => {
  const { user } = useAuth();
  const { isAuthenticated: isAdminAuthenticated } = useAdminAuth();
  const isAuthenticated = user || isAdminAuthenticated;
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  React.useEffect(() => {
    if (isOpen && event?.custom_form_fields) {
      // Initialize form data based on custom fields
      const initialData = {};
      Object.keys(event.custom_form_fields).forEach(fieldName => {
        initialData[fieldName] = '';
      });
      setFormData(initialData);
      setError('');
      setSuccess(false);
    }
  }, [isOpen, event]);

  const handleInputChange = (fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const registrationData = {
        event_id: event.id,
        custom_form_data: formData
      };

      await api.post(`/events/${event.id}/register`, registrationData);
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const renderFormField = (fieldName, fieldConfig) => {
    const { type, label, required, placeholder, options } = fieldConfig;

    switch (type) {
      case 'text':
      case 'email':
      case 'tel':
        return (
          <div key={fieldName} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {label || fieldName} {required && <span className="text-red-500">*</span>}
            </label>
            <input
              type={type}
              value={formData[fieldName] || ''}
              onChange={(e) => handleInputChange(fieldName, e.target.value)}
              placeholder={placeholder || ''}
              required={required}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        );

      case 'textarea':
        return (
          <div key={fieldName} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {label || fieldName} {required && <span className="text-red-500">*</span>}
            </label>
            <textarea
              value={formData[fieldName] || ''}
              onChange={(e) => handleInputChange(fieldName, e.target.value)}
              placeholder={placeholder || ''}
              required={required}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        );

      case 'select':
        return (
          <div key={fieldName} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {label || fieldName} {required && <span className="text-red-500">*</span>}
            </label>
            <select
              value={formData[fieldName] || ''}
              onChange={(e) => handleInputChange(fieldName, e.target.value)}
              required={required}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select an option</option>
              {options?.map((option, index) => (
                <option key={index} value={option}>{option}</option>
              ))}
            </select>
          </div>
        );

      case 'checkbox':
        return (
          <div key={fieldName} className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData[fieldName] || false}
                onChange={(e) => handleInputChange(fieldName, e.target.checked)}
                required={required}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">
                {label || fieldName} {required && <span className="text-red-500">*</span>}
              </span>
            </label>
          </div>
        );

      default:
        return null;
    }
  };

  if (!isOpen || !event) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto relative" onClick={(e) => e.stopPropagation()}>
        <button
          className="absolute top-3 right-3 p-1.5 hover:bg-gray-100 rounded-full transition-colors duration-200 z-10"
          onClick={onClose}
          aria-label="Close modal"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 hover:text-gray-600">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Register for {event.title}
          </h2>

          {!isAuthenticated ? (
            <div className="text-center py-8">
              <div className="mb-4">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Login Required</h3>
              <p className="text-sm text-gray-600 mb-6">
                You must be logged in to register for events. Please log in to continue.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onClose();
                    // You might want to redirect to login page or open login modal
                    window.location.href = '/login';
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Login
                </button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-600 mb-6">
                Please fill out the registration form below.
              </p>

              {error && (
                <div className="bg-red-50 border-l-4 border-red-400 rounded-r-lg p-4 mb-4">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              {success && (
                <div className="bg-green-50 border-l-4 border-green-400 rounded-r-lg p-4 mb-4">
                  <p className="text-sm text-green-800">Registration successful! Redirecting...</p>
                </div>
              )}

              {!success && (
                <form onSubmit={handleSubmit}>
                  {event.custom_form_fields && Object.entries(event.custom_form_fields).map(([fieldName, fieldConfig]) =>
                    renderFormField(fieldName, fieldConfig)
                  )}

                  <div className="flex gap-3 mt-6">
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <CosmicButton
                      type="submit"
                      disabled={loading}
                      className="flex-1"
                      variant="small"
                    >
                      {loading ? 'Registering...' : 'Register'}
                    </CosmicButton>
                  </div>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventRegistrationModal;