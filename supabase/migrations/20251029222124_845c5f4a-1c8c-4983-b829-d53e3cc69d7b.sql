-- Add mode tracking columns to tables
ALTER TABLE projects ADD COLUMN IF NOT EXISTS mode text DEFAULT 'personal' CHECK (mode IN ('personal', 'lecturer'));
ALTER TABLE reflections ADD COLUMN IF NOT EXISTS mode text DEFAULT 'personal' CHECK (mode IN ('personal', 'lecturer'));
ALTER TABLE mentor_logs ADD COLUMN IF NOT EXISTS mode text DEFAULT 'lecturer' CHECK (mode IN ('personal', 'lecturer'));

-- Change competency from single to multiple (array) and add Unsure/TBD option
ALTER TABLE projects DROP COLUMN IF EXISTS competency;
ALTER TABLE projects ADD COLUMN competencies text[] DEFAULT ARRAY['Create'];

ALTER TABLE mentor_logs DROP COLUMN IF EXISTS competency;
ALTER TABLE mentor_logs ADD COLUMN competencies text[] DEFAULT ARRAY['Create'];

-- Add mentor comments field to mentor_logs
ALTER TABLE mentor_logs ADD COLUMN IF NOT EXISTS mentor_comments text;

-- Add reflection category for lecture mode
ALTER TABLE reflections ADD COLUMN IF NOT EXISTS category text DEFAULT 'time-out';

-- Update RLS policies to allow mode-based filtering (keep existing public access)
-- No changes needed to RLS since we're filtering in the application layer