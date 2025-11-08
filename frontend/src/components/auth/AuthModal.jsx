import React, { useState, useRef } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import { useAuth } from '../../context/AuthContext';
import Icon from '../common/Icon';

const AuthModal = ({ isOpen, onClose }) => {
  const recaptchaRef = useRef(null);
  const [mode, setMode] = useState('login'); // 'login', 'register', or 'forgot'
  const [step, setStep] = useState('select'); // 'select', 'form', 'otp', 'success'
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    otp: '',
    newPassword: '',
    confirmPassword: '',
    rememberMe: false,
    recaptchaToken: null,
    resetToken: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [messageTimeout, setMessageTimeout] = useState(null);

  // Reset modal to initial state when opened
  React.useEffect(() => {
    if (isOpen) {
      setMode('login');
      setStep('select');
      setFormData({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        otp: '',
        newPassword: '',
        confirmPassword: '',
        rememberMe: false,
        recaptchaToken: null,
        resetToken: '',
      });
      setLoading(false);
      setError('');
      setMessage('');
      if (messageTimeout) {
        clearTimeout(messageTimeout);
        setMessageTimeout(null);
      }
      if (recaptchaRef.current) {
        recaptchaRef.current.reset();
      }
    }
  }, [isOpen]);

  const { register, verifyRegistration, login, verifyLogin, forgotPassword, verifyForgotPasswordOTP, resetPasswordWithOTP } = useAuth();

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Only clear success messages when user starts typing, keep error messages visible
    if (message) {
      setMessage('');
      if (messageTimeout) {
        clearTimeout(messageTimeout);
        setMessageTimeout(null);
      }
    }
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
      // Auto-dismiss success message after 5 seconds
      const timeout = setTimeout(() => setMessage(''), 5000);
      setMessageTimeout(timeout);
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

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await forgotPassword(formData.email);
      setMessage(result.message);
      setStep('otp');
      // Auto-dismiss success message after 5 seconds
      const timeout = setTimeout(() => setMessage(''), 5000);
      setMessageTimeout(timeout);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyForgotPassword = async (e) => {
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
      // Auto-dismiss success message after 5 seconds
      const timeout = setTimeout(() => setMessage(''), 5000);
      setMessageTimeout(timeout);
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
      newPassword: '',
      confirmPassword: '',
      rememberMe: false,
      recaptchaToken: null,
      resetToken: '',
    });
    setStep('select');
    // Keep error messages visible when resetting form, only clear success messages
    setMessage('');
    if (messageTimeout) {
      clearTimeout(messageTimeout);
      setMessageTimeout(null);
    }
    if (recaptchaRef.current) {
      recaptchaRef.current.reset();
    }
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    // Don't reset error messages when switching modes, only clear success messages
    setFormData({
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      otp: '',
      newPassword: '',
      confirmPassword: '',
      rememberMe: false,
      recaptchaToken: null,
      resetToken: '',
    });
    setStep('form');
    setMessage('');
    if (messageTimeout) {
      clearTimeout(messageTimeout);
      setMessageTimeout(null);
    }
    if (recaptchaRef.current) {
      recaptchaRef.current.reset();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto relative" onClick={(e) => e.stopPropagation()}>
        <button
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors duration-200 z-10"
          onClick={onClose}
          aria-label="Close modal"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600 hover:text-gray-900">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <div className="text-center mb-6 pt-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2 font-['Inter']">
            {step === 'select' ? 'Welcome to News Marketplace' :
             mode === 'login' ? 'Welcome Back' :
             mode === 'register' ? 'Create Account' :
             'Reset Password'}
          </h2>
          <p className="text-sm text-gray-600 font-['Open_Sans'] leading-relaxed">
            {step === 'select' ? 'Choose how you\'d like to proceed' :
             mode === 'login' ? 'Sign in to your News Marketplace account' :
             mode === 'register' ? 'Join News Marketplace to start your journey' :
             step === 'form' ? 'Enter your email address to receive a reset code' :
             step === 'otp' ? 'Enter the reset code and create a new password' :
             'Password reset successful!'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 rounded-r-lg p-4 mb-4 animate-fade-in">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-red-400 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <p className="text-sm text-red-800 font-medium leading-relaxed">{error}</p>
              </div>
              <button
                onClick={() => setError('')}
                className="ml-3 text-red-400 hover:text-red-600 transition-colors duration-200"
                aria-label="Dismiss error"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {message && (
          <div className="bg-green-50 border-l-4 border-green-400 rounded-r-lg p-4 mb-4 animate-fade-in">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <p className="text-sm text-green-800 font-medium leading-relaxed">{message}</p>
              </div>
              <button
                onClick={() => setMessage('')}
                className="ml-3 text-green-400 hover:text-green-600 transition-colors duration-200"
                aria-label="Dismiss message"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {step === 'select' ? (
          <div className="px-6 pb-6">
            <div className="space-y-4">
              <button
                type="button"
                onClick={() => { setMode('login'); setStep('form'); }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl font-['Inter'] text-sm"
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setMode('register'); setStep('form'); }}
                className="w-full bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 px-4 rounded-lg border border-gray-300 transition-all duration-200 font-['Inter'] text-sm"
              >
                Sign Up
              </button>
              <button
                type="button"
                onClick={() => { setMode('forgot'); setStep('form'); }}
                className="w-full bg-transparent hover:bg-gray-50 text-blue-600 hover:text-blue-800 font-medium py-3 px-4 rounded-lg transition-all duration-200 font-['Inter'] text-sm"
              >
                Forgot Password?
              </button>
            </div>
          </div>
        ) : step === 'form' ? (
          <form onSubmit={
            mode === 'login' ? handleLogin :
            mode === 'register' ? handleRegister :
            handleForgotPassword
          } className="px-6 pb-6">
            <div className="space-y-4">
              {mode === 'register' && (
                <>
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-900 mb-1 font-['Inter']">
                      First Name
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white text-gray-900 placeholder-gray-500 transition-all duration-200 font-['Open_Sans']"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-900 mb-1 font-['Inter']">
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white text-gray-900 placeholder-gray-500 transition-all duration-200 font-['Open_Sans']"
                      required
                    />
                  </div>
                </>
              )}

              {mode !== 'forgot' && (
                <>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-1 font-['Inter']">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white text-gray-900 placeholder-gray-500 transition-all duration-200 font-['Open_Sans']"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-900 mb-1 font-['Inter']">
                      Password
                    </label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white text-gray-900 placeholder-gray-500 transition-all duration-200 font-['Open_Sans']"
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
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                      />
                      <label htmlFor="rememberMe" className="ml-3 text-sm text-gray-600 font-['Open_Sans']">
                        Remember me
                      </label>
                    </div>
                  )}

                  <div className="flex justify-center">
                    <ReCAPTCHA
                      ref={recaptchaRef}
                      sitekey="6LdNzrErAAAAAB1EB7ETPEhUrynf0wSQftMt-COT"
                      onChange={handleCaptchaChange}
                      onExpired={() => setFormData(prev => ({ ...prev, recaptchaToken: null }))}
                    />
                  </div>
                </>
              )}

              {mode === 'forgot' && (
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-1 font-['Inter']">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white text-gray-900 placeholder-gray-500 transition-all duration-200 font-['Open_Sans']"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none mt-6 font-['Inter'] text-sm"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Please wait...
                </div>
              ) : (
                mode === 'login' ? 'Sign In' :
                mode === 'register' ? 'Create Account' :
                'Send Reset Code'
              )}
            </button>
          </form>
        ) : step === 'otp' ? (
          <form onSubmit={
            mode === 'login' ? handleVerifyLogin :
            mode === 'register' ? handleVerifyRegistration :
            handleVerifyForgotPassword
          } className="px-6 pb-6">
            <div className="text-center mb-4">
              <p className="text-sm text-gray-600 mb-4 font-['Open_Sans'] leading-relaxed">
                We've sent a 6-digit code to <strong className="text-gray-900">{formData.email}</strong>
              </p>
            </div>

            {mode === 'forgot' && (
              <>
                <div>
                  <label htmlFor="otp" className="block text-sm font-medium text-gray-900 mb-1 font-['Inter']">
                    Reset Code
                  </label>
                  <input
                    type="text"
                    id="otp"
                    name="otp"
                    value={formData.otp}
                    onChange={handleInputChange}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-xl tracking-widest bg-white text-gray-900 placeholder-gray-400 transition-all duration-200 font-['Open_Sans']"
                    placeholder="000000"
                    maxLength="6"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter the 6-digit code sent to {formData.email}
                  </p>
                </div>

                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-900 mb-1 font-['Inter']">
                    New Password
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white text-gray-900 placeholder-gray-500 transition-all duration-200 font-['Open_Sans']"
                    placeholder="Enter new password"
                    minLength="8"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-900 mb-1 font-['Inter']">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white text-gray-900 placeholder-gray-500 transition-all duration-200 font-['Open_Sans']"
                    placeholder="Confirm new password"
                    minLength="8"
                    required
                  />
                </div>
              </>
            )}

            {mode !== 'forgot' && (
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-900 mb-1 font-['Inter']">
                  Enter OTP Code
                </label>
                <input
                  type="text"
                  id="otp"
                  name="otp"
                  value={formData.otp}
                  onChange={handleInputChange}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-xl tracking-widest bg-white text-gray-900 placeholder-gray-400 transition-all duration-200 font-['Open_Sans']"
                  placeholder="000000"
                  maxLength="6"
                  required
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none mt-6 font-['Inter'] text-sm"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {mode === 'forgot' ? 'Resetting...' : 'Verifying...'}
                </div>
              ) : (
                mode === 'forgot' ? 'Reset Password' : 'Verify Code'
              )}
            </button>

            <button
              type="button"
              onClick={() => setStep('form')}
              className="w-full bg-white hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-lg border border-gray-300 transition-all duration-200 mt-3 font-['Inter'] text-sm"
            >
              Back
            </button>
          </form>
        ) : step === 'success' ? (
          <div className="px-6 pb-6 text-center">
            <Icon name="check-circle" size="xl" className="text-green-500 mx-auto mb-4" />
            <p className="body-regular mb-6">{message}</p>
            <button
              onClick={onClose}
              className="btn-primary"
            >
              Continue to Login
            </button>
          </div>
        ) : null}

        {step === 'form' && (
          <div className="text-center mt-6 space-y-3 px-6">
            {mode === 'login' && (
              <button
                type="button"
                onClick={() => { setMode('forgot'); setStep('form'); }}
                className="text-xs text-blue-600 hover:text-blue-800 hover:underline font-['Open_Sans'] transition-colors duration-200"
              >
                Forgot your password?
              </button>
            )}
            <p className="text-xs text-gray-600 font-['Open_Sans']">
              {mode === 'login' ? "Don't have an account?" : mode === 'register' ? "Already have an account?" : ""}
              {mode !== 'forgot' && (
                <button
                  type="button"
                  onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
                  className="ml-1 text-blue-600 hover:text-blue-800 hover:underline font-medium transition-colors duration-200"
                >
                  {mode === 'login' ? 'Sign up' : 'Sign in'}
                </button>
              )}
            </p>
            <button
              type="button"
              onClick={() => setStep('select')}
              className="text-xs text-gray-500 hover:text-gray-700 hover:underline font-['Open_Sans'] transition-colors duration-200"
            >
              Back to options
            </button>
          </div>
        )}
      </div>

    </div>
  );
};

export default AuthModal;