-- Update general_learning_goals to store structured JSON instead of plain text
-- First drop the default
ALTER TABLE public.profiles ALTER COLUMN general_learning_goals DROP DEFAULT;

-- Change the column type
ALTER TABLE public.profiles 
ALTER COLUMN general_learning_goals TYPE jsonb 
USING CASE 
  WHEN general_learning_goals IS NULL OR general_learning_goals = '' THEN '{"heading": "", "subheading": "", "goals": []}'::jsonb
  ELSE jsonb_build_object('heading', '', 'subheading', '', 'goals', ARRAY[general_learning_goals])
END;

-- Set new default
ALTER TABLE public.profiles 
ALTER COLUMN general_learning_goals SET DEFAULT '{"heading": "", "subheading": "", "goals": []}'::jsonb;