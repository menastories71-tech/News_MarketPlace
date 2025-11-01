import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Icon from '../common/Icon';

const ForgotPasswordModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState('email'); // 'email', 'otp'
  const [formData, setFormData] = useState({
    email: '',
    otp: '',
    resetToken: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const { forgotPassword, verifyForgotPasswordOTP, resetPasswordWithOTP } = useAuth();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await forgotPassword(formData.email);
      setMessage(result.message);
      setStep('otp');
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      setLoading(false);
      return;
    }

    try {
      const result = await verifyForgotPasswordOTP(formData.email, formData.otp);
      setFormData(prev => ({
        ...prev,
        resetToken: result.resetToken
      }));

      // Now reset the password immediately
      const resetResult = await resetPasswordWithOTP(result.resetToken, formData.newPassword);
      setMessage(resetResult.message);
      setStep('success');
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };


  const resetForm = () => {
    setFormData({
      email: '',
      otp: '',
      resetToken: '',
      newPassword: '',
      confirmPassword: '',
    });
    setStep('email');
    setError('');
    setMessage('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={handleClose}>
          <Icon name="close" size="sm" />
        </button>

        <div className="text-center mb-6">
          <h2 className="heading-2 mb-2">Reset Password</h2>
          <p className="body-regular text-gray-600">
            {step === 'email' && 'Enter your email address to receive a reset code'}
            {step === 'otp' && 'Enter the reset code and create a new password'}
            {step === 'success' && 'Password reset successful!'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {message && step !== 'success' && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-green-600 text-sm">{message}</p>
          </div>
        )}

        {step === 'email' && (
          <form onSubmit={handleForgotPassword}>
            <div>
              <label htmlFor="email" className="form-label">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter your email"
                required
              />
            </div>

            <button
              type="submit"
              className="btn-primary w-full mt-6"
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send Reset Code'}
            </button>
          </form>
        )}

        {step === 'otp' && (
          <form onSubmit={handleVerifyOTP}>
            <div>
              <label htmlFor="otp" className="form-label">
                Reset Code
              </label>
              <input
                type="text"
                id="otp"
                name="otp"
                value={formData.otp}
                onChange={handleInputChange}
                className="form-input text-center text-2xl tracking-widest"
                placeholder="000000"
                maxLength="6"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter the 6-digit code sent to {formData.email}
              </p>
            </div>

            <div>
              <label htmlFor="newPassword" className="form-label">
                New Password
              </label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter new password"
                minLength="8"
                required
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="form-label">
                Confirm New Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Confirm new password"
                minLength="8"
                required
              />
            </div>

            <button
              type="submit"
              className="btn-primary w-full mt-6"
              disabled={loading}
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>

            <button
              type="button"
              onClick={() => setStep('email')}
              className="btn-secondary w-full mt-3"
            >
              Back
            </button>
          </form>
        )}

        {step === 'success' && (
          <div className="text-center">
            <Icon name="check-circle" size="xl" className="text-success mx-auto mb-4" />
            <p className="body-regular mb-6">{message}</p>
            <button
              onClick={handleClose}
              className="btn-primary"
            >
              Continue to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordModal;