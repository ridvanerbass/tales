-- Add audio_url and video_url columns to stories table if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'stories' AND column_name = 'audio_url') THEN
        ALTER TABLE stories ADD COLUMN audio_url TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'stories' AND column_name = 'video_url') THEN
        ALTER TABLE stories ADD COLUMN video_url TEXT;
    END IF;
END $$;

-- Enable realtime for stories table
ALTER PUBLICATION supabase_realtime ADD TABLE stories;
