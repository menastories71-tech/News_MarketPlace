import React, { useState, useEffect } from 'react';
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

  // Language list
  const languages = [
    "English", "Spanish", "French", "German", "Italian", "Portuguese", "Russian", "Chinese", "Japanese", "Korean",
    "Arabic", "Hindi", "Bengali", "Urdu", "Turkish", "Persian", "Hebrew", "Thai", "Vietnamese", "Indonesian",
    "Malay", "Swahili", "Hausa", "Yoruba", "Amharic", "Somali", "Tigrinya", "Oromo", "Afrikaans", "Zulu",
    "Xhosa", "Sesotho", "Tswana", "Shona", "Ndebele", "Chewa", "Tumbuka", "Luganda", "Kinyarwanda", "Kirundi",
    "Kiswahili", "Lingala", "Kongo", "Tshiluba", "Chichewa", "Sena", "Tonga", "Tsonga", "Venda", "Pedi",
    "Sotho", "Tswana", "Xhosa", "Zulu", "Afrikaans", "Dutch", "Flemish", "Luxembourgish", "Alsatian", "Breton",
    "Catalan", "Galician", "Basque", "Aragonese", "Asturian", "Leonese", "Mirandese", "Extremaduran", "Fala",
    "Ladin", "Friulian", "Romansh", "Ladin", "Friulian", "Romansh", "Sardinian", "Corsican", "Sicilian",
    "Neapolitan", "Ligurian", "Piedmontese", "Venetian", "Emilian-Romagnol", "Lombard", "Tuscan", "Umbrian",
    "Marchegian", "Roman", "Abruzzese", "Molise", "Apulian", "Lucanian", "Calabrian", "Salentino", "Sicilian",
    "Sardinian", "Corsican", "Ligurian", "Piedmontese", "Venetian", "Emilian-Romagnol", "Lombard", "Tuscan",
    "Umbrian", "Marchegian", "Roman", "Abruzzese", "Molise", "Apulian", "Lucanian", "Calabrian", "Salentino"
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

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handlePhoneChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleMultiSelectChange = (name, value, checked) => {
    setFormData(prev => ({
      ...prev,
      [name]: checked
        ? [...prev[name], value]
        : prev[name].filter(item => item !== value)
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
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

    setLoading(true);
    setSubmitStatus(null);

    try {
      // Prepare data for Firebase
      const submitData = {
        ...formData,
        submittedAt: new Date(),
        recaptchaToken
      };

      // Add to Firebase Firestore
      const docRef = await addDoc(collection(db, 'exhibition_forms'), submitData);

      console.log('Document written with ID: ', docRef.id);
      setSubmitStatus('success');

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

    } catch (error) {
      console.error('Error adding document: ', error);
      setSubmitStatus('error');
      setErrors(prev => ({ ...prev, submit: 'Failed to submit form. Please try again.' }));
    } finally {
      setLoading(false);
    }
  };

  const theme = {
    primary: '#1976D2',
    primaryDark: '#0D47A1',
    primaryLight: '#E3F2FD',
    secondary: '#00796B',
    secondaryDark: '#004D40',
    secondaryLight: '#E0F2F1',
    success: '#4CAF50',
    warning: '#FF9800',
    danger: '#F44336',
    textPrimary: '#212121',
    textSecondary: '#757575',
    textDisabled: '#BDBDBD',
    background: '#FFFFFF',
    backgroundAlt: '#FAFAFA',
    backgroundSoft: '#F5F5F5',
    borderLight: '#E0E0E0',
    borderMedium: '#BDBDBD',
    borderDark: '#757575'
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

  const getInputStyle = (fieldName) => ({
    width: '100%',
    padding: '10px 12px',
    border: `1px solid ${errors[fieldName] ? theme.danger : '#d1d5db'}`,
    borderRadius: '8px',
    fontSize: '14px',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s'
  });

  const buttonStyle = {
    padding: '10px 20px',
    borderRadius: '8px',
    fontWeight: '600',
    cursor: 'pointer',
    border: 'none',
    marginRight: '12px'
  };

  const requiredAsterisk = {
    color: theme.danger,
    marginLeft: '4px'
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-center mb-8">Exhibition Registration Form</h1>

          {submitStatus === 'success' && (
            <div style={{
              padding: '16px',
              backgroundColor: '#e8f5e8',
              border: `1px solid ${theme.success}`,
              borderRadius: '8px',
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              <div style={{ fontWeight: '600', color: theme.success, fontSize: '18px' }}>
                Form Submitted Successfully!
              </div>
              <div style={{ fontSize: '14px', color: theme.textSecondary, marginTop: '8px' }}>
                Thank you for your registration. We will contact you soon.
              </div>
            </div>
          )}

          {submitStatus === 'error' && (
            <div style={{
              padding: '16px',
              backgroundColor: '#ffebee',
              border: `1px solid ${theme.danger}`,
              borderRadius: '8px',
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              <div style={{ fontWeight: '600', color: theme.danger }}>Submission Failed</div>
              <div style={{ fontSize: '14px', color: theme.textSecondary }}>
                {errors.submit || 'Please check your input and try again.'}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Personal Information Section */}
            <div style={{ marginBottom: '32px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '16px', color: theme.textPrimary }}>
                Personal Information
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 768 ? '1fr' : 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
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
            <div style={{ marginBottom: '32px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '16px', color: theme.textPrimary }}>
                Language Preferences
              </h2>
              <div style={formGroupStyle}>
                <label style={labelStyle}>Languages (Select multiple)</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
                  {languages.slice(0, 20).map(language => (
                    <label key={language} style={{ display: 'flex', alignItems: 'center', fontSize: '14px' }}>
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
                {formData.languages.length > 0 && (
                  <div style={{ marginTop: '8px', fontSize: '12px', color: theme.textSecondary }}>
                    Selected: {formData.languages.join(', ')}
                  </div>
                )}
              </div>
            </div>

            {/* Current Role Section */}
            <div style={{ marginBottom: '32px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '16px', color: theme.textPrimary }}>
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
            <div style={{ marginBottom: '32px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '16px', color: theme.textPrimary }}>
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

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '32px' }}>
              <button
                type="submit"
                style={{ ...buttonStyle, backgroundColor: '#1976D2', color: '#fff', width: '100%', maxWidth: '200px' }}
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ExhibitionFormPage;