-- Migration: Increase character limit for social media URLs in publication_managements
-- Created: 2026-01-13

ALTER TABLE publication_managements
ALTER COLUMN instagram TYPE VARCHAR(1000),
ALTER COLUMN facebook TYPE VARCHAR(1000),
ALTER COLUMN twitter TYPE VARCHAR(1000),
ALTER COLUMN linkedin TYPE VARCHAR(1000);
