const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const ticketController = require('../controllers/ticketController');
const eventRegistrationController = require('../controllers/eventRegistrationController');
const eventDisclaimerController = require('../controllers/eventDisclaimerController');
const {
  verifyToken,
  verifyAdminToken,
  requireAdminPanelAccess,
  requireAdminPermission
} = require('../middleware/auth');

// Admin ticket routes (must come before parameterized routes)
router.get('/tickets', verifyAdminToken, requireAdminPanelAccess, requireAdminPermission('manage_events'), ticketController.getAll);
router.get('/tickets/:id', verifyAdminToken, requireAdminPanelAccess, requireAdminPermission('manage_events'), ticketController.getById);
router.put('/tickets/:id', verifyAdminToken, requireAdminPanelAccess, requireAdminPermission('manage_events'), ticketController.updateValidation, ticketController.update);
router.delete('/tickets/:id', verifyAdminToken, requireAdminPanelAccess, requireAdminPermission('manage_events'), ticketController.delete);

// Disclaimer routes (must come before parameterized routes)
router.get('/disclaimers', verifyAdminToken, requireAdminPanelAccess, requireAdminPermission('manage_events'), eventDisclaimerController.getAll);
router.get('/disclaimers/active', eventDisclaimerController.getActive);
router.get('/disclaimers/:id', verifyAdminToken, requireAdminPanelAccess, requireAdminPermission('manage_events'), eventDisclaimerController.getById);
router.put('/disclaimers/:id', verifyAdminToken, requireAdminPanelAccess, requireAdminPermission('manage_events'), eventDisclaimerController.updateValidation, eventDisclaimerController.update);
router.delete('/disclaimers/:id', verifyAdminToken, requireAdminPanelAccess, requireAdminPermission('manage_events'), eventDisclaimerController.delete);

// Event routes
// Public routes
router.get('/', eventController.getAll);
router.get('/:id', eventController.getById);

// Admin event routes
router.post('/', verifyAdminToken, requireAdminPanelAccess, requireAdminPermission('manage_events'), eventController.createValidation, eventController.create);
router.put('/:id', verifyAdminToken, requireAdminPanelAccess, requireAdminPermission('manage_events'), eventController.updateValidation, eventController.update);
router.delete('/:id', verifyAdminToken, requireAdminPanelAccess, requireAdminPermission('manage_events'), eventController.delete);

// Event registrations (admin view)
router.get('/:id/registrations', verifyAdminToken, requireAdminPanelAccess, requireAdminPermission('manage_events'), eventController.getRegistrations);

// Ticket routes
// Public routes
router.get('/:eventId/tickets', ticketController.getByEvent);

// Admin ticket routes (event-specific)
router.post('/:eventId/tickets', verifyAdminToken, requireAdminPanelAccess, requireAdminPermission('manage_events'), ticketController.createValidation, ticketController.create);

// Registration routes
// Authenticated user registration (supports both user and admin tokens via API interceptor)
router.post('/:eventId/register', verifyToken, eventRegistrationController.createValidation, eventRegistrationController.register);

// User registration management
router.get('/registrations/:id', verifyToken, eventRegistrationController.getById);
router.get('/user/registrations', verifyToken, eventRegistrationController.getUserRegistrations);
router.put('/registrations/:id', (req, res, next) => {
  // Allow both user and admin authentication for updating registrations
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  console.log('Registration update auth check:', {
    hasAuthHeader: !!authHeader,
    hasToken: !!token,
    tokenLength: token?.length
  });

  if (!token) {
    console.log('No token provided');
    return res.status(401).json({ error: 'Authentication required' });
  }

  // Try user token first
  try {
    const authService = require('../services/authService');
    const decoded = authService.verifyAccessToken(token);

    // Check if this is actually an admin token that was verified by user service
    if (decoded.adminId) {
      // This is an admin token, set req.admin
      req.admin = decoded;
      console.log('Admin token verified via user service:', { adminId: decoded.adminId, role: decoded.role });
    } else {
      // This is a real user token
      req.user = decoded;
      console.log('User token verified successfully:', { userId: decoded.userId, email: decoded.email });
    }
    return next();
  } catch (userError) {
    console.log('User token verification failed:', userError.message);
    // User token failed, try admin token service
    try {
      const adminAuthService = require('../services/adminAuthService');
      const decoded = adminAuthService.verifyAccessToken(token);
      req.admin = decoded;
      console.log('Admin token verified via admin service:', { adminId: decoded.adminId, role: decoded.role });
      return next();
    } catch (adminError) {
      console.log('Admin token verification also failed:', adminError.message);
      return res.status(401).json({ error: 'Invalid token' });
    }
  }
}, eventRegistrationController.updateValidation, eventRegistrationController.update);
router.delete('/registrations/:id', verifyToken, eventRegistrationController.cancel);

// Admin registration management
router.delete('/admin/registrations/:id', verifyAdminToken, requireAdminPanelAccess, requireAdminPermission('manage_events'), eventRegistrationController.delete);

// Disclaimer routes
// Public routes
router.get('/:eventId/disclaimers', eventDisclaimerController.getByEvent);

// Admin disclaimer routes (event-specific)
router.post('/:eventId/disclaimers', verifyAdminToken, requireAdminPanelAccess, requireAdminPermission('manage_events'), eventDisclaimerController.createValidation, eventDisclaimerController.create);

module.exports = router;