-- Migration: Update image_count check constraint to allow 0
-- Created: 2025-12-05

ALTER TABLE publication_managements DROP CONSTRAINT publication_managements_image_count_check;
ALTER TABLE publication_managements ADD CONSTRAINT publication_managements_image_count_check CHECK (image_count IN (0, 1, 2));