-- Migration: Add enable columns to events table
-- Created: 2025-11-18

-- Add enable_sponsor column
ALTER TABLE events ADD COLUMN IF NOT EXISTS enable_sponsor BOOLEAN DEFAULT FALSE;

-- Add enable_media_partner column
ALTER TABLE events ADD COLUMN IF NOT EXISTS enable_media_partner BOOLEAN DEFAULT FALSE;

-- Add enable_speaker column
ALTER TABLE events ADD COLUMN IF NOT EXISTS enable_speaker BOOLEAN DEFAULT FALSE;

-- Add enable_guest column
ALTER TABLE events ADD COLUMN IF NOT EXISTS enable_guest BOOLEAN DEFAULT FALSE;