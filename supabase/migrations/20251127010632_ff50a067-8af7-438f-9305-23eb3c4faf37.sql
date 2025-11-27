-- Create reflection_versions table to track all changes
CREATE TABLE public.reflection_versions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reflection_id uuid NOT NULL,
  user_id uuid,
  version_number integer NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  
  -- Snapshot of reflection data at this version
  project_id uuid,
  mood text NOT NULL,
  emotional_dump text,
  thoughts_what_i_think text,
  thoughts_what_is_true text,
  contingency_plan text,
  todo_list jsonb DEFAULT '[]'::jsonb,
  what_i_did jsonb DEFAULT '[]'::jsonb,
  what_i_learned jsonb DEFAULT '[]'::jsonb,
  challenges_structured jsonb DEFAULT '[]'::jsonb,
  solutions_structured jsonb DEFAULT '[]'::jsonb,
  fill_the_gaps jsonb DEFAULT '[]'::jsonb,
  next_steps jsonb DEFAULT '[]'::jsonb,
  progress integer DEFAULT 0,
  mode text DEFAULT 'personal'::text,
  category text DEFAULT 'time-out'::text,
  
  -- Metadata
  change_description text,
  changed_by text
);

-- Enable RLS
ALTER TABLE public.reflection_versions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Public can view all reflection versions" 
ON public.reflection_versions 
FOR SELECT 
USING (true);

CREATE POLICY "Public can insert reflection versions" 
ON public.reflection_versions 
FOR INSERT 
WITH CHECK (true);

-- Create index for faster lookups
CREATE INDEX idx_reflection_versions_reflection_id ON public.reflection_versions(reflection_id);
CREATE INDEX idx_reflection_versions_created_at ON public.reflection_versions(created_at DESC);

-- Function to automatically create version on update
CREATE OR REPLACE FUNCTION public.create_reflection_version()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert the old version into reflection_versions
  INSERT INTO public.reflection_versions (
    reflection_id,
    user_id,
    version_number,
    project_id,
    mood,
    emotional_dump,
    thoughts_what_i_think,
    thoughts_what_is_true,
    contingency_plan,
    todo_list,
    what_i_did,
    what_i_learned,
    challenges_structured,
    solutions_structured,
    fill_the_gaps,
    next_steps,
    progress,
    mode,
    category,
    change_description
  )
  SELECT
    OLD.id,
    OLD.user_id,
    COALESCE((
      SELECT MAX(version_number) + 1
      FROM public.reflection_versions
      WHERE reflection_id = OLD.id
    ), 1),
    OLD.project_id,
    OLD.mood,
    OLD.emotional_dump,
    OLD.thoughts_what_i_think,
    OLD.thoughts_what_is_true,
    OLD.contingency_plan,
    OLD.todo_list,
    OLD.what_i_did,
    OLD.what_i_learned,
    OLD.challenges_structured,
    OLD.solutions_structured,
    OLD.fill_the_gaps,
    OLD.next_steps,
    OLD.progress,
    OLD.mode,
    OLD.category,
    'Automatic version created before update';
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to auto-version on update
CREATE TRIGGER reflection_version_trigger
BEFORE UPDATE ON public.reflections
FOR EACH ROW
EXECUTE FUNCTION public.create_reflection_version();