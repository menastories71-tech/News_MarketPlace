-- Migration: Create award_submissions table
-- Created: 2024-11-11

CREATE TABLE IF NOT EXISTS award_submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    award_id UUID REFERENCES awards(id) ON DELETE CASCADE,
    interested_receive_award BOOLEAN DEFAULT FALSE,
    interested_sponsor_award BOOLEAN DEFAULT FALSE,
    interested_speak_award BOOLEAN DEFAULT FALSE,
    interested_exhibit_award BOOLEAN DEFAULT FALSE,
    interested_attend_award BOOLEAN DEFAULT FALSE,
    name VARCHAR(255),
    email VARCHAR(255),
    whatsapp VARCHAR(20),
    calling_number VARCHAR(20),
    telegram_username VARCHAR(100),
    direct_number VARCHAR(20),
    gender VARCHAR(10),
    dob DATE,
    dual_passport BOOLEAN DEFAULT FALSE,
    passport_1 VARCHAR(100),
    passport_2 VARCHAR(100),
    residence_uae BOOLEAN DEFAULT FALSE,
    other_residence BOOLEAN DEFAULT FALSE,
    other_residence_name VARCHAR(255),
    current_company VARCHAR(255),
    position VARCHAR(255),
    linkedin VARCHAR(500),
    instagram VARCHAR(500),
    facebook VARCHAR(500),
    personal_website VARCHAR(500),
    company_website VARCHAR(500),
    company_industry VARCHAR(255),
    earlier_news_features TEXT,
    filling_for_other BOOLEAN DEFAULT FALSE,
    other_person_details TEXT,
    captcha_validated BOOLEAN DEFAULT FALSE,
    terms_agreed BOOLEAN DEFAULT FALSE,
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_award_submissions_award_id ON award_submissions(award_id);
CREATE INDEX IF NOT EXISTS idx_award_submissions_email ON award_submissions(email);
CREATE INDEX IF NOT EXISTS idx_award_submissions_created_at ON award_submissions(created_at);

-- Add trigger to update updated_at timestamp
CREATE TRIGGER update_award_submissions_updated_at
    BEFORE UPDATE ON award_submissions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();