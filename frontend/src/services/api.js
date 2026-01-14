import axios from 'axios';

// Create axios instance with default config
const baseURL = window.location.hostname === 'vaas.solutions'
  ? 'https://vaas.solutions/api'
  : '/api';

const api = axios.create({
  baseURL,
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

        // For admin requests, redirect to admin login
        if (isAdminRequest) {
          window.location.href = '/admin/login';
        } else {
          window.location.href = '/login';
        }

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
  async (error) => {
    // Handle 403 Forbidden errors (insufficient permissions)
    if (error.response?.status === 403) {
      console.error('Access denied:', error.response.data);

      // Show user-friendly error message
      const errorMessage = error.response.data.error || 'Access denied. You do not have permission to perform this action.';

      // For admin panel access, redirect to appropriate page
      if (window.location.pathname.startsWith('/admin')) {
        alert(errorMessage);
        window.location.href = '/';
        return Promise.reject(error);
      }

      // For other access denied errors, show alert
      alert(errorMessage);
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

// Admin API functions
export const adminAPI = {
  // Get all users
  getUsers: () => api.get('/admin/auth/users'),
  downloadUsersCSV: () => api.get('/admin/auth/users/export', { responseType: 'blob' }),

  // Roles and Permissions management
  getRoles: (params) => api.get('/admin/role-permissions/roles', { params }),
  getRole: (id) => api.get(`/admin/role-permissions/roles/${id}`),
  createRole: (data) => api.post('/admin/role-permissions/roles', data),
  updateRole: (id, data) => api.put(`/admin/role-permissions/roles/${id}`, data),
  deleteRole: (id) => api.delete(`/admin/role-permissions/roles/${id}`),
  getRolePermissions: (id) => api.get(`/admin/role-permissions/roles/${id}/permissions`),
  setRolePermissions: (id, data) => api.put(`/admin/role-permissions/roles/${id}/permissions`, data),
  assignPermissionToRole: (roleId, permissionId) => api.post(`/admin/role-permissions/roles/${roleId}/permissions/${permissionId}`),
  removePermissionFromRole: (roleId, permissionId) => api.delete(`/admin/role-permissions/roles/${roleId}/permissions/${permissionId}`),

  getPermissions: (params) => api.get('/admin/role-permissions/permissions', { params }),
  getPermission: (id) => api.get(`/admin/role-permissions/permissions/${id}`),
  createPermission: (data) => api.post('/admin/role-permissions/permissions', data),
  updatePermission: (id, data) => api.put(`/admin/role-permissions/permissions/${id}`, data),
  deletePermission: (id) => api.delete(`/admin/role-permissions/permissions/${id}`),

  getResources: () => api.get('/admin/role-permissions/resources'),

  // Blog management
  getBlogs: (params) => api.get('/blogs', { params }),
  getBlog: (id) => api.get(`/blogs/${id}`),
  createBlog: (data) => api.post('/blogs', data),
  updateBlog: (id, data) => api.put(`/blogs/${id}`, data),
  deleteBlog: (id) => api.delete(`/blogs/${id}`),

  // Reporter management
  downloadReporterTemplate: () => api.get('/reporters/admin/template', { responseType: 'blob' }),
  uploadBulkReporters: (data) => api.post('/reporters/admin/bulk-upload', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  downloadReportersCSV: (params) => api.get('/reporters/admin/export', { params, responseType: 'blob' }),

  // Other admin functions can be added here
};

export default api;