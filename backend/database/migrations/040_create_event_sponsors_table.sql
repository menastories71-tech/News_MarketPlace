-- Migration: Create event sponsors table
-- Created: 2025-11-18

CREATE TABLE IF NOT EXISTS event_sponsors (
    id SERIAL PRIMARY KEY,
    event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company_name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    website VARCHAR(255),
    sponsorship_level VARCHAR(100), -- e.g., Platinum, Gold, Silver, Bronze
    sponsorship_amount DECIMAL(10,2),
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
CREATE INDEX IF NOT EXISTS idx_event_sponsors_event_id ON event_sponsors(event_id);
CREATE INDEX IF NOT EXISTS idx_event_sponsors_user_id ON event_sponsors(user_id);
CREATE INDEX IF NOT EXISTS idx_event_sponsors_status ON event_sponsors(status);
CREATE INDEX IF NOT EXISTS idx_event_sponsors_application_date ON event_sponsors(application_date);

-- Add trigger to update updated_at timestamp
CREATE TRIGGER update_event_sponsors_updated_at
    BEFORE UPDATE ON event_sponsors
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();