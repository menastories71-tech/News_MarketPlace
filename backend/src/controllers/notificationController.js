const UserNotification = require('../models/UserNotification');

class NotificationController {
  // Get user notifications
  async getUserNotifications(req, res) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { page = 1, limit = 20, unread_only = false } = req.query;
      const offset = (page - 1) * limit;

      let notifications;
      if (unread_only === 'true') {
        notifications = await UserNotification.findUnreadByUserId(userId);
      } else {
        notifications = await UserNotification.findByUserId(userId, limit, offset);
      }

      const totalCount = await UserNotification.getCountForUser(userId, unread_only === 'true');

      res.json({
        notifications: notifications.map(n => n.toJSON()),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalCount,
          pages: Math.ceil(totalCount / limit)
        }
      });
    } catch (error) {
      console.error('Get user notifications error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Mark notification as read
  async markAsRead(req, res) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { id } = req.params;
      const notification = await UserNotification.findByUserId(userId).then(notifications =>
        notifications.find(n => n.id === parseInt(id))
      );

      if (!notification) {
        return res.status(404).json({ error: 'Notification not found' });
      }

      await notification.markAsRead();
      res.json({ message: 'Notification marked as read', notification: notification.toJSON() });
    } catch (error) {
      console.error('Mark notification as read error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Mark multiple notifications as read
  async markMultipleAsRead(req, res) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { notification_ids } = req.body;
      if (!Array.isArray(notification_ids) || notification_ids.length === 0) {
        return res.status(400).json({ error: 'Notification IDs array is required' });
      }

      await UserNotification.markMultipleAsRead(notification_ids);
      res.json({ message: `${notification_ids.length} notifications marked as read` });
    } catch (error) {
      console.error('Mark multiple notifications as read error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get notification count
  async getNotificationCount(req, res) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const totalCount = await UserNotification.getCountForUser(userId, false);
      const unreadCount = await UserNotification.getCountForUser(userId, true);

      res.json({
        total: totalCount,
        unread: unreadCount
      });
    } catch (error) {
      console.error('Get notification count error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Delete notification
  async deleteNotification(req, res) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { id } = req.params;
      const notifications = await UserNotification.findByUserId(userId);
      const notification = notifications.find(n => n.id === parseInt(id));

      if (!notification) {
        return res.status(404).json({ error: 'Notification not found' });
      }

      await notification.delete();
      res.json({ message: 'Notification deleted successfully' });
    } catch (error) {
      console.error('Delete notification error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = new NotificationController();