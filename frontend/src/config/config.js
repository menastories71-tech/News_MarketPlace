const config = {
  recaptcha: {
    siteKey: import.meta.env?.VITE_RECAPTCHA_SITE_KEY || '6LdNzrErAAAAAB1EB7ETPEhUrynf0wSQftMt-COT',
  },
  api: {
    baseUrl: process.env?.REACT_APP_API_BASE_URL || '/api',
  },
  firebase: {
    apiKey: import.meta.env?.VITE_FIREBASE_API_KEY || "your-api-key",
    authDomain: import.meta.env?.VITE_FIREBASE_AUTH_DOMAIN || "your-project.firebaseapp.com",
    projectId: import.meta.env?.VITE_FIREBASE_PROJECT_ID || "your-project-id",
    storageBucket: import.meta.env?.VITE_FIREBASE_STORAGE_BUCKET || "your-project.appspot.com",
    messagingSenderId: import.meta.env?.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
    appId: import.meta.env?.VITE_FIREBASE_APP_ID || "your-app-id",
    measurementId: import.meta.env?.VITE_FIREBASE_MEASUREMENT_ID
  }
};

export default config;
