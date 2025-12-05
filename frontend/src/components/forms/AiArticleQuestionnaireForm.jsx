import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../common/Icon';

const AiArticleQuestionnaireForm = () => {
  const navigate = useNavigate();

  // Tab state
  const [activeTab, setActiveTab] = useState('questionnaire'); // 'questionnaire' or 'my-submissions'

  const [formData, setFormData] = useState({
    // Story type
    storyType: '',

    // Part 1 - About You / Your Brand
    part1: {
      name: '',
      preferredTitle: '',
      background: '',
      inspiration: '',
      challenges: '',
      uniquePerspective: '',
      highlights: '',
      anecdotes: '',
      futureVision: '',
      additionalInfo: ''
    },

    // Part 2 - Article Guidelines
    part2: {
      goal: '',
      targetAudience: '',
      message: '',
      points: '',
      seoKeywords: '',
      tone: '',
      socialLinks: '',
      references: '',
      titles: '',
      exclusions: ''
    },

    // SEO section
    seo: {
      keywords: '',
      geoLocation: '',
      personName: '',
      companyName: ''
    },

    // File upload
    documents: null,

    // Publication
    publicationId: ''
  });

  const [publications, setPublications] = useState([]);
  const [publicationsLoading, setPublicationsLoading] = useState(true);
  const [publicationsError, setPublicationsError] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [rateLimitInfo, setRateLimitInfo] = useState(null);
  const [countdown, setCountdown] = useState(0);

  // My submissions state
  const [mySubmissions, setMySubmissions] = useState([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);

  // Fetch publications on component mount
  useEffect(() => {
    const fetchPublications = async () => {
      setPublicationsLoading(true);
      setPublicationsError('');

      try {
        const response = await fetch('/api/publications', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setPublications(data.publications || []);
        } else {
          setPublicationsError('Failed to load publications. Please try refreshing the page.');
        }
      } catch (error) {
        console.error('Error fetching publications:', error);
        setPublicationsError('Network error while loading publications. Please check your connection.');
      } finally {
        setPublicationsLoading(false);
      }
    };

    fetchPublications();
  }, []);

  const fetchMySubmissions = async () => {
    try {
      setSubmissionsLoading(true);
      const response = await fetch('/api/ai-generated-articles/my', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setMySubmissions(data.articles || []);
      } else {
        console.error('Failed to fetch my submissions');
        setMySubmissions([]);
      }
    } catch (error) {
      console.error('Error fetching my submissions:', error);
      setMySubmissions([]);
    } finally {
      setSubmissionsLoading(false);
    }
  };

  // Fetch submissions when my-submissions tab is active
  useEffect(() => {
    if (activeTab === 'my-submissions') {
      fetchMySubmissions();
    }
  }, [activeTab]);

  // Countdown timer for rate limit
  useEffect(() => {
    let interval;
    if (countdown > 0) {
      interval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            setRateLimitInfo(null);
            setMessage('');
            return 0;
          }
          return prev - 1;
        });
      }, 60000); // Update every minute
    }
    return () => clearInterval(interval);
  }, [countdown]);

  const handleInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: typeof prev[section] === 'object' ? {
        ...prev[section],
        [field]: value
      } : value
    }));

    // Clear error for this field
    if (errors[`${section}.${field}`]) {
      setErrors(prev => ({
        ...prev,
        [`${section}.${field}`]: ''
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData(prev => ({
      ...prev,
      documents: file
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields
    if (!formData.storyType) {
      newErrors.storyType = 'Please select a story type';
    }

    // Part 1 required fields (marked as required in the questionnaire)
    if (!formData.part1.name.trim()) {
      newErrors['part1.name'] = 'This field is required';
    }

    if (!formData.part1.background.trim()) {
      newErrors['part1.background'] = 'This field is required';
    }

    if (!formData.part1.inspiration.trim()) {
      newErrors['part1.inspiration'] = 'This field is required';
    }

    if (!formData.part1.challenges.trim()) {
      newErrors['part1.challenges'] = 'This field is required';
    }

    if (!formData.part1.uniquePerspective.trim()) {
      newErrors['part1.uniquePerspective'] = 'This field is required';
    }

    if (!formData.part1.highlights.trim()) {
      newErrors['part1.highlights'] = 'This field is required';
    }

    if (!formData.part1.futureVision.trim()) {
      newErrors['part1.futureVision'] = 'This field is required';
    }

    // Part 2 required fields
    if (!formData.part2.goal.trim()) {
      newErrors['part2.goal'] = 'This field is required';
    }

    if (!formData.part2.targetAudience.trim()) {
      newErrors['part2.targetAudience'] = 'This field is required';
    }

    if (!formData.part2.message.trim()) {
      newErrors['part2.message'] = 'This field is required';
    }

    if (!formData.part2.points.trim()) {
      newErrors['part2.points'] = 'This field is required';
    }

    if (!formData.part2.seoKeywords.trim()) {
      newErrors['part2.seoKeywords'] = 'This field is required';
    }

    if (!formData.publicationId) {
      newErrors.publicationId = 'Please select a publication';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setMessage('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const submitData = new FormData();

      // Add all form data
      submitData.append('storyType', formData.storyType);
      submitData.append('part1', JSON.stringify(formData.part1));
      submitData.append('part2', JSON.stringify(formData.part2));
      submitData.append('seo', JSON.stringify(formData.seo));
      submitData.append('publicationId', formData.publicationId);

      if (formData.documents) {
        submitData.append('uploaded_file', formData.documents);
      }

      const response = await fetch('/api/ai-generated-articles', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: submitData
      });

      let responseData;
      try {
        responseData = await response.json();
      } catch (parseError) {
        console.error('Error parsing response:', parseError);
        responseData = null;
      }

      if (response.ok) {
        setMessage('Questionnaire submitted successfully! Redirecting to article generation...');
        // Redirect to article generation page
        setTimeout(() => {
          navigate(`/ai-article-generation/${responseData.article.id}`);
        }, 2000);
      } else {
        // Handle rate limiting
        if (response.status === 429 && responseData?.tokenReset) {
          setRateLimitInfo({
            message: responseData.message,
            remainingMinutes: responseData.remainingMinutes
          });
          setCountdown(responseData.remainingMinutes);
          setMessage('');
          return;
        }

        const errorMessage = responseData?.message || responseData?.error || `Submission failed with status ${response.status}. Please try again.`;
        setMessage(errorMessage);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setMessage('Network error occurred. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const storyTypes = [
    { value: 'profile', label: 'Profile Article' },
    { value: 'editorial', label: 'Editorial feature PR' },
    { value: 'advertorial', label: 'Advertorial / Brand Voice' },
    { value: 'listicle', label: 'Listicle' }
  ];

  const part1Questions = [
    { key: 'name', label: 'What is the name of the person(s) and/or brand these articles are for?', required: true },
    { key: 'preferredTitle', label: 'Do you have a preferred title (producer, rapper, influencer, etc.) that you\'d like us to use?' },
    { key: 'background', label: 'What is your personal background and experience related to this article?', required: true },
    { key: 'inspiration', label: 'What inspired you to start your business or become involved in this industry?', required: true },
    { key: 'challenges', label: 'What challenges or obstacles have you faced in your career or business, and how have you overcome them?', required: true },
    { key: 'uniquePerspective', label: 'What sets you apart from others in your industry, and what unique perspective do you bring to this article?', required: true },
    { key: 'highlights', label: 'What are some notable career highlights? (Awards, recognition, accomplishments, etc.)', required: true },
    { key: 'anecdotes', label: 'Do you have any personal anecdotes or stories that you would like to include in this article?' },
    { key: 'futureVision', label: 'Where do you see yourself/your brand in a few years? What are some of your dreams and aspirations?', required: true },
    { key: 'additionalInfo', label: 'Is there anything else that you think the writer should know in order to create an effective and successful article?' }
  ];

  const part2Questions = [
    { key: 'goal', label: 'What is the main goal of this article? (e.g. to increase brand awareness, to drive traffic to a website, to generate leads)', required: true },
    { key: 'targetAudience', label: 'Who is the target audience for this content piece? (e.g. age range, location, interests, job titles, industry beginners, enthusiasts)', required: true },
    { key: 'message', label: 'What is the main message or theme you want in this article?', required: true },
    { key: 'points', label: 'What specific points or information do you want to include in this article?', required: true },
    { key: 'seoKeywords', label: 'Are there any specific SEO keywords or phrases that you want to focus on in this article?', required: true },
    { key: 'tone', label: 'Are there any specific tone or style guidelines that you want the writer to follow? (if yes, please provide details)' },
    { key: 'socialLinks', label: 'Please provide direct links to all social media accounts (if any) you want to be included in the articles.' },
    { key: 'references', label: 'Are there any existing content pieces (e.g. blog posts, articles) that you want the writer to reference or link to in this article?' },
    { key: 'titles', label: 'Provide 2 to 3 potential title ideas if you\'d like.' },
    { key: 'exclusions', label: 'Is there information you do NOT want to be included in the article? (if yes, please provide details)' }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-lg">
      {/* Tab Navigation */}
      <div className="mb-8">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('questionnaire')}
            className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'questionnaire'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            AI Article Questionnaire
          </button>
          <button
            onClick={() => setActiveTab('my-submissions')}
            className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'my-submissions'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            My AI Submissions
          </button>
        </div>
      </div>

      {activeTab === 'questionnaire' && (
        <>
          {message && (
            <div className={`mb-6 p-4 rounded-lg ${message.includes('success') ? 'bg-green-50 border-l-4 border-green-400' : 'bg-red-50 border-l-4 border-red-400'}`}>
              <p className={`text-sm ${message.includes('success') ? 'text-green-800' : 'text-red-800'}`}>{message}</p>
            </div>
          )}

      {rateLimitInfo && (
        <div className="mb-6 p-4 rounded-lg bg-orange-50 border-l-4 border-orange-400">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-orange-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-orange-800 font-medium">AI Tokens Exhausted</p>
            </div>
            <div className="text-sm text-orange-700 font-mono">
              {countdown} min remaining
            </div>
          </div>
          <p className="text-sm text-orange-700 mt-2">{rateLimitInfo.message}</p>
          <div className="mt-3 bg-orange-100 rounded-lg p-3">
            <div className="flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-800">{countdown}</div>
                <div className="text-xs text-orange-600">minutes until reset</div>
              </div>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Story Type Section */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 font-['Inter']">Article Format</h2>
          <p className="text-sm text-gray-600 mb-4 font-['Open_Sans']">Please choose from one of the options below:</p>
          <div className="space-y-3">
            {storyTypes.map((type) => (
              <label key={type.value} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="storyType"
                  value={type.value}
                  checked={formData.storyType === type.value}
                  onChange={(e) => handleInputChange('storyType', null, e.target.value)}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="text-gray-900 font-['Open_Sans']">{type.label}</span>
              </label>
            ))}
          </div>
          {errors.storyType && <p className="text-red-600 text-sm mt-2">{errors.storyType}</p>}
        </div>

        {/* Part 1 Section */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 font-['Inter']">Part 1 - About You / Your Brand</h2>
          <div className="space-y-6">
            {part1Questions.map((question, index) => (
              <div key={question.key}>
                <label className="block text-sm font-medium text-gray-900 mb-2 font-['Inter']">
                  {index + 1}. {question.label}
                  {question.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                <textarea
                  value={formData.part1[question.key]}
                  onChange={(e) => handleInputChange('part1', question.key, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white text-gray-900 placeholder-gray-500 transition-all duration-200 font-['Open_Sans'] min-h-[100px] resize-vertical"
                  placeholder="Enter your response here..."
                />
                {errors[`part1.${question.key}`] && <p className="text-red-600 text-sm mt-1">{errors[`part1.${question.key}`]}</p>}
              </div>
            ))}
          </div>
        </div>

        {/* Part 2 Section */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 font-['Inter']">Part 2 - Article Guidelines</h2>
          <div className="space-y-6">
            {part2Questions.map((question, index) => (
              <div key={question.key}>
                <label className="block text-sm font-medium text-gray-900 mb-2 font-['Inter']">
                  {index + 1}. {question.label}
                  {question.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                <textarea
                  value={formData.part2[question.key]}
                  onChange={(e) => handleInputChange('part2', question.key, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white text-gray-900 placeholder-gray-500 transition-all duration-200 font-['Open_Sans'] min-h-[100px] resize-vertical"
                  placeholder="Enter your response here..."
                />
                {errors[`part2.${question.key}`] && <p className="text-red-600 text-sm mt-1">{errors[`part2.${question.key}`]}</p>}
              </div>
            ))}
          </div>
        </div>

        {/* SEO Section */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 font-['Inter']">SEO Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2 font-['Inter']">
                Keywords
              </label>
              <input
                type="text"
                value={formData.seo.keywords}
                onChange={(e) => handleInputChange('seo', 'keywords', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white text-gray-900 placeholder-gray-500 transition-all duration-200 font-['Open_Sans']"
                placeholder="Enter SEO keywords"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2 font-['Inter']">
                Geo Location
              </label>
              <input
                type="text"
                value={formData.seo.geoLocation}
                onChange={(e) => handleInputChange('seo', 'geoLocation', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white text-gray-900 placeholder-gray-500 transition-all duration-200 font-['Open_Sans']"
                placeholder="Enter geo location"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2 font-['Inter']">
                Person Name
              </label>
              <input
                type="text"
                value={formData.seo.personName}
                onChange={(e) => handleInputChange('seo', 'personName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white text-gray-900 placeholder-gray-500 transition-all duration-200 font-['Open_Sans']"
                placeholder="Enter person name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2 font-['Inter']">
                Company Name
              </label>
              <input
                type="text"
                value={formData.seo.companyName}
                onChange={(e) => handleInputChange('seo', 'companyName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white text-gray-900 placeholder-gray-500 transition-all duration-200 font-['Open_Sans']"
                placeholder="Enter company name"
              />
            </div>
          </div>
        </div>

        {/* File Upload Section */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 font-['Inter']">Document Upload (Optional)</h2>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2 font-['Inter']">
              Upload supporting documents
            </label>
            <input
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white text-gray-900 transition-all duration-200 font-['Open_Sans']"
            />
            <p className="text-xs text-gray-500 mt-1">Accepted formats: PDF, DOC, DOCX, TXT, JPG, PNG</p>
          </div>
        </div>

        {/* Publication Selection */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 font-['Inter']">Publication Selection</h2>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2 font-['Inter']">
              Select Publication <span className="text-red-500">*</span>
            </label>
            {publicationsLoading ? (
              <div className="flex items-center space-x-2">
                <Icon name="arrow-path" size="sm" className="animate-spin" />
                <span className="text-sm text-gray-600">Loading publications...</span>
              </div>
            ) : publicationsError ? (
              <p className="text-red-600 text-sm">{publicationsError}</p>
            ) : (
              <select
                value={formData.publicationId}
                onChange={(e) => handleInputChange('publicationId', null, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white text-gray-900 transition-all duration-200 font-['Open_Sans']"
              >
                <option value="">Select a publication...</option>
                {publications.map((pub) => (
                  <option key={pub.id} value={pub.id}>
                    {pub.publication_name}
                  </option>
                ))}
              </select>
            )}
            {errors.publicationId && <p className="text-red-600 text-sm mt-1">{errors.publicationId}</p>}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading || rateLimitInfo !== null}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none font-['Inter'] text-sm"
          >
            {rateLimitInfo ? (
              'Tokens Exhausted - Wait for Reset'
            ) : loading ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              </div>
            ) : (
              'Submit Questionnaire'
            )}
          </button>
        </div>
      </form>
        </>
      )}

      {activeTab === 'my-submissions' && (
        <div>
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-4" style={{ color: '#212121' }}>
              My AI Submissions
            </h1>
            <p style={{ color: '#757575' }}>
              View all your AI-generated article submissions and their status
            </p>
          </div>

          {submissionsLoading ? (
            <div className="flex items-center justify-center py-12">
              <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span style={{ color: '#757575' }}>Loading submissions...</span>
            </div>
          ) : mySubmissions.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto mb-4 h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-lg font-medium mb-2" style={{ color: '#212121' }}>No AI submissions yet</h3>
              <p style={{ color: '#757575' }}>You haven't submitted any AI-generated articles yet.</p>
              <button
                onClick={() => setActiveTab('questionnaire')}
                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Your First AI Article
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {mySubmissions.map((submission) => (
                <div key={submission.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-2" style={{ color: '#212121' }}>
                        {submission.name || 'AI Generated Article'}
                      </h3>
                      <p className="text-sm mb-2" style={{ color: '#757575' }}>
                        Story Type: <span className="font-medium capitalize">{submission.story_type}</span>
                      </p>
                      <p className="text-sm mb-2" style={{ color: '#757575' }}>
                        Publication: <span className="font-medium">{submission.publication?.publication_name || 'N/A'}</span>
                      </p>
                      <p className="text-sm" style={{ color: '#757575' }}>
                        Submitted on: {new Date(submission.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="ml-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          submission.status === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : submission.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : submission.status === 'draft'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                      </span>
                    </div>
                  </div>

                  {submission.generated_content && (
                    <div className="mt-4">
                      <p className="text-sm line-clamp-3" style={{ color: '#757575' }}>
                        {submission.generated_content.substring(0, 200)}...
                      </p>
                    </div>
                  )}

                  {submission.status === 'approved' && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <a
                        href={`/ai-article/${submission.id}`}
                        className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        View Article
                      </a>
                    </div>
                  )}

                  {submission.status === 'draft' && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <a
                        href={`/ai-article-generation/${submission.id}`}
                        className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Continue Generation
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AiArticleQuestionnaireForm;