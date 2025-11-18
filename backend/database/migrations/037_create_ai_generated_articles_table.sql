-- Migration: Create ai_generated_articles table
-- Created: 2025-11-17

-- Create enum types
CREATE TYPE story_type_enum AS ENUM ('profile', 'editorial', 'advertorial', 'listicle');
CREATE TYPE article_status_enum AS ENUM ('draft', 'pending', 'approved');

CREATE TABLE IF NOT EXISTS ai_generated_articles (
    id SERIAL PRIMARY KEY,
    story_type story_type_enum NOT NULL,
    -- Part 1 fields
    name VARCHAR(255),
    preferred_title VARCHAR(500),
    background TEXT,
    inspiration TEXT,
    challenges TEXT,
    unique_perspective TEXT,
    highlights TEXT,
    anecdotes TEXT,
    aspirations TEXT,
    additional_info TEXT,
    -- Part 2 fields
    goal TEXT,
    audience TEXT,
    message TEXT,
    points TEXT,
    seo_keywords TEXT,
    tone VARCHAR(100),
    social_links JSONB,
    references TEXT,
    title_ideas TEXT,
    exclude_info TEXT,
    -- SEO fields
    geo_location VARCHAR(255),
    person_name VARCHAR(255),
    company_name VARCHAR(255),
    -- Other fields
    publication_id INTEGER REFERENCES publications(id),
    generated_content TEXT,
    status article_status_enum DEFAULT 'draft',
    user_id INTEGER REFERENCES users(id),
    uploaded_file_path VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ai_generated_articles_story_type ON ai_generated_articles(story_type);
CREATE INDEX IF NOT EXISTS idx_ai_generated_articles_status ON ai_generated_articles(status);
CREATE INDEX IF NOT EXISTS idx_ai_generated_articles_publication_id ON ai_generated_articles(publication_id);
CREATE INDEX IF NOT EXISTS idx_ai_generated_articles_user_id ON ai_generated_articles(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_generated_articles_person_name ON ai_generated_articles(person_name);
CREATE INDEX IF NOT EXISTS idx_ai_generated_articles_company_name ON ai_generated_articles(company_name);
CREATE INDEX IF NOT EXISTS idx_ai_generated_articles_geo_location ON ai_generated_articles(geo_location);
CREATE INDEX IF NOT EXISTS idx_ai_generated_articles_created_at ON ai_generated_articles(created_at);

-- Add trigger to update updated_at timestamp
CREATE TRIGGER update_ai_generated_articles_updated_at
    BEFORE UPDATE ON ai_generated_articles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();