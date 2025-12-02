-- Add submitted_by column to powerlist_nominations table
ALTER TABLE powerlist_nominations ADD COLUMN submitted_by INTEGER REFERENCES users(id);

-- Create index for submitted_by
CREATE INDEX idx_powerlist_nominations_submitted_by ON powerlist_nominations (submitted_by);