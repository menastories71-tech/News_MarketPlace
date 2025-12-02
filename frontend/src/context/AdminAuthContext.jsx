import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AdminAuthContext = createContext();

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if admin is authenticated on app load
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('adminAccessToken');
      if (token) {
        try {
          const response = await api.get('/admin/auth/profile');
          setAdmin(response.data.admin);
          setIsAuthenticated(true);
          console.log('Admin authentication successful:', response.data.admin);
        } catch (error) {
          console.error('Admin auth check failed:', error);
          
          // Clear invalid token
          localStorage.removeItem('adminAccessToken');
          setAdmin(null);
          setIsAuthenticated(false);
          
          // Provide user feedback for authentication failure
          if (error.response?.status === 401) {
            console.log('Admin token expired or invalid');
          } else if (error.response?.status === 403) {
            console.log('Admin access forbidden - insufficient permissions');
          } else {
            console.log('Admin authentication error:', error.response?.data?.error || error.message);
          }
          
          // If token is invalid, redirect to login for admin pages
          if (window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin/login') {
            console.log('Redirecting to admin login due to authentication failure');
            window.location.href = '/admin/login';
          }
        }
      } else {
        // No token found
        console.log('No admin access token found');
        setAdmin(null);
        setIsAuthenticated(false);
        
        // Redirect to login if on admin pages
        if (window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin/login') {
          console.log('Redirecting to admin login - no token');
          window.location.href = '/admin/login';
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  // Login admin
  const login = async (email, password) => {
    try {
      console.log('Attempting admin login for:', email);
      const response = await api.post('/admin/auth/login', { email, password });
      const { tokens, admin: adminData } = response.data;
      const { accessToken } = tokens;

      // Store token
      localStorage.setItem('adminAccessToken', accessToken);
      setAdmin(adminData);
      setIsAuthenticated(true);

      console.log('Admin login successful:', adminData);
      return response.data;
    } catch (error) {
      console.error('Admin login failed:', error);
      
      // Clear any existing token on failed login
      localStorage.removeItem('adminAccessToken');
      setAdmin(null);
      setIsAuthenticated(false);
      
      // Extract meaningful error message
      const errorMessage = error.response?.data?.error || 
                          error.message || 
                          'Login failed. Please check your credentials.';
      
      throw new Error(errorMessage);
    }
  };

  // Logout admin
  const logout = async () => {
    try {
      await api.post('/admin/auth/logout');
    } catch (error) {
      console.error('Admin logout error:', error);
    } finally {
      localStorage.removeItem('adminAccessToken');
      setAdmin(null);
      setIsAuthenticated(false);
    }
  };

  // Update admin profile
  const updateProfile = async (profileData) => {
    try {
      const response = await api.put('/admin/auth/profile', profileData);
      setAdmin(response.data.admin);
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || 'Profile update failed';
    }
  };

  // Change admin password
  const changePassword = async (currentPassword, newPassword) => {
    try {
      const response = await api.put('/admin/auth/change-password', {
        currentPassword,
        newPassword
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || 'Password change failed';
    }
  };

  // Check if admin has specific role
  const hasRole = (role) => {
    return admin?.role === role;
  };

  // Check if admin has any of the specified roles
  const hasAnyRole = (roles) => {
    return roles.includes(admin?.role);
  };

  // Get admin role level
  const getRoleLevel = () => {
    const roleLevels = {
      'super_admin': 5,
      'content_manager': 4,
      'editor': 3,
      'registered_user': 2,
      'agency': 1,
      'other': 0
    };
    return roleLevels[admin?.role] || 0;
  };

  const value = {
    admin,
    loading,
    isAuthenticated,
    login,
    logout,
    updateProfile,
    changePassword,
    hasRole,
    hasAnyRole,
    getRoleLevel,
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};