import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import config from '../config/config';

// Initialize Firebase
const app = initializeApp(config.firebase);
const db = getFirestore(app);

// Exhibition Form Page Component
const ExhibitionFormPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    callingNumber: '',
    whatsappNumber: '',
    email: '',
    gender: '',
    countryOfResidence: '',
    languages: [],
    currentRoles: [],
    interestedIn: [],
    termsAccepted: false
  });

  const [loading, setLoading] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState('');
  const [errors, setErrors] = useState({});
  const [submitStatus, setSubmitStatus] = useState(null); // null, 'success', 'error'
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isRateLimited, setIsRateLimited] = useState(false);

  // Rate limiting configuration
  const MAX_SUBMISSIONS_PER_USER_PER_DAY = 5; // Per user limit to prevent spam
  const RATE_LIMIT_RESET_HOURS = 24;
  const RATE_LIMIT_RETRY_MINUTES = 10; // Retry after 10 minutes

  // Rate limiting functions
  const getRateLimitKey = (identifier) => `exhibition_form_submissions_${identifier}_${new Date().toDateString()}`;

  const checkRateLimit = (identifier, maxSubmissions) => {
    try {
      const key = getRateLimitKey(identifier);
      const data = JSON.parse(localStorage.getItem(key) || '{"submissions":[],"blockedUntil":0}');
      const now = Date.now();
      const oneDay = RATE_LIMIT_RESET_HOURS * 60 * 60 * 1000;

      // Check if still blocked
      if (data.blockedUntil && now < data.blockedUntil) {
        return false;
      }

      // Filter out old submissions
      const recentSubmissions = data.submissions.filter(time => now - time < oneDay);

      // Update localStorage
      localStorage.setItem(key, JSON.stringify({
        submissions: recentSubmissions,
        blockedUntil: 0
      }));

      return recentSubmissions.length < maxSubmissions;
    } catch (error) {
      console.warn('Rate limiting check failed:', error);
      return true; // Allow submission if localStorage fails
    }
  };

  const recordSubmission = (identifier) => {
    try {
      const key = getRateLimitKey(identifier);
      const data = JSON.parse(localStorage.getItem(key) || '{"submissions":[],"blockedUntil":0}');
      data.submissions.push(Date.now());

      // If limit reached, set blocked time
      if (data.submissions.length >= MAX_SUBMISSIONS_PER_USER_PER_DAY) {
        data.blockedUntil = Date.now() + (RATE_LIMIT_RETRY_MINUTES * 60 * 1000);
      }

      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.warn('Recording submission failed:', error);
    }
  };

  // Check user-specific rate limit
  const checkUserRateLimit = () => {
    const userIdentifier = `session_${sessionStorage.getItem('sessionId') || Math.random().toString(36).substr(2, 9)}`;
    return checkRateLimit(userIdentifier, MAX_SUBMISSIONS_PER_USER_PER_DAY);
  };

  // Get remaining time until retry is allowed
  const getRemainingTime = (identifier) => {
    try {
      const key = getRateLimitKey(identifier);
      const data = JSON.parse(localStorage.getItem(key) || '{"blockedUntil":0}');
      const now = Date.now();
      if (data.blockedUntil && now < data.blockedUntil) {
        return Math.ceil((data.blockedUntil - now) / (60 * 1000)); // minutes
      }
      return 0;
    } catch (error) {
      return 0;
    }
  };

  // Country list for dropdown
  const countries = [
    "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria",
    "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan",
    "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia",
    "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica",
    "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt",
    "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France", "Gabon",
    "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana",
    "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel",
    "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan", "Laos",
    "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi",
    "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova",
    "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands",
    "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway", "Oman", "Pakistan", "Palau",
    "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia",
    "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia",
    "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan",
    "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania",
    "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda",
    "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam",
    "Yemen", "Zambia", "Zimbabwe"
  ];

  // Comprehensive world languages list
  const languages = [
    "Abkhaz", "Afar", "Afrikaans", "Akan", "Albanian", "Amharic", "Arabic", "Aragonese", "Armenian", "Assamese",
    "Avaric", "Avestan", "Aymara", "Azerbaijani", "Bambara", "Bashkir", "Basque", "Belarusian", "Bengali", "Bihari",
    "Bislama", "Bosnian", "Breton", "Bulgarian", "Burmese", "Catalan", "Chamorro", "Chechen", "Chichewa", "Chinese",
    "Chuvash", "Cornish", "Corsican", "Cree", "Croatian", "Czech", "Danish", "Divehi", "Dutch", "Dzongkha",
    "English", "Esperanto", "Estonian", "Ewe", "Faroese", "Fijian", "Finnish", "French", "Fula", "Galician",
    "Georgian", "German", "Greek", "Guaraní", "Gujarati", "Haitian", "Hausa", "Hebrew", "Herero", "Hindi",
    "Hiri Motu", "Hungarian", "Icelandic", "Ido", "Igbo", "Indonesian", "Interlingua", "Interlingue", "Inuktitut",
    "Inupiaq", "Irish", "Italian", "Japanese", "Javanese", "Kalaallisut", "Kannada", "Kanuri", "Kashmiri", "Kazakh",
    "Khmer", "Kikuyu", "Kinyarwanda", "Kirghiz", "Komi", "Kongo", "Korean", "Kurdish", "Kwanyama", "Lao",
    "Latin", "Latvian", "Limburgish", "Lingala", "Lithuanian", "Luba-Katanga", "Luxembourgish", "Macedonian",
    "Malagasy", "Malay", "Malayalam", "Maltese", "Manx", "Maori", "Marathi", "Marshallese", "Mongolian",
    "Nauru", "Navajo", "Ndonga", "Nepali", "North Ndebele", "Northern Sami", "Norwegian", "Norwegian Bokmål",
    "Norwegian Nynorsk", "Nuosu", "Occitan", "Ojibwe", "Oriya", "Oromo", "Ossetian", "Pali", "Panjabi", "Pashto",
    "Persian", "Polish", "Portuguese", "Quechua", "Romanian", "Romansh", "Russian", "Samoan", "Sango", "Sanskrit",
    "Sardinian", "Scottish Gaelic", "Serbian", "Shona", "Sindhi", "Sinhala", "Slovak", "Slovenian", "Somali",
    "South Ndebele", "Southern Sotho", "Spanish", "Sundanese", "Swahili", "Swati", "Swedish", "Tagalog", "Tahitian",
    "Tajik", "Tamil", "Tatar", "Telugu", "Thai", "Tibetan", "Tigrinya", "Tonga", "Tsonga", "Tswana", "Turkish",
    "Turkmen", "Twi", "Uighur", "Ukrainian", "Urdu", "Uzbek", "Venda", "Vietnamese", "Volapük", "Walloon",
    "Welsh", "Western Frisian", "Wolof", "Xhosa", "Yiddish", "Yoruba", "Zhuang", "Zulu"
  ];

  // Current roles - alphabetical
  const currentRoles = [
    "Content Creator",
    "Digital Marketer",
    "Gamer",
    "Government Official",
    "Marketing Agency",
    "Marketing Professional",
    "Media Buyer",
    "Media Company owner",
    "Model and Influencer",
    "Musician or Actor or Entertainer",
    "Newspaper and Media Publisher",
    "OOH",
    "Radio Personality",
    "Sales and BDM at Media Group",
    "TV personality"
  ];

  // Interested in options
  const interestedInOptions = [
    "Affiliate Programmed",
    "Corporate Communication",
    "Influencer Platform Registration",
    "Influencer access",
    "Press and Social Media Distribution",
    "Recurring Media and Press Services",
    "Social Media Account Assistance"
  ];

  // Generate session ID for rate limiting
  useEffect(() => {
    if (!sessionStorage.getItem('sessionId')) {
      sessionStorage.setItem('sessionId', Math.random().toString(36).substr(2, 9));
    }
  }, []);

  // Load reCAPTCHA script and render widget
  useEffect(() => {
    const loadRecaptcha = () => {
      if (!window.grecaptcha) {
        const script = document.createElement('script');
        script.src = `https://www.google.com/recaptcha/api.js?render=explicit`;
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);

        script.onload = () => {
          if (window.grecaptcha) {
            window.grecaptcha.ready(() => {
              console.log('reCAPTCHA ready');
              renderRecaptcha();
            });
          }
        };
      } else {
        setTimeout(() => {
          renderRecaptcha();
        }, 100);
      }
    };

    const renderRecaptcha = () => {
      const container = document.getElementById('recaptcha-container-exhibition');
      if (!container) {
        console.log('reCAPTCHA container not found');
        return;
      }

      if (container.hasChildNodes()) {
        console.log('reCAPTCHA already rendered, skipping');
        return;
      }

      const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY || "6LdNzrErAAAAAB1EB7ETPEhUrynf0wSQftMt-COT";

      try {
        const widgetId = window.grecaptcha.render('recaptcha-container-exhibition', {
          'sitekey': siteKey,
          'callback': (token) => {
            setRecaptchaToken(token);
            setErrors(prev => ({ ...prev, recaptcha: '' }));
          },
          'expired-callback': () => {
            setRecaptchaToken('');
            setErrors(prev => ({ ...prev, recaptcha: 'reCAPTCHA expired. Please try again.' }));
          },
          'error-callback': () => {
            setRecaptchaToken('');
            setErrors(prev => ({ ...prev, recaptcha: 'reCAPTCHA error. Please try again.' }));
          }
        });
        console.log('reCAPTCHA rendered with widget ID:', widgetId);
      } catch (error) {
        console.error('Error rendering reCAPTCHA:', error);
      }
    };

    loadRecaptcha();
  }, []);

  // Debounced input change handler for performance
  const debouncedSetFormData = useCallback(
    (() => {
      let timeoutId;
      return (updater) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          setFormData(updater);
        }, 100);
      };
    })(),
    []
  );

  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;

    // Immediate state update for better UX
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));

    // Clear errors immediately
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  }, [errors]);

  const handlePhoneChange = useCallback((name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  }, [errors]);

  const handleMultiSelectChange = useCallback((name, value, checked) => {
    setFormData(prev => ({
      ...prev,
      [name]: checked
        ? [...prev[name], value]
        : prev[name].filter(item => item !== value)
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  }, [errors]);

  // Input sanitization function
  const sanitizeInput = (input) => {
    if (typeof input !== 'string') return input;
    return input
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  };

  // Additional security validation
  const validateSecurity = (data) => {
    const suspiciousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+=/i,
      /eval\(/i,
      /alert\(/i,
      /document\./i,
      /window\./i
    ];

    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'string') {
        for (const pattern of suspiciousPatterns) {
          if (pattern.test(value)) {
            return false;
          }
        }
      }
    }
    return true;
  };

  // Submit with retry logic
  const submitWithRetry = async (data, maxRetries = 3) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        setRetryCount(attempt - 1);
        const docRef = await addDoc(collection(db, 'exhibition_forms'), data);
        console.log(`Document written with ID: ${docRef.id} (attempt ${attempt})`);
        return true;
      } catch (error) {
        console.warn(`Submission attempt ${attempt} failed:`, error);

        if (attempt === maxRetries) {
          throw error;
        }

        // Exponential backoff: wait 1s, 2s, 4s...
        const delay = Math.pow(2, attempt - 1) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    return false;
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields
    const requiredFields = ['name', 'email', 'countryOfResidence'];
    requiredFields.forEach(field => {
      if (!formData[field] || formData[field].toString().trim() === '') {
        newErrors[field] = 'This field is required';
      }
    });

    // Email validation
    if (formData.email && !formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone validation - basic check
    if (formData.callingNumber && formData.callingNumber.length < 10) {
      newErrors.callingNumber = 'Please enter a valid phone number';
    }

    if (formData.whatsappNumber && formData.whatsappNumber.length < 10) {
      newErrors.whatsappNumber = 'Please enter a valid phone number';
    }

    // Terms accepted
    if (!formData.termsAccepted) {
      newErrors.termsAccepted = 'You must accept the terms and conditions';
    }

    // reCAPTCHA
    if (!recaptchaToken) {
      newErrors.recaptcha = 'Please complete the reCAPTCHA verification';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Check user rate limit
    if (!checkUserRateLimit()) {
      const remainingMinutes = getRemainingTime(`session_${sessionStorage.getItem('sessionId') || Math.random().toString(36).substr(2, 9)}`);
      setIsRateLimited(true);
      setErrors({
        submit: `You have reached the maximum submissions (5 per day). Please try again in ${remainingMinutes} minutes.`
      });
      return;
    }

    setLoading(true);
    setSubmitStatus(null);
    setIsRateLimited(false);

    try {
      // Sanitize and validate inputs
      const sanitizedData = {
        name: sanitizeInput(formData.name),
        callingNumber: formData.callingNumber,
        whatsappNumber: formData.whatsappNumber,
        email: sanitizeInput(formData.email),
        gender: sanitizeInput(formData.gender),
        countryOfResidence: sanitizeInput(formData.countryOfResidence),
        languages: formData.languages,
        currentRoles: formData.currentRoles,
        interestedIn: formData.interestedIn,
        termsAccepted: formData.termsAccepted,
        submittedAt: new Date(),
        recaptchaToken,
        sessionId: sessionStorage.getItem('sessionId'),
        userAgent: navigator.userAgent,
        timestamp: Date.now()
      };

      // Security validation
      if (!validateSecurity(sanitizedData)) {
        setErrors({ submit: 'Invalid input detected. Please check your data and try again.' });
        return;
      }

      // Attempt submission with retry logic
      const success = await submitWithRetry(sanitizedData, 3); // Max 3 retries

      if (success) {
        // Record successful submission for rate limiting
        recordSubmission(`session_${sessionStorage.getItem('sessionId') || Math.random().toString(36).substr(2, 9)}`);

        setSubmitStatus('success');
        setShowSuccessModal(true);
        setRetryCount(0);

        // Reset form
        setFormData({
          name: '',
          callingNumber: '',
          whatsappNumber: '',
          email: '',
          gender: '',
          countryOfResidence: '',
          languages: [],
          currentRoles: [],
          interestedIn: [],
          termsAccepted: false
        });
        setRecaptchaToken('');

        // Reset reCAPTCHA
        if (window.grecaptcha) {
          window.grecaptcha.reset();
        }

        // Auto-close modal after 8 seconds
        setTimeout(() => {
          setShowSuccessModal(false);
        }, 8000);
      } else {
        throw new Error('All retry attempts failed');
      }

    } catch (error) {
      console.error('Error submitting form: ', error);
      setSubmitStatus('error');

      let errorMessage = 'Failed to submit form. Please try again.';
      if (error.code === 'unavailable') {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (error.code === 'permission-denied') {
        errorMessage = 'Permission denied. Please contact support.';
      } else if (retryCount < 2) {
        errorMessage = `Submission failed. ${3 - retryCount} attempts remaining.`;
      }

      setErrors(prev => ({ ...prev, submit: errorMessage }));
    } finally {
      setLoading(false);
    }
  };

  const theme = useMemo(() => ({
    primary: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
    primarySolid: '#3b82f6',
    primaryDark: '#1d4ed8',
    primaryLight: 'rgba(59, 130, 246, 0.1)',
    secondary: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
    secondarySolid: '#60a5fa',
    accent: 'linear-gradient(135deg, #93c5fd 0%, #60a5fa 100%)',
    accentSolid: '#93c5fd',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    textPrimary: '#1f2937',
    textSecondary: '#6b7280',
    textMuted: '#9ca3af',
    background: '#ffffff',
    backgroundAlt: '#f8fafc',
    backgroundGradient: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
    cardBackground: 'rgba(255, 255, 255, 0.95)',
    borderLight: '#e5e7eb',
    borderMedium: '#d1d5db',
    shadow: '0 10px 25px rgba(59, 130, 246, 0.1)',
    shadowHover: '0 20px 40px rgba(59, 130, 246, 0.15)',
    glow: '0 0 20px rgba(59, 130, 246, 0.3)'
  }), []);

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

  const getInputStyle = (fieldName) => ({
    width: '100%',
    padding: '14px 16px',
    border: `2px solid ${errors[fieldName] ? theme.danger : theme.borderLight}`,
    borderRadius: '12px',
    fontSize: '15px',
    boxSizing: 'border-box',
    transition: 'all 0.3s ease',
    backgroundColor: theme.background,
    fontFamily: 'inherit',
    outline: 'none',
    boxShadow: errors[fieldName] ? `0 0 0 3px ${theme.danger}20` : 'none',
    ':focus': {
      borderColor: theme.primarySolid,
      boxShadow: theme.glow
    }
  });

  const buttonStyle = {
    padding: '16px 32px',
    borderRadius: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    border: 'none',
    marginRight: '12px',
    fontSize: '16px',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  };

  const requiredAsterisk = {
    color: theme.danger,
    marginLeft: '4px'
  };

  return (
    <>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }

          .form-section {
            animation: fadeIn 0.6s ease-out;
          }

          .form-section:nth-child(1) { animation-delay: 0.1s; }
          .form-section:nth-child(2) { animation-delay: 0.2s; }
          .form-section:nth-child(3) { animation-delay: 0.3s; }
          .form-section:nth-child(4) { animation-delay: 0.4s; }

          input:focus, select:focus, textarea:focus {
            border-color: ${theme.primarySolid} !important;
            box-shadow: ${theme.glow} !important;
          }

          button:hover:not(:disabled) {
            transform: translateY(-2px) !important;
            box-shadow: ${theme.shadowHover} !important;
          }

          .checkbox-item:hover {
            background-color: ${theme.backgroundAlt} !important;
            border-radius: 6px !important;
          }

          /* Mobile Responsiveness - Very Small Screens (320px and up) */
          @media (max-width: 320px) {
            .form-container {
              padding: '12px 8px' !important;
              margin: '8px' !important;
            }

            .form-section {
              padding: '12px 8px' !important;
              margin-bottom: '12px' !important;
              border-radius: '8px' !important;
            }

            .section-title {
              font-size: '1.1rem' !important;
              margin-bottom: '16px' !important;
            }

            .input-grid, .language-grid {
              grid-template-columns: 1fr !important;
              gap: '12px' !important;
            }

            .submit-button {
              width: '100%' !important;
              max-width: 'none' !important;
              padding: '12px 24px' !important;
              font-size: '14px' !important;
            }

            input, select, textarea {
              font-size: '14px' !important;
              padding: '12px 14px' !important;
            }

            label {
              font-size: '13px' !important;
            }
          }

          /* Small Mobile (321px - 480px) */
          @media (min-width: 321px) and (max-width: 480px) {
            .form-container {
              padding: '16px 12px' !important;
            }

            .form-section {
              padding: '16px 12px' !important;
              margin-bottom: '16px' !important;
            }

            .section-title {
              font-size: '1.25rem' !important;
            }

            .input-grid {
              grid-template-columns: 1fr !important;
            }

            .language-grid {
              grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)) !important;
            }

            .submit-button {
              width: '100%' !important;
              max-width: 'none' !important;
              padding: '14px 28px' !important;
            }

            input, select, textarea {
              font-size: '15px' !important;
              padding: '14px 16px' !important;
            }
          }

          /* Medium Mobile (481px - 640px) */
          @media (min-width: 481px) and (max-width: 640px) {
            .form-container {
              padding: '20px 16px' !important;
            }

            .form-section {
              padding: '20px 16px' !important;
              margin-bottom: '20px' !important;
            }

            .section-title {
              font-size: '1.4rem' !important;
            }

            .input-grid {
              grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)) !important;
            }

            .language-grid {
              grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)) !important;
            }

            .submit-button {
              width: '100%' !important;
              max-width: '320px' !important;
            }
          }

          /* Desktop and larger */
          @media (min-width: 641px) {
            .form-container {
              padding: '32px 24px' !important;
            }

            .form-section {
              padding: '28px 24px' !important;
              margin-bottom: '28px' !important;
            }

            .input-grid {
              grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)) !important;
            }

            .language-grid {
              grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)) !important;
            }

            .submit-button {
              max-width: '280px' !important;
            }
          }

          /* Responsive Text Sizing */
          @media (max-width: 320px) {
            .form-header {
              padding: '24px 16px' !important;
            }

            .main-title {
              font-size: '1.8rem' !important;
            }

            .main-subtitle {
              font-size: '0.9rem' !important;
            }

            .registration-title {
              font-size: '1.4rem' !important;
            }
          }

          @media (min-width: 321px) and (max-width: 480px) {
            .form-header {
              padding: '32px 24px' !important;
            }

            .main-title {
              font-size: '2.1rem' !important;
            }

            .main-subtitle {
              font-size: '1rem' !important;
            }

            .registration-title {
              font-size: '1.6rem' !important;
            }
          }

          @media (min-width: 481px) and (max-width: 640px) {
            .form-header {
              padding: '36px 28px' !important;
            }

            .main-title {
              font-size: '2.3rem' !important;
            }

            .main-subtitle {
              font-size: '1.05rem' !important;
            }

            .registration-title {
              font-size: '1.7rem' !important;
            }
          }

          /* Firework/Cracker Animations */
          @keyframes firework-explode {
            0% { transform: scale(0) rotate(0deg); opacity: 1; }
            50% { transform: scale(1.2) rotate(180deg); opacity: 0.8; }
            100% { transform: scale(0) rotate(360deg); opacity: 0; }
          }

          @keyframes confetti-fall {
            0% { transform: translateY(-100vh) rotate(0deg); opacity: 1; }
            100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
          }

          @keyframes sparkle {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.3); opacity: 0.7; }
          }

          @keyframes bounce-in {
            0% { transform: scale(0.3); opacity: 0; }
            50% { transform: scale(1.05); }
            70% { transform: scale(0.9); }
            100% { transform: scale(1); opacity: 1; }
          }

          .firework {
            position: absolute;
            width: 8px;
            height: 8px;
            border-radius: 50%;
            animation: firework-explode 2s ease-out infinite;
          }

          .firework:nth-child(1) { background: #ff6b6b; left: 20%; top: 20%; animation-delay: 0s; }
          .firework:nth-child(2) { background: #4ecdc4; left: 80%; top: 30%; animation-delay: 0.5s; }
          .firework:nth-child(3) { background: #45b7d1; left: 40%; top: 70%; animation-delay: 1s; }
          .firework:nth-child(4) { background: #f9ca24; left: 70%; top: 60%; animation-delay: 1.5s; }
          .firework:nth-child(5) { background: #f0932b; left: 10%; top: 50%; animation-delay: 2s; }
          .firework:nth-child(6) { background: #eb4d4b; left: 90%; top: 80%; animation-delay: 2.5s; }
          .firework:nth-child(7) { background: #6c5ce7; left: 60%; top: 10%; animation-delay: 3s; }
          .firework:nth-child(8) { background: #fd79a8; left: 30%; top: 90%; animation-delay: 3.5s; }

          .confetti {
            position: absolute;
            width: 6px;
            height: 12px;
            animation: confetti-fall 3s linear infinite;
          }

          .confetti:nth-child(odd) { background: linear-gradient(45deg, #ff6b6b, #ff8e53); }
          .confetti:nth-child(even) { background: linear-gradient(45deg, #4ecdc4, #44a08d); }

          .sparkle {
            position: absolute;
            width: 4px;
            height: 4px;
            background: #ffd700;
            border-radius: 50%;
            animation: sparkle 1.5s ease-in-out infinite;
          }

          .success-modal {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            backdrop-filter: blur(8px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            animation: fadeIn 0.5s ease-out;
          }

          .success-content {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 24px;
            padding: 40px;
            text-align: center;
            position: relative;
            overflow: hidden;
            max-width: 500px;
            width: 90%;
            box-shadow: 0 25px 50px rgba(0,0,0,0.3);
            animation: bounce-in 0.8s ease-out;
          }

          .success-content::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
            opacity: 0.1;
            pointer-events: none;
          }
        `}
      </style>
      <div style={{
        minHeight: '100vh',
        background: theme.backgroundGradient,
        padding: '16px 12px'
      }}>
      <div className="form-container" style={{
        maxWidth: '800px',
        margin: '0 auto',
        background: theme.cardBackground,
        backdropFilter: 'blur(20px)',
        borderRadius: '20px',
        boxShadow: theme.shadow,
        border: `1px solid ${theme.borderLight}`,
        overflow: 'hidden',
        position: 'relative'
      }}>
        {/* Header with gradient background */}
        <div className="form-header" style={{
          background: theme.primary,
          padding: '40px 32px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="4"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            opacity: 0.1
          }}></div>
          <h1 className="main-title" style={{
            fontSize: '2.5rem',
            fontWeight: '800',
            color: 'white',
            margin: '0 0 8px 0',
            textShadow: '0 2px 4px rgba(0,0,0,0.1)',
            position: 'relative',
            zIndex: 1
          }}>
            Exhibition Registration
          </h1>
          <p className="main-subtitle" style={{
            fontSize: '1.1rem',
            color: 'rgba(255,255,255,0.9)',
            margin: 0,
            fontWeight: '400',
            position: 'relative',
            zIndex: 1
          }}>
            Join us for an extraordinary experience
          </p>
        </div>

        <div style={{ padding: '32px 24px' }}>
          <h2 className="registration-title" style={{
            fontSize: '1.8rem',
            fontWeight: '700',
            color: theme.textPrimary,
            marginBottom: '32px',
            textAlign: 'center'
          }}>
            Registration Details
          </h2>


          {submitStatus === 'error' && (
            <div style={{
              padding: '24px',
              background: `linear-gradient(135deg, ${theme.danger}15 0%, #ef444420 100%)`,
              border: `2px solid ${theme.danger}`,
              borderRadius: '16px',
              marginBottom: '32px',
              textAlign: 'center',
              boxShadow: `0 8px 24px ${theme.danger}20`,
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'url("data:image/svg+xml,%3Csvg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="%23ef4444" fill-opacity="0.05"%3E%3Cpath d="M20 20c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10zm-10 0c0-3.3-2.7-6-6-6s-6 2.7-6 6 2.7 6 6 6 6-2.7 6-6z"/%3E%3C/g%3E%3C/svg%3E")',
                opacity: 0.1
              }}></div>
              <div style={{
                fontSize: '48px',
                marginBottom: '16px',
                position: 'relative',
                zIndex: 1
              }}>
                ❌
              </div>
              <div style={{
                fontWeight: '700',
                color: theme.danger,
                fontSize: '24px',
                marginBottom: '8px',
                position: 'relative',
                zIndex: 1
              }}>
                Submission Failed
              </div>
              <div style={{
                fontSize: '16px',
                color: theme.textSecondary,
                position: 'relative',
                zIndex: 1
              }}>
                {errors.submit || 'Please check your input and try again.'}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Personal Information Section */}
            <div className="form-section" style={{
              marginBottom: '28px',
              background: `linear-gradient(135deg, ${theme.backgroundAlt} 0%, rgba(255,255,255,0.8) 100%)`,
              borderRadius: '12px',
              padding: '20px',
              border: `1px solid ${theme.borderLight}`,
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
            }}>
              <h2 className="section-title" style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                margin: '0 0 20px 0',
                color: theme.textPrimary,
                paddingBottom: '12px',
                borderBottom: `2px solid ${theme.primarySolid}`
              }}>
                Personal Information
              </h2>
              <div className="input-grid" style={{ display: 'grid', gap: '16px' }}>
                <div style={formGroupStyle}>
                  <label style={labelStyle}>
                    Name <span style={requiredAsterisk}>*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    style={getInputStyle('name')}
                    required
                  />
                  {errors.name && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.name}</div>}
                </div>

                <div style={formGroupStyle}>
                  <label style={labelStyle}>Gender</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    style={getInputStyle('gender')}
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>

                <div style={formGroupStyle}>
                  <label style={labelStyle}>
                    Email <span style={requiredAsterisk}>*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    style={getInputStyle('email')}
                    required
                  />
                  {errors.email && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.email}</div>}
                </div>

                <div style={formGroupStyle}>
                  <label style={labelStyle}>Calling Number</label>
                  <PhoneInput
                    international
                    countryCallingCodeEditable={false}
                    value={formData.callingNumber}
                    onChange={(value) => handlePhoneChange('callingNumber', value)}
                    style={getInputStyle('callingNumber')}
                  />
                  {errors.callingNumber && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.callingNumber}</div>}
                </div>

                <div style={formGroupStyle}>
                  <label style={labelStyle}>WhatsApp Number</label>
                  <PhoneInput
                    international
                    countryCallingCodeEditable={false}
                    value={formData.whatsappNumber}
                    onChange={(value) => handlePhoneChange('whatsappNumber', value)}
                    style={getInputStyle('whatsappNumber')}
                  />
                  {errors.whatsappNumber && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.whatsappNumber}</div>}
                </div>

                <div style={formGroupStyle}>
                  <label style={labelStyle}>
                    Country of Residence <span style={requiredAsterisk}>*</span>
                  </label>
                  <input
                    type="text"
                    name="countryOfResidence"
                    value={formData.countryOfResidence}
                    onChange={handleInputChange}
                    list="countries"
                    style={getInputStyle('countryOfResidence')}
                    placeholder="Type to search country..."
                    required
                  />
                  <datalist id="countries">
                    {countries.map(country => (
                      <option key={country} value={country} />
                    ))}
                  </datalist>
                  {errors.countryOfResidence && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.countryOfResidence}</div>}
                </div>
              </div>
            </div>

            {/* Language Section */}
            <div className="form-section" style={{
              marginBottom: '28px',
              background: `linear-gradient(135deg, ${theme.backgroundAlt} 0%, rgba(255,255,255,0.8) 100%)`,
              borderRadius: '12px',
              padding: '20px',
              border: `1px solid ${theme.borderLight}`,
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
            }}>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                margin: '0 0 20px 0',
                color: theme.textPrimary,
                paddingBottom: '12px',
                borderBottom: `2px solid ${theme.secondarySolid}`
              }}>
                Language Preferences
              </h2>
              <div style={formGroupStyle}>
                <label style={labelStyle}>Languages (Select multiple)</label>
                <div style={{
                  maxHeight: '200px',
                  overflowY: 'auto',
                  border: `1px solid ${theme.borderLight}`,
                  borderRadius: '8px',
                  padding: '12px',
                  backgroundColor: theme.background
                }}>
                  <div className="language-grid" style={{ display: 'grid', gap: '8px' }}>
                    {languages.map(language => (
                      <label key={language} className="checkbox-item" style={{
                        display: 'flex',
                        alignItems: 'center',
                        fontSize: '14px',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        margin: '2px'
                      }}>
                        <input
                          type="checkbox"
                          checked={formData.languages.includes(language)}
                          onChange={(e) => handleMultiSelectChange('languages', language, e.target.checked)}
                          style={{ marginRight: '8px' }}
                        />
                        {language}
                      </label>
                    ))}
                  </div>
                </div>
                {formData.languages.length > 0 && (
                  <div style={{
                    marginTop: '12px',
                    padding: '8px',
                    backgroundColor: theme.primaryLight,
                    borderRadius: '6px',
                    fontSize: '13px',
                    color: theme.primaryDark
                  }}>
                    <strong>Selected Languages ({formData.languages.length}):</strong> {formData.languages.join(', ')}
                  </div>
                )}
              </div>
            </div>

            {/* Current Role Section */}
            <div className="form-section" style={{
              marginBottom: '28px',
              background: `linear-gradient(135deg, ${theme.backgroundAlt} 0%, rgba(255,255,255,0.8) 100%)`,
              borderRadius: '12px',
              padding: '20px',
              border: `1px solid ${theme.borderLight}`,
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
            }}>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                margin: '0 0 20px 0',
                color: theme.textPrimary,
                paddingBottom: '12px',
                borderBottom: `2px solid ${theme.accentSolid}`
              }}>
                Professional Information
              </h2>
              <div style={formGroupStyle}>
                <label style={labelStyle}>Current Role (Select multiple)</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '8px' }}>
                  {currentRoles.map(role => (
                    <label key={role} style={{ display: 'flex', alignItems: 'center', fontSize: '14px' }}>
                      <input
                        type="checkbox"
                        checked={formData.currentRoles.includes(role)}
                        onChange={(e) => handleMultiSelectChange('currentRoles', role, e.target.checked)}
                        style={{ marginRight: '8px' }}
                      />
                      {role}
                    </label>
                  ))}
                </div>
                {formData.currentRoles.length > 0 && (
                  <div style={{ marginTop: '8px', fontSize: '12px', color: theme.textSecondary }}>
                    Selected: {formData.currentRoles.join(', ')}
                  </div>
                )}
              </div>
            </div>

            {/* Interested In Section */}
            <div className="form-section" style={{
              marginBottom: '28px',
              background: `linear-gradient(135deg, ${theme.backgroundAlt} 0%, rgba(255,255,255,0.8) 100%)`,
              borderRadius: '12px',
              padding: '20px',
              border: `1px solid ${theme.borderLight}`,
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
            }}>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                margin: '0 0 20px 0',
                color: theme.textPrimary,
                paddingBottom: '12px',
                borderBottom: `2px solid ${theme.success}`
              }}>
                Areas of Interest
              </h2>
              <div style={formGroupStyle}>
                <label style={labelStyle}>You are interested in (Select multiple)</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '8px' }}>
                  {interestedInOptions.map(option => (
                    <label key={option} style={{ display: 'flex', alignItems: 'center', fontSize: '14px' }}>
                      <input
                        type="checkbox"
                        checked={formData.interestedIn.includes(option)}
                        onChange={(e) => handleMultiSelectChange('interestedIn', option, e.target.checked)}
                        style={{ marginRight: '8px' }}
                      />
                      {option}
                    </label>
                  ))}
                </div>
                {formData.interestedIn.length > 0 && (
                  <div style={{ marginTop: '8px', fontSize: '12px', color: theme.textSecondary }}>
                    Selected: {formData.interestedIn.join(', ')}
                  </div>
                )}
              </div>
            </div>

            {/* Terms and reCAPTCHA */}
            <div style={{ marginBottom: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                <input
                  type="checkbox"
                  name="termsAccepted"
                  id="terms"
                  checked={formData.termsAccepted}
                  onChange={handleInputChange}
                  style={{ marginRight: '8px' }}
                />
                <label htmlFor="terms" style={{ fontSize: '14px', color: '#212121' }}>
                  I accept the <a href="/terms-and-conditions" target="_blank" rel="noopener noreferrer" style={{ color: theme.primary }}>Terms and Conditions</a> <span style={requiredAsterisk}>*</span>
                </label>
              </div>
              {errors.termsAccepted && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.termsAccepted}</div>}

              {/* reCAPTCHA */}
              <div style={{ marginTop: '24px' }}>
                <div
                  id="recaptcha-container-exhibition"
                  style={{ display: 'inline-block' }}
                ></div>
                {errors.recaptcha && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.recaptcha}</div>}
                <div style={{ fontSize: '12px', color: theme.textSecondary, marginTop: '8px' }}>
                  Complete the reCAPTCHA verification to submit your form.
                </div>
              </div>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'center',
              marginTop: '48px',
              paddingTop: '32px',
              borderTop: `1px solid ${theme.borderLight}`
            }}>
              <button
                type="submit"
                className="submit-button"
                style={{
                  ...buttonStyle,
                  background: theme.primary,
                  color: '#fff',
                  border: 'none',
                  position: 'relative',
                  overflow: 'hidden',
                  ':hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: theme.shadowHover
                  },
                  ':disabled': {
                    opacity: 0.6,
                    cursor: 'not-allowed',
                    transform: 'none'
                  }
                }}
                disabled={loading}
              >
                <span style={{
                  position: 'relative',
                  zIndex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}>
                  {loading ? (
                    <>
                      <div style={{
                        width: '20px',
                        height: '20px',
                        border: '2px solid rgba(255,255,255,0.3)',
                        borderTop: '2px solid white',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }}></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      🚀 Submit Registration
                    </>
                  )}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Success Modal with Fireworks */}
      {showSuccessModal && (
        <div className="success-modal" onClick={() => setShowSuccessModal(false)}>
          <div className="success-content" onClick={(e) => e.stopPropagation()}>
            {/* Firework Effects */}
            <div className="firework"></div>
            <div className="firework"></div>
            <div className="firework"></div>
            <div className="firework"></div>
            <div className="firework"></div>
            <div className="firework"></div>
            <div className="firework"></div>
            <div className="firework"></div>

            {/* Confetti */}
            {Array.from({ length: 20 }, (_, i) => (
              <div
                key={i}
                className="confetti"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${2 + Math.random() * 2}s`
                }}
              ></div>
            ))}

            {/* Sparkles */}
            {Array.from({ length: 15 }, (_, i) => (
              <div
                key={i}
                className="sparkle"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`
                }}
              ></div>
            ))}

            {/* Close Button */}
            <button
              onClick={() => setShowSuccessModal(false)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'white',
                fontSize: '20px',
                backdropFilter: 'blur(10px)'
              }}
            >
              ×
            </button>

            {/* Success Content */}
            <div style={{ position: 'relative', zIndex: 2 }}>
              <div style={{
                fontSize: '80px',
                marginBottom: '20px',
                animation: 'bounce-in 1s ease-out 0.5s both'
              }}>
                🎉
              </div>

              <h2 style={{
                fontSize: '2.5rem',
                fontWeight: '800',
                color: 'white',
                margin: '0 0 16px 0',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                animation: 'fadeIn 1s ease-out 0.7s both'
              }}>
                Congratulations! 🎊
              </h2>

              <p style={{
                fontSize: '1.3rem',
                color: 'rgba(255,255,255,0.95)',
                margin: '0 0 24px 0',
                fontWeight: '500',
                lineHeight: '1.6',
                animation: 'fadeIn 1s ease-out 0.9s both'
              }}>
                Your exhibition registration has been successfully submitted!
                <br />
                <strong>Thank you for your precious time! 🌟</strong>
              </p>

              <div style={{
                background: 'rgba(255,255,255,0.15)',
                borderRadius: '16px',
                padding: '20px',
                marginBottom: '24px',
                backdropFilter: 'blur(10px)',
                animation: 'fadeIn 1s ease-out 1.1s both'
              }}>
                <p style={{
                  margin: '0',
                  fontSize: '1.1rem',
                  color: 'white',
                  fontWeight: '600'
                }}>
                  ✨ We'll be in touch with you soon with all the exciting details! ✨
                </p>
              </div>

              <button
                onClick={() => setShowSuccessModal(false)}
                style={{
                  background: 'linear-gradient(135deg, #ff6b6b 0%, #ffa500 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '14px 32px',
                  fontSize: '16px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  boxShadow: '0 8px 24px rgba(255,107,107,0.3)',
                  transition: 'all 0.3s ease',
                  animation: 'fadeIn 1s ease-out 1.3s both'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 12px 32px rgba(255,107,107,0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 8px 24px rgba(255,107,107,0.3)';
                }}
              >
                🎊 Continue Exploring
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
};

export default React.memo(ExhibitionFormPage);