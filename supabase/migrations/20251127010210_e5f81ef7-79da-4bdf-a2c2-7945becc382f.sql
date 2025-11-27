-- Add next_steps column to reflections table
ALTER TABLE public.reflections
ADD COLUMN next_steps jsonb DEFAULT '[]'::jsonb;