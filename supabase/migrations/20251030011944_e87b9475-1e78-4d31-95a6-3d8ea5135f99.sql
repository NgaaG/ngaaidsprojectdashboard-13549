-- Add learning goals and key tasks to projects table
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS learning_goals JSONB DEFAULT '{"Research": "", "Create": "", "Organize": "", "Communicate": "", "Learn": ""}'::jsonb,
ADD COLUMN IF NOT EXISTS key_tasks JSONB DEFAULT '[]'::jsonb;

-- Add comment for documentation
COMMENT ON COLUMN public.projects.learning_goals IS 'Learning goals organized by CMD competency';
COMMENT ON COLUMN public.projects.key_tasks IS 'Array of task objects with name, status (completed/not-completed/to-be-completed), and description';