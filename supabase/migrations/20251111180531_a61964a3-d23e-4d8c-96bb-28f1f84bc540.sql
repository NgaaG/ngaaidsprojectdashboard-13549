-- Transform key_goals and outcomes from text to arrays for checkbox functionality

-- Add temporary new columns
ALTER TABLE mentor_logs ADD COLUMN key_goals_array jsonb DEFAULT '[]'::jsonb;
ALTER TABLE mentor_logs ADD COLUMN outcomes_array jsonb DEFAULT '[]'::jsonb;

-- Migrate existing data: split text by newlines and create arrays
UPDATE mentor_logs 
SET key_goals_array = (
  SELECT jsonb_agg(trim(both from line))
  FROM regexp_split_to_table(COALESCE(key_goals, ''), E'\n') AS line
  WHERE trim(both from line) != ''
)
WHERE key_goals IS NOT NULL AND key_goals != '';

UPDATE mentor_logs 
SET outcomes_array = (
  SELECT jsonb_agg(trim(both from line))
  FROM regexp_split_to_table(COALESCE(outcomes, ''), E'\n') AS line
  WHERE trim(both from line) != ''
)
WHERE outcomes IS NOT NULL AND outcomes != '';

-- Drop old text columns
ALTER TABLE mentor_logs DROP COLUMN key_goals;
ALTER TABLE mentor_logs DROP COLUMN outcomes;

-- Rename new columns to original names
ALTER TABLE mentor_logs RENAME COLUMN key_goals_array TO key_goals;
ALTER TABLE mentor_logs RENAME COLUMN outcomes_array TO outcomes;