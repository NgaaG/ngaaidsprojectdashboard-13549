-- Add project_id column to mentor_logs table
ALTER TABLE public.mentor_logs 
ADD COLUMN project_id uuid REFERENCES public.projects(id);

-- Add index for better query performance
CREATE INDEX idx_mentor_logs_project_id ON public.mentor_logs(project_id);

-- Add index for mode filtering
CREATE INDEX idx_mentor_logs_mode ON public.mentor_logs(mode);
CREATE INDEX idx_reflections_mode ON public.reflections(mode);
CREATE INDEX idx_projects_mode ON public.projects(mode);