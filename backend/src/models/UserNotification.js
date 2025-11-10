const { query } = require('../config/database');

class UserNotification {
  constructor(data) {
    this.id = data.id;
    this.user_id = data.user_id;
    this.type = data.type;
    this.title = data.title;
    this.message = data.message;
    this.related_id = data.related_id;
    this.is_read = data.is_read || false;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Create a new notification
  static async create(notificationData) {
    const { user_id, type, title, message, related_id } = notificationData;

    const sql = `
      INSERT INTO user_notifications (user_id, type, title, message, related_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const result = await query(sql, [user_id, type, title, message, related_id]);
    return new UserNotification(result.rows[0]);
  }

  // Find notifications by user ID
  static async findByUserId(userId, limit = 50, offset = 0) {
    const sql = 'SELECT * FROM user_notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3';
    const result = await query(sql, [userId, limit, offset]);
    return result.rows.map(row => new UserNotification(row));
  }

  // Find unread notifications by user ID
  static async findUnreadByUserId(userId) {
    const sql = 'SELECT * FROM user_notifications WHERE user_id = $1 AND is_read = FALSE ORDER BY created_at DESC';
    const result = await query(sql, [userId]);
    return result.rows.map(row => new UserNotification(row));
  }

  // Mark notification as read
  async markAsRead() {
    const sql = 'UPDATE user_notifications SET is_read = TRUE, updated_at = NOW() WHERE id = $1 RETURNING *';
    const result = await query(sql, [this.id]);
    Object.assign(this, result.rows[0]);
    return this;
  }

  // Mark multiple notifications as read
  static async markMultipleAsRead(notificationIds) {
    const sql = 'UPDATE user_notifications SET is_read = TRUE, updated_at = NOW() WHERE id = ANY($1)';
    await query(sql, [notificationIds]);
  }

  // Get notification count for user
  static async getCountForUser(userId, unreadOnly = false) {
    const sql = unreadOnly
      ? 'SELECT COUNT(*) as count FROM user_notifications WHERE user_id = $1 AND is_read = FALSE'
      : 'SELECT COUNT(*) as count FROM user_notifications WHERE user_id = $1';

    const result = await query(sql, [userId]);
    return parseInt(result.rows[0].count);
  }

  // Delete notification
  async delete() {
    const sql = 'DELETE FROM user_notifications WHERE id = $1';
    await query(sql, [this.id]);
  }

  // Convert to JSON
  toJSON() {
    return {
      id: this.id,
      user_id: this.user_id,
      type: this.type,
      title: this.title,
      message: this.message,
      related_id: this.related_id,
      is_read: this.is_read,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}

module.exports = UserNotification;