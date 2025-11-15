-- Migration: Add role_id to admins table and rename existing role column
-- Created: 2025-11-15

-- Rename existing role column to old_role
ALTER TABLE admins RENAME COLUMN role TO old_role;

-- Add new role_id column
ALTER TABLE admins ADD COLUMN IF NOT EXISTS role_id INTEGER REFERENCES roles(id);

-- Create index on role_id
CREATE INDEX IF NOT EXISTS idx_admins_role_id ON admins(role_id);