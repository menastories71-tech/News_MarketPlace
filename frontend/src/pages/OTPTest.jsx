import React, { useState } from 'react';
import UserHeader from '../components/common/UserHeader';
import UserFooter from '../components/common/UserFooter';

const OTPTest = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [flowType, setFlowType] = useState('SMS');
  const [otp, setOtp] = useState('');
  const [verificationId, setVerificationId] = useState('');
  const [loading, setLoading] = useState(false);
  const [sendResponse, setSendResponse] = useState(null);
  const [validateResponse, setValidateResponse] = useState(null);
  const [error, setError] = useState('');

  // Backend API base URL
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

  const sendOTP = async () => {
    if (!phoneNumber || phoneNumber.length !== 10) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    setLoading(true);
    setError('');
    setSendResponse(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/otp/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          mobileNumber: phoneNumber,
          flowType: flowType,
          countryCode: '91'
        })
      });

      const data = await response.json();

      if (data.success) {
        setSendResponse(data);
        setVerificationId(data.data.verificationId);
        setError('');
      } else {
        setError(data.message || 'Failed to send OTP');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Send OTP error:', err);
    } finally {
      setLoading(false);
    }
  };

  const validateOTP = async () => {
    if (!otp || otp.length < 4 || otp.length > 6) {
      setError('Please enter a valid 4-6 digit OTP');
      return;
    }

    if (!verificationId) {
      setError('Please send OTP first');
      return;
    }

    setLoading(true);
    setError('');
    setValidateResponse(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/otp/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          mobileNumber: phoneNumber,
          verificationId: verificationId,
          code: otp,
          countryCode: '91'
        })
      });

      const data = await response.json();
      setValidateResponse(data);

      if (data.success) {
        setError('');
      } else {
        setError(data.message || 'OTP validation failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Validate OTP error:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setPhoneNumber('');
    setOtp('');
    setVerificationId('');
    setSendResponse(null);
    setValidateResponse(null);
    setError('');
  };

  return (
    <div className="min-h-screen bg-white">
      <UserHeader />

      {/* Hero Section */}
      <section className="relative py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#E3F2FD] to-white border-b border-[#E0E0E0]">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-[#212121] mb-6 tracking-tight">
            OTP Testing with Message Central
          </h1>
          <p className="text-lg md:text-xl text-[#757575] max-w-3xl mx-auto leading-relaxed font-light">
            Test Message Central's OTP service for SMS and WhatsApp verification
          </p>
        </div>
      </section>

      {/* Test Form */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg border border-[#E0E0E0] p-8">

            {/* Phone Number Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-[#212121] mb-2">
                Phone Number (10 digits)
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border border-r-0 border-gray-300 rounded-l-md">
                  +91
                </span>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="Enter 10-digit number"
                  className="flex-1 min-w-0 block w-full px-3 py-2 border border-gray-300 rounded-none rounded-r-md focus:ring-[#1976D2] focus:border-[#1976D2] text-[#212121]"
                />
              </div>
            </div>

            {/* Flow Type Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-[#212121] mb-2">
                Delivery Method
              </label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="SMS"
                    checked={flowType === 'SMS'}
                    onChange={(e) => setFlowType(e.target.value)}
                    className="mr-2"
                  />
                  SMS
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="WHATSAPP"
                    checked={flowType === 'WHATSAPP'}
                    onChange={(e) => setFlowType(e.target.value)}
                    className="mr-2"
                  />
                  WhatsApp
                </label>
              </div>
            </div>

            {/* Send OTP Button */}
            <div className="mb-6">
              <button
                onClick={sendOTP}
                disabled={loading || !phoneNumber}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                  loading || !phoneNumber
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-[#1976D2] hover:bg-[#0D47A1] text-white'
                }`}
              >
                {loading ? 'Sending...' : 'Send OTP'}
              </button>
            </div>

            {/* Send Response */}
            {sendResponse && (
              <div className={`mb-6 p-4 border rounded-lg ${
                sendResponse.success
                  ? 'bg-green-50 border-green-200'
                  : 'bg-red-50 border-red-200'
              }`}>
                <h3 className={`font-semibold mb-2 ${
                  sendResponse.success
                    ? 'text-green-800'
                    : 'text-red-800'
                }`}>
                  {sendResponse.success ? 'OTP Sent Successfully!' : 'Failed to Send OTP'}
                </h3>
                <pre className={`text-sm whitespace-pre-wrap ${
                  sendResponse.success
                    ? 'text-green-700'
                    : 'text-red-700'
                }`}>
                  {JSON.stringify(sendResponse, null, 2)}
                </pre>
              </div>
            )}

            {/* OTP Input */}
            {verificationId && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-[#212121] mb-2">
                  Enter OTP (6 digits)
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Enter 6-digit OTP"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#1976D2] focus:border-[#1976D2] text-[#212121]"
                />
                <button
                  onClick={validateOTP}
                  disabled={loading || !otp}
                  className={`w-full mt-3 py-3 px-4 rounded-lg font-medium transition-colors ${
                    loading || !otp
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-[#4CAF50] hover:bg-[#388E3C] text-white'
                  }`}
                >
                  {loading ? 'Validating...' : 'Validate OTP'}
                </button>
              </div>
            )}

            {/* Validate Response */}
            {validateResponse && (
              <div className={`mb-6 p-4 border rounded-lg ${
                validateResponse.success
                  ? 'bg-green-50 border-green-200'
                  : 'bg-red-50 border-red-200'
              }`}>
                <h3 className={`font-semibold mb-2 ${
                  validateResponse.success
                    ? 'text-green-800'
                    : 'text-red-800'
                }`}>
                  {validateResponse.success ? 'OTP Validated Successfully!' : 'Validation Failed'}
                </h3>
                <pre className={`text-sm whitespace-pre-wrap ${
                  validateResponse.success
                    ? 'text-green-700'
                    : 'text-red-700'
                }`}>
                  {JSON.stringify(validateResponse, null, 2)}
                </pre>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800">{error}</p>
              </div>
            )}

            {/* Reset Button */}
            <button
              onClick={resetForm}
              className="w-full py-2 px-4 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Reset Form
            </button>
          </div>

          {/* API Information */}
          <div className="mt-8 bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-[#212121] mb-4">API Information</h3>
            <div className="space-y-2 text-sm text-[#757575]">
              <p><strong>Backend API:</strong> {API_BASE_URL}/api/otp</p>
              <p><strong>Send OTP:</strong> POST /api/otp/send</p>
              <p><strong>Validate OTP:</strong> POST /api/otp/validate</p>
              <p><strong>Health Check:</strong> GET /api/otp/health</p>
              <p><strong>Service Info:</strong> GET /api/otp/info</p>
              <p><strong>Provider:</strong> Message Central</p>
              <p><strong>Country Code:</strong> 91 (India)</p>
              <p><strong>Flow Types:</strong> SMS, WhatsApp</p>
            </div>
          </div>
        </div>
      </section>

      <UserFooter />
    </div>
  );
};

export default OTPTest;