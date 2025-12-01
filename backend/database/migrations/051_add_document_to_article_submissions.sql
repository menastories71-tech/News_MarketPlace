-- Migration: Add document column to article_submissions table
-- Created: 2025-12-01

ALTER TABLE article_submissions ADD COLUMN document VARCHAR(500);

-- Create index for document
CREATE INDEX IF NOT EXISTS idx_article_submissions_document ON article_submissions(document);