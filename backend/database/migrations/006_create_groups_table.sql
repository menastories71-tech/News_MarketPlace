-- Migration: Create groups table
-- Created: 2024-11-09

CREATE TABLE IF NOT EXISTS groups (
    id SERIAL PRIMARY KEY,
    group_sn VARCHAR(50) UNIQUE NOT NULL,
    group_name VARCHAR(255) NOT NULL,
    group_location VARCHAR(255),
    group_website VARCHAR(500),
    group_linkedin VARCHAR(500),
    group_instagram VARCHAR(500),
    submitted_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    submitted_by_admin INTEGER REFERENCES admins(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_groups_group_sn ON groups(group_sn);
CREATE INDEX IF NOT EXISTS idx_groups_status ON groups(status);
CREATE INDEX IF NOT EXISTS idx_groups_is_active ON groups(is_active);
CREATE INDEX IF NOT EXISTS idx_groups_created_at ON groups(created_at);

-- Add trigger to update updated_at timestamp
CREATE TRIGGER update_groups_updated_at
    BEFORE UPDATE ON groups
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();