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
    <div className="min-h-screen bg-[#FAFAFA]">
      <UserHeader />
      <Toaster />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12 max-w-5xl">
        <div className="bg-[#FFFFFF] rounded-xl shadow-lg p-4 sm:p-6 lg:p-10 border border-[#E0E0E0]">
          <div className="text-center mb-6 sm:mb-8">
            <div className="flex items-center justify-center mb-4">
              <Icon name="chat-bubble-left" size="xl" style={{ color: '#1976D2', marginRight: '12px' }} />
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#212121]">Contact Us</h1>
            </div>
            <p className="text-sm sm:text-base text-[#757575] max-w-2xl mx-auto leading-relaxed">
              Get in touch with us. We'd love to hear from you.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Name and Gender */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="flex items-center text-sm font-medium text-[#212121] mb-2">
                  <Icon name="user" size="sm" style={{ color: '#757575', marginRight: '8px' }} />
                  Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2.5 sm:py-3 border border-[#BDBDBD] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976D2] focus:border-transparent text-sm sm:text-base bg-[#FFFFFF] text-[#212121] placeholder-[#757575] transition-all duration-200"
                  placeholder="Enter your full name"
                />
                {errors.name && <p className="text-[#F44336] text-sm mt-1 flex items-center">
                  <Icon name="exclamation-triangle" size="xs" style={{ color: '#F44336', marginRight: '4px' }} />
                  {errors.name}
                </p>}
              </div>

              <div>
                <label className="flex items-center text-sm font-medium text-[#212121] mb-2">
                  <Icon name="users" size="sm" style={{ color: '#757575', marginRight: '8px' }} />
                  Gender *
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2.5 sm:py-3 border border-[#BDBDBD] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976D2] focus:border-transparent text-sm sm:text-base bg-[#FFFFFF] text-[#212121] transition-all duration-200"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                {errors.gender && <p className="text-[#F44336] text-sm mt-1 flex items-center">
                  <Icon name="exclamation-triangle" size="xs" style={{ color: '#F44336', marginRight: '4px' }} />
                  {errors.gender}
                </p>}
              </div>
            </div>

            {/* Contact Information - Responsive Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="flex items-center text-sm font-medium text-[#212121] mb-2">
                  <Icon name="phone" size="sm" style={{ color: '#757575', marginRight: '8px' }} />
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="number"
                  value={formData.number}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2.5 sm:py-3 border border-[#BDBDBD] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976D2] focus:border-transparent text-sm sm:text-base bg-[#FFFFFF] text-[#212121] placeholder-[#757575] transition-all duration-200"
                  placeholder="Enter phone number"
                />
                {errors.number && <p className="text-[#F44336] text-sm mt-1 flex items-center">
                  <Icon name="exclamation-triangle" size="xs" style={{ color: '#F44336', marginRight: '4px' }} />
                  {errors.number}
                </p>}
              </div>

              <div>
                <label className="flex items-center text-sm font-medium text-[#212121] mb-2">
                  <Icon name="mail" size="sm" style={{ color: '#757575', marginRight: '8px' }} />
                  Email *
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="flex-1 px-3 py-2.5 sm:py-3 border border-[#BDBDBD] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976D2] focus:border-transparent text-sm sm:text-base bg-[#FFFFFF] text-[#212121] placeholder-[#757575] transition-all duration-200"
                    placeholder="Enter email"
                  />
                  <button
                    type="button"
                    onClick={() => sendOtp('email')}
                    disabled={otpSent.email || loading}
                    className="px-4 py-2.5 sm:py-3 bg-[#1976D2] text-[#FFFFFF] rounded-lg hover:bg-[#0D47A1] disabled:opacity-50 text-sm font-medium whitespace-nowrap transition-all duration-200 min-w-[100px]"
                  >
                    {otpSent.email ? 'Sent' : 'Send OTP'}
                  </button>
                </div>
                {otpSent.email && !otpVerified.email && (
                  <div className="mt-3 space-y-2">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        value={otpValues.email}
                        onChange={(e) => handleOtpChange('email', e.target.value)}
                        className="flex-1 px-3 py-2.5 border border-[#BDBDBD] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976D2] focus:border-transparent text-sm bg-[#FFFFFF] text-[#212121] placeholder-[#757575] transition-all duration-200"
                        placeholder="Enter OTP"
                        maxLength="6"
                      />
                      <button
                        type="button"
                        onClick={() => verifyOtp('email')}
                        disabled={loading}
                        className="px-4 py-2.5 bg-[#4CAF50] text-[#FFFFFF] rounded-lg hover:bg-[#388E3C] disabled:opacity-50 text-sm font-medium whitespace-nowrap transition-all duration-200 min-w-[100px]"
                      >
                        Verify
                      </button>
                    </div>
                    <p className="text-xs sm:text-sm text-[#1976D2] flex items-start">
                      <Icon name="information-circle" size="xs" style={{ color: '#1976D2', marginRight: '4px', marginTop: '2px', flexShrink: 0 }} />
                      Check your email for the OTP code. It may take a few minutes to arrive.
                    </p>
                  </div>
                )}
                {otpVerified.email && (
                  <div className="mt-2 flex items-center text-[#4CAF50]">
                    <Icon name="check-circle" size="sm" style={{ color: '#4CAF50', marginRight: '6px' }} />
                    <span className="text-sm">Email verified successfully!</span>
                  </div>
                )}
                {errors.email && <p className="text-[#F44336] text-sm mt-1 flex items-center">
                  <Icon name="exclamation-triangle" size="xs" style={{ color: '#F44336', marginRight: '4px' }} />
                  {errors.email}
                </p>}
                {errors.emailOtp && <p className="text-[#F44336] text-sm mt-1 flex items-center">
                  <Icon name="exclamation-triangle" size="xs" style={{ color: '#F44336', marginRight: '4px' }} />
                  {errors.emailOtp}
                </p>}
              </div>
            </div>

            {/* WhatsApp Number - Separate Line */}
            <div>
              <label className="flex items-center text-sm font-medium text-[#212121] mb-2">
                <Icon name="whatsapp" size="sm" style={{ color: '#25D366', marginRight: '8px' }} />
                WhatsApp *
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="tel"
                  name="whatsapp"
                  value={formData.whatsapp}
                  onChange={handleInputChange}
                  className="flex-1 px-3 py-2.5 sm:py-3 border border-[#BDBDBD] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976D2] focus:border-transparent text-sm sm:text-base bg-[#FFFFFF] text-[#212121] placeholder-[#757575] transition-all duration-200"
                  placeholder="Enter WhatsApp number"
                />
                <button
                  type="button"
                  onClick={() => sendOtp('whatsapp')}
                  disabled={otpSent.whatsapp || loading}
                  className="px-4 py-2.5 sm:py-3 bg-[#1976D2] text-[#FFFFFF] rounded-lg hover:bg-[#0D47A1] disabled:opacity-50 text-sm font-medium whitespace-nowrap transition-all duration-200 min-w-[100px]"
                >
                  {otpSent.whatsapp ? 'Sent' : 'Send OTP'}
                </button>
              </div>
              {otpSent.whatsapp && !otpVerified.whatsapp && (
                <div className="mt-3 space-y-2">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={otpValues.whatsapp}
                      onChange={(e) => handleOtpChange('whatsapp', e.target.value)}
                      className="flex-1 px-3 py-2.5 border border-[#BDBDBD] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976D2] focus:border-transparent text-sm bg-[#FFFFFF] text-[#212121] placeholder-[#757575] transition-all duration-200"
                      placeholder="Enter OTP"
                      maxLength="6"
                    />
                    <button
                      type="button"
                      onClick={() => verifyOtp('whatsapp')}
                      disabled={loading}
                      className="px-4 py-2.5 bg-[#4CAF50] text-[#FFFFFF] rounded-lg hover:bg-[#388E3C] disabled:opacity-50 text-sm font-medium whitespace-nowrap transition-all duration-200 min-w-[100px]"
                    >
                      Verify
                    </button>
                  </div>
                  <p className="text-xs sm:text-sm text-[#1976D2] flex items-start">
                    <Icon name="information-circle" size="xs" style={{ color: '#1976D2', marginRight: '4px', marginTop: '2px', flexShrink: 0 }} />
                    Check your WhatsApp for the OTP code. It may take a few minutes to arrive.
                  </p>
                </div>
              )}
              {otpVerified.whatsapp && (
                <div className="mt-2 flex items-center text-[#4CAF50]">
                  <Icon name="check-circle" size="sm" style={{ color: '#4CAF50', marginRight: '6px' }} />
                  <span className="text-sm">WhatsApp verified successfully!</span>
                </div>
              )}
              {errors.whatsapp && <p className="text-[#F44336] text-sm mt-1 flex items-center">
                <Icon name="exclamation-triangle" size="xs" style={{ color: '#F44336', marginRight: '4px' }} />
                {errors.whatsapp}
              </p>}
              {errors.whatsappOtp && <p className="text-[#F44336] text-sm mt-1 flex items-center">
                <Icon name="exclamation-triangle" size="xs" style={{ color: '#F44336', marginRight: '4px' }} />
                {errors.whatsappOtp}
              </p>}
            </div>

            {/* Query Type */}
            <div>
              <label className="flex items-center text-sm font-medium text-[#212121] mb-2">
                <Icon name="question-mark-circle" size="sm" style={{ color: '#757575', marginRight: '8px' }} />
                Query Type *
              </label>
              <select
                name="query"
                value={formData.query}
                onChange={handleInputChange}
                className="w-full px-3 py-2.5 sm:py-3 border border-[#BDBDBD] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976D2] focus:border-transparent bg-[#FFFFFF] text-[#212121] text-sm sm:text-base transition-all duration-200"
              >
                <option value="">Select query type</option>
                {queryOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.query && <p className="text-[#F44336] text-sm mt-1 flex items-center">
                <Icon name="exclamation-triangle" size="xs" style={{ color: '#F44336', marginRight: '4px' }} />
                {errors.query}
              </p>}
            </div>

            {/* Company Information */}
            <div className="bg-[#F8F9FA] p-4 sm:p-6 rounded-lg border border-[#E9ECEF]">
              <h3 className="flex items-center text-lg font-semibold text-[#212121] mb-4">
                <Icon name="building" size="sm" style={{ color: '#1976D2', marginRight: '8px' }} />
                Company Information (Optional)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                <div>
                  <label className="block text-sm font-medium text-[#212121] mb-2">
                    Company Name
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2.5 border border-[#BDBDBD] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976D2] focus:border-transparent text-sm bg-[#FFFFFF] text-[#212121] placeholder-[#757575] transition-all duration-200"
                    placeholder="Enter company name"
                  />
                </div>

                <div>
                  <label className="flex items-center text-sm font-medium text-[#212121] mb-2">
                    <Icon name="globe-alt" size="xs" style={{ color: '#757575', marginRight: '6px' }} />
                    Company Website
                  </label>
                  <input
                    type="url"
                    name="companyWebsite"
                    value={formData.companyWebsite}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2.5 border border-[#BDBDBD] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976D2] focus:border-transparent text-sm bg-[#FFFFFF] text-[#212121] placeholder-[#757575] transition-all duration-200"
                    placeholder="https://example.com"
                  />
                </div>

                <div className="md:col-span-2 xl:col-span-1">
                  <label className="flex items-center text-sm font-medium text-[#212121] mb-2">
                    <Icon name="share" size="xs" style={{ color: '#757575', marginRight: '6px' }} />
                    Social Media Links
                  </label>
                  <input
                    type="text"
                    name="companySocialMedia"
                    value={formData.companySocialMedia}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2.5 border border-[#BDBDBD] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976D2] focus:border-transparent text-sm bg-[#FFFFFF] text-[#212121] placeholder-[#757575] transition-all duration-200"
                    placeholder="Social media links"
                  />
                </div>
              </div>
            </div>

            {/* Individual Social Links */}
            <div className="bg-[#F0F8FF] p-4 sm:p-6 rounded-lg border border-[#B3D9FF]">
              <h3 className="flex items-center text-lg font-semibold text-[#212121] mb-4">
                <Icon name="user" size="sm" style={{ color: '#1976D2', marginRight: '8px' }} />
                Personal Social Media (Optional)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="flex items-center text-sm font-medium text-[#212121] mb-2">
                    <Icon name="linkedin" size="xs" style={{ color: '#0077B5', marginRight: '6px' }} />
                    LinkedIn Profile
                  </label>
                  <input
                    type="url"
                    name="individualLinkedin"
                    value={formData.individualLinkedin}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2.5 border border-[#BDBDBD] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976D2] focus:border-transparent bg-[#FFFFFF] text-[#212121] placeholder-[#757575] text-sm transition-all duration-200"
                    placeholder="LinkedIn profile URL"
                  />
                </div>

                <div>
                  <label className="flex items-center text-sm font-medium text-[#212121] mb-2">
                    <Icon name="instagram" size="xs" style={{ color: '#E4405F', marginRight: '6px' }} />
                    Instagram Profile
                  </label>
                  <input
                    type="url"
                    name="individualInstagram"
                    value={formData.individualInstagram}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2.5 border border-[#BDBDBD] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976D2] focus:border-transparent bg-[#FFFFFF] text-[#212121] placeholder-[#757575] text-sm transition-all duration-200"
                    placeholder="Instagram profile URL"
                  />
                </div>
              </div>
            </div>

            {/* How did you hear about us */}
            <div>
              <label className="flex items-center text-sm font-medium text-[#212121] mb-2">
                <Icon name="megaphone" size="sm" style={{ color: '#757575', marginRight: '8px' }} />
                How did you hear about us?
              </label>
              <input
                type="text"
                name="howDidYouHear"
                value={formData.howDidYouHear}
                onChange={handleInputChange}
                className="w-full px-3 py-2.5 sm:py-3 border border-[#BDBDBD] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976D2] focus:border-transparent bg-[#FFFFFF] text-[#212121] placeholder-[#757575] text-sm sm:text-base transition-all duration-200"
                placeholder="How did you find us?"
              />
            </div>

            {/* Message */}
            <div>
              <label className="flex items-center text-sm font-medium text-[#212121] mb-2">
                <Icon name="document-text" size="sm" style={{ color: '#757575', marginRight: '8px' }} />
                Message *
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                rows={window.innerWidth < 640 ? 4 : 5}
                className="w-full px-3 py-2.5 sm:py-3 border border-[#BDBDBD] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976D2] focus:border-transparent bg-[#FFFFFF] text-[#212121] placeholder-[#757575] text-sm sm:text-base resize-none transition-all duration-200"
                placeholder="Enter your message (max 500 characters)"
                maxLength={500}
              />
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs sm:text-sm text-[#757575]">
                  {formData.message.length}/500 characters
                </p>
                {formData.message.length > 450 && (
                  <p className="text-xs text-[#FF9800] flex items-center">
                    <Icon name="exclamation-triangle" size="xs" style={{ color: '#FF9800', marginRight: '4px' }} />
                    Approaching limit
                  </p>
                )}
              </div>
              {errors.message && <p className="text-[#F44336] text-sm mt-1 flex items-center">
                <Icon name="exclamation-triangle" size="xs" style={{ color: '#F44336', marginRight: '4px' }} />
                {errors.message}
              </p>}
            </div>

            {/* Captcha */}
            <div>
              <label className="flex items-center text-sm font-medium text-[#212121] mb-3">
                <Icon name="shield-check" size="sm" style={{ color: '#757575', marginRight: '8px' }} />
                Security Verification *
              </label>
              <div className="flex justify-center lg:justify-start">
                <div className="overflow-x-auto">
                  <ReCAPTCHA
                    ref={recaptchaRef}
                    sitekey="6LdNzrErAAAAAB1EB7ETPEhUrynf0wSQftMt-COT"
                    onChange={handleRecaptchaChange}
                    onExpired={() => setRecaptchaToken(null)}
                    size={typeof window !== 'undefined' && window.innerWidth < 400 ? "compact" : "normal"}
                    theme="light"
                  />
                </div>
              </div>
              {errors.captcha && <p className="text-[#F44336] text-sm mt-2 flex items-center">
                <Icon name="exclamation-triangle" size="xs" style={{ color: '#F44336', marginRight: '4px' }} />
                {errors.captcha}
              </p>}
            </div>

            {/* Terms and Conditions */}
            <div className="bg-[#FFF8E1] p-4 rounded-lg border border-[#FFE082]">
              <label className="flex items-start cursor-pointer">
                <input
                  type="checkbox"
                  name="termsAccepted"
                  checked={formData.termsAccepted}
                  onChange={handleInputChange}
                  className="mt-1 mr-3 flex-shrink-0 w-4 h-4 text-[#1976D2] border-[#BDBDBD] rounded focus:ring-[#1976D2] focus:ring-2"
                />
                <div className="text-sm text-[#795548] leading-relaxed">
                  <span>I accept the </span>
                  <a 
                    href="/terms-and-conditions" 
                    className="text-[#1976D2] hover:text-[#0D47A1] font-medium underline transition-colors duration-200"
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    Terms and Conditions
                  </a>
                  <span> and understand that my information will be processed according to the Privacy Policy.</span>
                </div>
              </label>
              {errors.termsAccepted && <p className="text-[#F44336] text-sm mt-2 flex items-center">
                <Icon name="exclamation-triangle" size="xs" style={{ color: '#F44336', marginRight: '4px' }} />
                {errors.termsAccepted}
              </p>}
            </div>

            {/* Submit Button */}
            <div className="text-center pt-4 sm:pt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto min-w-[200px] px-6 sm:px-8 py-3 sm:py-4 bg-[#1976D2] text-[#FFFFFF] rounded-lg hover:bg-[#0D47A1] disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm sm:text-base transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <Icon name="arrow-path" size="sm" className="animate-spin" style={{ color: '#FFFFFF', marginRight: '8px' }} />
                    Submitting...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <Icon name="paper-airplane" size="sm" style={{ color: '#FFFFFF', marginRight: '8px' }} />
                    Submit Contact Form
                  </div>
                )}
              </button>
            </div>

            {/* Help Text */}
            <div className="text-center pt-4">
              <p className="text-xs sm:text-sm text-[#757575] flex items-center justify-center">
                <Icon name="information-circle" size="xs" style={{ color: '#757575', marginRight: '6px' }} />
                Need help? Contact us at support@newsmarketplace.com
              </p>
            </div>
          </form>
        </div>
      </main>

      <UserFooter />
    </div>
  );
};

export default ContactUs;