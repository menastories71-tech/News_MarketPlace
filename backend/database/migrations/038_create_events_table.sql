-- Migration: Create events table
-- Created: 2025-11-18

CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    country VARCHAR(100),
    city VARCHAR(100),
    start_date DATE,
    end_date DATE,
    month VARCHAR(20), -- Derived from start_date, for filtering
    event_type VARCHAR(50) CHECK (event_type IN ('Government Summit', 'Power List', 'Membership', 'Leisure Events', 'Sports Events', 'Music Festival', 'Art Festival')),
    is_free BOOLEAN DEFAULT FALSE,
    organizer VARCHAR(255),
    venue VARCHAR(255),
    capacity INTEGER,
    registration_deadline DATE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'completed')),
    custom_form_fields JSONB, -- For additional registration fields like Forbes Billionaire List
    disclaimer_text TEXT, -- For ticker or page disclaimer
    created_by INTEGER REFERENCES admins(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_events_country ON events(country);
CREATE INDEX IF NOT EXISTS idx_events_city ON events(city);
CREATE INDEX IF NOT EXISTS idx_events_month ON events(month);
CREATE INDEX IF NOT EXISTS idx_events_event_type ON events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_start_date ON events(start_date);

-- Add trigger to update updated_at timestamp
CREATE TRIGGER update_events_updated_at
    BEFORE UPDATE ON events
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();