-- Migration: Create reporters table
-- Created: 2024-11-12

CREATE TABLE IF NOT EXISTS reporters (
    id SERIAL PRIMARY KEY,
    function_department VARCHAR(50) NOT NULL CHECK (function_department IN ('Commercial', 'Procurement', 'Publishing', 'Marketing', 'Accounts and Finance')),
    position VARCHAR(50) NOT NULL CHECK (position IN ('Journalist', 'Reporter', 'Contributor', 'Staff')),
    name VARCHAR(255) NOT NULL,
    gender VARCHAR(20),
    email VARCHAR(255) UNIQUE NOT NULL,
    whatsapp VARCHAR(20),
    publication_name VARCHAR(255),
    website_url VARCHAR(500),
    linkedin VARCHAR(500),
    instagram VARCHAR(500),
    facebook VARCHAR(500),
    publication_industry VARCHAR(255),
    publication_location VARCHAR(255),
    niche_industry VARCHAR(255),
    minimum_expectation_usd DECIMAL(10,2),
    articles_per_month INTEGER,
    turnaround_time VARCHAR(100),
    company_allowed_in_title BOOLEAN DEFAULT FALSE,
    individual_allowed_in_title BOOLEAN DEFAULT FALSE,
    subheading_allowed BOOLEAN DEFAULT FALSE,
    sample_url VARCHAR(500),
    will_change_wordings BOOLEAN DEFAULT FALSE,
    article_placed_permanently BOOLEAN DEFAULT FALSE,
    article_can_be_deleted BOOLEAN DEFAULT FALSE,
    article_can_be_modified BOOLEAN DEFAULT FALSE,
    terms_accepted BOOLEAN NOT NULL DEFAULT FALSE,
    how_heard_about_us TEXT,
    message TEXT,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    submitted_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    submitted_by_admin INTEGER REFERENCES admins(id) ON DELETE SET NULL,
    approved_at TIMESTAMP,
    approved_by INTEGER REFERENCES admins(id) ON DELETE SET NULL,
    rejected_at TIMESTAMP,
    rejected_by INTEGER REFERENCES admins(id) ON DELETE SET NULL,
    rejection_reason TEXT,
    admin_comments TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_reporters_email ON reporters(email);
CREATE INDEX IF NOT EXISTS idx_reporters_status ON reporters(status);
CREATE INDEX IF NOT EXISTS idx_reporters_is_active ON reporters(is_active);
CREATE INDEX IF NOT EXISTS idx_reporters_created_at ON reporters(created_at);
CREATE INDEX IF NOT EXISTS idx_reporters_function_department ON reporters(function_department);
CREATE INDEX IF NOT EXISTS idx_reporters_position ON reporters(position);

-- Add trigger to update updated_at timestamp
CREATE TRIGGER update_reporters_updated_at
    BEFORE UPDATE ON reporters
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();