-- Create languages table if not exists
CREATE TABLE IF NOT EXISTS languages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create translations table if not exists
CREATE TABLE IF NOT EXISTS translations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  language_code TEXT NOT NULL REFERENCES languages(code) ON DELETE CASCADE,
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(language_code, key)
);

-- Insert default language (Turkish)
INSERT INTO languages (code, name, is_active, is_default)
VALUES ('tr', 'Türkçe', TRUE, TRUE)
ON CONFLICT (code) DO NOTHING;

-- Insert default language (English)
INSERT INTO languages (code, name, is_active, is_default)
VALUES ('en', 'English', TRUE, FALSE)
ON CONFLICT (code) DO NOTHING;

-- Enable realtime for languages and translations
alter publication supabase_realtime add table languages;
alter publication supabase_realtime add table translations;
