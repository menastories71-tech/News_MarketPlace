const { query } = require('../config/database');

class RateLimiter {
  constructor() {
    this.limits = {
      publication_submit: {
        windowMs: 60 * 1000, // 1 minute
        maxRequests: 1,
        message: 'You can only submit one publication per minute. Please try again later.'
      },
      reporter_submit: {
        windowMs: 60 * 1000, // 1 minute
        maxRequests: 1,
        message: 'You can only submit one reporter profile per minute. Please try again later.'
      },
      career_submit: {
        windowMs: 60 * 1000, // 1 minute
        maxRequests: 1,
        message: 'You can only submit one career posting per minute. Please try again later.'
      },
      podcaster_submit: {
        windowMs: 60 * 1000, // 1 minute
        maxRequests: 1,
        message: 'You can only submit one podcaster profile per minute. Please try again later.'
      },
      ai_article_submit: {
        windowMs: 60 * 60 * 1000, // 1 hour
        maxRequests: 1,
        message: 'Your AI tokens have been used up for this hour. You can submit another article in {remainingMinutes} minutes.'
      },
      otp_operation: {
        windowMs: 5 * 60 * 1000, // 5 minutes
        maxRequests: 5,
        message: 'Too many OTP operations. Please try again later.'
      }
    };
  }

  // Check rate limit for user actions
  async checkLimit(userId, action) {
    const limit = this.limits[action];
    if (!limit) return { allowed: true };

    const windowStart = new Date(Date.now() - limit.windowMs);

    try {
      // Count recent requests for this user and action
      const sql = `
        SELECT COUNT(*) as count
        FROM user_actions
        WHERE user_id = $1
          AND action = $2
          AND created_at >= $3
      `;

      const result = await query(sql, [userId, action, windowStart]);
      const requestCount = parseInt(result.rows[0].count);

      if (requestCount >= limit.maxRequests) {
        return {
          allowed: false,
          message: limit.message,
          remainingTime: this.getRemainingTime(userId, action)
        };
      }

      // Log the action
      await this.logAction(userId, action);

      return { allowed: true };
    } catch (error) {
      console.error('Rate limit check error:', error);
      // Allow request on error to avoid blocking legitimate users
      return { allowed: true };
    }
  }

  // Log user action
  async logAction(userId, action) {
    try {
      const sql = `
        INSERT INTO user_actions (user_id, action, created_at)
        VALUES ($1, $2, NOW())
      `;
      await query(sql, [userId, action]);
    } catch (error) {
      console.error('Failed to log user action:', error);
    }
  }

  // Get remaining time until rate limit resets
  async getRemainingTime(userId, action) {
    try {
      const sql = `
        SELECT created_at
        FROM user_actions
        WHERE user_id = $1 AND action = $2
        ORDER BY created_at DESC
        LIMIT 1
      `;

      const result = await query(sql, [userId, action]);
      if (result.rows.length === 0) return 0;

      const lastAction = new Date(result.rows[0].created_at);
      const limit = this.limits[action];
      const resetTime = new Date(lastAction.getTime() + limit.windowMs);
      const remainingMs = resetTime - Date.now();

      return Math.max(0, Math.ceil(remainingMs / 1000 / 60)); // minutes
    } catch (error) {
      console.error('Error calculating remaining time:', error);
      return 0;
    }
  }
}

const rateLimiter = new RateLimiter();

// Middleware function for publication submission rate limiting
const publicationSubmitLimit = async (req, res, next) => {
  const userId = req.user?.userId;
  if (!userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const result = await rateLimiter.checkLimit(userId, 'publication_submit');

  if (!result.allowed) {
    return res.status(429).json({
      error: 'Rate limit exceeded',
      message: result.message,
      remainingMinutes: result.remainingTime
    });
  }

  next();
};

// Middleware function for reporter submission rate limiting
const reporterSubmitLimit = async (req, res, next) => {
  const userId = req.user?.userId;
  if (!userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const result = await rateLimiter.checkLimit(userId, 'reporter_submit');

  if (!result.allowed) {
    return res.status(429).json({
      error: 'Rate limit exceeded',
      message: result.message,
      remainingMinutes: result.remainingTime
    });
  }

  next();
};

// Middleware function for career submission rate limiting
const careerSubmitLimit = async (req, res, next) => {
  const userId = req.user?.userId;
  if (!userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const result = await rateLimiter.checkLimit(userId, 'career_submit');

  if (!result.allowed) {
    return res.status(429).json({
      error: 'Rate limit exceeded',
      message: result.message,
      remainingMinutes: result.remainingTime
    });
  }

  next();
};

// Middleware function for podcaster submission rate limiting
const podcasterSubmitLimit = async (req, res, next) => {
  const userId = req.user?.userId;
  if (!userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const result = await rateLimiter.checkLimit(userId, 'podcaster_submit');

  if (!result.allowed) {
    return res.status(429).json({
      error: 'Rate limit exceeded',
      message: result.message,
      remainingMinutes: result.remainingTime
    });
  }

  next();
};

// Middleware function for AI article submission rate limiting
const aiArticleSubmitLimit = async (req, res, next) => {
  const userId = req.user?.userId;
  if (!userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const result = await rateLimiter.checkLimit(userId, 'ai_article_submit');

  if (!result.allowed) {
    const message = 'Your AI tokens have been used up for this hour. You can submit another article in {remainingMinutes} minutes.'
      .replace('{remainingMinutes}', result.remainingTime);

    return res.status(429).json({
      error: 'Rate limit exceeded',
      message: message,
      remainingMinutes: result.remainingTime,
      tokenReset: true
    });
  }

  next();
};

// Middleware function for OTP operations (more lenient rate limiting)
const otpLimit = async (req, res, next) => {
  const userId = req.user?.userId;
  if (!userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // Allow 5 OTP operations per 5 minutes (send + verify combined)
  const result = await rateLimiter.checkLimit(userId, 'otp_operation');

  if (!result.allowed) {
    return res.status(429).json({
      error: 'Rate limit exceeded',
      message: 'Too many OTP operations. Please try again later.',
      remainingMinutes: result.remainingTime
    });
  }

  next();
};

module.exports = {
  publicationSubmitLimit,
  reporterSubmitLimit,
  careerSubmitLimit,
  podcasterSubmitLimit,
  aiArticleSubmitLimit,
  otpLimit,
  rateLimiter
};