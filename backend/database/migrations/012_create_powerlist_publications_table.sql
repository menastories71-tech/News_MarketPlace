-- Migration: Create powerlist_publications table
-- Created: 2024-11-11

CREATE TABLE IF NOT EXISTS powerlist_publications (
    id SERIAL PRIMARY KEY,
    powerlist_id INTEGER REFERENCES powerlists(id) ON DELETE CASCADE,
    publication_id INTEGER REFERENCES publications(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_powerlist_publications_powerlist_id ON powerlist_publications(powerlist_id);
CREATE INDEX IF NOT EXISTS idx_powerlist_publications_publication_id ON powerlist_publications(publication_id);
CREATE INDEX IF NOT EXISTS idx_powerlist_publications_created_at ON powerlist_publications(created_at);

-- Add unique constraint to prevent duplicate associations
CREATE UNIQUE INDEX IF NOT EXISTS idx_powerlist_publications_unique ON powerlist_publications(powerlist_id, publication_id);