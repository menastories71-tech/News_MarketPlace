// Cookie management utilities for tracking and managing user cookies

/**
 * Set a cookie with specified options
 * @param {string} name - Cookie name
 * @param {string} value - Cookie value
 * @param {Object} options - Cookie options
 */
export const setCookie = (name, value, options = {}) => {
  const defaultOptions = {
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Lax',
    ...options
  };

  let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

  if (defaultOptions.maxAge) {
    cookieString += `; max-age=${defaultOptions.maxAge}`;
  }

  if (defaultOptions.expires) {
    cookieString += `; expires=${defaultOptions.expires.toUTCString()}`;
  }

  if (defaultOptions.path) {
    cookieString += `; path=${defaultOptions.path}`;
  }

  if (defaultOptions.domain) {
    cookieString += `; domain=${defaultOptions.domain}`;
  }

  if (defaultOptions.secure) {
    cookieString += '; secure';
  }

  if (defaultOptions.sameSite) {
    cookieString += `; samesite=${defaultOptions.sameSite}`;
  }

  document.cookie = cookieString;
};

/**
 * Get a cookie value by name
 * @param {string} name - Cookie name
 * @returns {string|null} Cookie value or null if not found
 */
export const getCookie = (name) => {
  const nameEQ = encodeURIComponent(name) + '=';
  const cookies = document.cookie.split(';');

  for (let cookie of cookies) {
    cookie = cookie.trim();
    if (cookie.indexOf(nameEQ) === 0) {
      return decodeURIComponent(cookie.substring(nameEQ.length));
    }
  }

  return null;
};

/**
 * Delete a cookie by name
 * @param {string} name - Cookie name
 * @param {Object} options - Cookie options for deletion
 */
export const deleteCookie = (name, options = {}) => {
  setCookie(name, '', {
    ...options,
    maxAge: -1,
    expires: new Date(0)
  });
};

/**
 * Get all cookies as an object
 * @returns {Object} Object containing all cookie key-value pairs
 */
export const getAllCookies = () => {
  const cookies = {};
  const cookieArray = document.cookie.split(';');

  cookieArray.forEach(cookie => {
    const [name, value] = cookie.trim().split('=');
    if (name && value) {
      cookies[decodeURIComponent(name)] = decodeURIComponent(value);
    }
  });

  return cookies;
};

/**
 * Check if a specific cookie type is consented to
 * @param {string} type - Cookie type ('necessary', 'analytics', 'marketing')
 * @returns {boolean} Whether the cookie type is allowed
 */
export const hasCookieConsent = (type) => {
  const consent = localStorage.getItem('cookieConsent');
  if (!consent) return false;

  try {
    const preferences = JSON.parse(consent);
    return preferences[type] === true;
  } catch (error) {
    console.error('Error parsing cookie consent:', error);
    return false;
  }
};

/**
 * Get user's cookie preferences
 * @returns {Object|null} Cookie preferences object or null if not set
 */
export const getCookiePreferences = () => {
  const consent = localStorage.getItem('cookieConsent');
  if (!consent) return null;

  try {
    return JSON.parse(consent);
  } catch (error) {
    console.error('Error parsing cookie consent:', error);
    return null;
  }
};

/**
 * Track user activity for analytics (only if consented)
 * @param {string} event - Event name
 * @param {Object} data - Event data
 */
export const trackUserActivity = (event, data = {}) => {
  if (!hasCookieConsent('analytics')) return;

  // Generate unique user ID if not exists
  let userId = getCookie('user_id');
  if (!userId) {
    userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    setCookie('user_id', userId, { maxAge: 31536000 }); // 1 year
  }

  // Track page views and events
  const trackingData = {
    userId,
    event,
    timestamp: new Date().toISOString(),
    url: window.location.href,
    userAgent: navigator.userAgent,
    ...data
  };

  // Store in session storage for batch sending
  const existingTracks = JSON.parse(sessionStorage.getItem('user_tracks') || '[]');
  existingTracks.push(trackingData);
  sessionStorage.setItem('user_tracks', JSON.stringify(existingTracks));

  // In a real implementation, you would send this to your analytics service
  console.log('Tracking user activity:', trackingData);
};

/**
 * Initialize tracking when user consents to analytics
 */
export const initializeAnalytics = () => {
  if (!hasCookieConsent('analytics')) return;

  // Set session start time
  const sessionStart = new Date().toISOString();
  setCookie('session_start', sessionStart, { maxAge: 1800 }); // 30 minutes

  // Track page view
  trackUserActivity('page_view', {
    page: window.location.pathname,
    referrer: document.referrer
  });

  // Track time spent on page
  let startTime = Date.now();
  const trackTimeSpent = () => {
    const timeSpent = Math.round((Date.now() - startTime) / 1000);
    trackUserActivity('time_spent', { duration: timeSpent });
  };

  // Track on page unload
  window.addEventListener('beforeunload', trackTimeSpent);

  // Track on visibility change
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      trackTimeSpent();
    } else {
      startTime = Date.now(); // Reset timer when user returns
    }
  });
};

/**
 * Initialize marketing tracking when user consents
 */
export const initializeMarketing = () => {
  if (!hasCookieConsent('marketing')) return;

  // Set marketing consent timestamp
  const marketingConsentTime = new Date().toISOString();
  setCookie('marketing_consent_time', marketingConsentTime, { maxAge: 31536000 });

  // In a real implementation, you would initialize marketing pixels, retargeting, etc.
  console.log('Marketing tracking initialized');
};

/**
 * Generate a comprehensive cookie report for the user
 * @returns {Object} Cookie report data
 */
export const generateCookieReport = () => {
  const allCookies = getAllCookies();
  const preferences = getCookiePreferences();
  const userId = getCookie('user_id');

  return {
    userId,
    preferences,
    cookies: allCookies,
    consentGiven: !!preferences,
    consentTimestamp: preferences?.timestamp,
    sessionStart: getCookie('session_start'),
    marketingConsentTime: getCookie('marketing_consent_time'),
    generatedAt: new Date().toISOString()
  };
};

/**
 * Clear all tracking cookies (for GDPR compliance)
 */
export const clearTrackingCookies = () => {
  const trackingCookies = [
    'user_id',
    'session_start',
    'marketing_consent_time',
    'analytics_consent',
    'marketing_consent'
  ];

  trackingCookies.forEach(cookieName => {
    deleteCookie(cookieName);
  });

  // Clear session storage tracking data
  sessionStorage.removeItem('user_tracks');

  // Clear localStorage consent
  localStorage.removeItem('cookieConsent');
};