const jwt = require('jsonwebtoken');
const authService = require('../services/authService');
const adminAuthService = require('../services/adminAuthService');

// Middleware to verify JWT token for regular users
const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const decoded = authService.verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// Middleware to verify JWT token for admins
const verifyAdminToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: 'Admin access token required' });
    }

    const decoded = adminAuthService.verifyAccessToken(token);
    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired admin token' });
  }
};

// Middleware to verify refresh token from cookies for regular users
const verifyRefreshToken = (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token required' });
    }

    const decoded = authService.verifyRefreshToken(refreshToken);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired refresh token' });
  }
};

// Middleware to verify refresh token from cookies for admins
const verifyAdminRefreshToken = (req, res, next) => {
  try {
    const refreshToken = req.cookies.adminRefreshToken;

    if (!refreshToken) {
      return res.status(401).json({ error: 'Admin refresh token required' });
    }

    const decoded = adminAuthService.verifyRefreshToken(refreshToken);
    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired admin refresh token' });
  }
};

// Middleware to check if user is authenticated (optional auth)
const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = authService.verifyAccessToken(token);
      req.user = decoded;
    }
    next();
  } catch (error) {
    // Token is invalid but we don't throw error for optional auth
    next();
  }
};

// Middleware to check user roles
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

// Middleware to check admin roles
const requireAdminRole = (roles) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({ error: 'Admin authentication required' });
    }

    if (!roles.includes(req.admin.role)) {
      return res.status(403).json({ error: 'Insufficient admin permissions' });
    }

    next();
  };
};

// Middleware to check admin role level (higher or equal)
const requireAdminRoleLevel = (minLevel) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({ error: 'Admin authentication required' });
    }

    const roleLevels = {
      'super_admin': 5,
      'content_manager': 4,
      'editor': 3,
      'registered_user': 2,
      'agency': 1,
      'other': 0
    };

    const adminLevel = roleLevels[req.admin.role] || 0;

    if (adminLevel < minLevel) {
      return res.status(403).json({ error: 'Insufficient admin role level' });
    }

    next();
  };
};

// Middleware to check if user is verified
const requireVerified = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // Note: This would need to be checked against the database
  // For now, we'll assume the token contains verification status
  // In a real implementation, you might want to check the database

  next();
};

module.exports = {
  verifyToken,
  verifyRefreshToken,
  verifyAdminToken,
  verifyAdminRefreshToken,
  optionalAuth,
  requireRole,
  requireAdminRole,
  requireAdminRoleLevel,
  requireVerified
};