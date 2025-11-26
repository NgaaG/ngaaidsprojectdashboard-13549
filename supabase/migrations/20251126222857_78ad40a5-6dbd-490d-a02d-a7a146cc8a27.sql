-- Add new columns to reflections table for enhanced structure
ALTER TABLE reflections ADD COLUMN IF NOT EXISTS what_i_did JSONB DEFAULT '[]'::jsonb;
ALTER TABLE reflections ADD COLUMN IF NOT EXISTS fill_the_gaps JSONB DEFAULT '[]'::jsonb;
ALTER TABLE reflections ADD COLUMN IF NOT EXISTS what_i_executed JSONB DEFAULT '[]'::jsonb;
ALTER TABLE reflections ADD COLUMN IF NOT EXISTS challenges_structured JSONB DEFAULT '[]'::jsonb;
ALTER TABLE reflections ADD COLUMN IF NOT EXISTS solutions_structured JSONB DEFAULT '[]'::jsonb;

-- Update existing reflections to convert old text fields to new structure
UPDATE reflections
SET 
  what_i_did = CASE 
    WHEN emotional_dump IS NOT NULL AND emotional_dump != '' 
    THEN jsonb_build_array(jsonb_build_object('id', gen_random_uuid()::text, 'subheading', '', 'content', emotional_dump))
    ELSE '[]'::jsonb
  END,
  challenges_structured = CASE 
    WHEN thoughts_what_i_think IS NOT NULL AND thoughts_what_i_think != ''
    THEN jsonb_build_array(jsonb_build_object('id', gen_random_uuid()::text, 'category', 'ideas-design', 'content', thoughts_what_i_think))
    ELSE '[]'::jsonb
  END,
  solutions_structured = CASE
    WHEN thoughts_what_is_true IS NOT NULL AND thoughts_what_is_true != ''
    THEN jsonb_build_array(jsonb_build_object('id', gen_random_uuid()::text, 'category', 'ideas-design', 'content', thoughts_what_is_true))
    ELSE '[]'::jsonb
  END
WHERE mode = 'lecture';