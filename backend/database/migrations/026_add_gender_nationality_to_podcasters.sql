-- Migration: Add gender and nationality to podcasters table
-- Created: 2025-11-14

ALTER TABLE podcasters ADD COLUMN IF NOT EXISTS gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other'));
ALTER TABLE podcasters ADD COLUMN IF NOT EXISTS nationality VARCHAR(100);