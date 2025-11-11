-- Migration: Create awards table
-- Created: 2024-11-11

CREATE TABLE IF NOT EXISTS awards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    award_name VARCHAR(255) NOT NULL,
    award_focus VARCHAR(255),
    organiser VARCHAR(255),
    website VARCHAR(500),
    linkedin VARCHAR(500),
    instagram VARCHAR(500),
    award_month VARCHAR(50),
    cta_text VARCHAR(255),
    description TEXT,
    chief_guest VARCHAR(255),
    celebrity_guest VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_awards_award_name ON awards(award_name);
CREATE INDEX IF NOT EXISTS idx_awards_created_at ON awards(created_at);

-- Add trigger to update updated_at timestamp
CREATE TRIGGER update_awards_updated_at
    BEFORE UPDATE ON awards
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();