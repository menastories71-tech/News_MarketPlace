-- Migration: Add event application fields
-- Created: 2025-11-18

-- Add columns to enable/disable different application types
ALTER TABLE events
ADD COLUMN IF NOT EXISTS enable_sponsor BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS enable_media_partner BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS enable_speaker BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS enable_guest BOOLEAN DEFAULT FALSE;

-- Create indexes for the new fields
CREATE INDEX IF NOT EXISTS idx_events_enable_sponsor ON events(enable_sponsor);
CREATE INDEX IF NOT EXISTS idx_events_enable_media_partner ON events(enable_media_partner);
CREATE INDEX IF NOT EXISTS idx_events_enable_speaker ON events(enable_speaker);
CREATE INDEX IF NOT EXISTS idx_events_enable_guest ON events(enable_guest);