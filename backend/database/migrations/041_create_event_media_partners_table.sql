-- Migration: Create event media partners table
-- Created: 2025-11-18

CREATE TABLE IF NOT EXISTS event_media_partners (
    id SERIAL PRIMARY KEY,
    event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    organization_name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    website VARCHAR(255),
    media_type VARCHAR(100), -- e.g., TV, Radio, Print, Digital
    audience_size VARCHAR(100), -- e.g., 1M-5M, 5M-10M, etc.
    coverage_areas TEXT, -- Areas they can cover
    partnership_type VARCHAR(100), -- e.g., Media Partner, Content Partner
    description TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    application_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_by INTEGER REFERENCES admins(id),
    reviewed_at TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Ensure one application per user per event
    UNIQUE(event_id, user_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_event_media_partners_event_id ON event_media_partners(event_id);
CREATE INDEX IF NOT EXISTS idx_event_media_partners_user_id ON event_media_partners(user_id);
CREATE INDEX IF NOT EXISTS idx_event_media_partners_status ON event_media_partners(status);
CREATE INDEX IF NOT EXISTS idx_event_media_partners_application_date ON event_media_partners(application_date);

-- Add trigger to update updated_at timestamp
CREATE TRIGGER update_event_media_partners_updated_at
    BEFORE UPDATE ON event_media_partners
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();