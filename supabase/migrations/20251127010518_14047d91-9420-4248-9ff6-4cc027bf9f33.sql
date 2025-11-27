-- Add all missing structured reflection columns
ALTER TABLE public.reflections
ADD COLUMN IF NOT EXISTS what_i_learned jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS challenges_structured jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS solutions_structured jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS fill_the_gaps jsonb DEFAULT '[]'::jsonb;