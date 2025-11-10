const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { verifyToken, requireOwnership } = require('../middleware/auth');

// All notification routes require authentication
router.use(verifyToken);

// Get user notifications (users can only see their own notifications)
router.get('/', notificationController.getUserNotifications);

// Get notification count (users can only see their own count)
router.get('/count', notificationController.getNotificationCount);

// Mark notification as read (users can only modify their own notifications)
router.patch('/:id/read', requireOwnership('notification'), notificationController.markAsRead);

// Mark multiple notifications as read (users can only modify their own notifications)
router.patch('/read-multiple', notificationController.markMultipleAsRead);

// Delete notification (users can only delete their own notifications)
router.delete('/:id', requireOwnership('notification'), notificationController.deleteNotification);

module.exports = router;