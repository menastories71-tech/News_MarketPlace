-- Migration: Create event_creations table

CREATE TABLE IF NOT EXISTS event_creations (
    id SERIAL PRIMARY KEY,
    event_name VARCHAR(255),
    event_organiser_name VARCHAR(255),
    url VARCHAR(255),
    tentative_month VARCHAR(50),
    industry VARCHAR(255),
    regional_focused VARCHAR(255),
    event_country VARCHAR(255),
    event_city VARCHAR(255),
    company_focused_individual_focused VARCHAR(255),
    image VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_event_creations_updated_at
    BEFORE UPDATE ON event_creations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Indexes on key columns
CREATE INDEX idx_event_creations_created_at ON event_creations(created_at);