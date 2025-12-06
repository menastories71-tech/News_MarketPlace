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
    console.log('Admin token verified:', { adminId: decoded.adminId, role: decoded.role });
    next();
  } catch (error) {
    console.log('Admin token verification failed:', error.message);
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
    console.log('Admin role check:', { role: req.admin.role, level: adminLevel, required: minLevel });

    if (adminLevel < minLevel) {
      return res.status(403).json({
        error: 'Insufficient admin role level',
        currentRole: req.admin.role,
        currentLevel: adminLevel,
        requiredLevel: minLevel
      });
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

// Middleware to check if user owns the resource (for user-specific data)
const requireOwnership = (resourceType) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const resourceId = req.params.id || req.params.publicationId || req.params.userId;

    if (!resourceId) {
      return res.status(400).json({ error: 'Resource ID required' });
    }

    try {
      let resourceOwnerId;

      switch (resourceType) {
        case 'publication':
          const Publication = require('../models/Publication');
          const publication = await Publication.findById(resourceId);
          if (!publication) {
            return res.status(404).json({ error: 'Publication not found' });
          }
          resourceOwnerId = publication.submitted_by;
          break;

        case 'theme':
          const Theme = require('../models/Theme');
          const theme = await Theme.findById(resourceId);
          if (!theme) {
            return res.status(404).json({ error: 'Theme not found' });
          }
          resourceOwnerId = theme.submitted_by;
          break;

        case 'reporter':
          const Reporter = require('../models/Reporter');
          const reporter = await Reporter.findById(resourceId);
          if (!reporter) {
            return res.status(404).json({ error: 'Reporter not found' });
          }
          resourceOwnerId = reporter.submitted_by;
          break;

        case 'career':
          const Career = require('../models/Career');
          const career = await Career.findById(resourceId);
          if (!career) {
            return res.status(404).json({ error: 'Career not found' });
          }
          resourceOwnerId = career.submitted_by;
          break;

        case 'podcaster':
          const Podcaster = require('../models/Podcaster');
          const podcaster = await Podcaster.findById(resourceId);
          if (!podcaster) {
            return res.status(404).json({ error: 'Podcaster not found' });
          }
          resourceOwnerId = podcaster.submitted_by;
          break;

        case 'user':
          resourceOwnerId = resourceId;
          break;

        default:
          return res.status(400).json({ error: 'Invalid resource type' });
      }

      if (req.user.userId !== resourceOwnerId) {
        return res.status(403).json({ error: 'Access denied: You can only access your own data' });
      }

      next();
    } catch (error) {
      console.error('Ownership check error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
};

// Middleware to check if admin has permission for specific actions
const requireAdminPermission = (permission) => {
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

    const permissionLevels = {
      'manage_publications': 1,
      'manage_themes': 1,
      'manage_reporters': 1,
      'manage_careers': 1,
      'manage_podcasters': 1,
      'manage_orders': 1,
      'approve_publications': 2,
      'approve_themes': 2,
      'approve_reporters': 2,
      'approve_careers': 2,
      'approve_podcasters': 2,
      'manage_users': 3,
      'manage_admins': 4,
      'system_admin': 5
    };

    const requiredLevel = permissionLevels[permission] || 5;

    if (adminLevel < requiredLevel) {
      return res.status(403).json({
        error: 'Insufficient permissions',
        required: permission,
        currentLevel: adminLevel
      });
    }

    next();
  };
};

// Middleware to check if user can submit publications (rate limiting and verification)
const requirePublicationSubmissionRights = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // Additional checks can be added here (e.g., user verification status, account status)
  // For now, just ensure user is authenticated

  next();
};

// Middleware to validate admin access to admin panel
const requireAdminPanelAccess = (req, res, next) => {
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

  // Minimum level 1 (agency) can access admin panel
  if (adminLevel < 1) {
    return res.status(403).json({ error: 'Insufficient role level for admin panel access' });
  }

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
  requireVerified,
  requireOwnership,
  requireAdminPermission,
  requirePublicationSubmissionRights,
  requireAdminPanelAccess
};