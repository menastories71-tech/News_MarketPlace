-- Migration: Create event_disclaimers table
-- Created: 2025-11-18

CREATE TABLE IF NOT EXISTS event_disclaimers (
    id SERIAL PRIMARY KEY,
    event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_event_disclaimers_event_id ON event_disclaimers(event_id);
CREATE INDEX IF NOT EXISTS idx_event_disclaimers_is_active ON event_disclaimers(is_active);

-- Add trigger to update updated_at timestamp
CREATE TRIGGER update_event_disclaimers_updated_at
    BEFORE UPDATE ON event_disclaimers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();