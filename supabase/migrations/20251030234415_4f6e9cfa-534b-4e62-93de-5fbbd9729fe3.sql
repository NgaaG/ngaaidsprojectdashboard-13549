-- Add resource_links column to mentor_logs table
ALTER TABLE public.mentor_logs 
ADD COLUMN resource_links text;

COMMENT ON COLUMN public.mentor_logs.resource_links IS 'Links to resources provided by the lecturer';