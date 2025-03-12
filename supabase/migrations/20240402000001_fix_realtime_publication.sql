-- Fix for realtime publication error
-- Check if the table is already in the publication before adding it
DO $$
BEGIN
  -- Check if languages table is already in the publication
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'languages'
  ) THEN
    -- Only add if not already in the publication
    ALTER PUBLICATION supabase_realtime ADD TABLE languages;
  END IF;
  
  -- Check if translations table is already in the publication
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'translations'
  ) THEN
    -- Only add if not already in the publication
    ALTER PUBLICATION supabase_realtime ADD TABLE translations;
  END IF;
END
$$;
