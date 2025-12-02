-- Create powerlist_nominations table
CREATE TABLE powerlist_nominations (
    id SERIAL PRIMARY KEY,
    publication_name VARCHAR(255),
    website_url VARCHAR(500),
    power_list_name VARCHAR(255),
    industry VARCHAR(255),
    company_or_individual VARCHAR(255),
    tentative_month VARCHAR(100),
    location_region VARCHAR(255),
    last_power_list_url VARCHAR(500),
    image VARCHAR(500),
    status VARCHAR(50) DEFAULT 'pending',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_powerlist_nominations_status ON powerlist_nominations (status);
CREATE INDEX idx_powerlist_nominations_is_active ON powerlist_nominations (is_active);
CREATE INDEX idx_powerlist_nominations_created_at ON powerlist_nominations (created_at);

-- Create trigger function to update updated_at on update
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger
CREATE TRIGGER update_powerlist_nominations_updated_at
    BEFORE UPDATE ON powerlist_nominations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();