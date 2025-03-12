-- Add country column to visitors table
ALTER TABLE visitors ADD COLUMN IF NOT EXISTS country TEXT;

-- Update existing records with placeholder data
UPDATE visitors SET country = 'Türkiye' WHERE country IS NULL AND ip_address LIKE '78.%';
UPDATE visitors SET country = 'USA' WHERE country IS NULL AND ip_address LIKE '192.%';
UPDATE visitors SET country = 'Germany' WHERE country IS NULL AND ip_address LIKE '91.%';
UPDATE visitors SET country = 'Unknown' WHERE country IS NULL;

-- Add this table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE visitors;