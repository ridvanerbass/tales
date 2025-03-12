-- Reset all tables except users

-- Truncate tables with foreign key constraints first
TRUNCATE TABLE user_activities CASCADE;
TRUNCATE TABLE user_stories CASCADE;
TRUNCATE TABLE stats CASCADE;
TRUNCATE TABLE stories CASCADE;
TRUNCATE TABLE categories CASCADE;
TRUNCATE TABLE visitors CASCADE;

-- Reset sequences
ALTER SEQUENCE IF EXISTS categories_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS stories_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS stats_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS user_stories_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS user_activities_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS visitors_id_seq RESTART WITH 1;

-- Add language management table
CREATE TABLE IF NOT EXISTS languages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(10) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add translations table
CREATE TABLE IF NOT EXISTS translations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  language_code VARCHAR(10) NOT NULL REFERENCES languages(code) ON DELETE CASCADE,
  key VARCHAR(255) NOT NULL,
  value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(language_code, key)
);

-- Insert default languages
INSERT INTO languages (code, name, is_active, is_default) VALUES
('tr', 'Türkçe', true, true),
('en', 'English', true, false),
('de', 'Deutsch', true, false),
('fr', 'Français', true, false),
('ar', 'العربية', true, false)
ON CONFLICT (code) DO NOTHING;

-- Enable realtime for new tables
alter publication supabase_realtime add table languages;
alter publication supabase_realtime add table translations;
