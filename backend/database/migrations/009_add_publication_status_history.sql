-- Migration: Add publication status history and approval tracking
-- Created: 2024-11-09

-- Add new columns for status tracking
ALTER TABLE publications
ADD COLUMN IF NOT EXISTS status_history JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS approved_by INTEGER REFERENCES admins(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS rejected_by INTEGER REFERENCES admins(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
ADD COLUMN IF NOT EXISTS admin_comments TEXT;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_publications_approved_at ON publications(approved_at);
CREATE INDEX IF NOT EXISTS idx_publications_rejected_at ON publications(rejected_at);
CREATE INDEX IF NOT EXISTS idx_publications_approved_by ON publications(approved_by);
CREATE INDEX IF NOT EXISTS idx_publications_rejected_by ON publications(rejected_by);