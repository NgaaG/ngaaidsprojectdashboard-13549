-- Add learning_goals_achievements column to projects table
ALTER TABLE public.projects 
ADD COLUMN learning_goals_achievements jsonb DEFAULT '{"Research": [], "Create": [], "Organize": [], "Communicate": [], "Learn": []}'::jsonb;

-- Add selected_task_ids column to mentor_logs table
ALTER TABLE public.mentor_logs 
ADD COLUMN selected_task_ids text[];