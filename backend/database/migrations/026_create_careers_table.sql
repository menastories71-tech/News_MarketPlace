-- Migration: Create careers table
-- Created: 2025-11-13

CREATE TABLE IF NOT EXISTS careers (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    company VARCHAR(255),
    location VARCHAR(255),
    salary DECIMAL(10,2),
    type VARCHAR(20) CHECK (type IN ('full-time', 'part-time')),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('active', 'pending', 'approved', 'rejected')),
    submitted_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
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
CREATE INDEX IF NOT EXISTS idx_careers_status ON careers(status);
CREATE INDEX IF NOT EXISTS idx_careers_type ON careers(type);
CREATE INDEX IF NOT EXISTS idx_careers_is_active ON careers(is_active);
CREATE INDEX IF NOT EXISTS idx_careers_created_at ON careers(created_at);
CREATE INDEX IF NOT EXISTS idx_careers_submitted_by ON careers(submitted_by);

-- Add trigger to update updated_at timestamp
CREATE TRIGGER update_careers_updated_at
    BEFORE UPDATE ON careers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();