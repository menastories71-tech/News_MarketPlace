-- Migration: Create paparazzi_creations table

CREATE TABLE paparazzi_creations (
    id SERIAL PRIMARY KEY,
    instagram_page_name VARCHAR(255),
    no_of_followers INTEGER,
    region_focused VARCHAR(255),
    category VARCHAR(255) CHECK (category IN ('Entertainment and Movies', 'Lifestyle', 'Local Guide')),
    instagram_url VARCHAR(500),
    profile_dp_logo VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Trigger to update updated_at on row updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_paparazzi_creations_updated_at
    BEFORE UPDATE ON paparazzi_creations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Indexes on key columns
CREATE INDEX idx_paparazzi_creations_category ON paparazzi_creations(category);
CREATE INDEX idx_paparazzi_creations_created_at ON paparazzi_creations(created_at);