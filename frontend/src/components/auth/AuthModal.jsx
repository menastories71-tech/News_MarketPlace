import React, { useState, useRef } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import { useAuth } from '../../context/AuthContext';
import Icon from '../common/Icon';
import ForgotPasswordModal from './ForgotPasswordModal';

const AuthModal = ({ isOpen, onClose }) => {
  const recaptchaRef = useRef(null);
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [step, setStep] = useState('form'); // 'form' or 'otp'
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    otp: '',
    rememberMe: false,
    recaptchaToken: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const { register, verifyRegistration, login, verifyLogin } = useAuth();

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCaptchaChange = (token) => {
    setFormData(prev => ({
      ...prev,
      recaptchaToken: token
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.recaptchaToken) {
      setError('Please complete the reCAPTCHA verification');
      setLoading(false);
      return;
    }

    try {
      const result = await register({
        email: formData.email,
        password: formData.password,
        first_name: formData.firstName,
        last_name: formData.lastName,
        recaptchaToken: formData.recaptchaToken,
      });

      setMessage(result.message);
      setStep('otp');
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyRegistration = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await verifyRegistration(formData.email, formData.otp);
      onClose();
      // Redirect or show success message
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.recaptchaToken) {
      setError('Please complete the reCAPTCHA verification');
      setLoading(false);
      return;
    }

    try {
      const result = await login(formData.email, formData.password, formData.rememberMe, formData.recaptchaToken);
      setMessage(result.message);
      setStep('otp');
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await verifyLogin(formData.email, formData.otp, formData.rememberMe);
      onClose();
      // Redirect to dashboard or home
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      otp: '',
      rememberMe: false,
      recaptchaToken: null,
    });
    setStep('form');
    setError('');
    setMessage('');
    if (recaptchaRef.current) {
      recaptchaRef.current.reset();
    }
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    resetForm();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <Icon name="close" size="sm" />
        </button>

        <div className="text-center mb-8">
          <h2 className="heading-2 mb-3">
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="body-regular text-gray-600">
            {mode === 'login'
              ? 'Sign in to your News Marketplace account'
              : 'Join News Marketplace to start your journey'
            }
          </p>
        </div>

        {error && (
          <div className="alert-error">
            <p className="text-sm">{error}</p>
          </div>
        )}

        {message && (
          <div className="alert-success">
            <p className="text-sm">{message}</p>
          </div>
        )}

        {step === 'form' ? (
          <form onSubmit={mode === 'login' ? handleLogin : handleRegister}>
            <div className="space-y-5">
              {mode === 'register' && (
                <>
                  <div>
                    <label htmlFor="firstName" className="form-label">
                      First Name
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="form-label">
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    />
                  </div>
                </>
              )}

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
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                  minLength="8"
                />
              </div>

              {mode === 'login' && (
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="rememberMe"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  <label htmlFor="rememberMe" className="text-sm text-gray-600">
                    Remember me
                  </label>
                </div>
              )}

              <div>
                <ReCAPTCHA
                  ref={recaptchaRef}
                  sitekey="6LclFwYsAAAAAHuO_Cd7uAWWYCMlqiqLIz_4NNuK"
                  onChange={handleCaptchaChange}
                  onExpired={() => setFormData(prev => ({ ...prev, recaptchaToken: null }))}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary w-full mt-8"
              disabled={loading}
            >
              {loading ? 'Please wait...' : (mode === 'login' ? 'Sign In' : 'Create Account')}
            </button>
          </form>
        ) : (
          <form onSubmit={mode === 'login' ? handleVerifyLogin : handleVerifyRegistration}>
            <div className="text-center mb-4">
              <p className="body-regular mb-4">
                We've sent a 6-digit code to <strong>{formData.email}</strong>
              </p>
            </div>

            <div>
              <label htmlFor="otp" className="form-label">
                Enter OTP Code
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
            </div>

            <button
              type="submit"
              className="btn-primary w-full mt-8"
              disabled={loading}
            >
              {loading ? 'Verifying...' : 'Verify Code'}
            </button>

            <button
              type="button"
              onClick={() => setStep('form')}
              className="btn-secondary w-full mt-4"
            >
              Back
            </button>
          </form>
        )}

        {step === 'form' && mode === 'login' && (
          <div className="text-center mt-8 space-y-3">
            <button
              type="button"
              onClick={() => setShowForgotPassword(true)}
              className="text-sm text-primary hover:underline"
            >
              Forgot your password?
            </button>
            <p className="text-sm text-gray-600">
              Don't have an account?
              <button
                type="button"
                onClick={() => switchMode('register')}
                className="ml-1 text-primary hover:underline"
              >
                Sign up
              </button>
            </p>
          </div>
        )}

        {step === 'form' && mode === 'register' && (
          <div className="text-center mt-8">
            <p className="text-sm text-gray-600">
              Already have an account?
              <button
                type="button"
                onClick={() => switchMode('login')}
                className="ml-1 text-primary hover:underline"
              >
                Sign in
              </button>
            </p>
          </div>
        )}
      </div>

      <ForgotPasswordModal
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
      />
    </div>
  );
};

export default AuthModal;