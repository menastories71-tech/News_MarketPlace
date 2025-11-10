-- Migration: Create user_actions table for rate limiting
-- Created: 2024-11-09

CREATE TABLE IF NOT EXISTS user_actions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_actions_user_action (user_id, action),
    INDEX idx_user_actions_created_at (created_at)
);