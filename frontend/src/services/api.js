import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Check for admin token first, then regular user token
    const adminToken = localStorage.getItem('adminAccessToken');
    const userToken = localStorage.getItem('accessToken');

    if (adminToken) {
      config.headers.Authorization = `Bearer ${adminToken}`;
    } else if (userToken) {
      config.headers.Authorization = `Bearer ${userToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Check if this is an admin request
        const isAdminRequest = originalRequest.url?.includes('/admin/');
        const refreshEndpoint = isAdminRequest ? '/api/admin/auth/refresh-token' : '/api/auth/refresh-token';
        const tokenKey = isAdminRequest ? 'adminAccessToken' : 'accessToken';
        const loginPath = isAdminRequest ? '/admin/login' : '/login';

        // Try to refresh token
        const response = await axios.post(refreshEndpoint, {}, {
          withCredentials: true
        });

        const { accessToken } = response.data;
        localStorage.setItem(tokenKey, accessToken);

        // Retry the original request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, redirect to appropriate login
        const isAdminRequest = originalRequest.url?.includes('/admin/');
        const tokenKey = isAdminRequest ? 'adminAccessToken' : 'accessToken';
        const loginPath = isAdminRequest ? '/admin/login' : '/login';

        localStorage.removeItem(tokenKey);
        window.location.href = loginPath;
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Admin API functions
export const adminAPI = {
  // Get all users
  getUsers: () => api.get('/admin/auth/users'),

  // Other admin functions can be added here
};

export default api;