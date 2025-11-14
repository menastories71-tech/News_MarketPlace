-- Migration: Create event_enquiries table
-- Created: 2024-11-12

CREATE TABLE IF NOT EXISTS event_enquiries (
    id SERIAL PRIMARY KEY,
    event_name VARCHAR(255) NOT NULL,
    event_date DATE,
    organiser VARCHAR(255),
    event_industry VARCHAR(255),
    event_sub_industry VARCHAR(255),
    country VARCHAR(100),
    city VARCHAR(100),
    event_venue_name VARCHAR(255),
    google_map_location VARCHAR(500),
    event_mode VARCHAR(20) CHECK (event_mode IN ('virtual', 'in person')),
    event_type VARCHAR(50) CHECK (event_type IN ('networking', 'expo', 'exhibition', 'conference', 'awards', 'seminar', 'forum')),
    event_organised_by VARCHAR(50) CHECK (event_organised_by IN ('Government', 'private', 'ngo')),
    event_commercial VARCHAR(50) CHECK (event_commercial IN ('profit oriented', 'community oriented')),
    event_website VARCHAR(500),
    event_ig VARCHAR(500),
    event_linkedin VARCHAR(500),
    event_facebook VARCHAR(500),
    event_youtube VARCHAR(500),
    event_entrance VARCHAR(50) CHECK (event_entrance IN ('free for all', 'ticket based', 'invite based')),
    contact_person_name VARCHAR(255),
    contact_person_email VARCHAR(255),
    contact_person_number VARCHAR(20),
    contact_person_whatsapp VARCHAR(20),
    market_company_name BOOLEAN DEFAULT FALSE,
    provide_booth BOOLEAN DEFAULT FALSE,
    terms_and_conditions BOOLEAN NOT NULL DEFAULT FALSE,
    how_did_you_hear VARCHAR(255),
    message TEXT,
    status VARCHAR(50) DEFAULT 'new' CHECK (status IN ('new', 'viewed')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_event_enquiries_event_name ON event_enquiries(event_name);
CREATE INDEX IF NOT EXISTS idx_event_enquiries_status ON event_enquiries(status);
CREATE INDEX IF NOT EXISTS idx_event_enquiries_created_at ON event_enquiries(created_at);
CREATE INDEX IF NOT EXISTS idx_event_enquiries_event_date ON event_enquiries(event_date);

-- Add trigger to update updated_at timestamp
CREATE TRIGGER update_event_enquiries_updated_at
    BEFORE UPDATE ON event_enquiries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();