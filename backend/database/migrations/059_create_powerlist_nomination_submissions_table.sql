-- Create powerlist_nomination_submissions table
CREATE TABLE powerlist_nomination_submissions (
    id SERIAL PRIMARY KEY,
    powerlist_nomination_id INTEGER REFERENCES powerlist_nominations(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    additional_message TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_powerlist_nomination_submissions_status ON powerlist_nomination_submissions (status);
CREATE INDEX idx_powerlist_nomination_submissions_email ON powerlist_nomination_submissions (email);
CREATE INDEX idx_powerlist_nomination_submissions_powerlist_nomination_id ON powerlist_nomination_submissions (powerlist_nomination_id);
CREATE INDEX idx_powerlist_nomination_submissions_submitted_at ON powerlist_nomination_submissions (submitted_at);

-- Create trigger
CREATE TRIGGER update_powerlist_nomination_submissions_updated_at
    BEFORE UPDATE ON powerlist_nomination_submissions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();