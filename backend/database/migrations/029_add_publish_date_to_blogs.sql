-- Migration: Add publish_date column to blogs table
-- Created: 2025-11-13

ALTER TABLE blogs ADD COLUMN IF NOT EXISTS publish_date DATE NOT NULL DEFAULT CURRENT_DATE;

-- Update existing blogs to have today's date if they don't have a publish_date
UPDATE blogs SET publish_date = CURRENT_DATE WHERE publish_date IS NULL;