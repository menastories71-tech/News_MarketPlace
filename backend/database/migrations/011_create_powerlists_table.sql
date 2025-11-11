-- Migration: Create powerlists table
-- Created: 2024-11-11

CREATE TABLE IF NOT EXISTS powerlists (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    whatsapp VARCHAR(20),
    calling_number VARCHAR(20),
    telegram_username VARCHAR(100),
    direct_number VARCHAR(20),
    gender VARCHAR(10),
    date_of_birth DATE,
    dual_passport BOOLEAN DEFAULT FALSE,
    passport_nationality_one VARCHAR(100),
    passport_nationality_two VARCHAR(100),
    uae_permanent_residence BOOLEAN DEFAULT FALSE,
    other_permanent_residency BOOLEAN DEFAULT FALSE,
    other_residency_mention TEXT,
    current_company VARCHAR(255),
    position VARCHAR(255),
    linkedin_url VARCHAR(500),
    instagram_url VARCHAR(500),
    facebook_url VARCHAR(500),
    personal_website VARCHAR(500),
    company_website VARCHAR(500),
    company_industry VARCHAR(255),
    filling_on_behalf BOOLEAN DEFAULT FALSE,
    behalf_name VARCHAR(255),
    behalf_position VARCHAR(255),
    behalf_relation VARCHAR(255),
    behalf_gender VARCHAR(10),
    behalf_email VARCHAR(255),
    behalf_contact_number VARCHAR(20),
    captcha_verified BOOLEAN DEFAULT FALSE,
    agree_terms BOOLEAN NOT NULL,
    message TEXT,
    submitted_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'pending',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_powerlists_name ON powerlists(name);
CREATE INDEX IF NOT EXISTS idx_powerlists_email ON powerlists(email);
CREATE INDEX IF NOT EXISTS idx_powerlists_status ON powerlists(status);
CREATE INDEX IF NOT EXISTS idx_powerlists_is_active ON powerlists(is_active);
CREATE INDEX IF NOT EXISTS idx_powerlists_created_at ON powerlists(created_at);
CREATE INDEX IF NOT EXISTS idx_powerlists_submitted_by ON powerlists(submitted_by);

-- Add trigger to update updated_at timestamp
CREATE TRIGGER update_powerlists_updated_at
    BEFORE UPDATE ON powerlists
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();