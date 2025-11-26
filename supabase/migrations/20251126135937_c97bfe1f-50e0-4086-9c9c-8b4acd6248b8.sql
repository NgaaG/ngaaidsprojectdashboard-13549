-- Add general_learning_goals field to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS general_learning_goals TEXT DEFAULT '';

-- Add comment to explain the field
COMMENT ON COLUMN public.profiles.general_learning_goals IS 'General learning goals in free-form text before categorizing into competencies';