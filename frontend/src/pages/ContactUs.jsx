import React, { useState, useRef } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import toast, { Toaster } from 'react-hot-toast';
import UserHeader from '../components/common/UserHeader';
import UserFooter from '../components/common/UserFooter';
import Icon from '../components/common/Icon';

const ContactUs = () => {
  const recaptchaRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    gender: '',
    number: '',
    email: '',
    whatsapp: '',
    query: '',
    companyName: '',
    companyWebsite: '',
    companySocialMedia: '',
    individualLinkedin: '',
    individualInstagram: '',
    howDidYouHear: '',
    message: '',
    termsAccepted: false
  });

  const [otpSent, setOtpSent] = useState({ email: false, whatsapp: false });
  const [otpVerified, setOtpVerified] = useState({ email: false, whatsapp: false });
  const [otpValues, setOtpValues] = useState({ email: '', whatsapp: '' });
  const [recaptchaToken, setRecaptchaToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const queryOptions = [
    { value: 'current_customer', label: 'Current Customer' },
    { value: 'potential_customer', label: 'Potential Customer' },
    { value: 'current_vendor', label: 'Current Vendor' },
    { value: 'potential_vendor', label: 'Potential Vendor' },
    { value: 'suggestions_feedback', label: 'Suggestions/Feedback' },
    { value: 'journalist_reporter', label: 'Journalist/Reporter/Editor/Contributor/Publishing Staff' },
    { value: 'commercial_sales', label: 'Commercial/Sales/Key Accounts/Business Development/Brand Partnership/Event Partnership/Affiliate Programme/Media Partnership' }
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleOtpChange = (type, value) => {
    setOtpValues(prev => ({ ...prev, [type]: value }));
  };

  const handleRecaptchaChange = (token) => {
    setRecaptchaToken(token);
  };

  const sendOtp = async (type) => {
    if (!formData[type]) {
      setErrors(prev => ({ ...prev, [type]: `${type} is required` }));
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/contact/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, value: formData[type] })
      });

      if (response.ok) {
        setOtpSent(prev => ({ ...prev, [type]: true }));
        toast.success(`OTP sent to your ${type}!`, {
          duration: 4000,
          position: 'top-right',
          style: {
            background: '#4CAF50',
            color: '#FFFFFF',
          },
        });
      } else {
        const error = await response.json();
        setErrors(prev => ({ ...prev, [type]: error.message }));
        toast.error(`Failed to send OTP to ${type}`, {
          duration: 4000,
          position: 'top-right',
          style: {
            background: '#F44336',
            color: '#FFFFFF',
          },
        });
      }
    } catch (error) {
      setErrors(prev => ({ ...prev, [type]: 'Failed to send OTP' }));
      toast.error('Failed to send OTP. Please try again.', {
        duration: 4000,
        position: 'top-right',
        style: {
          background: '#F44336',
          color: '#FFFFFF',
        },
      });
    }
    setLoading(false);
  };

  const verifyOtp = async (type) => {
    if (!otpValues[type]) {
      setErrors(prev => ({ ...prev, [`${type}Otp`]: 'OTP is required' }));
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/contact/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, value: formData[type], otp: otpValues[type] })
      });

      if (response.ok) {
        setOtpVerified(prev => ({ ...prev, [type]: true }));
        setErrors(prev => ({ ...prev, [`${type}Otp`]: '' }));
        toast.success(`${type} verified successfully!`, {
          duration: 4000,
          position: 'top-right',
          style: {
            background: '#4CAF50',
            color: '#FFFFFF',
          },
        });
      } else {
        const error = await response.json();
        setErrors(prev => ({ ...prev, [`${type}Otp`]: error.message }));
        toast.error(`Failed to verify ${type}`, {
          duration: 4000,
          position: 'top-right',
          style: {
            background: '#F44336',
            color: '#FFFFFF',
          },
        });
      }
    } catch (error) {
      setErrors(prev => ({ ...prev, [`${type}Otp`]: 'Failed to verify OTP' }));
      toast.error('Failed to verify OTP. Please try again.', {
        duration: 4000,
        position: 'top-right',
        style: {
          background: '#F44336',
          color: '#FFFFFF',
        },
      });
    }
    setLoading(false);
  };


  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.number) newErrors.number = 'Number is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.whatsapp) newErrors.whatsapp = 'WhatsApp number is required';
    if (!formData.query) newErrors.query = 'Query type is required';
    if (!formData.message.trim()) newErrors.message = 'Message is required';
    if (!formData.termsAccepted) newErrors.termsAccepted = 'You must accept the terms and conditions';
    if (!otpVerified.email) newErrors.emailOtp = 'Email must be verified';
    if (!otpVerified.whatsapp) newErrors.whatsappOtp = 'WhatsApp must be verified';
    if (!recaptchaToken) newErrors.captcha = 'Please complete the captcha';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      const submitData = { ...formData, recaptchaToken };
      const response = await fetch('/api/contact/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      });

      if (response.ok) {
        toast.success('Contact form submitted successfully!', {
          duration: 5000,
          position: 'top-right',
          style: {
            background: '#4CAF50',
            color: '#FFFFFF',
          },
        });
        // Reset form
        setFormData({
          name: '', gender: '', number: '', email: '', whatsapp: '', query: '',
          companyName: '', companyWebsite: '', companySocialMedia: '',
          individualLinkedin: '', individualInstagram: '', howDidYouHear: '',
          message: '', termsAccepted: false
        });
        setOtpSent({ email: false, whatsapp: false });
        setOtpVerified({ email: false, whatsapp: false });
        setOtpValues({ email: '', whatsapp: '' });
        setRecaptchaToken(null);
        if (recaptchaRef.current) {
          recaptchaRef.current.reset();
        }
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to submit form', {
          duration: 5000,
          position: 'top-right',
          style: {
            background: '#F44336',
            color: '#FFFFFF',
          },
        });
      }
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error('Network error. Please check your connection and try again.', {
        duration: 5000,
        position: 'top-right',
        style: {
          background: '#F44336',
          color: '#FFFFFF',
        },
      });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <UserHeader />
      <Toaster />

      <main className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-12">
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 lg:p-8">
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 sm:mb-4">Contact Us</h1>
            <p className="text-sm sm:text-base text-gray-600">
              Get in touch with us. We'd love to hear from you.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Name and Gender */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm sm:text-base"
                  placeholder="Enter your full name"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender *
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm sm:text-base"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender}</p>}
              </div>
            </div>

            {/* Number, Email, WhatsApp - Stack on mobile */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number *
                </label>
                <input
                  type="tel"
                  name="number"
                  value={formData.number}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm sm:text-base"
                  placeholder="Enter phone number"
                />
                {errors.number && <p className="text-red-500 text-sm mt-1">{errors.number}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm sm:text-base"
                    placeholder="Enter email"
                  />
                  <button
                    type="button"
                    onClick={() => sendOtp('email')}
                    disabled={otpSent.email || loading}
                    className="px-3 sm:px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark disabled:opacity-50 text-xs sm:text-sm whitespace-nowrap"
                  >
                    {otpSent.email ? 'Sent' : 'Send OTP'}
                  </button>
                </div>
                {otpSent.email && !otpVerified.email && (
                  <div className="mt-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={otpValues.email}
                        onChange={(e) => handleOtpChange('email', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm sm:text-base"
                        placeholder="Enter OTP"
                        maxLength="6"
                      />
                      <button
                        type="button"
                        onClick={() => verifyOtp('email')}
                        disabled={loading}
                        className="px-3 sm:px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50 text-xs sm:text-sm whitespace-nowrap"
                      >
                        Verify
                      </button>
                    </div>
                    <p className="text-sm text-blue-600 mt-1">
                      Check your email for the OTP code. It may take a few minutes to arrive.
                    </p>
                  </div>
                )}
                {otpVerified.email && (
                  <div className="mt-2 flex items-center text-green-600">
                    <Icon name="check-circle" size="sm" className="mr-1" />
                    <span className="text-sm">Email verified successfully!</span>
                  </div>
                )}
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                {errors.emailOtp && <p className="text-red-500 text-sm mt-1">{errors.emailOtp}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  WhatsApp *
                </label>
                <div className="flex gap-2">
                  <input
                    type="tel"
                    name="whatsapp"
                    value={formData.whatsapp}
                    onChange={handleInputChange}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm sm:text-base"
                    placeholder="Enter WhatsApp number"
                  />
                  <button
                    type="button"
                    onClick={() => sendOtp('whatsapp')}
                    disabled={otpSent.whatsapp || loading}
                    className="px-3 sm:px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark disabled:opacity-50 text-xs sm:text-sm whitespace-nowrap"
                  >
                    {otpSent.whatsapp ? 'Sent' : 'Send OTP'}
                  </button>
                </div>
                {otpSent.whatsapp && !otpVerified.whatsapp && (
                  <div className="mt-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={otpValues.whatsapp}
                        onChange={(e) => handleOtpChange('whatsapp', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm sm:text-base"
                        placeholder="Enter OTP"
                        maxLength="6"
                      />
                      <button
                        type="button"
                        onClick={() => verifyOtp('whatsapp')}
                        disabled={loading}
                        className="px-3 sm:px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50 text-xs sm:text-sm whitespace-nowrap"
                      >
                        Verify
                      </button>
                    </div>
                    <p className="text-sm text-blue-600 mt-1">
                      Check your WhatsApp for the OTP code. It may take a few minutes to arrive.
                    </p>
                  </div>
                )}
                {otpVerified.whatsapp && (
                  <div className="mt-2 flex items-center text-green-600">
                    <Icon name="check-circle" size="sm" className="mr-1" />
                    <span className="text-sm">WhatsApp verified successfully!</span>
                  </div>
                )}
                {errors.whatsapp && <p className="text-red-500 text-sm mt-1">{errors.whatsapp}</p>}
                {errors.whatsappOtp && <p className="text-red-500 text-sm mt-1">{errors.whatsappOtp}</p>}
              </div>
            </div>

            {/* Query Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Query *
              </label>
              <select
                name="query"
                value={formData.query}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Select query type</option>
                {queryOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.query && <p className="text-red-500 text-sm mt-1">{errors.query}</p>}
            </div>

            {/* Company Information - Stack on mobile */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter company name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Website
                </label>
                <input
                  type="url"
                  name="companyWebsite"
                  value={formData.companyWebsite}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="https://example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Social Media Links
                </label>
                <input
                  type="text"
                  name="companySocialMedia"
                  value={formData.companySocialMedia}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Social media links"
                />
              </div>
            </div>

            {/* Individual Social Links */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Individual LinkedIn
                </label>
                <input
                  type="url"
                  name="individualLinkedin"
                  value={formData.individualLinkedin}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="LinkedIn profile URL"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Individual Instagram
                </label>
                <input
                  type="url"
                  name="individualInstagram"
                  value={formData.individualInstagram}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Instagram profile URL"
                />
              </div>
            </div>

            {/* How did you hear about us */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                How did you hear about us?
              </label>
              <input
                type="text"
                name="howDidYouHear"
                value={formData.howDidYouHear}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="How did you find us?"
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message *
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                rows={5}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Enter your message (max 500 characters)"
                maxLength={500}
              />
              <p className="text-sm text-gray-500 mt-1">
                {formData.message.length}/500 characters
              </p>
              {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message}</p>}
            </div>

            {/* Captcha - Make responsive */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Captcha *
              </label>
              <div className="flex justify-center sm:justify-start overflow-x-auto">
                <ReCAPTCHA
                  ref={recaptchaRef}
                  sitekey="6LdNzrErAAAAAB1EB7ETPEhUrynf0wSQftMt-COT"
                  onChange={handleRecaptchaChange}
                  onExpired={() => setRecaptchaToken(null)}
                  size={typeof window !== 'undefined' && window.innerWidth < 640 ? "compact" : "normal"}
                />
              </div>
              {errors.captcha && <p className="text-red-500 text-sm mt-1">{errors.captcha}</p>}
            </div>

            {/* Terms and Conditions */}
            <div>
              <label className="flex items-start">
                <input
                  type="checkbox"
                  name="termsAccepted"
                  checked={formData.termsAccepted}
                  onChange={handleInputChange}
                  className="mt-1 mr-3 flex-shrink-0"
                />
                <span className="text-sm text-gray-700 leading-relaxed">
                  I accept the{' '}
                  <a href="/terms-and-conditions" className="text-primary hover:underline">
                    Terms and Conditions
                  </a>
                </span>
              </label>
              {errors.termsAccepted && <p className="text-red-500 text-sm mt-1">{errors.termsAccepted}</p>}
            </div>

            {/* Submit Button */}
            <div className="text-center pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-8 py-3 bg-primary text-white rounded-md hover:bg-primary-dark disabled:opacity-50 font-medium transition-colors"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <Icon name="arrow-path" size="sm" className="animate-spin mr-2" />
                    Submitting...
                  </div>
                ) : (
                  'Submit Contact Form'
                )}
              </button>
            </div>
          </form>
        </div>
      </main>

      <UserFooter />
    </div>
  );
};

export default ContactUs;