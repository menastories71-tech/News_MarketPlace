-- Migration: Create affiliate_enquiries table
-- Created: 2024-11-13

CREATE TABLE IF NOT EXISTS affiliate_enquiries (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    gender VARCHAR(50),
    email VARCHAR(255) NOT NULL,
    whatsapp VARCHAR(20),
    linkedin VARCHAR(500),
    ig VARCHAR(500),
    facebook VARCHAR(500),
    passport_nationality VARCHAR(100),
    current_residency VARCHAR(100),
    how_did_you_hear VARCHAR(255),
    message TEXT,
    referral_code VARCHAR(50),
    terms_accepted BOOLEAN NOT NULL DEFAULT FALSE,
    captcha_verified BOOLEAN NOT NULL DEFAULT FALSE,
    submitted_at TIMESTAMP,
    status VARCHAR(50) DEFAULT 'new' CHECK (status IN ('new', 'viewed')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_affiliate_enquiries_email ON affiliate_enquiries(email);
CREATE INDEX IF NOT EXISTS idx_affiliate_enquiries_status ON affiliate_enquiries(status);
CREATE INDEX IF NOT EXISTS idx_affiliate_enquiries_created_at ON affiliate_enquiries(created_at);
CREATE INDEX IF NOT EXISTS idx_affiliate_enquiries_submitted_at ON affiliate_enquiries(submitted_at);

-- Add trigger to update updated_at timestamp
CREATE TRIGGER update_affiliate_enquiries_updated_at
    BEFORE UPDATE ON affiliate_enquiries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();