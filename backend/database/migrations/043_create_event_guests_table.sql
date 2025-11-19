-- Migration: Create event guests table
-- Created: 2025-11-18

CREATE TABLE IF NOT EXISTS event_guests (
    id SERIAL PRIMARY KEY,
    event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    organization VARCHAR(255),
    position VARCHAR(255), -- Job title/position
    guest_type VARCHAR(100), -- e.g., VIP, Press, Industry Expert
    reason_for_attendance TEXT,
    special_dietary_requirements TEXT,
    accessibility_needs TEXT,
    accompanying_guests INTEGER DEFAULT 0,
    linkedin_profile VARCHAR(255),
    website VARCHAR(255),
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
CREATE INDEX IF NOT EXISTS idx_event_guests_event_id ON event_guests(event_id);
CREATE INDEX IF NOT EXISTS idx_event_guests_user_id ON event_guests(user_id);
CREATE INDEX IF NOT EXISTS idx_event_guests_status ON event_guests(status);
CREATE INDEX IF NOT EXISTS idx_event_guests_application_date ON event_guests(application_date);

-- Add trigger to update updated_at timestamp
CREATE TRIGGER update_event_guests_updated_at
    BEFORE UPDATE ON event_guests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();