-- Migration: Create real_estates table
-- Created: 2025-11-14

CREATE TABLE IF NOT EXISTS real_estates (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(15,2),
    location VARCHAR(255),
    property_type VARCHAR(100),
    bedrooms INTEGER,
    bathrooms INTEGER,
    area_sqft DECIMAL(10,2),
    images JSONB DEFAULT '[]'::jsonb,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    submitted_by INTEGER REFERENCES users(id),
    submitted_by_admin INTEGER REFERENCES admins(id),
    approved_at TIMESTAMP,
    approved_by INTEGER REFERENCES admins(id),
    rejected_at TIMESTAMP,
    rejected_by INTEGER REFERENCES admins(id),
    rejection_reason TEXT,
    admin_comments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_real_estates_title ON real_estates(title);
CREATE INDEX IF NOT EXISTS idx_real_estates_location ON real_estates(location);
CREATE INDEX IF NOT EXISTS idx_real_estates_property_type ON real_estates(property_type);
CREATE INDEX IF NOT EXISTS idx_real_estates_status ON real_estates(status);
CREATE INDEX IF NOT EXISTS idx_real_estates_submitted_by ON real_estates(submitted_by);
CREATE INDEX IF NOT EXISTS idx_real_estates_created_at ON real_estates(created_at);
CREATE INDEX IF NOT EXISTS idx_real_estates_is_active ON real_estates(is_active);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_real_estates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_real_estates_updated_at
    BEFORE UPDATE ON real_estates
    FOR EACH ROW
    EXECUTE FUNCTION update_real_estates_updated_at();

-- Add comment
COMMENT ON TABLE real_estates IS 'Real estate listings submitted by users and managed by admins';