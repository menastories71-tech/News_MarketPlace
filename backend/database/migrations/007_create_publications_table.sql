-- Migration: Create publications table
-- Created: 2024-11-09

CREATE TABLE IF NOT EXISTS publications (
    id SERIAL PRIMARY KEY,
    group_id INTEGER REFERENCES groups(id) ON DELETE CASCADE,
    publication_sn VARCHAR(50) UNIQUE NOT NULL,
    publication_grade VARCHAR(10),
    publication_name VARCHAR(255) NOT NULL,
    publication_website VARCHAR(500),
    publication_price DECIMAL(10,2),
    agreement_tat INTEGER, -- in days
    practical_tat INTEGER, -- in days
    publication_socials_icons TEXT, -- JSON string for social media icons
    publication_language VARCHAR(100),
    publication_region VARCHAR(255),
    publication_primary_industry VARCHAR(255),
    website_news_index VARCHAR(255),
    da INTEGER, -- Domain Authority
    dr INTEGER, -- Domain Rating
    sponsored_or_not BOOLEAN DEFAULT FALSE,
    words_limit INTEGER,
    number_of_images INTEGER,
    do_follow_link BOOLEAN DEFAULT FALSE,
    example_link VARCHAR(500),
    excluding_categories TEXT,
    other_remarks TEXT,
    tags_badges TEXT, -- JSON string for tags/badges like "Hot deals", "best seller", etc.
    live_on_platform BOOLEAN DEFAULT FALSE,
    submitted_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    submitted_by_admin INTEGER REFERENCES admins(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_publications_group_id ON publications(group_id);
CREATE INDEX IF NOT EXISTS idx_publications_publication_sn ON publications(publication_sn);
CREATE INDEX IF NOT EXISTS idx_publications_status ON publications(status);
CREATE INDEX IF NOT EXISTS idx_publications_is_active ON publications(is_active);
CREATE INDEX IF NOT EXISTS idx_publications_live_on_platform ON publications(live_on_platform);
CREATE INDEX IF NOT EXISTS idx_publications_created_at ON publications(created_at);

-- Add trigger to update updated_at timestamp
CREATE TRIGGER update_publications_updated_at
    BEFORE UPDATE ON publications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();