-- Migration: Create podcasters table
-- Created: 2025-11-13

CREATE TABLE IF NOT EXISTS podcasters (
    id SERIAL PRIMARY KEY,
    image VARCHAR(500),
    podcast_name VARCHAR(255) NOT NULL,
    podcast_host VARCHAR(255),
    podcast_focus_industry VARCHAR(255),
    podcast_target_audience VARCHAR(255),
    podcast_region VARCHAR(100),
    podcast_website VARCHAR(500),
    podcast_ig VARCHAR(500),
    podcast_linkedin VARCHAR(500),
    podcast_facebook VARCHAR(500),
    podcast_ig_username VARCHAR(255),
    podcast_ig_followers INTEGER,
    podcast_ig_engagement_rate DECIMAL(5,2),
    podcast_ig_prominent_guests TEXT,
    spotify_channel_name VARCHAR(255),
    spotify_channel_url VARCHAR(500),
    youtube_channel_name VARCHAR(255),
    youtube_channel_url VARCHAR(500),
    tiktok VARCHAR(500),
    cta TEXT,
    contact_us_to_be_on_podcast TEXT,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    submitted_by INTEGER REFERENCES users(id),
    submitted_by_admin INTEGER REFERENCES admins(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_podcasters_podcast_name ON podcasters(podcast_name);
CREATE INDEX IF NOT EXISTS idx_podcasters_status ON podcasters(status);
CREATE INDEX IF NOT EXISTS idx_podcasters_created_at ON podcasters(created_at);
CREATE INDEX IF NOT EXISTS idx_podcasters_submitted_by ON podcasters(submitted_by);

-- Add trigger to update updated_at timestamp
CREATE TRIGGER update_podcasters_updated_at
    BEFORE UPDATE ON podcasters
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();