import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is authenticated on app load
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          const response = await api.get('/auth/profile');
          setUser(response.data.user);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('accessToken');
          setUser(null);
          setIsAuthenticated(false);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  // Register user
  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || 'Registration failed';
    }
  };

  // Verify registration OTP
  const verifyRegistration = async (email, otp) => {
    try {
      const response = await api.post('/auth/verify-registration', { email, otp });
      const { accessToken, user: userData } = response.data;

      localStorage.setItem('accessToken', accessToken);
      setUser(userData);
      setIsAuthenticated(true);

      return response.data;
    } catch (error) {
      throw error.response?.data?.error || 'OTP verification failed';
    }
  };

  // Login user
  const login = async (email, password, rememberMe = false, recaptchaToken = null) => {
    try {
      const response = await api.post('/auth/login', { email, password, rememberMe, recaptchaToken });
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || 'Login failed';
    }
  };

  // Verify login OTP
  const verifyLogin = async (email, otp, rememberMe = false) => {
    try {
      const response = await api.post('/auth/verify-login', { email, otp, rememberMe });
      const { accessToken, user: userData } = response.data;

      localStorage.setItem('accessToken', accessToken);
      setUser(userData);
      setIsAuthenticated(true);

      return response.data;
    } catch (error) {
      throw error.response?.data?.error || 'OTP verification failed';
    }
  };

  // Logout user
  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('accessToken');
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  // Forgot password
  const forgotPassword = async (email) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || 'Failed to send reset code';
    }
  };

  // Verify forgot password OTP
  const verifyForgotPasswordOTP = async (email, otp) => {
    try {
      const response = await api.post('/auth/verify-forgot-password-otp', { email, otp });
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || 'OTP verification failed';
    }
  };

  // Reset password with OTP
  const resetPasswordWithOTP = async (token, password) => {
    try {
      const response = await api.post('/auth/reset-password-with-otp', { token, password });
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || 'Password reset failed';
    }
  };

  // Reset password (legacy method for backward compatibility)
  const resetPassword = async (token, password) => {
    try {
      const response = await api.post('/auth/reset-password', { token, password });
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || 'Password reset failed';
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    register,
    verifyRegistration,
    login,
    verifyLogin,
    logout,
    forgotPassword,
    verifyForgotPasswordOTP,
    resetPasswordWithOTP,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};