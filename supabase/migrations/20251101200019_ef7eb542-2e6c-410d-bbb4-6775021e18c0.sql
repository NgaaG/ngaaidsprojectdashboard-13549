-- Add project_id column to reflections table
ALTER TABLE public.reflections 
ADD COLUMN project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE;

-- Add index for better query performance
CREATE INDEX idx_reflections_project_id ON public.reflections(project_id);